import {CY3,HG,LED,MAT,OPT_LENS,POLE_H,S3,THREE,add,cv,housing,hw,makeLamp,opt,optBody,optToggle,reg,rod,setBody,tex} from '../../kit/signal-parts.js';
// フードレス灯器(熊谷市の時差式信号の実物写真): 白い薄型の平板ケースに、フードなしの丸いLEDレンズ3つ
export default {id:'jp-veh-hoodless',name:'車両用 フードレス横型3灯(白い平板形)',
  desc:'フードを持たない、白い薄型の平板ケースの横型3灯。レンズは本体面と同じ高さで、細かいLEDの点が見える。上下2本の鋼管で柱に取り付け、時差式の表示板が付く例が多い。',
  dims:'本体 約1.1×0.36×0.12m(写真からの推定)',focus:[1.3,4.9,0],view:[.7,.3,5.2],night:'fy',states:S3,cycle:CY3,options:[optBody('gray'),OPT_LENS,optToggle('sign','時差式の表示板','on')],
  build(){setBody('#dfe1e0');const root=new THREE.Group(),L={};POLE_H(root,5.6,.0826,.0826);
    const g=new THREE.Group();g.position.set(1.3,4.9,0);root.add(g);const W=1.12,H=.36,D=.12;housing(g,W,H,D,.02,HG);hw(g,W,H,D);
    ['green','yellow','red'].forEach((k,i)=>reg(L,k,makeLamp(g,(i-1)*.37,0,D/2,.15,k,LED,{hood:0})));
    for(const y of[.075,-.075])rod(root,[.04,4.9+y,0],[1.3-W/2+.04,4.9+y,0],.022);
    for(const y of[4.9+.075,4.9-.075])add(root,new THREE.CylinderGeometry(.095,.095,.08,36),MAT.galv,0,y,0);
    const so=opt(root,'sign','on');const c=cv(128,340),x=c.getContext('2d');x.fillStyle='#f6f7f4';x.fillRect(0,0,128,340);x.strokeStyle='#1a56c8';x.lineWidth=9;x.strokeRect(6,6,116,328);x.fillStyle='#1a56c8';x.textAlign='center';x.font='700 66px "Noto Sans JP",sans-serif';'時差式信号'.split('').forEach((t,i)=>x.fillText(t,64,70+i*62));
    add(so,new THREE.BoxGeometry(.3,.78,.014),MAT.white,.5,4.9+.02,.0);add(so,new THREE.PlaneGeometry(.28,.76),new THREE.MeshStandardMaterial({map:tex(c),roughness:.5}),.5,4.9+.02,.009);
    for(const y of[.075,-.075])rod(so,[.37,4.9+y,0],[.63,4.9+y,0],.012,MAT.steel);
    return {root,lamps:L};}};
