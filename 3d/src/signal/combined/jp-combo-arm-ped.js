import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
const st=[{id:'s1',label:'車 青 / 歩 赤',on:['v_green','p_red']},{id:'s2',label:'車 黄 / 歩 赤',on:['v_yellow','p_red']},{id:'s3',label:'全赤',on:['v_red','p_red']},
  {id:'s4',label:'車 赤 / 歩 青',on:['v_red','p_walk']},{id:'s5',label:'車 赤 / 歩 青点滅',on:['v_red'],flash:['p_walk']},{id:'night',label:'夜間(車 黄点滅)',flash:['v_yellow']},{id:'off',label:'消灯'}];
export default {id:'jp-combo-arm-ped',name:'車両用(アーム式)+歩行者用 一体柱',
  desc:'交差点で最も一般的な組み合わせ。アームに車両用横型灯器を吊り、同じ柱の低い位置に歩行者用灯器・押ボタン箱・音響装置を備える。',
  dims:'柱高 約6.3m / 歩行者灯器高 約2.35m(推定)',focus:[1.5,3.8,.2],view:[1.4,.4,9],night:'night',states:st,
  cycle:[{s:'s1',d:7},{s:'s2',d:3},{s:'s3',d:1.5},{s:'s4',d:6},{s:'s5',d:4},{s:'s3',d:1.5}],options:[OPT_LENS,optToggle('backplate','背面板'),optToggle('button','押ボタン箱','on'),optToggle('sound','音響装置','on')],
  build(){const root=new THREE.Group(),L={};mastArm(root,6.3,5.9,3.4);horizHead(root,L,{x:2.9,y:5.28,R:.125,pitch:.31,H:.36,D:.23,mat:HG,hood:.3,prefix:'v_',backplate:true});hanger(root,2.9,5.46,5.9,.4);
    pedHousing(root,L,{y:2.35,pr:.108,yaw:Math.PI/2,prefix:'p_',mat:HG});const bo=opt(root,'button','on');bo.rotation.y=Math.PI/2;addButton(bo,L,1.2,.12);const so=opt(root,'sound','on');so.rotation.y=Math.PI/2;addSpeaker(so,3.0,.112);return {root,lamps:L};}};
