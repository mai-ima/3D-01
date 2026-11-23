import {THREE,RM,add,opt,optChoice,optToggle,roundBox,concreteMat,canvasTex}from '../../kit/road-parts.js';
// 車止め(ボラード): 歩道への車の進入を防ぐ。ステンレス鋼管(反射帯付き)と、洗い出し仕上げの石の円柱(実物写真を参考)
export default {id:'jp-facility-bollard',name:'車止め(ボラード)',
  desc:'歩道の端に立つ車止め。ステンレス鋼管(反射帯付き)と、洗い出しの石の円柱を選べる。反射帯は付け外しできる。',
  dims:'ステンレス φ114.3・高さ0.8m / 石の円柱 φ0.5・高さ0.6m(代表値)',focus:[0,.5,0],view:[.9,.3,2.8],
  options:[optChoice('type','種類',[['steel','ステンレス鋼管'],['stone','石の円柱']],'steel'),optToggle('band','反射帯(ステンレス)','on')],
  build(){const root=new THREE.Group();
    const st=opt(root,'type','steel');add(st,new THREE.CylinderGeometry(.05715,.05715,.8,48),RM.stainless,0,.4,0);add(st,new THREE.SphereGeometry(.0575,32,14,0,Math.PI*2,0,Math.PI/2),RM.stainless,0,.8,0);
    add(st,new THREE.CylinderGeometry(.075,.075,.012,48),RM.stainless,0,.006,0);const rg=add(st,new THREE.TorusGeometry(.0575,.006,10,48),RM.zincDull,0,.7,0);rg.rotation.x=Math.PI/2;
    const bd=opt(st,'band','on');for(const y of[.68,.58]){add(bd,new THREE.CylinderGeometry(.0585,.0585,.07,48,1,true),RM.reflRed,0,y,0);}
    const sn=opt(root,'type','stone');const cm=concreteMat('#a9a79f',60000,[2,1]);
    add(sn,new THREE.CylinderGeometry(.23,.25,.5,64),cm,0,.3,0);add(sn,new THREE.CylinderGeometry(.27,.29,.12,64),cm,0,.06,0);add(sn,new THREE.CylinderGeometry(.24,.24,.015,64),cm,0,.56,0);
    add(sn,roundBox(.2,.2,.012,.02,.004),new THREE.MeshStandardMaterial({color:0x4a4d4e,roughness:.45,metalness:.7}),0,.567,0).rotation.x=-Math.PI/2;
    return {root,lamps:{}};}};
