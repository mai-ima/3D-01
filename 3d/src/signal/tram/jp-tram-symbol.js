import {HG,MAT,POLE_H,THREE,add,cv,housing,hw,makeLamp,optBody,reg,rod,setBody,tex} from '../../kit/signal-parts.js';
// 路面電車の軌道信号(記号灯): 富山ライトレール・万葉線などの実物写真を参考に、×・+・T・I の記号を灯す黒い縦型4灯
function symTex(kind){const c=cv(256,256),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,256);g.strokeStyle='#fff';g.lineWidth=26;g.lineCap='butt';g.beginPath();
  if(kind==='x'){g.moveTo(52,52);g.lineTo(204,204);g.moveTo(204,52);g.lineTo(52,204);}
  if(kind==='plus'){g.moveTo(128,40);g.lineTo(128,216);g.moveTo(40,128);g.lineTo(216,128);}
  if(kind==='t'){g.moveTo(50,70);g.lineTo(206,70);g.moveTo(128,70);g.lineTo(128,214);}
  if(kind==='i'){g.moveTo(128,36);g.lineTo(128,220);}g.stroke();return tex(c);}
export default {id:'jp-tram-symbol',name:'軌道信号(記号灯 ×・+・T・I)',
  desc:'路面電車・LRTの軌道信号。黒い灯器に、×(赤)・+(橙)・T(橙)・I(青緑)の記号灯が並ぶ。×は停止。他の記号の意味は事業者ごとに定められる(実物写真を参考にした形状)。',
  dims:'本体 約0.42×1.45m(推定)',focus:[1.0,4.6,0],view:[.7,.3,5],night:null,
  states:[{id:'x',label:'× 停止',on:['x']},{id:'plus',label:'+',on:['plus']},{id:'t',label:'T',on:['t']},{id:'i',label:'I 進行',on:['i']},{id:'off',label:'消灯'}],
  cycle:[{s:'x',d:5},{s:'i',d:5},{s:'t',d:3},{s:'plus',d:3}],
  options:[optBody('black')],
  build(){setBody('#1b1e20');const root=new THREE.Group(),L={};POLE_H(root,5.4,.0826,.0826);const g=new THREE.Group();g.position.set(1.0,4.4,0);root.add(g);
    housing(g,.42,1.46,.2,.06,HG);hw(g,.42,1.46,.2);
    [['x','red','x',.54],['plus','yellow','plus',.18],['t','yellow','t',-.18],['i','green','i',-.54]].forEach(([k,c,s,y])=>reg(L,k,makeLamp(g,0,y,.1,.125,c,symTex(s),{hood:.22,gap:1.6,hoodMat:HG})));
    for(const y of[4.95,3.85]){rod(root,[0,y,0],[.78,y,0],.024);add(root,new THREE.CylinderGeometry(.1,.1,.09,40),MAT.galv,0,y,0);}
    return {root,lamps:L};}};
