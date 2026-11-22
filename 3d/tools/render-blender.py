"""GLB を Blender(Cycles)で物理ベースレンダリングして品質確認する。
使い方: python 3d/tools/render-blender.py <model-id> <out.png> [state-id] [--view front|three|lamp] [--night] [--samples N]
事前に: python -m venv .venv && .venv/bin/pip install bpy numpy
"""
import sys,os,json,re,math,argparse
import bpy
from mathutils import Vector
ap=argparse.ArgumentParser();ap.add_argument('id');ap.add_argument('out');ap.add_argument('state',nargs='?');ap.add_argument('--view',default='three')
ap.add_argument('--night',action='store_true');ap.add_argument('--samples',type=int,default=64);ap.add_argument('--w',type=int,default=900);ap.add_argument('--h',type=int,default=1100);a=ap.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:])
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
idx=json.load(open(f'{ROOT}/3d/models/index.json'));e=next(m for m in idx['models'] if m['id']==a.id)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=f"{ROOT}/3d/models/{e['file']}")
base=lambda n:re.sub(r'\.\d+$','',n)
# --- 既定オプションだけ表示 ---
dflt={o['id']:o['default'] for o in e.get('options',[])}
for ob in bpy.data.objects:
    m=re.match(r'^opt_([^_]+)_([^_]+)',base(ob.name))
    if m and dflt.get(m.group(1))!=m.group(2):
        stack=[ob]
        while stack:
            o=stack.pop();o.hide_render=True;o.hide_viewport=True;stack.extend(o.children)
# --- 現示(点灯) ---
st=next((s for s in e.get('states',[]) if s['id']==(a.state or (e.get('cycle') or [{'s':None}])[0]['s'])),None)
lit=set((st or {}).get('on',[])+(st or {}).get('flash',[])+(st or {}).get('flash2',[]))
colors={l['key']:l['lit'] for l in e.get('lamps',[])}
for mat in bpy.data.materials:
    m=re.match(r'^lens_(.+?)(?:\.\d+)?$',mat.name)
    if not m or not mat.node_tree: continue
    key=m.group(1);bsdf=mat.node_tree.nodes.get('Principled BSDF')
    if not bsdf: continue
    on=key in lit;c=colors.get(key,'#ffffff');rgb=[int(c[i:i+2],16)/255 for i in(1,3,5)]
    bsdf.inputs['Emission Color'].default_value=(*rgb,1);bsdf.inputs['Emission Strength'].default_value=6.0 if on else 0.0
# --- 物体の範囲 ---
mn=Vector((1e9,)*3);mx=Vector((-1e9,)*3)
for ob in bpy.data.objects:
    if ob.type=='MESH' and not ob.hide_render:
        for c in ob.bound_box:
            w=ob.matrix_world@Vector(c);mn=Vector(map(min,mn,w));mx=Vector(map(max,mx,w))
ctr=(mn+mx)/2;size=mx-mn
# --- 地面・空 ---
bpy.ops.mesh.primitive_plane_add(size=80,location=(ctr.x,ctr.y,mn.z-0.001));g=bpy.context.object
gm=bpy.data.materials.new('ground');gm.use_nodes=True;gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.05,.05,.055,1);gm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.9;g.data.materials.append(gm)
w=bpy.data.worlds.new('w');bpy.context.scene.world=w;w.use_nodes=True;nt=w.node_tree;nt.nodes.clear()
sky=nt.nodes.new('ShaderNodeTexSky');sky.sky_type='MULTIPLE_SCATTERING';sky.sun_elevation=math.radians(-6 if a.night else 38);sky.sun_rotation=math.radians(30);sky.air_density=1.0
bg=nt.nodes.new('ShaderNodeBackground');out=nt.nodes.new('ShaderNodeOutputWorld');nt.links.new(sky.outputs[0],bg.inputs[0]);nt.links.new(bg.outputs[0],out.inputs[0]);bg.inputs[1].default_value=.35 if a.night else 1.0
# --- カメラ ---
cam=bpy.data.cameras.new('c');cam.lens=70;co=bpy.data.objects.new('c',cam);bpy.context.collection.objects.link(co);bpy.context.scene.camera=co
d=max(size.x,size.z,size.y*.6)*1.9+2
tgt=Vector((ctr.x,ctr.y,mn.z+size.z*.5)) if (a.view!='lamp' or not e.get('focus')) else Vector((e['focus'][0],-e['focus'][2],e['focus'][1]))   # glTF(Y-up)→Blender(Z-up)
# glTF は Y-up → Blender は Z-up に変換済み: 正面(+Z)= -Y
dirv={'three':Vector((.5,-1,.25)),'front':Vector((0,-1,.05)),'lamp':Vector((.35,-1,.12))}[a.view].normalized()
if a.view=='lamp': d=6.2
co.location=tgt+dirv*d;co.rotation_euler=(tgt-co.location).to_track_quat('-Z','Y').to_euler()
# --- レンダ設定 ---
sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=a.samples;sc.cycles.use_denoising=True
sc.render.resolution_x=a.w;sc.render.resolution_y=a.h;sc.render.filepath=a.out;sc.view_settings.view_transform='AgX';sc.view_settings.exposure=-1.2
bpy.ops.render.render(write_still=True);print('rendered',a.out)
