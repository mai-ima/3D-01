import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
export default {id:'jp-veh-arrow',group:'road-vehicle',name:'車両用 横型3灯+矢印灯(左・直進・右)',
  desc:'主灯の下に青色矢印の補助灯(左折・直進・右折)を備える。右折専用現示や分離信号の交差点で使われる。',
  dims:'主灯φ250 + 矢印灯φ230(推定)',focus:[1.5,5.3,0],view:[.8,.3,6],night:'fy',states:arrowStates,
  cycle:[{s:'g+s',d:6},{s:'g+l+s',d:3},{s:'y',d:3},{s:'r',d:2},{s:'r+r',d:5},{s:'r+l+r',d:3}],
  options:[OPT_LENS,optToggle('backplate','背面板')],
  build(){const root=new THREE.Group(),L={};mastArm(root,6.3,5.95,3.2);const cx=2.7,cy=5.45;
    horizHead(root,L,{x:cx,y:cy,R:.125,pitch:.31,H:.36,D:.23,mat:MAT.hous,hood:.3,backplate:true});
    const ag=new THREE.Group();ag.position.set(cx,cy-.37,0);root.add(ag);housing(ag,1.0,.31,.2,.09,MAT.hous);hw(ag,1.0,.31,.2);
    [['left',-.31],['straight',0],['right',.31]].forEach(([k,lx])=>reg(L,k,makeLamp(ag,lx,0,.1,.105,'green',arrowTexture(k),{hood:.22,gap:1.55})));
    hanger(root,cx,cy+.2,5.95,.4);return {root,lamps:L};}};
