import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
const st=[{id:'t1',label:'車 青 / 電車 停止',on:['v_green','stop']},{id:'t2',label:'車 黄 / 電車 停止',on:['v_yellow','stop']},{id:'t3',label:'全赤(電車 停止)',on:['v_red','stop']},
  {id:'t4',label:'車 赤 / 電車 直進',on:['v_red','straight']},{id:'t5',label:'車 赤 / 電車 左+直進',on:['v_red','left','straight']},{id:'night',label:'夜間(車 黄点滅)',flash:['v_yellow'],on:['stop']},{id:'off',label:'消灯'}];
export default {id:'jp-tram-with-vehicle',name:'路面電車用+車両用 一体(アーム式)',
  desc:'軌道が道路と交差・併用する交差点で、路面電車用信号(赤×・黄矢印)と車両用灯器を同じアームに並べた構成。電車は車両用の現示とは別に矢印で進行する。',
  dims:'アーム長 約4.0m(推定)',focus:[2.4,5.3,0],view:[1.2,.4,7.5],night:'night',states:st,
  cycle:[{s:'t1',d:7},{s:'t2',d:3},{s:'t3',d:1.5},{s:'t4',d:6},{s:'t5',d:3},{s:'t3',d:1.5}],options:[OPT_LENS,optToggle('backplate','背面板')],
  build(){const root=new THREE.Group(),L={};mastArm(root,6.4,6.0,4.1);tramHead(root,L,{x:1.7,y:5.36});for(const o of[-.14,.14]){rod(root,[1.7+o,5.8,0],[1.7+o,6.0,0],.016,MAT.steel);}
    horizHead(root,L,{x:3.2,y:5.5,R:.125,pitch:.31,H:.36,D:.23,mat:HG,hood:.3,prefix:'v_',backplate:true});hanger(root,3.2,5.68,6.0,.4);return {root,lamps:L};}};
