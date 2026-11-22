import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
export default {id:'jp-veh-h300-arm',group:'road-vehicle',name:'車両用 横型3灯 φ300(アーム式)',
  desc:'国内で最も多い標準形。レンズ径φ300mm、左から青・黄・赤。ダークグリーン塗装の灯器を、門型・アーム式の支柱から吊り下げる。',
  dims:'本体 約1.15×0.41×0.26m(φ300標準値による推定)',focus:[3.1,5.3,0],view:[.9,.4,6.4],night:'fy',states:S3,cycle:CY3,
  options:[OPT_LENS,optToggle('backplate','背面板')],
  build(){const root=new THREE.Group(),L={};mastArm(root,6.2,5.8,3.6);const h=horizHead(root,L,{x:3.1,y:5.18,R:.15,pitch:.37,H:.41,D:.26,mat:MAT.hous,backplate:true});hanger(root,3.1,5.38,5.8,.45);return {root,lamps:L};}};
