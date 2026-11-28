// 道路(車道そのもの)の部品。長さ20mの1区画を、ビューアが前後に並べて長い道路にする。road-parts.js だけに依存する
// 座標: 原点=舗装の外側の端(路肩の外縁)、+X=車道の側、Z=進行方向(区画は z=-10〜+10)、舗装面が y=0
import {THREE,RM,add,canvasTex,tex,noiseCanvas,concreteMat,opt,optChoice,optToggle}from './road-parts.js';
export {THREE,RM,add,opt,optChoice,optToggle,concreteMat};
export const TILE=20;

/* ---------- 材質 ---------- */
let _asph=null;
/** アスファルト舗装(骨材の粒つき)。幅 w[m] × 区画長 の面に 2m 四方で貼る */
export function asphaltMat(w){if(!_asph){const c=noiseCanvas(512,'#3d3f43',60000,235);const g=c.getContext('2d');
    for(let i=0;i<5200;i++){const v=110+Math.random()*100|0;g.fillStyle=`rgba(${v},${v},${v+4},.55)`;g.beginPath();g.arc(Math.random()*512,Math.random()*512,Math.random()*1.7+.5,0,7);g.fill();}
    for(let i=0;i<7;i++){g.strokeStyle='rgba(20,20,22,.35)';g.lineWidth=1.2;g.beginPath();let x=Math.random()*512,y=Math.random()*512;g.moveTo(x,y);for(let k=0;k<14;k++){x+=(Math.random()-.5)*50;y+=(Math.random()-.5)*50;g.lineTo(x,y);}g.stroke();}
    _asph=c;}
  const t=tex(_asph,{rep:[w/2,TILE/2]});t.userData.mimeType='image/jpeg';return new THREE.MeshStandardMaterial({map:t,roughness:.9});}
const paintMat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.65,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
export const PAINT={white:paintMat(0xf2f2ec),yellow:paintMat(0xe8b415),blue:paintMat(0x2f86c4)};
const conc=new THREE.MeshStandardMaterial({color:0xb7b5ad,roughness:.93});
const grass=()=>{const c=noiseCanvas(256,'#55683a',9000,160);const t=tex(c,{rep:[1,TILE/1.5]});t.userData.mimeType='image/jpeg';return new THREE.MeshStandardMaterial({map:t,roughness:1});};

/* ---------- 面と区画線 ---------- */
/** x0〜x1 の水平な板(上面 y)。材質は mat */
export function slab(parent,x0,x1,mat,y=0,t=.05){const g=add(parent,new THREE.BoxGeometry(x1-x0,t,TILE),mat,(x0+x1)/2,y-t/2,0);g.receiveShadow=true;return g;}
/** 舗装の面。x0〜x1 */
export function pave(parent,x0,x1){return slab(parent,x0,x1,asphaltMat(x1-x0));}
/** 路側の草地・砂利(舗装の外) */
export function verge(parent,x0,x1,y=-.01){return slab(parent,x0,x1,grass(),y,.04);}
/** 区画線。kind: 'solid' 実線 / [線長,間隔] 破線(区画の先頭から)。w=線幅[m] */
export function line(parent,x,w,kind,mat=PAINT.white){const y=.004;
  if(kind==='solid'){add(parent,new THREE.BoxGeometry(w,.006,TILE),mat,x,y,0);return;}
  const [d,gap]=kind,p=d+gap;for(let z=-TILE/2;z<TILE/2-.01;z+=p)add(parent,new THREE.BoxGeometry(w,.006,Math.min(d,TILE/2-z)),mat,x,y,z+Math.min(d,TILE/2-z)/2);}

/* ---------- 路側・中央の工作物 ---------- */
/** 縁石+側溝(歩車道境界ブロック。上面は舗装から15cm) */
export function curb(parent,x,side=1){const g=new THREE.Group();g.position.x=x;parent.add(g);
  add(g,new THREE.BoxGeometry(.18,.15,TILE-.02),conc,side*.09,.075-.0,0);add(g,new THREE.BoxGeometry(.3,.02,TILE-.02),conc,-side*.15,-.01,0);   // L型側溝の底
  add(g,new THREE.BoxGeometry(.02,.15,TILE),conc,side*.0,.075,0);return g;}
/** ガードレール(ビーム式 Gr: 波形ビーム+支柱φ114.3、4m間隔) */
export function guardrail(parent,x,{h=.7,box=false}={}){const mz=RM.zinc;
  for(let z=-TILE/2+2;z<TILE/2;z+=4){add(parent,new THREE.CylinderGeometry(.057,.057,h+.35,16),mz,x,(h+.35)/2-.3,z);}
  const wave=new THREE.Shape([[0,0],[.016,0],[.03,.06],[.06,.06],[.074,0],[.12,0],[.134,.06],[.164,.06],[.178,0],[.2,0],[.2,.008],[.18,.008],[.166,.068],[.132,.068],[.118,.008],[.076,.008],[.062,.068],[.028,.068],[.014,.008],[0,.008]].map(([a,b])=>new THREE.Vector2(a-.1,b*3.2)));
  if(box)add(parent,new THREE.BoxGeometry(.06,.28,TILE-.05),mz,x+.06,h-.05,0);
  else{const geo=new THREE.ExtrudeGeometry(wave,{depth:TILE-.05,bevelEnabled:false});geo.translate(0,0,-(TILE-.05)/2);const m=add(parent,geo,mz,x+.07,h-.1,0);m.rotation.z=0;}}
/** ワイヤロープ(支柱φ89.1・3m間隔・ロープn本) */
export function wireRope(parent,x,n=3){const ys=n===3?[.55,.76,.97]:[.46,.62,.8,.98];
  for(let z=-TILE/2+1.5;z<TILE/2;z+=3)add(parent,new THREE.CylinderGeometry(.0446,.0446,1.1,14),RM.zinc,x,.55,z);
  for(const y of ys)add(parent,new THREE.CylinderGeometry(.009,.009,TILE,8),new THREE.MeshStandardMaterial({color:0xa4a9ac,roughness:.35,metalness:.85}),x,y,0).rotation.x=Math.PI/2;}
/** コンクリート壁(断面: [[x,y],…])。長さは区画いっぱい */
export function wall(parent,x,profile){const sh=new THREE.Shape(profile.map(([a,b])=>new THREE.Vector2(a,b)));const geo=new THREE.ExtrudeGeometry(sh,{depth:TILE-.02,bevelEnabled:false});geo.translate(0,0,-(TILE-.02)/2);
  const m=add(parent,geo,conc,x,0,0);m.receiveShadow=true;m.castShadow=true;
  for(const z of[-TILE/2])add(parent,new THREE.BoxGeometry(.04,.5,.002),new THREE.MeshStandardMaterial({color:0x8d8b84,roughness:1}),x,.4,z);return m;}
export const WALL_F=[[-.3,0],[.3,0],[.3,.08],[.26,.33],[.1,.81],[-.1,.81],[-.26,.33],[-.3,.08]];
export const WALL_SINGLE=[[-.25,0],[.25,0],[.11,1.1],[-.11,1.1]];
/** 視線誘導標(橙/白、50m→ここでは20m区画に1本) */
export function delineator(parent,x,color='white'){const m=color==='white'?RM.reflWhite:RM.reflOrange;add(parent,new THREE.CylinderGeometry(.025,.025,1.2,10),RM.white,x,.6,0);
  const r=add(parent,new THREE.CylinderGeometry(.05,.05,.012,24),m,x,1.2,.02);r.rotation.x=Math.PI/2;}
