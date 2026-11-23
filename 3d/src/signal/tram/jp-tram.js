import {setBody,optBody,tramHead,THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle} from '../../kit/signal-parts.js';
export default {id:'jp-tram',group:'tram',name:'路面電車用信号(赤×・黄矢印)',
  desc:'道路交通法の「電車用信号」。赤×は停止、黄色矢印は矢印の方向へ進行可。自動車は従わない。広島電鉄・都電荒川線・長崎・熊本などの軌道で見られる。',
  dims:'本体 約0.40×0.82×0.20m(推定)',focus:[1.1,4.6,0],view:[.6,.25,4.6],night:null,
  states:[{id:'stop',label:'停止(赤×)',on:['stop']},{id:'l',label:'左進行',on:['left']},{id:'s',label:'直進',on:['straight']},{id:'r',label:'右進行',on:['right']},{id:'ls',label:'左+直進',on:['left','straight']},{id:'off',label:'消灯'}],
  cycle:[{s:'stop',d:6},{s:'s',d:5},{s:'stop',d:3},{s:'l',d:4}],
  options:[optBody('gray')],
  build(){setBody('#b7bcbe');const root=new THREE.Group(),L={};POLE_H(root,5.4,.0826,.0826);tramHead(root,L,{x:1.0,y:4.55});
    for(const y of[4.85,4.25]){rod(root,[0,y,0],[.77,y,0],.024);add(root,new THREE.CylinderGeometry(.1,.1,.09,40),MAT.galv,0,y,0);}return {root,lamps:L};}};
