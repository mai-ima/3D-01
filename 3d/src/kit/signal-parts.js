// 信号機モデル共通の部品(灯器ヘッド・取付金具・状態テーブル・任意部品)
import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,
  lensMaterial,domeLens,cv,tex,allLamps} from './index.js';
/* ---------- shared bits ---------- */
const HG=MAT.hous.clone();HG.color.set(0x858c90);          // 淡灰色の灯器
const HK=MAT.housD;                                           // 黒系の灯器
const reg=(lamps,key,L)=>{L.key=key;L.mat.name='lens_'+key;L.lens.name='lamp_'+key;if(L.lensB){L.matB.name='lensB_'+key;L.lensB.name='lampB_'+key;}lamps[key]=L;return L;};
const deg=THREE.MathUtils.degToRad;
function dotLamp(parent,x,y,z,R,color,map=null){const c=COL[color];const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  add(g,new THREE.CylinderGeometry(R*1.45,R*1.45,.012,32),MAT.rubber).rotation.x=Math.PI/2;
  const mat=lensMaterial(c.dark,c.e,map);const lens=add(g,domeLens(R,R*.3,64),mat,0,0,.007);
  const L={g,mat,glow:null,lens,v:0,t:0,color:c,key:null};allLamps.push(L);return L;}
function cylLamp(parent,x,y,z,R,h,color){const c=COL[color];const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  const mat=lensMaterial(c.dark,c.e,null);const lens=add(g,new THREE.CylinderGeometry(R,R,h,64,1,false),mat);
  add(g,new THREE.CylinderGeometry(R*1.08,R*1.08,.018,64),MAT.rubber,0,h/2+.009,0);add(g,new THREE.CylinderGeometry(R*1.08,R*1.08,.018,64),MAT.rubber,0,-h/2-.009,0);
  const L={g,mat,glow:null,lens,v:0,t:0,color:c,key:null};allLamps.push(L);return L;}
function hw(g,w,h,d){ // 前面扉のラッチ・ヒンジ・水抜きスリット
  for(const x of[-w*.34,w*.34])add(g,roundBox(.05,.032,.034,.008,.002),MAT.steel,x,-h/2+.012,d/2-.004);
  for(const x of[-w*.3,w*.3]){const k=add(g,new THREE.CylinderGeometry(.011,.011,.07,16),MAT.steel,x,h/2-.006,-d/2+.03);k.rotation.z=Math.PI/2;}
  for(let i=-3;i<=3;i++)add(g,new THREE.BoxGeometry(.028,.008,.05),MAT.black,i*.045,-h/2-.001,0);
  add(g,new THREE.BoxGeometry(.1,.035,.004),MAT.white,0,0,-d/2-.012);}                       // 銘板
function hanger(parent,sx,topY,armY,off){for(const o of[-off,off]){rod(parent,[sx+o,topY+.05,0],[sx+o,armY,0],.014,MAT.steel);
  const r=add(parent,new THREE.TorusGeometry(.064,.012,12,40),MAT.steel,sx+o,armY,0);r.rotation.y=Math.PI/2;}}
function strap(parent,y,r){const t=add(parent,new THREE.TorusGeometry(r,.009,10,48),MAT.steel,0,y,0);t.rotation.x=Math.PI/2;return t;}
function backplateOpt(g,W,H,D){const b=opt(g,'backplate','on');add(b,roundBox(W+.16,H+.16,.022,.06,.005),MAT.black,0,0,-D/2-.03);
  const fs=rrShape(W+.14,H+.14,.055);fs.holes.push(rrShape(W+.1,H+.1,.05));add(b,new THREE.ExtrudeGeometry(fs,{depth:.004,bevelEnabled:false,curveSegments:16}),MAT.white,0,0,-D/2-.019);}
function horizHead(parent,lamps,{x=0,y=0,z=0,R=.15,pitch=.37,H=.41,D=.26,mat=MAT.hous,tilt=0,keys=['green','yellow','red'],hood=.34,gap=1.55,prefix='',backplate=false}){
  const n=keys.length,W=(n-1)*pitch+2*R+.17;const g=new THREE.Group();g.position.set(x,y,z);g.rotation.x=deg(tilt);parent.add(g);
  housing(g,W,H,D,.1,mat);hw(g,W,H,D);if(backplate)backplateOpt(g,W,H,D);
  keys.forEach((k,i)=>reg(lamps,prefix+k,makeLamp(g,(i-(n-1)/2)*pitch,0,D/2,R,k,LED,{hood,gap})));
  for(const sx of[-W*.38,W*.38]){add(g,roundBox(.16,.05,.1,.015,.004),MAT.galv,sx,H/2+.03,0);bolt(g,sx,H/2+.06,0,.012,'y');}
  return {g,W,H,D};}
function vertHead(parent,lamps,{x=0,y=0,z=0,R=.15,pitch=.37,D=.26,mat=MAT.hous,tilt=0,keys=['red','yellow','green'],hood=.34,gap=1.55,snow=false,backplate=false,prefix=''}){
  const n=keys.length,H=(n-1)*pitch+2*R+.17,W=2*R+.17;const g=new THREE.Group();g.position.set(x,y,z);g.rotation.x=deg(tilt);parent.add(g);
  housing(g,W,H,D,.1,mat);hw(g,W,H,D);if(backplate)backplateOpt(g,W,H,D);
  keys.forEach((k,i)=>reg(lamps,prefix+k,makeLamp(g,0,((n-1)/2-i)*pitch,D/2,R,k,LED,{hood,gap:snow?1.0:gap})));
  if(snow){const so=opt(g,'snow','on');const r=add(so,roundBox(W+.06,.02,D+hood+.1,.01,.004),mat,0,H/2+.05,hood/2-.02);r.rotation.x=-.14;}  // 着雪防止の庇(任意)
  for(const sy of[-H*.36,H*.36])add(g,roundBox(.06,.16,.1,.015,.004),MAT.galv,-W/2-.025,sy,0);
  return {g,W,H,D};}
const POLE_H=(root,h,r0=.1,r1=.065)=>pole(root,h,r0,r1,{bands:false});

/* ---------- state helpers ---------- */
const S3=[{id:'g',label:'青',on:['green']},{id:'y',label:'黄',on:['yellow']},{id:'r',label:'赤',on:['red']},{id:'fy',label:'黄点滅',flash:['yellow']},{id:'fr',label:'赤点滅',flash:['red']},{id:'off',label:'消灯'}];
const CY3=[{s:'g',d:8},{s:'y',d:3},{s:'r',d:8}];
const SPED=[{id:'r',label:'赤(止まれ)',on:['red']},{id:'g',label:'青(渡れる)',on:['walk']},{id:'gb',label:'青点滅(渡り終えて)',flash:['walk']},{id:'off',label:'消灯'}];

function xTexture(){const c=cv(256,256),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,256);g.strokeStyle='#fff';g.lineWidth=34;g.lineCap='butt';g.beginPath();g.moveTo(52,52);g.lineTo(204,204);g.moveTo(204,52);g.lineTo(52,204);g.stroke();return tex(c);}
function pedHousing(root,L,{y,pr=.065,yaw=0,prefix='',withBar=false,mat=MAT.hous,pictoWalk=pedTexture('walk'),pictoStand=pedTexture('stand'),color='green'}){
  if(yaw){const wr=new THREE.Group();wr.rotation.y=yaw;root.add(wr);root=wr;}   // 歩行者灯は横断方向へ向ける
  const W=withBar?.58:.4,H=.8,D=.17;const g=new THREE.Group();g.position.set(0,y,pr+.105);root.add(g);
  housing(g,W,H,D,.07,mat);hw(g,W,H,D);const ox=withBar?-.08:0;
  const mk=(key,col,pt,ly)=>{const c=COL[col];const geo=new THREE.ShapeGeometry(rrShape(.28,.28,.045),24);const p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/.28+.5,p.getY(i)/.28+.5);
    const lg=new THREE.Group();lg.position.set(ox,ly,D/2);g.add(lg);
    const fs=rrShape(.335,.335,.055);fs.holes.push(rrShape(.28,.28,.045));add(lg,new THREE.ExtrudeGeometry(fs,{depth:.02,bevelEnabled:false,curveSegments:24}),MAT.rubber);
    add(lg,new THREE.PlaneGeometry(.34,.34),MAT.black,0,0,-.003);
    const mat2=lensMaterial(c.dark,c.e,pt);mat2.map=null;mat2.clearcoat=.25;mat2.roughness=.4;const lens=add(lg,geo,mat2,0,0,.004);
    add(lg,roundBox(.37,.014,.13,.005,.002),mat,0,.19,.05);                               // 庇
    const o={g:lg,mat:mat2,glow:null,lens,v:0,t:0,color:c,key:null};allLamps.push(o);reg(L,key,o);};
  mk(prefix+'red','red',pictoStand,.215);mk(prefix+'walk',color,pictoWalk,-.215);
  for(const yy of[.3,-.3]){strap(root,y+yy,pr+.006);add(root,roundBox(.05,.022,.1,.006,.003),MAT.steel,0,y+yy,pr+.035);}
  return {g,W,H,D,ox};}
function railBody(keys,colors,{post=3.6,mastW=.14}={}){
  const root=new THREE.Group(),L={};const n=keys.length,pitch=.27,R=.095,H=n*pitch+.07,W=.36;
  add(root,new THREE.BoxGeometry(mastW,post,mastW),MAT.galv,0,post/2,0);add(root,new THREE.BoxGeometry(.4,.04,.4),MAT.galv,0,.02,0);
  for(let i=0;i<4;i++)add(root,new THREE.CylinderGeometry(.02,.02,.04,6),MAT.steel,i%2?.16:-.16,.06,i<2?.16:-.16);
  for(let y=.5;y<post-.5;y+=.35){add(root,new THREE.BoxGeometry(.3,.025,.025),MAT.galv,0,y,-mastW/2-.012);}                // 昇塔ステップ
  const cy=post+H/2-.1;const g=new THREE.Group();g.position.set(0,cy,mastW/2+.16);root.add(g);
  housing(g,W-.04,H-.04,.3,.04,HK);add(g,roundBox(W+.14,H+.14,.03,.03,.006),MAT.black,0,0,.2).scale.z=1;                      // 背景板(マスク)
  const fs=rrShape(W+.12,H+.12,.028);fs.holes.push(rrShape(W+.09,H+.09,.024));add(g,new THREE.ExtrudeGeometry(fs,{depth:.004,bevelEnabled:false,curveSegments:16}),MAT.white,0,0,.216);
  keys.forEach((k,i)=>reg(L,k,makeLamp(g,0,(n-1)/2*pitch-i*pitch,.215,R,colors[i],LED,{hood:.27,gap:.9})));
  rod(root,[0,post-.3,0],[0,cy-H/2+.1,mastW/2+.02],.03);rod(root,[0,cy-H/2-.05,mastW/2],[0,cy-H/2-.05,mastW/2+.15],.03);
  return {root,lamps:L,cy};}
function stripePole(root,h,r){for(let i=0;i<Math.floor(h/.2);i++)add(root,new THREE.CylinderGeometry(r+.0015,r+.0015,.2,56,1,true),i%2?MAT.black:MAT.yel,0,.1+i*.2,0).scale.set(1.03,1,1.03);
  add(root,new THREE.CylinderGeometry(r*1.9,r*1.9,.03,56),MAT.galv,0,.015,0);add(root,new THREE.SphereGeometry(r*1.05,32,12,0,Math.PI*2,0,Math.PI/2),MAT.black,0,h,0);}
const arrowStates=[
  {id:'g+s',label:'青+直進',on:['green','straight']},{id:'g+l+s',label:'青+左+直進',on:['green','left','straight']},{id:'g',label:'青',on:['green']},
  {id:'y',label:'黄',on:['yellow']},{id:'r',label:'赤',on:['red']},{id:'r+l',label:'赤+左矢印',on:['red','left']},{id:'r+r',label:'赤+右矢印',on:['red','right']},
  {id:'r+l+r',label:'赤+左右矢印',on:['red','left','right']},{id:'fy',label:'黄点滅',flash:['yellow']},{id:'off',label:'消灯'}];
function addSpeaker(parent,y,pr=.06){const sp=add(parent,roundBox(.2,.16,.13,.03,.006),MAT.white,0,y,pr+.04);for(let i=-3;i<=3;i++)add(sp,new THREE.BoxGeometry(.13,.006,.01),MAT.black,0,i*.016,.066);return sp;}
function addButton(parent,L,y,pr=.06){const bx=new THREE.Group();bx.position.set(0,y,pr+.04);parent.add(bx);add(bx,roundBox(.17,.3,.085,.025,.006),MAT.yel);
  const c=cv(256,420),x=c.getContext('2d');x.fillStyle='#f1c40f';x.fillRect(0,0,256,420);x.fillStyle='#111';x.textAlign='center';x.font='700 38px "Noto Sans JP",sans-serif';x.fillText('おして',128,56);x.fillText('ください',128,102);
  x.fillStyle='#fff';x.fillRect(20,300,216,60);x.fillStyle='#c62828';x.font='700 32px "Noto Sans JP",sans-serif';x.fillText('おまちください',128,344,200);
  add(bx,new THREE.PlaneGeometry(.155,.255),new THREE.MeshStandardMaterial({map:tex(c),roughness:.45}),0,0,.0435);
  const btn=add(bx,new THREE.CylinderGeometry(.05,.054,.025,48),new THREE.MeshPhysicalMaterial({color:0xd62828,roughness:.25,clearcoat:1}),0,.03,.055);btn.rotation.x=Math.PI/2;
  reg(L,'wait',dotLamp(bx,0,-.085,.0445,.016,'red'));for(const yy of[.12,-.12])strap(parent,y+yy,pr-.004);return bx;}
function tramHead(parent,L,{x=0,y=0,z=0,prefix=''}={}){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  housing(g,.46,.84,.22,.07,HK);hw(g,.46,.84,.22);reg(L,prefix+'stop',makeLamp(g,0,.22,.11,.15,'red',xTexture(),{hood:.3,gap:1.5}));
  [['left',-.13],['straight',0],['right',.13]].forEach(([k,lx])=>reg(L,prefix+k,makeLamp(g,lx,-.22,.11,.062,'yellow',arrowTexture(k),{hood:.045,gap:1.9})));
  for(const sx of[-.14,.14])add(g,roundBox(.08,.05,.1,.015,.004),MAT.galv,sx,.445,0);return g;}
export const OPT_LENS={id:"lens",label:"灯火方式",choices:[{id:"led",label:"LED式"},{id:"bulb",label:"電球式"}],default:"led"};
export const optToggle=(id,label,def="off")=>({id,label,choices:[{id:"off",label:"なし"},{id:"on",label:"あり"}],default:def});
export {tramHead,addSpeaker,addButton,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps};
