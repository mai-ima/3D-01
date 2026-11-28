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
// 反射シートの面。つやを強くしすぎると、空の映り込みで白い膜がかかり、白と緑の差が弱く見える
export const faceMat=map=>new THREE.MeshPhysicalMaterial({map,roughness:.55,clearcoat:.12,clearcoatRoughness:.4,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});   // 板の本体の前面と近いので、重なって乱れないよう手前に寄せる
/** 洗い出し・コンクリート系の材質 */
/** 高さ(0〜1)の格子から、法線マップ(canvas)を作る。strength=凹凸の強さ */
function heightToNormal(h,n,strength){const c=cv(n,n),g=c.getContext('2d'),im=g.createImageData(n,n),d=im.data;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const l=h[y*n+(x+n-1)%n],r=h[y*n+(x+1)%n],u=h[((y+n-1)%n)*n+x],dn=h[((y+1)%n)*n+x];
    let nx=(l-r)*strength,ny=(u-dn)*strength,nz=1;const k=1/Math.hypot(nx,ny,nz);nx*=k;ny*=k;nz*=k;const o=(y*n+x)*4;d[o]=(nx*.5+.5)*255;d[o+1]=(ny*.5+.5)*255;d[o+2]=(nz*.5+.5)*255;d[o+3]=255;}
  g.putImageData(im,0,0);return c;}
/** 値のむらを重ねた格子(フラクタルノイズ)。n×n・繰り返しても継ぎ目が出ない */
function fbm(n,oct=5,seed=7){let s=seed;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;const out=new Float32Array(n*n);let amp=1,tot=0;
  for(let o=0;o<oct;o++){const g=4<<o,grid=new Float32Array(g*g);for(let i=0;i<g*g;i++)grid[i]=rnd();
    for(let y=0;y<n;y++){const fy=y/n*g,y0=Math.floor(fy),ty=fy-y0,sy=ty*ty*(3-2*ty);for(let x=0;x<n;x++){const fx=x/n*g,x0=Math.floor(fx),tx=fx-x0,sx=tx*tx*(3-2*tx);
      const a=grid[(y0%g)*g+(x0%g)],b=grid[(y0%g)*g+((x0+1)%g)],c=grid[((y0+1)%g)*g+(x0%g)],d=grid[((y0+1)%g)*g+((x0+1)%g)];
      out[y*n+x]+=amp*(a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy);}}tot+=amp;amp*=.5;}
  for(let i=0;i<out.length;i++)out[i]/=tot;return out;}
/** 打放しコンクリート: 色むら・小さな気泡・型枠の継ぎ目・セパレーター穴(Pコンの穴)・凹凸(法線マップ)つき。新品の状態(汚れ・経年劣化は描かない) */
export function concreteMat(base='#b9b8b2',n=26000,rep=[1,1],{formwork=true}={}){const N=512,h=fbm(N,5,11),tint=fbm(N,3,29);
  const c=cv(N,N),g=c.getContext('2d'),im=g.createImageData(N,N),d=im.data;const b=new THREE.Color(base);
  for(let i=0;i<N*N;i++){const v=.86+tint[i]*.22+(h[i]-.5)*.16;d[i*4]=Math.min(255,b.r*255*v);d[i*4+1]=Math.min(255,b.g*255*v);d[i*4+2]=Math.min(255,b.b*255*v);d[i*4+3]=255;}
  g.putImageData(im,0,0);
  for(let i=0;i<n/12;i++){const x=Math.random()*N,y=Math.random()*N,r=Math.random()*1.4+.3;g.fillStyle=`rgba(40,40,38,${Math.random()*.28+.06})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();h[(y|0)*N+(x|0)]-=.25;}   // 気泡(小さな穴)
  if(formwork){g.fillStyle='rgba(60,60,58,.22)';for(let y=0;y<N;y+=128)g.fillRect(0,y,N,2);for(let x=0;x<N;x+=256)g.fillRect(x,0,1.5,N);        // 型枠(合板)の継ぎ目
    for(let y=64;y<N;y+=128)for(let x=64;x<N;x+=256){g.fillStyle='rgba(30,30,30,.55)';g.beginPath();g.arc(x,y,5,0,7);g.fill();g.fillStyle='rgba(120,120,116,.7)';g.beginPath();g.arc(x,y,2.4,0,7);g.fill();}}      // セパレーターの穴
  const t=tex(c,{rep});t.userData.mimeType='image/jpeg';const nm=tex(heightToNormal(h,N,2.2),{rep,srgb:false});nm.userData.mimeType='image/jpeg';
  return new THREE.MeshStandardMaterial({map:t,normalMap:nm,normalScale:new THREE.Vector2(.8,.8),roughness:.9});}
export {fbm,heightToNormal};

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
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)-cx)/w+.5,(p.getY(i)-cy)/h+.5);return add(parent,fg,faceMat(map),0,0,t/2+.006);}
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

export {THREE,MAT,COL,add,rod,bolt,roundBox,rrShape,cv,tex,noiseCanvas,opt,optToggle,optChoice};
