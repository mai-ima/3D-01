import {CY3,HG,MAT,OPT_LENS,S3,THREE,add,cv,hanger,horizHead,mastArm,opt,optBody,optToggle,rod,setBody,tex} from '../../kit/signal-parts.js';
export default {id:'jp-veh-h300-arm',group:'road-vehicle',name:'車両用 横型3灯 φ300(アーム式)',
  desc:'国内で最も多い標準形。レンズ径φ300mm、左から青・黄・赤。ダークグリーン塗装の灯器を、門型・アーム式の支柱から吊り下げる。',
  dims:'本体 約1.25×0.42×0.16m(φ300薄型LED・メーカー公表値)',focus:[3.1,5.3,0],view:[.9,.4,6.4],night:'fy',states:S3,cycle:CY3,
  options:[optBody('gray'),OPT_LENS,optToggle('backplate','背面板'),optToggle('sign','時差式の表示板')],
  build(){setBody('#b7bcbe');const root=new THREE.Group(),L={};mastArm(root,6.2,5.8,3.6);const h=horizHead(root,L,{x:3.1,y:5.18,R:.15,pitch:.395,H:.42,D:.161,mat:HG,backplate:true});hanger(root,3.1,5.38,5.8,.45);
    {const so=opt(root,'sign','on');const c=cv(128,340),x=c.getContext('2d');x.fillStyle='#f6f7f4';x.fillRect(0,0,128,340);x.strokeStyle='#1a56c8';x.lineWidth=9;x.strokeRect(6,6,116,328);x.fillStyle='#1a56c8';x.textAlign='center';x.font='700 66px "Noto Sans JP",sans-serif';'時差式信号'.split('').forEach((t,i)=>x.fillText(t,64,70+i*62));
     add(so,new THREE.BoxGeometry(.3,.78,.014),MAT.white,2.1,5.45,.0);add(so,new THREE.PlaneGeometry(.28,.76),new THREE.MeshStandardMaterial({map:tex(c),roughness:.5}),2.1,5.45,.009);rod(so,[2.0,5.7,0],[2.0,5.8,0],.012,MAT.steel);}
    return {root,lamps:L};}};
