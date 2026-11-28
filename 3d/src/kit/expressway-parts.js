// 高速道路用の部品(料金所・案内標識・情報板・防護柵)。road-parts.js(と kit/index.js)だけに依存する
import {THREE,RM,add,bar,polyShape,plateBody,plateFace,canvasTex,FONT,concreteMat,deg}from './road-parts.js';
export * from './road-parts.js';

/* ---------- 高速道路まわりの色(NEXCO・首都高の標準色に近い代表値) ---------- */
export const EXC={green:'#0b6b45',greenDark:'#09563a',blue:'#1c4f9c',purple:'#6a4fd0',purpleDark:'#4a37a0',ink:'#101418',
  cream:0xdcd6c3,gray:0x4a5057,grayLight:0x9ea5ab,grayDark:0x2f353a};
export const EXM={
  canopy:new THREE.MeshStandardMaterial({color:EXC.gray,roughness:.62,metalness:.25}),
  canopyDark:new THREE.MeshStandardMaterial({color:EXC.grayDark,roughness:.7,metalness:.2}),
  pillar:new THREE.MeshStandardMaterial({color:0x8a9096,roughness:.7,metalness:.2}),
  cream:new THREE.MeshStandardMaterial({color:EXC.cream,roughness:.62}),
  creamWhite:new THREE.MeshPhysicalMaterial({color:0xe8e4d6,roughness:.5,clearcoat:.25}),
  cabinet:new THREE.MeshStandardMaterial({color:0xc4c9cc,roughness:.55,metalness:.15}),
  glass:new THREE.MeshPhysicalMaterial({color:0x1a2a33,roughness:.08,metalness:.1,clearcoat:1,transparent:true,opacity:.82}),
};

/** 断面(z,y)の多角形を x 方向に押し出す。幅 w で x=0 中心。柱状の島端・クッションなどに使う */
export function prism(profile,w){const s=new THREE.Shape(profile.map(([z,y])=>new THREE.Vector2(z,y)));
  const g=new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:false,curveSegments:16});g.rotateY(-Math.PI/2);g.translate(w/2,0,0);return g;}

/* ---------- 料金所のレーン種別表示板(文字面) ---------- */
export const LANE_KINDS={etc:'ETC専用',etcPlain:'ETC',mix:'ETC・一般',gen:'一般'};
export function laneBoardTex(kind){return canvasTex(680,250,(g,w,h)=>{g.fillStyle='#202428';g.fillRect(0,0,w,h);
  const plate=(x,y,pw,ph,col,txt,fs)=>{g.fillStyle=col;g.beginPath();g.roundRect(x,y,pw,ph,10);g.fill();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=`700 ${fs}px ${FONT}`;g.fillText(txt,x+pw/2,y+ph/2+4,pw*.9);};
  if(kind==='etc')plate(70,56,540,138,EXC.purple,'ETC専用',104);
  else if(kind==='etcPlain')plate(120,56,440,138,EXC.purple,'E T C',108);
  else if(kind==='mix'){plate(40,56,330,138,EXC.purple,'ETC',100);plate(380,56,260,138,EXC.green,'一般',100);}
  else plate(150,56,380,138,EXC.green,'一般',112);});}
/** 速度表示(赤色LED): 20km/h以下 */
export function speedTex(){return canvasTex(256,512,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
  g.font=`700 150px ${FONT}`;g.fillText('20',w/2,150);g.font=`700 60px ${FONT}`;g.fillText('Km/h',w/2,260);g.font=`700 80px ${FONT}`;g.fillText('以下',w/2,380);});}
/** 地名板(緑地・白文字・日英併記) */
export function nameTex(ja,en,w=1536,h=200){return canvasTex(w,h,(g)=>{g.fillStyle=EXC.green;g.fillRect(0,0,w,h);g.strokeStyle='#fff';g.lineWidth=5;g.strokeRect(10,10,w-20,h-20);
  g.fillStyle='#fff';g.textBaseline='middle';g.textAlign='left';g.font=`700 ${h*.5}px ${FONT}`;g.fillText(ja,60,h*.5);const jw=g.measureText(ja).width;g.font=`500 ${h*.32}px ${FONT}`;g.fillText(en,60+jw+40,h*.56);});}
/** 路面標示: 青地に白の山形(減速を促すレーン表示) */
export function blueZoneTex(){return canvasTex(512,1024,(g,w,h)=>{g.fillStyle='#2f86c4';g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.9)';
  for(let i=0;i<4;i++){const y=90+i*240;g.beginPath();g.moveTo(40,y+80);g.lineTo(w/2,y);g.lineTo(w-40,y+80);g.lineTo(w-40,y+130);g.lineTo(w/2,y+50);g.lineTo(40,y+130);g.closePath();g.fill();}});}
/** 赤白の縞(開閉バー・クッション) */
export const redWhite=(i)=>i%2?RM.white:RM.red;
export {deg,concreteMat};

/* ---------- 案内標識の文字面(緑地・白文字) ---------- */
export const PX=240;   // 1m あたりの画像の画素数
/** 緑地の案内板の画像。draw(g,w,h) で文字や矢印を描く。縁は白 */
export function greenFace(wm,hm,draw,{bg=EXC.green,border=true}={}){return canvasTex(Math.round(wm*PX),Math.round(hm*PX),(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle=bg;g.beginPath();g.roundRect(12,12,w-24,h-24,16);g.fill();
  if(border){g.strokeStyle='#fff';g.lineWidth=6;g.beginPath();g.roundRect(24,24,w-48,h-48,10);g.stroke();}
  g.fillStyle='#fff';g.textBaseline='middle';draw(g,w,h);});}
export const txt=(g,s,x,y,size,{align='left',maxW,weight=700}={})=>{g.textAlign=align;g.font=`${weight} ${size}px ${FONT}`;g.fillText(s,x,y,maxW);};
/** 出口番号の白い四角(紫地のETC専用表示つき) */
export function exitNumber(g,x,y,num,{etc=false}={}){g.save();g.fillStyle='#fff';g.fillRect(x,y,110,100);g.fillStyle=EXC.green;g.font=`700 70px ${FONT}`;g.textAlign='center';g.fillText(num,x+55,y+52);
  if(etc){g.fillStyle=EXC.purple;g.fillRect(x+120,y,190,100);g.fillStyle='#fff';g.font=`700 60px ${FONT}`;g.fillText('ETC',x+215,y+50);}g.restore();}
/** 板(角丸)を1枚: 本体+面。parent の (x,y,z) に置く */
export function signBoard(parent,wm,hm,map,x,y,z,r=.05){const sh=polyShape([[-wm/2,hm/2],[wm/2,hm/2],[wm/2,-hm/2],[-wm/2,-hm/2]],r);const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);plateBody(g,sh,.006);plateFace(g,sh,wm,hm,map,{t:.006});return g;}
/** トラス(上弦・下弦・斜材)。a→b の長さを n 区間 */
export function truss(parent,a,b,h,n,r=.04,mat=RM.zinc){const dx=(b[0]-a[0]),L=Math.abs(dx),dir=Math.sign(dx)||1;
  for(const y of[a[1],a[1]+h])add(parent,new THREE.CylinderGeometry(r,r,L,12),mat,(a[0]+b[0])/2,y,a[2]).rotation.z=Math.PI/2;
  for(let i=0;i<n;i++){const x0=a[0]+dir*L*i/n,x1=a[0]+dir*L*(i+1)/n;const up=i%2===0;
    bar(parent,[x0,up?a[1]:a[1]+h,a[2]],[x1,up?a[1]+h:a[1],a[2]],r*.6,mat);}}
