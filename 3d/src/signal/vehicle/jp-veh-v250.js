import {setBody,optBody,THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
export default {id:'jp-veh-v250',name:'車両用 縦型3灯 φ250(標準)',
  desc:'縦に3灯を並べた標準的な縦型。上から赤・黄・青。信号柱の側面にブラケットで取り付け、前傾15°で太陽光の直接反射を抑える。',
  dims:'レンズφ250mm / 前傾15°。本体寸法は推定',focus:[1.0,5.0,0],view:[.9,.3,5.6],night:'fy',states:S3,cycle:CY3,options:[optBody('gray'),OPT_LENS,optToggle('backplate','背面板')],
  build(){setBody('#b7bcbe');const root=new THREE.Group(),L={};POLE_H(root,5.7,.0826,.0826);vertHead(root,L,{x:1.0,y:5.0,R:.125,pitch:.31,D:.125,mat:HG,tilt:15,hood:.3,backplate:true});
    for(const y of[5.5,4.5]){rod(root,[0,y,0],[.8,y,0],.026);add(root,new THREE.CylinderGeometry(.1,.1,.09,40),MAT.galv,0,y,0);}return {root,lamps:L};}};
