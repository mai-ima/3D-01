// 道路関係の部品(標識板・支柱・取付金具・防護柵・路面材)。kit/index.js だけに依存する
import {THREE,MAT,COL,add,rod,bolt,roundBox,rrShape,cv,tex,noiseCanvas,lensMaterial,allLamps,opt,optToggle,optChoice} from './index.js';

export const FONT='"Noto Sans JP","Noto Sans CJK JP","WenQuanYi Zen Hei",sans-serif';
export const deg=THREE.MathUtils.degToRad;

/* ---------- 材質 ---------- */
export const RM={
  zinc:new THREE.MeshStandardMaterial({color:0xb4b9bb,roughness:.5,metalness:.75}),            // 溶融亜鉛めっき
  zincDull:new THREE.MeshStandardMaterial({color:0x9ea3a5,roughness:.68,metalness:.6}),
  alu:new THREE.MeshStandardMaterial({color:0xaeb3b5,roughness:.45,metalness:.7}),             // 標識板の裏・縁
  white:new THREE.MeshPhysicalMaterial({color:0xeeeeea,roughness:.5,clearcoat:.3}),
  black:new THREE.MeshStandardMaterial({color:0x14171a,roughness:.62}),
  orange:new THREE.MeshPhysicalMaterial({color:0xe5700f,roughness:.45,clearcoat:.35}),
  yellow:new THREE.MeshPhysicalMaterial({color:0xf0c10d,roughness:.45,clearcoat:.3}),
  red:new THREE.MeshPhysicalMaterial({color:0xc3161c,roughness:.45,clearcoat:.3}),
  rubber:new THREE.MeshStandardMaterial({color:0x17191b,roughness:.92}),
  stainless:new THREE.MeshStandardMaterial({color:0xd9dcde,roughness:.26,metalness:1}),
  reflWhite:new THREE.MeshStandardMaterial({color:0xf4f4ee,roughness:.3,metalness:.1,emissive:0x303028,emissiveIntensity:.5}),
  reflOrange:new THREE.MeshStandardMaterial({color:0xf08a10,roughness:.3,metalness:.1,emissive:0x4a2a00,emissiveIntensity:.6}),
  reflRed:new THREE.MeshStandardMaterial({color:0xd12a20,roughness:.3,metalness:.1,emissive:0x400a05,emissiveIntensity:.6}),
};
/** 反射シートの貼られた標識面 */
export const faceMat=map=>new THREE.MeshPhysicalMaterial({map,roughness:.34,clearcoat:.45,clearcoatRoughness:.22});
/** 洗い出し・コンクリート系の材質 */
export function concreteMat(base='#b9b8b2',n=26000,rep=[1,1]){const c=noiseCanvas(512,base,n,235);const t=tex(c,{rep});t.userData.mimeType='image/jpeg';return new THREE.MeshStandardMaterial({map:t,roughness:.92});}

/* ---------- 画像 ---------- */
export function canvasTex(w,h,draw,{jpeg=false}={}){const c=cv(w,h),g=c.getContext('2d');draw(g,w,h);const t=tex(c);if(jpeg)t.userData.mimeType='image/jpeg';return t;}
export function arrowPath(g,x,y,len,wid,dir){ // 太い矢印(dir: 0=上 90=右 180=下 270=左)
  g.save();g.translate(x,y);g.rotate(deg(dir));g.beginPath();const h=len/2,hw=wid/2,sw=wid*.32;
  g.moveTo(0,-h);g.lineTo(hw,-h+wid*.85);g.lineTo(sw,-h+wid*.85);g.lineTo(sw,h);g.lineTo(-sw,h);g.lineTo(-sw,-h+wid*.85);g.lineTo(-hw,-h+wid*.85);g.closePath();g.fill();g.restore();}

/* ---------- 形状 ---------- */
export function circleShape(r){const s=new THREE.Shape();s.absarc(0,0,r,0,Math.PI*2,false);return s;}
/** 角を丸めた多角形(pts: [[x,y],…]) */
export function polyShape(pts,r){const s=new THREE.Shape(),n=pts.length;
  for(let i=0;i<n;i++){const p0=pts[(i+n-1)%n],p1=pts[i],p2=pts[(i+1)%n];
    const v1=new THREE.Vector2(p0[0]-p1[0],p0[1]-p1[1]),v2=new THREE.Vector2(p2[0]-p1[0],p2[1]-p1[1]),l1=v1.length(),l2=v2.length();v1.normalize();v2.normalize();
    const ang=Math.acos(Math.max(-1,Math.min(1,v1.dot(v2))));const d=Math.min(r/Math.tan(ang/2),l1/2,l2/2);
    const a=[p1[0]+v1.x*d,p1[1]+v1.y*d],b=[p1[0]+v2.x*d,p1[1]+v2.y*d];
    if(i===0)s.moveTo(a[0],a[1]);else s.lineTo(a[0],a[1]);s.quadraticCurveTo(p1[0],p1[1],b[0],b[1]);}
  s.closePath();return s;}

/* ---------- 標識板 ---------- */
/** 板の本体(アルミ・縁が少し丸い) */
export function plateBody(parent,shape,t=.004){const geo=new THREE.ExtrudeGeometry(shape,{depth:t,bevelEnabled:true,bevelThickness:.002,bevelSize:.003,bevelSegments:2,curveSegments:32});geo.translate(0,0,-t/2);return add(parent,geo,RM.alu);}
/** 板の表面(反射シートの画像)。w,h=画像が張られる範囲、cx,cy=その中心 */
export function plateFace(parent,shape,w,h,map,{t=.004,cx=0,cy=0}={}){const fg=new THREE.ShapeGeometry(shape,32),p=fg.attributes.position,uv=fg.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)-cx)/w+.5,(p.getY(i)-cy)/h+.5);return add(parent,fg,faceMat(map),0,0,t/2+.0035);}
export const plate=(parent,shape,w,h,map,o={})=>{plateBody(parent,shape,o.t);return plateFace(parent,shape,w,h,map,o);};

/* ---------- 支柱・金具 ---------- */
/** 標識の支柱(鋼管・亜鉛めっき。先端は丸いキャップ) */
export function signPole(parent,h,r=.03025){add(parent,new THREE.CylinderGeometry(r,r,h,40),RM.zinc,0,h/2,0);
  add(parent,new THREE.SphereGeometry(r*1.02,28,12,0,Math.PI*2,0,Math.PI/2),RM.zinc,0,h,0);
  add(parent,new THREE.CylinderGeometry(r*1.08,r*1.08,.012,40),RM.zincDull,0,.006,0);}
/** 板を柱に留めるバンド金具 */
export function clamp(parent,y,r,zPlate){const t=add(parent,new THREE.TorusGeometry(r+.005,.0055,10,40),RM.zinc,0,y,0);t.rotation.x=Math.PI/2;
  add(parent,roundBox(.05,.034,Math.max(.012,zPlate-r),.004,.002),RM.zinc,0,y,(r+zPlate)/2);bolt(parent,0,y,zPlate+.002,.007);}
/** 角パイプ・丸パイプの横材 */
export const bar=(parent,a,b,r=.02,mat=RM.zinc)=>rod(parent,a,b,r,mat,24);

/* ---------- 光る部品(街路灯・点滅灯) ---------- */
/** 板状の発光面。GLB 規約どおり mesh=lamp_<key>、material=lens_<key> */
export function lightPanel(lamps,key,parent,geo,color,x=0,y=0,z=0,map=null){const c=COL[color];const mat=lensMaterial(c.dark,c.e,map);mat.name='lens_'+key;mat.roughness=.3;if(map){mat.map=map;mat.color.set(0xffffff);}
  const lens=add(parent,geo,mat,x,y,z);lens.name='lamp_'+key;const L={g:lens,mat,glow:null,lens,v:0,t:0,color:c,key};allLamps.push(L);lamps[key]=L;return L;}

export {THREE,MAT,COL,add,rod,bolt,roundBox,rrShape,cv,tex,opt,optToggle,optChoice};
