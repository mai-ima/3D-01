import {THREE,RM,add,lightPanel,roundBox,optChoice,opt}from '../../kit/road-parts.js';
// 歩道用の街路灯(ポール灯): 歩道を照らす低いポールの先端灯。傘(笠)形の灯具
const ST=[{id:'on',label:'点灯',on:['lamp']},{id:'off',label:'消灯'}];
export default {id:'jp-light-sidewalk',name:'歩道用街路灯(ポール灯)',
  desc:'歩道の脇に立つ、低めの街路灯。笠形の灯具の中のLEDが下を照らす。夜は点灯し、昼は消灯する。灯具の形(笠・ランタン)を選べる。',
  dims:'ポール高 約4.2m・灯具径 約0.45m(代表値)',focus:[0,4,0],view:[1.4,.2,6.2],night:'on',states:ST,cycle:[{s:'on',d:8},{s:'off',d:4}],
  options:[optChoice('head','灯具',[['shade','笠形'],['lantern','ランタン形']],'shade')],
  build(){const root=new THREE.Group(),L={};const H=4.2;
    add(root,new THREE.CylinderGeometry(.045,.075,H,36,10),RM.zincDull,0,H/2,0);add(root,new THREE.CylinderGeometry(.11,.11,.02,36),RM.zincDull,0,.01,0);add(root,new THREE.CylinderGeometry(.082,.1,.3,36),RM.zincDull,0,.17,0);
    const ring=add(root,new THREE.TorusGeometry(.052,.01,10,32),RM.zinc,0,H-.4,0);ring.rotation.x=Math.PI/2;
    const sh=opt(root,'head','shade');const cap=new THREE.SphereGeometry(.26,48,16,0,Math.PI*2,0,Math.PI/2);add(sh,cap,RM.white,0,H+.02,0);add(sh,new THREE.CylinderGeometry(.262,.262,.02,48),RM.zincDull,0,H+.02,0);
    const lp=new THREE.CircleGeometry(.2,40);lp.rotateX(-Math.PI/2);lightPanel(L,'lamp',sh,lp,'white',0,H+.008,0);
    const ln=opt(root,'head','lantern');add(ln,new THREE.CylinderGeometry(.12,.1,.03,32),RM.black,0,H+.02,0);
    for(const a of[0,1,2,3]){const x=Math.cos(a*Math.PI/2+Math.PI/4)*.17,z=Math.sin(a*Math.PI/2+Math.PI/4)*.17;add(ln,new THREE.CylinderGeometry(.01,.01,.36,8),RM.black,x*.8,H+.2,z*.8);}
    add(ln,new THREE.ConeGeometry(.24,.14,4,1),RM.black,0,H+.45,0).rotation.y=Math.PI/4;
    const lg=new THREE.CylinderGeometry(.12,.12,.32,32,1,true);const gl=add(ln,lg,new THREE.MeshStandardMaterial({color:0xf2f2ea,roughness:.4,transparent:true,opacity:.55,side:THREE.DoubleSide}),0,H+.2,0);
    const lp2=new THREE.SphereGeometry(.1,24,16);lightPanel(L,'lamp2',ln,lp2,'white',0,H+.2,0);
    return {root,lamps:L};}};
