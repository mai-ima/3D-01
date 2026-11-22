import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
export default {id:'jp-veh-flash',group:'road-vehicle',name:'点滅専用灯器(黄・赤 2灯式)',
  desc:'押ボタン式や警戒交差点で使う、黄色点滅(注意)・赤色点滅(一時停止)の2灯式。通常は黄と赤を交互または単独で点滅させる。',
  dims:'φ250・2灯(推定寸法)',focus:[.9,5.0,0],view:[.6,.3,4.6],night:'fy',
  states:[{id:'fy',label:'黄点滅',flash:['yellow']},{id:'fr',label:'赤点滅',flash:['red']},{id:'alt',label:'黄赤交互',flash:['yellow'],flash2:['red']},{id:'off',label:'消灯'}],
  cycle:[{s:'fy',d:6},{s:'alt',d:6},{s:'fr',d:6}],
  options:[OPT_LENS],
  build(){const root=new THREE.Group(),L={};POLE_H(root,5.6,.0826,.0826);horizHead(root,L,{x:1.15,y:5.0,R:.125,pitch:.33,H:.37,D:.125,mat:MAT.hous,keys:['yellow','red'],hood:.3,tilt:15});
    for(const y of[5.18,4.82]){rod(root,[0,y,0],[.78,y,0],.024);add(root,new THREE.CylinderGeometry(.095,.095,.09,40),MAT.galv,0,y,0);}return {root,lamps:L};}};
