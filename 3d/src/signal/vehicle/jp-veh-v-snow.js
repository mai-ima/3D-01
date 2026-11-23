import {setBody,optBody,THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
export default {id:'jp-veh-v-snow',group:'road-vehicle',name:'車両用 縦型3灯(積雪寒冷地・着雪防止)',
  desc:'北海道・東北・北陸など積雪寒冷地で使われる縦型。上から赤・黄・青。庇付きフードと20°の前傾で着雪を防ぐ。',
  dims:'前傾20°(公表情報)。本体寸法は推定',focus:[1.0,5.0,0],view:[.9,.3,5.8],night:'fy',states:S3,cycle:CY3,
  options:[optBody('black'),OPT_LENS,optToggle('snow','着雪防止の庇','on'),optToggle('backplate','背面板')],
  build(){setBody('#1b1e20');const root=new THREE.Group(),L={};POLE_H(root,6,.0826,.0826);
    const h=vertHead(root,L,{x:1.1,y:5.0,R:.15,pitch:.37,D:.161,mat:HG,tilt:20,hood:.4,snow:true,backplate:true});
    for(const y of[5.55,4.45]){rod(root,[0,y,0],[.86,y,0],.026);add(root,new THREE.CylinderGeometry(.105,.105,.09,40),MAT.galv,0,y,0);}
    return {root,lamps:L};}};
