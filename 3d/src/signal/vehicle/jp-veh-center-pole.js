import {CY3,HG,MAT,OPT_LENS,S3,THREE,add,cv,optBody,pole,rod,setBody,tex,vertHead} from '../../kit/signal-parts.js';
// 中央柱式(熊本の交差点などの実物写真): 交差点の島に立つ1本の柱に、縦型3灯の灯器を各方向に取り付ける。基礎は黄黒の斜め縞のコンクリート
function stripeTex(){const c=cv(512,128),g=c.getContext('2d');g.fillStyle='#f0c010';g.fillRect(0,0,512,128);g.fillStyle='#16130a';for(let x=-128;x<640;x+=80){g.beginPath();g.moveTo(x,128);g.lineTo(x+40,128);g.lineTo(x+40+128,0);g.lineTo(x+128,0);g.closePath();g.fill();}const t=tex(c);t.wrapS=THREE.RepeatWrapping;return t;}
export default {id:'jp-veh-center-pole',name:'車両用 中央柱式(島の柱に縦型3灯×2方向)',
  desc:'交差点の中央の島に立つ1本の柱に、縦型3灯の灯器を方向ごとに取り付けた形。基礎は黄と黒の斜め縞のコンクリート。実物写真(熊本)を参考にした形状。',
  dims:'柱高 約5.5m / 基礎径 約1.4m(推定)',focus:[0,4.4,0],view:[1.6,.5,6.8],night:'fy',states:S3,cycle:CY3,options:[optBody('gray'),OPT_LENS],
  build(){setBody('#b7bcbe');const root=new THREE.Group(),L={};
    const bs=new THREE.MeshStandardMaterial({map:stripeTex(),roughness:.9});bs.map.repeat.set(3,1);
    const base=add(root,new THREE.CylinderGeometry(.7,.72,.75,64,1),bs,0,.375,0);add(root,new THREE.CylinderGeometry(.72,.72,.06,64),new THREE.MeshStandardMaterial({color:0xb8b8b2,roughness:.9}),0,.78,0);
    pole(root,5.5,.1,.082,{bands:false});
    const mk=(ang,prefix)=>{const g=new THREE.Group();g.rotation.y=ang;root.add(g);
      vertHead(g,L,{x:.24,y:4.55,R:.125,pitch:.31,D:.125,mat:HG,hood:.3,prefix});
      for(const y of[5.0,4.1]){rod(g,[.07,y,0],[.12,y,0],.022);add(g,new THREE.CylinderGeometry(.095,.095,.08,36),MAT.galv,0,y,0);}};
    mk(0,'');                                            // 手前向きの灯器(点灯制御の対象)
    for(const a of[Math.PI/2,Math.PI,-Math.PI/2]){const g=new THREE.Group();g.rotation.y=a;root.add(g);const hh={};vertHead(g,hh,{x:.24,y:4.55,R:.125,pitch:.31,D:.125,mat:HG,hood:.3,prefix:'x'+Math.round(a*10)});for(const k in hh){hh[k].v=hh[k].t=0;}
      for(const y of[5.0,4.1]){rod(g,[.07,y,0],[.12,y,0],.022);add(g,new THREE.CylinderGeometry(.095,.095,.08,36),MAT.galv,0,y,0);}
      for(const k in hh)L[k]=hh[k];}
    return {root,lamps:L};}};
