import {THREE,RM,add,bar,bolt,lightPanel,roundBox,optChoice,opt}from '../../kit/road-parts.js';
// 道路照明灯(片持ちアーム式・LED): 車道の上に腕を伸ばし、LED灯具で路面を照らす
const ST=[{id:'on',label:'点灯',on:['lamp']},{id:'off',label:'消灯'}];
export default {id:'jp-light-road',name:'道路照明灯(片持ち・LED)',
  desc:'先細りの鋼管ポールの先で、アームが車道側へ伸び、LEDの灯具が路面を照らす。夜は点灯し、昼は消灯する。アームの形(直線・曲線)を選べる。',
  dims:'ポール高 約9m・アーム長 約2.2m・灯具 約0.85×0.38m(代表値)',focus:[1.2,9,0],view:[2.2,.1,9],night:'on',states:ST,cycle:[{s:'on',d:8},{s:'off',d:4}],
  options:[optChoice('arm','アームの形',[['curve','曲線'],['straight','直線']],'curve')],
  build(){const root=new THREE.Group(),L={};const H=9;
    add(root,new THREE.CylinderGeometry(.075,.145,H,12,12),RM.zincDull,0,H/2,0);                                                   // 八角に近い先細りのポール
    add(root,new THREE.CylinderGeometry(.19,.19,.02,40),RM.zincDull,0,.01,0);add(root,new THREE.CylinderGeometry(.16,.2,.22,40),RM.zincDull,0,.13,0);
    for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;add(root,new THREE.CylinderGeometry(.016,.016,.05,6),RM.zinc,Math.cos(a)*.17,.045,Math.sin(a)*.17);}
    add(root,roundBox(.11,.4,.012,.02,.004),RM.zincDull,0,.9,.14);
    const mk=(o,pts)=>{const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));add(o,new THREE.TubeGeometry(curve,48,.045,16,false),RM.zincDull);return curve;};
    const ac=opt(root,'arm','curve'),as=opt(root,'arm','straight');mk(ac,[[0,H-.1,0],[.5,H+.35,0],[1.4,H+.62,0],[2.2,H+.65,0]]);mk(as,[[0,H-.05,0],[1.1,H+.3,0],[2.2,H+.6,0]]);
    const g=new THREE.Group();g.position.set(2.3,H+.6,0);g.rotation.z=deg(-4);root.add(g);
    add(g,roundBox(.85,.1,.38,.05,.01),RM.zincDull,0,-.05,0);add(g,roundBox(.6,.1,.3,.04,.01),RM.zinc,0,.05,0);
    const lens=new THREE.PlaneGeometry(.7,.3);lens.rotateX(-Math.PI/2);lightPanel(L,'lamp',g,lens,'white',0,-.101,0);
    add(g,new THREE.CylinderGeometry(.045,.045,.12,16),RM.zincDull,-.3,-.02,0).rotation.z=Math.PI/2;
    return {root,lamps:L};}};
function deg(a){return a*Math.PI/180;}
