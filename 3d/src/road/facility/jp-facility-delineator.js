import {THREE,RM,add,opt,optChoice,roundBox}from '../../kit/road-parts.js';
// 視線誘導標(デリニエータ)と、雪国の矢羽根。路肩の線形を示す。実物写真(白い柱+反射板)を参考
export default {id:'jp-facility-delineator',name:'視線誘導標(デリニエータ)',
  desc:'路肩に立つ白い支柱の先に反射板を付けた視線誘導標。道路の線形を夜間に示す。反射板の色(白・橙)を選べ、積雪地の矢羽根(高い支柱)に切り替えられる。',
  dims:'支柱 φ約0.07m・高さ約1.05m / 反射板 約0.1×0.07m(代表値)',focus:[0,.9,0],view:[.5,.2,2.4],
  options:[optChoice('type','種類',[['low','通常(低い支柱)'],['tall','矢羽根(高い支柱)']],'low'),optChoice('refl','反射板の色',[['white','白'],['orange','橙']],'white')],
  build(){const root=new THREE.Group();
    const lo=opt(root,'type','low'),hi=opt(root,'type','tall');
    add(lo,new THREE.CylinderGeometry(.036,.036,1.05,36),RM.white,0,.525,0);add(lo,new THREE.SphereGeometry(.0365,24,10,0,Math.PI*2,0,Math.PI/2),RM.white,0,1.05,0);add(lo,new THREE.CylinderGeometry(.07,.07,.012,32),RM.zincDull,0,.006,0);
    const band=add(lo,new THREE.CylinderGeometry(.0375,.0375,.2,36),RM.black,0,.78,0);
    for(const [id,m] of[['white',RM.reflWhite],['orange',RM.reflOrange]]){const o=opt(lo,'refl',id);add(o,roundBox(.1,.07,.012,.008,.002),m,0,.95,.043);}
    // 矢羽根: 赤白の縞の高い支柱(雪の中で道を示す)
    const H=3.0;for(let i=0;i<10;i++)add(hi,new THREE.CylinderGeometry(.03,.03,H/10,32,1,true),i%2?RM.white:RM.red,0,H/10*(i+.5),0);add(hi,new THREE.SphereGeometry(.031,24,10,0,Math.PI*2,0,Math.PI/2),RM.red,0,H,0);
    for(const sx of[-1,1]){const w=new THREE.Shape();w.moveTo(0,0);w.lineTo(.22*sx,.08);w.lineTo(.22*sx,-.08);w.closePath();const f=new THREE.ShapeGeometry(w);add(hi,f,RM.reflRed,0,H-.2,.035);}
    return {root,lamps:{}};}};
