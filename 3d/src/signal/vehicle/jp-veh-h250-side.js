import {CY3,HG,MAT,OPT_LENS,POLE_H,S3,THREE,add,horizHead,optBody,optToggle,rod,roundBox,setBody} from '../../kit/signal-parts.js';
export default {id:'jp-veh-h250-side',group:'road-vehicle',name:'車両用 横型3灯 φ250(側柱式・前傾15°)',
  desc:'2017年の警察庁仕様変更で小型化されたφ250mm。太陽光の直接反射を抑えるため本体を前へ15°傾けて取り付ける。淡灰色の灯器。',
  dims:'レンズφ250mm / 取付前傾15°(公表情報)。本体 1.05×0.37×0.125m(メーカー公表値)',focus:[1.2,5.2,0],view:[.7,.35,5.6],night:'fy',states:S3,cycle:CY3,
  options:[optBody('gray'),OPT_LENS,optToggle('backplate','背面板')],
  build(){setBody('#b7bcbe');const root=new THREE.Group(),L={};POLE_H(root,5.9,.0826,.0826);
    const h=horizHead(root,L,{x:1.25,y:5.2,R:.125,pitch:.31,H:.37,D:.125,mat:HG,tilt:15,hood:.3,backplate:true});
    for(const y of[5.38,5.02]){rod(root,[0,y,0],[.82,y,0],.024);add(root,new THREE.CylinderGeometry(.1,.1,.09,40),MAT.galv,0,y,0);add(root,roundBox(.1,.09,.1,.02,.004),MAT.galv,.84,y,0);}
    return {root,lamps:L};}};
