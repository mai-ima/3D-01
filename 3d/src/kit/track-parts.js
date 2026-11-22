// 軌道モデル共通の部品(レール断面・PCまくらぎ・道床・敷石)
import {THREE,tex,cv,add,roundBox} from './index.js';

export const TM={
  rail:new THREE.MeshStandardMaterial({color:0x777b7f,roughness:.5,metalness:.85}),
  railTop:new THREE.MeshStandardMaterial({color:0xc6cace,roughness:.16,metalness:1}),
  fastener:new THREE.MeshStandardMaterial({color:0x4a4d50,roughness:.55,metalness:.8}),
  clip:new THREE.MeshStandardMaterial({color:0x8a8f93,roughness:.4,metalness:.9}),
  pad:new THREE.MeshStandardMaterial({color:0x1e2224,roughness:.9}),
};
function noiseTex(size,base,n,{rep=[1,1],jpeg=true,tone=230}={}){const c=cv(size,size),g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,size,size);
  for(let i=0;i<n;i++){const v=Math.random()*tone|0;g.fillStyle=`rgba(${v},${v},${v},${Math.random()*.5+.08})`;g.beginPath();g.arc(Math.random()*size,Math.random()*size,Math.random()*1.8+.4,0,7);g.fill();}
  const t=tex(c,{rep});if(jpeg)t.userData.mimeType='image/jpeg';return t;}
export const concreteMat=()=>new THREE.MeshStandardMaterial({color:0xa3a29d,roughness:.93,map:noiseTex(256,'#b8b6b0',9000,{rep:[1,1]})});
export const ballastMat=()=>new THREE.MeshStandardMaterial({color:0xb4b1ab,roughness:1,map:noiseTex(512,'#8f8c87',60000,{rep:[4,16],tone:255})});

/** レール断面(x=幅方向, y=高さ方向。y=0が底面) */
export function railShape(h,headW,baseW,webT){const hw=headW/2,bw=baseW/2,wt=webT/2;
  const P=[[-bw,0],[bw,0],[bw,.015],[wt+.02,.032],[wt,.047],[wt,h-.068],[hw*.55,h-.052],[hw,h-.036],[hw,h-.012],[hw*.72,h],[-hw*.72,h],[-hw,h-.012],[-hw,h-.036],[-hw*.55,h-.052],[-wt,h-.068],[-wt,.047],[-wt-.02,.032],[-bw,.015]];
  const s=new THREE.Shape();P.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
export function railMesh(len,{h=.153,headW=.065,baseW=.127,webT=.0155}={}){const g=new THREE.Group();
  const geo=new THREE.ExtrudeGeometry(railShape(h,headW,baseW,webT),{depth:len,bevelEnabled:false});geo.translate(0,0,-len/2);add(g,geo,TM.rail);
  add(g,new THREE.BoxGeometry(headW*.46,.0025,len),TM.railTop,0,h+.0005,0);   // 研磨された走行面
  return g;}
/** 弾性クリップ(板ばね)。レール中心からの距離 x、高さ y */
export function clipMesh(sign){const pts=[[.098,.004],[.082,.02],[.062,.028],[.046,.026],[.04,.016],[.05,.011]].map(([x,y])=>new THREE.Vector3(sign*x,y,0));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),14,.0042,5,false);}
/** 周期境界に対応した決定論ノイズ(タイル継ぎ目を消す) */
export const hash=(a,b)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);};
/** 砂利道床(高さ場メッシュ) */
export function ballastBed(len,{w=4.8,crest=1.75,y0=-.025}={}){const sx=120,sz=Math.round(len*18);
  const g=new THREE.PlaneGeometry(w,len,sx,sz);g.rotateX(-Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const ix=Math.round((x+w/2)/w*sx),iz=Math.round((z+len/2)/len*sz)%sz;
    let y=y0-Math.max(0,Math.abs(x)-crest)*.5+(hash(ix,iz)-.5)*.022+Math.sin(x*31+iz*.37)*.004;p.setY(i,y);uv.setXY(i,x/1.1,z/1.1);}
  g.computeVertexNormals();return g;}
/** 砂利(インスタンス) */
export function ballastStones(len,count,{w=4.4,crest=1.75,y0=-.025,sleeperZ=[],mat}={}){
  const geo=new THREE.IcosahedronGeometry(1,1);{const p=geo.attributes.position;for(let i=0;i<p.count;i++){const j=1+(hash(i,7)-.5)*.35;p.setXYZ(i,p.getX(i)*j,p.getY(i)*j,p.getZ(i)*j);}geo.computeVertexNormals();}const im=new THREE.InstancedMesh(geo,mat,count);const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=new THREE.Vector3(),pos=new THREE.Vector3();let n=0;
  for(let i=0;i<count*3&&n<count;i++){const x=(Math.random()-.5)*w,z=(Math.random()-.5)*len;
    if(Math.abs(x)<1.3&&sleeperZ.some(sz=>Math.abs(z-sz)<.16))continue;const y=y0-Math.max(0,Math.abs(x)-crest)*.5+.004;
    const r=.03+Math.random()*.035;sc.set(r*(.9+Math.random()*.6),r*(.55+Math.random()*.35),r*(.9+Math.random()*.6));e.set(Math.random()*6,Math.random()*6,Math.random()*6);q.setFromEuler(e);pos.set(x,y,z);m.compose(pos,q,sc);im.setMatrixAt(n++,m);}
  im.count=n;im.instanceMatrix.needsUpdate=true;return im;}
/** PCまくらぎ(上面 y=top, 下面 top-0.2, 長さ 2.4m) */
export function sleeperGeo(len=2.4){const s=new THREE.Shape();[[-.14,-.2],[.14,-.2],[.1,0],[-.1,0]].forEach(([z,y],i)=>i?s.lineTo(z,y):s.moveTo(z,y));s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:len,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:4});g.translate(0,0,-len/2);g.rotateY(Math.PI/2);return g;}
export function seatDetail(parent,x,y,z,sign){ // レール座面: パッド・肩・クリップ
  add(parent,new THREE.BoxGeometry(.15,.008,.2),TM.pad,x,y+.004,z);
  for(const s of[-1,1]){add(parent,new THREE.BoxGeometry(.05,.04,.12),TM.fastener,x+s*.105,y+.02,z);
    for(const dz of[-.04,.04]){const c=new THREE.Mesh(clipMesh(s),TM.clip);c.position.set(x,y+.008,z+dz);parent.add(c);}}}
/** 御影石の敷石(石畳)テクスチャ */
export function settsTexture(){const c=cv(1024,1024),g=c.getContext('2d');g.fillStyle='#2c2c2e';g.fillRect(0,0,1024,1024);const w=64,h=64;
  for(let r=0;r<1024/h;r++)for(let q=-1;q<1024/w+1;q++){const x=q*w+(r%2?w/2:0),y=r*h,v=105+Math.random()*70|0,t=Math.random()*14|0;
    g.fillStyle=`rgb(${v+t},${v+t*.4},${v-t*.5})`;g.beginPath();g.roundRect(x+3.5,y+3.5,w-7,h-7,9);g.fill();
    for(let k=0;k<26;k++){const u=100+Math.random()*100|0;g.fillStyle=`rgba(${u},${u},${u},.18)`;g.fillRect(x+4+Math.random()*(w-10),y+4+Math.random()*(h-10),2,2);}}
  const t=tex(c,{rep:[1,1]});t.userData.mimeType='image/jpeg';return t;}
export function asphaltTex(rep=[2,4]){const t=noiseTex(512,'#3d3f42',30000,{rep,tone:210});return t;}
