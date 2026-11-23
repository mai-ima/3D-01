"""Blender でモデルを磨く(面取り・スムーズシェーディング)。
使い方: python 3d/tools/blender-refine.py <モデルID> <出力.glb> [--bevel 0.004] [--angle 40]
  - 角に小さな面取り(Bevel)を付け、ハイライトが走る現実の金属・樹脂らしい縁にする
  - 面の角度が小さい所は滑らかに(自動スムーズ)、鋭い所はそのまま残す
  - ランプ(lamp_* / lampB_*)と、オプション部品(opt_*)のノード名・材質名は保つ
"""
import sys,os,json,re,argparse,math
import bpy,bmesh
ap=argparse.ArgumentParser();ap.add_argument('id');ap.add_argument('out');ap.add_argument('--bevel',type=float,default=.004);ap.add_argument('--angle',type=float,default=40)
a=ap.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:])
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
idx=json.load(open(f'{ROOT}/3d/models/index.json'));e=next(m for m in idx['models'] if m['id']==a.id)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=f"{ROOT}/3d/models/{e['file']}")
nb=0;skipped=0
for ob in list(bpy.data.objects):
    if ob.type!='MESH': continue
    name=re.sub(r'\.\d+$','',ob.name)
    mats=[m.name for m in ob.data.materials if m]
    # ランプのレンズと、板状の薄いもの(標識面・画像貼り)は触らない
    if any(m.startswith(('lens_','lensB_')) for m in mats) or len(ob.data.polygons)<8:
        skipped+=1;continue
    bm=bmesh.new();bm.from_mesh(ob.data)
    # 鋭い辺(二面角が大きい辺)だけをベベルする。滑らかな曲面の辺は触らない
    edges=[ed for ed in bm.edges if ed.is_manifold and ed.calc_face_angle(0)>math.radians(a.angle) and ed.calc_length()>a.bevel*3]
    if edges and len(bm.verts)<60000:
        try:
            bmesh.ops.bevel(bm,geom=edges,offset=a.bevel,segments=2,profile=.5,affect='EDGES');nb+=1
        except Exception as ex: print('bevel skip',ob.name,ex)
    bm.to_mesh(ob.data);bm.free()
    ob.data.polygons.foreach_set('use_smooth',[True]*len(ob.data.polygons))
    try: ob.data.shade_auto_smooth(angle=math.radians(a.angle))
    except Exception: pass
print(f'ベベル適用 {nb} メッシュ / 触らない {skipped}')
bpy.ops.export_scene.gltf(filepath=a.out,export_format='GLB',export_apply=True,export_yup=True,export_extras=True)
print('書き出し',a.out)
