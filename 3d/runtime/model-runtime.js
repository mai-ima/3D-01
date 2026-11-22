// 3Dモデル(GLB)の読み込み・点灯制御・オプション切替のための再利用ランタイム(他スレッド/他プロジェクトからそのまま使える)
//
//   import {loadModel, cycleAt} from './model-runtime.js';
//   const m = await loadModel('models/signal/pedestrian/jp-ped-led/model.glb', entry);  // entry = index.json の models[] の1要素
//   scene.add(m.root);
//   m.setOption('button','on');        // 任意部品: 押ボタン箱を表示
//   m.setOption('lens','bulb');        // 灯火方式: 電球式(フレネル)に切替
//   m.setState('g');                   // 現示(entry.states[].id)
//   // 毎フレーム: m.update(dt, elapsedSeconds);
//
// GLB 規約:
//   ランプ: メッシュ名 lamp_<key>(LED式レンズ) / lampB_<key>(電球式レンズ)、マテリアル名 lens_<key> / lensB_<key>
//           消灯状態で出力。点灯色は material.userData.litColor、輝度係数は litIntensity。
//   任意部品: ノード名 opt_<option>_<choice>。ランタイムが選択中の choice だけを表示する。
//   アニメ: entry.anim.node で指定された Group を entry.states[].arm(ラジアン)へ回転。
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

let _glowTex=null;
function glowTexture(){if(_glowTex)return _glowTex;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.45)');gr.addColorStop(.6,'rgba(255,255,255,.1)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);_glowTex=new THREE.CanvasTexture(c);_glowTex.colorSpace=THREE.SRGBColorSpace;return _glowTex;}

/** opts.b64: true → `<url>.b64.txt`(base64テキスト)から読む。.glb を配信できない環境(アーティファクト等)向け */
export async function loadModel(url,entry,opts={}){let gltf;
  if(opts.b64){const txt=await (await fetch(url+'.b64.txt')).text();const bin=Uint8Array.from(atob(txt),c=>c.charCodeAt(0));gltf=await new GLTFLoader().parseAsync(bin.buffer,'');}
  else gltf=await new GLTFLoader().loadAsync(url);
  return new Model(gltf.scene,entry,opts);}
export const loadSignal=loadModel;

/** 時刻 t(秒) に対するサイクル上の状態を返す */
export function cycleAt(cycle,t){const total=cycle.reduce((a,c)=>a+c.d,0);let x=((t%total)+total)%total;
  for(let i=0;i<cycle.length;i++){if(x<cycle[i].d)return {index:i,s:cycle[i].s,rem:cycle[i].d-x,total};x-=cycle[i].d;}
  return {index:0,s:cycle[0].s,rem:cycle[0].d,total};}

export class Model{
  constructor(root,entry,{glow=true}={}){
    this.root=root;this.entry=entry;this.lamps={};this.stateId=null;this.state=null;this.glowK=.5;this.armNode=null;this.options={};this._optNodes={};
    root.traverse(o=>{
      if(o.isMesh&&(o.name.startsWith('lamp_')||o.name.startsWith('lampB_'))){const key=o.name.replace(/^lamp[B]?_/,'');let L=this.lamps[key];
        if(!L){L=this.lamps[key]={key,meshes:[],mats:[],lit:new THREE.Color((o.material.userData||{}).litColor||'#ffffff'),k:(o.material.userData||{}).litIntensity||3.4,v:0,t:0,glow:null};}
        L.meshes.push(o);L.mats.push(o.material);
        if(glow&&!L.glow&&o.name.startsWith('lamp_')){o.geometry.computeBoundingSphere();const r=o.geometry.boundingSphere.radius;
          const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),color:L.lit,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0}));
          s.scale.setScalar(Math.max(r*8,.25));s.position.set(0,0,.06);s.userData.noShadow=true;(o.parent.name.startsWith('opt_')?o.parent.parent:o.parent).add(s);L.glow=s;}}
      const m=/^opt_([^_]+)_([^_]+?)(?:_\d+)?$/.exec(o.name);if(m){(this._optNodes[m[1]]||(this._optNodes[m[1]]=[])).push({node:o,choice:m[2]});}   // 同名ノードは GLTFLoader が _1,_2… を付けるので除去
    });
    if(entry.anim){this.armNode=root.getObjectByName(entry.anim.node);this.axis=entry.anim.axis||'z';}
    root.traverse(o=>{if(o.isMesh&&!o.userData.noShadow){o.castShadow=true;o.receiveShadow=true;}});
    for(const op of entry.options||[])this.setOption(op.id,op.default);
    if(entry.states&&entry.states.length)this.setState(entry.states[0].id,true);
  }
  /** 任意部品・方式の切替。choice に一致する opt_<id>_<choice> だけを表示 */
  setOption(id,choice){this.options[id]=choice;for(const {node,choice:c} of this._optNodes[id]||[])node.visible=(c===choice);}
  setState(id,snap=false){const st=(this.entry.states||[]).find(s=>s.id===id);if(!st)return;this.stateId=id;this.state=st;
    if(snap){for(const L of Object.values(this.lamps))L.v=L.t=this._target(L.key,true);if(this.armNode&&st.arm!=null)this.armNode.rotation[this.axis]=st.arm;}}
  _target(key,bl){const s=this.state;if(!s)return 0;return (s.on&&s.on.includes(key))||(s.flash&&s.flash.includes(key)&&bl)||(s.flash2&&s.flash2.includes(key)&&!bl)?1:0;}
  /** dt: 経過秒, t: 通算秒(点滅の位相。1Hz) */
  update(dt,t){if(!this.state)return;const bl=(t%1)<.5,k=1-Math.exp(-dt*38);
    for(const L of Object.values(this.lamps)){L.t=this._target(L.key,bl);L.v+=(L.t-L.v)*k;for(const m of L.mats){m.emissive.copy(L.lit);m.emissiveIntensity=L.v*L.k;}if(L.glow)L.glow.material.opacity=L.v*this.glowK;}
    if(this.armNode&&this.state.arm!=null){const a=this.armNode.rotation[this.axis];this.armNode.rotation[this.axis]=a+(this.state.arm-a)*(1-Math.exp(-dt*2.6));}}
  /** 最も明るく点灯しているランプ(点光源の位置決め用) */
  brightest(){let b=null;for(const L of Object.values(this.lamps))if(L.v>.05&&(!b||L.v>b.v))b=L;return b;}
  dispose(){this.root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}
}
