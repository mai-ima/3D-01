import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
export default {id:'jp-rail-relay',group:'rail',name:'中継信号機(白色灯の縦・横・斜め)',
  desc:'見通しの悪い場所で、主信号機の現示を中継する白色灯式。一般的な方式では縦=進行、横=停止、斜め=注意(減速)を示す。',
  dims:'マスク約0.78×0.78m(推定)。現示の割当は一般例',focus:[0,3.9,.4],view:[.6,.2,4.6],night:null,
  states:[{id:'go',label:'縦(進行)',on:['t','c','b']},{id:'stop',label:'横(停止)',on:['l','c','r']},{id:'slow',label:'斜め(注意)',on:['bl','c','tr']},{id:'off',label:'消灯'}],
  cycle:[{s:'go',d:5},{s:'slow',d:4},{s:'stop',d:5}],
  options:[OPT_LENS],
  build(){const root=new THREE.Group(),L={};const post=3.5;add(root,new THREE.BoxGeometry(.14,post,.14),MAT.galv,0,post/2,0);add(root,new THREE.BoxGeometry(.4,.04,.4),MAT.galv,0,.02,0);
    const g=new THREE.Group();g.position.set(0,post+.25,.3);root.add(g);housing(g,.7,.7,.26,.05,HK);add(g,roundBox(.8,.8,.03,.05,.006),MAT.black,0,0,.17);
    const fs=rrShape(.78,.78,.04);fs.holes.push(rrShape(.75,.75,.036));add(g,new THREE.ExtrudeGeometry(fs,{depth:.004,bevelEnabled:false,curveSegments:16}),MAT.white,0,0,.186);
    const P=.2;const pos={t:[0,P],b:[0,-P],l:[-P,0],r:[P,0],c:[0,0],tr:[P,P],bl:[-P,-P]};
    for(const k in pos)reg(L,k,makeLamp(g,pos[k][0],pos[k][1],.185,.07,'white',LED,{hood:.2,gap:1.0}));
    rod(root,[0,post-.4,0],[0,post-.1,.2],.03);return {root,lamps:L};}};
