import {setBody,optBody,THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
const st=[{id:'s1',label:'車 青 / 歩 赤',on:['v_green','p_red']},{id:'s2',label:'車 黄 / 歩 赤',on:['v_yellow','p_red']},{id:'s3',label:'全赤',on:['v_red','p_red']},
  {id:'s4',label:'車 赤 / 歩 青',on:['v_red','p_walk']},{id:'s5',label:'車 赤 / 歩 青点滅',on:['v_red'],flash:['p_walk']},{id:'night',label:'夜間(車 黄点滅)',flash:['v_yellow']},{id:'off',label:'消灯'}];
export default {id:'jp-combo-vert-ped',name:'車両用(縦型・積雪地)+歩行者用 一体柱',
  desc:'積雪寒冷地の側柱式。縦型の車両用灯器(着雪防止庇付き)と歩行者用灯器・押ボタン箱を同じ柱にまとめた構成。',
  dims:'柱高 約6.0m(推定)',focus:[1.0,3.6,.2],view:[1.4,.4,9],night:'night',states:st,
  cycle:[{s:'s1',d:7},{s:'s2',d:3},{s:'s3',d:1.5},{s:'s4',d:6},{s:'s5',d:4},{s:'s3',d:1.5}],options:[optBody('gray'),OPT_LENS,optToggle('snow','着雪防止の庇','on'),optToggle('button','押ボタン箱','on'),optToggle('sound','音響装置','on')],
  build(){setBody('#b7bcbe');const root=new THREE.Group(),L={};POLE_H(root,6,.0826,.0826);vertHead(root,L,{x:1.1,y:5.0,R:.15,pitch:.37,D:.161,mat:HG,tilt:20,hood:.4,snow:true,prefix:'v_'});
    for(const y of[5.55,4.45]){rod(root,[0,y,0],[.86,y,0],.026);add(root,new THREE.CylinderGeometry(.105,.105,.09,40),MAT.galv,0,y,0);}
    pedHousing(root,L,{y:2.3,pr:.0826,yaw:Math.PI/2,prefix:'p_',mat:HG});const bo=opt(root,'button','on');bo.rotation.y=Math.PI/2;addButton(bo,L,1.15,.086);const so=opt(root,'sound','on');so.rotation.y=Math.PI/2;addSpeaker(so,2.85,.083);return {root,lamps:L};}};
