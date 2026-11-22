import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
export default {id:'jp-bike-ped',group:'road-ped',name:'自転車・歩行者用灯器',
  desc:'自転車横断帯のある横断歩道などで使う灯器。自転車の図柄が赤(止まれ)と青(進め)で点灯する。',
  dims:'本体 約0.40×0.80×0.17m(推定)',focus:[0,2.35,.2],view:[.5,.2,4],night:null,states:SPED,cycle:[{s:'r',d:7},{s:'g',d:6},{s:'gb',d:4}],
  build(){const root=new THREE.Group(),L={};POLE_H(root,3.0,.065,.052);pedHousing(root,L,{y:2.3,mat:HK,pictoWalk:bikeTexture(),pictoStand:bikeTexture()});return {root,lamps:L};}};
