import * as THREE0 from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
/** 書き出しの設定。boost=true のカテゴリは、円柱・球・押し出し・箱を細かく(丸く)作る(道路・高速道路・車道は、部品が小さくても滑らかに見えるように) */
export const config={sprites:true,bulb:true,boost:false};
/* 形状クラスの差し替え: boost のときは分割数を増やし、角の立った箱は小さな面取りつきの箱(UV は箱のまま)にする */
const THREE={...THREE0};
THREE.CylinderGeometry=class extends THREE0.CylinderGeometry{constructor(rt,rb,h,rs=8,hs=1,oe,ts,tl){super(rt,rb,h,config.boost?Math.max(rs,32):rs,hs,oe,ts,tl);}};
THREE.SphereGeometry=class extends THREE0.SphereGeometry{constructor(r,ws=32,hs=16,...a){super(r,config.boost?Math.max(ws,48):ws,config.boost?Math.max(hs,24):hs,...a);}};
THREE.TorusGeometry=class extends THREE0.TorusGeometry{constructor(r,t,rs=12,ts=48,arc){super(r,t,config.boost?Math.max(rs,10):rs,config.boost?Math.max(ts,48):ts,arc);}};
THREE.CircleGeometry=class extends THREE0.CircleGeometry{constructor(r,seg=32,...a){super(r,config.boost?Math.max(seg,64):seg,...a);}};
THREE.ExtrudeGeometry=class extends THREE0.ExtrudeGeometry{constructor(sh,o={}){super(sh,config.boost?{...o,curveSegments:Math.max(o.curveSegments||12,16),bevelSegments:Math.max(o.bevelSegments||3,3)}:o);}};
THREE.BoxGeometry=function BoxGeometry(w=1,h=1,d=1,ws=1,hs=1,ds=1){
  if(config.boost&&ws===1&&hs===1&&ds===1&&Math.min(w,h,d)>=.05)return new RoundedBoxGeometry(w,h,d,2,Math.min(.012,Math.min(w,h,d)*.16));
  return new THREE0.BoxGeometry(w,h,d,ws,hs,ds);};
/* ---------- textures ---------- */
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const tex=(c,{rep,srgb=true,aniso=16}={})=>{const t=new THREE.CanvasTexture(c);t.anisotropy=aniso;if(srgb)t.colorSpace=THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;};
function noiseCanvas(size,base,speck,n){const c=cv(size,size),g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,size,size);
  for(let i=0;i<n;i++){const v=Math.random()*speck|0;g.fillStyle=`rgba(${v},${v},${v},${Math.random()*.5+.1})`;g.beginPath();g.arc(Math.random()*size,Math.random()*size,Math.random()*1.6+.4,0,7);g.fill();}return c;}
function ledTexture(){const c=cv(512,512),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,512,512);
  const bg=g.createRadialGradient(256,256,0,256,256,250);bg.addColorStop(0,'rgba(255,255,255,.34)');bg.addColorStop(1,'rgba(255,255,255,.16)');
  g.fillStyle=bg;g.beginPath();g.arc(256,256,250,0,7);g.fill();
  const s=21;for(let r=-14;r<=14;r++)for(let q=-14;q<=14;q++){const x=256+q*s+(r&1?s/2:0),y=256+r*s*.866;if(Math.hypot(x-256,y-256)>230)continue;
    const gr=g.createRadialGradient(x,y,0,x,y,8.5);gr.addColorStop(0,'#fff');gr.addColorStop(.55,'rgba(255,255,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x-9,y-9,18,18);}
  return tex(c);}
function arrowTexture(dir){const c=cv(256,256),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,256);
  g.translate(128,128);g.rotate(dir==='left'?-Math.PI/2:dir==='right'?Math.PI/2:0);g.fillStyle='#fff';
  g.beginPath();g.moveTo(0,-86);g.lineTo(62,-6);g.lineTo(24,-6);g.lineTo(24,82);g.lineTo(-24,82);g.lineTo(-24,-6);g.lineTo(-62,-6);g.closePath();g.fill();
  return tex(c);}
function pedTexture(kind){const c=cv(256,256),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,256);
  g.strokeStyle='#fff';g.fillStyle='#fff';g.lineCap='round';g.lineWidth=22;
  const L=(a,b,c2,d)=>{g.beginPath();g.moveTo(a,b);g.lineTo(c2,d);g.stroke();};
  g.beginPath();g.arc(kind==='walk'?136:128,44,21,0,7);g.fill();
  if(kind==='stand'){L(128,86,128,150);L(106,98,100,158);L(150,98,156,158);L(118,150,116,222);L(138,150,140,222);}
  else{L(130,86,124,148);L(128,100,98,148);L(130,100,164,138);L(124,148,98,222);L(124,148,156,222);}
  return tex(c);}
function radialTexture(){const c=cv(128,128),g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.45)');gr.addColorStop(.6,'rgba(255,255,255,.1)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);return tex(c,{aniso:1});}
const LED=ledTexture(), GLOW=radialTexture();

/* ---------- materials ---------- */
const grain=tex(noiseCanvas(256,'#808080',255,6000),{rep:[4,4],srgb:false});
const MAT={
  hous:new THREE.MeshPhysicalMaterial({color:0x28342e,roughness:.42,metalness:.15,clearcoat:.7,clearcoatRoughness:.3,bumpMap:grain,bumpScale:.15}),
  housD:new THREE.MeshPhysicalMaterial({color:0x15181a,roughness:.4,metalness:.2,clearcoat:.8,clearcoatRoughness:.25,bumpMap:grain,bumpScale:.12}),
  hood:new THREE.MeshStandardMaterial({color:0x151a17,roughness:.78,metalness:.05,side:THREE.DoubleSide}),
  rubber:new THREE.MeshStandardMaterial({color:0x0b0c0d,roughness:.9,side:THREE.DoubleSide}),
  galv:new THREE.MeshStandardMaterial({color:0xb9bdbb,roughness:.55,metalness:.3}),
  steel:new THREE.MeshStandardMaterial({color:0x8c9296,roughness:.3,metalness:1}),
  white:new THREE.MeshPhysicalMaterial({color:0xeeeeea,roughness:.35,clearcoat:.5}),
  red:new THREE.MeshPhysicalMaterial({color:0xb4141a,roughness:.4,clearcoat:.5}),
  yel:new THREE.MeshPhysicalMaterial({color:0xe9b50e,roughness:.45,clearcoat:.4}),
  refl:new THREE.MeshStandardMaterial({color:0xf0c415,roughness:.35,metalness:.1,emissive:0x3a2c00,emissiveIntensity:.5}),
  black:new THREE.MeshStandardMaterial({color:0x090a0b,roughness:.8}),
};
/* ---------- geometry helpers ---------- */
function rrShape(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.absarc(x+w-r,y+r,r,-Math.PI/2,0);s.lineTo(x+w,y+h-r);s.absarc(x+w-r,y+h-r,r,0,Math.PI/2);s.lineTo(x+r,y+h);s.absarc(x+r,y+h-r,r,Math.PI/2,Math.PI);s.lineTo(x,y+r);s.absarc(x+r,y+r,r,Math.PI,1.5*Math.PI);return s;}
function roundBox(w,h,d,r,b=.012){const dd=d-2*b;const g=new THREE.ExtrudeGeometry(rrShape(w-2*b,h-2*b,Math.max(r-b,.005)),{depth:dd,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:b>.008?3:1,curveSegments:Math.max(3,Math.min(16,Math.round(r*110)))});g.translate(0,0,-dd/2);return g;}
function add(parent,geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
function rod(parent,a,b,r,mat=MAT.galv,seg=24){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),seg),mat);
  m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(m);return m;}
function bolt(parent,x,y,z,r=.014,axis='z'){const m=add(parent,new THREE.CylinderGeometry(r,r,r*.9,6),MAT.steel,x,y,z);if(axis==='z')m.rotation.x=Math.PI/2;return m;}
function pole(parent,h,r0,r1,{bands=true}={}){
  const rAt=y=>r0+(r1-r0)*y/h;
  add(parent,new THREE.CylinderGeometry(r1,r0,h,72,14),MAT.galv,0,h/2,0);
  add(parent,new THREE.CylinderGeometry(r0*1.9,r0*1.9,.03,72),MAT.galv,0,.015,0);
  add(parent,new THREE.CylinderGeometry(r0*1.04,r0*1.55,.26,72),MAT.galv,0,.16,0);
  for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;const x=Math.cos(a)*r0*1.7,z=Math.sin(a)*r0*1.7;add(parent,new THREE.CylinderGeometry(.02,.02,.045,6),MAT.steel,x,.052,z);add(parent,new THREE.CylinderGeometry(.027,.027,.018,6),MAT.steel,x,.082,z);}
  add(parent,new THREE.SphereGeometry(r1*1.12,40,16,0,Math.PI*2,0,Math.PI/2),MAT.galv,0,h,0);
  const hp=add(parent,roundBox(.085,.2,.014,.012,.004),MAT.galv,0,.75,rAt(.75)*.97);bolt(hp,0,.07,.01,.007);bolt(hp,0,-.07,.01,.007);
  if(bands)for(const y of[1.7,1.86])add(parent,new THREE.CylinderGeometry(rAt(y)+.003,rAt(y)+.003,.09,72,1,true),MAT.refl,0,y,0);
}
function mastArm(parent,H,armY,armL){
  pole(parent,H,.125,.075);
  const a=add(parent,new THREE.CylinderGeometry(.048,.075,armL,56,10),MAT.galv);a.rotation.z=-Math.PI/2;a.position.set(armL/2,armY,0);
  add(parent,new THREE.CylinderGeometry(.14,.14,.3,56),MAT.galv,0,armY,0);
  rod(parent,[0,armY-.95,0],[armL*.5,armY-.04,0],.03);rod(parent,[0,armY-.95,0],[.1,armY-.95,0],.04);
  add(parent,new THREE.SphereGeometry(.05,24,12),MAT.galv,armL,armY,0);
  const cable=new THREE.CatmullRomCurve3([new THREE.Vector3(.11,.9,.02),new THREE.Vector3(.12,armY-.1,.04),new THREE.Vector3(armL*.5,armY-.12,.06),new THREE.Vector3(armL-.3,armY-.2,.04)]);
  add(parent,new THREE.TubeGeometry(cable,120,.011,8),MAT.black);
}
/* lamps */
function domeLens(R,depth,seg=96){const pts=[];for(let i=0;i<=14;i++){const r=R*i/14;pts.push(new THREE.Vector2(r,depth*(1-(r/R)**2)));}
  const g=new THREE.LatheGeometry(pts,seg);g.rotateX(Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/(2*R)+.5,p.getY(i)/(2*R)+.5);return g;}
function lensMaterial(dark,emissive,map){return new THREE.MeshPhysicalMaterial({color:dark,roughness:.16,clearcoat:1,clearcoatRoughness:.05,emissive,emissiveMap:map,emissiveIntensity:0,side:THREE.DoubleSide});}
const COL={orange:{dark:0x2e1a02,e:0xff7a00,hex:'#ff8a1a'},white:{dark:0x1c1f22,e:0xf4f8ff,hex:'#f4f8ff'},red:{dark:0x2a0606,e:0xff2a18,hex:'#ff4332'},yellow:{dark:0x2e1f02,e:0xffa800,hex:'#ffbd14'},green:{dark:0x02221a,e:0x00e6a2,hex:'#18d9a0'},blue:{dark:0x021c2e,e:0x1f9bff,hex:'#2aa6ff'},purple:{dark:0x14062e,e:0x9a5cff,hex:'#a574ff'}};
const allLamps=[];
function fresnelTexture(){const c=cv(512,512),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,512,512);
  for(let i=0;i<22;i++){const r=250-i*11;const gr=g.createRadialGradient(256,256,r-9,256,256,r);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(.6,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,.15)');g.strokeStyle=gr;g.lineWidth=9;g.beginPath();g.arc(256,256,r-4.5,0,7);g.stroke();}
  const cg=g.createRadialGradient(256,256,0,256,256,52);cg.addColorStop(0,'rgba(255,255,255,1)');cg.addColorStop(1,'rgba(255,255,255,.3)');g.fillStyle=cg;g.beginPath();g.arc(256,256,52,0,7);g.fill();return tex(c);}
const FRES=fresnelTexture();
function makeLamp(parent,x,y,z,R,color,map,{hood=.28,gap=1.5,round=true,hoodMat=MAT.hood}={}){
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  const bez=new THREE.LatheGeometry([[R+.004,-.012],[R+.027,-.012],[R+.027,.008],[R+.014,.022],[R+.004,.022]].map(p=>new THREE.Vector2(...p)),96);bez.rotateX(Math.PI/2);add(g,bez,MAT.rubber);
  add(g,new THREE.CircleGeometry(R+.01,64),MAT.black,0,0,-.006);
  const c=COL[color];
  const swappable=map===LED&&config.bulb;      // 灯火方式(LED式/電球式)を切り替えられるのは、丸いLEDレンズの灯器だけ
  let ledG=g;if(swappable){ledG=new THREE.Group();ledG.name='opt_lens_led';g.add(ledG);}
  const mat=lensMaterial(c.dark,c.e,map);const lens=add(ledG,domeLens(R,.014),mat);
  let lensB=null,matB=null;
  if(swappable){const bg=new THREE.Group();bg.name='opt_lens_bulb';g.add(bg);                   // 電球式(フレネルレンズ)
    matB=lensMaterial(c.dark,c.e,FRES);matB.roughness=.28;lensB=add(bg,domeLens(R,.032,96),matB);}
  if(hood>0){const hg=new THREE.CylinderGeometry(R+.034,R+.034,hood,80,1,true,gap/2,Math.PI*2-gap);hg.rotateX(Math.PI/2);hg.translate(0,0,hood/2);add(g,hg,hoodMat);
    const tor=add(g,new THREE.TorusGeometry(R+.034,.0055,10,80,Math.PI*2-gap),hoodMat,0,0,hood);tor.rotation.z=gap/2-Math.PI/2;
    const ig=new THREE.CylinderGeometry(R+.029,R+.029,hood-.01,64,1,true,gap/2,Math.PI*2-gap);ig.rotateX(Math.PI/2);ig.translate(0,0,hood/2);add(g,ig,new THREE.MeshStandardMaterial({color:0x020202,roughness:1,side:THREE.DoubleSide}));}
  let glow=null;if(config.sprites){glow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:c.e,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0}));
  glow.scale.setScalar(R*9);glow.position.z=.07;glow.userData.noShadow=true;g.add(glow);}
  const L={g,mat,glow,lens,lensB,matB,v:0,t:0,color:c,key:null};allLamps.push(L);return L;
}
/** オプション定義の共通ヘルパー。optToggle=付ける/外す、optChoice=複数の選択肢から1つ */
export const optToggle=(id,label,def='off')=>({id,label,choices:[{id:'off',label:'なし'},{id:'on',label:'あり'}],default:def});
export const optChoice=(id,label,choices,def)=>({id,label,choices:choices.map(([i,l])=>({id:i,label:l})),default:def||choices[0][0]});
/** 任意部品グループ(ノード名 opt_<group>_<choice>)。ランタイムが可視切替する */
export function opt(parent,group,choice){const g=new THREE.Group();g.name=`opt_${group}_${choice}`;parent.add(g);return g;}
function housing(parent,w,h,d,r,mat,x,y,z){const m=add(parent,roundBox(w,h,d,r),mat,x,y,z);
  for(let i=-2;i<=2;i++)add(m,new THREE.BoxGeometry(w*.5,.012,.02),mat,0,i*h*.14,-d/2-.008); return m;}

export function bikeTexture(){const c=cv(256,256),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,256);g.strokeStyle='#fff';g.fillStyle='#fff';g.lineCap='round';g.lineJoin='round';
  g.lineWidth=12;for(const x of[70,186]){g.beginPath();g.arc(x,176,38,0,7);g.stroke();}
  g.lineWidth=11;g.beginPath();g.moveTo(70,176);g.lineTo(108,110);g.lineTo(160,110);g.lineTo(186,176);g.moveTo(108,110);g.lineTo(128,176);g.lineTo(70,176);g.moveTo(160,110);g.lineTo(150,84);g.lineTo(176,84);g.moveTo(100,100);g.lineTo(118,100);g.stroke();return tex(c);}
/* weathering: streaks + soot used as colour map on painted parts */
export function dirtTexture(){const c=cv(512,512),g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,512,512);
  for(let i=0;i<70;i++){const x=Math.random()*512,w=2+Math.random()*9,l=80+Math.random()*380,y=Math.random()*200;const gr=g.createLinearGradient(0,y,0,y+l);const a=.04+Math.random()*.09;
    gr.addColorStop(0,'rgba(60,50,40,0)');gr.addColorStop(.3,`rgba(60,50,40,${a})`);gr.addColorStop(1,'rgba(60,50,40,0)');g.fillStyle=gr;g.fillRect(x,y,w,l);}
  for(let i=0;i<9000;i++){g.fillStyle=`rgba(${Math.random()<.5?'0,0,0':'255,255,255'},${Math.random()*.05})`;g.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*2,1+Math.random()*2);}
  const bt=g.createLinearGradient(0,380,0,512);bt.addColorStop(0,'rgba(40,34,28,0)');bt.addColorStop(1,'rgba(40,34,28,.28)');g.fillStyle=bt;g.fillRect(0,380,512,132);
  return tex(c,{rep:[1,1]});}
const DIRT=dirtTexture();for(const k of['hous','housD','galv','hood'])MAT[k].map=DIRT;
export {FRES,DIRT,THREE,cv,tex,grain,LED,GLOW,MAT,COL,allLamps,rrShape,roundBox,add,rod,bolt,pole,mastArm,domeLens,lensMaterial,makeLamp,housing,arrowTexture,pedTexture,noiseCanvas};
