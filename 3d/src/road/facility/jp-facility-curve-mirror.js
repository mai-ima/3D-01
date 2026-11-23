import {THREE,RM,add,bar,bolt,deg,opt,optChoice,roundBox}from '../../kit/road-parts.js';
// カーブミラー(道路反射鏡): 橙色の柱に、凸面の丸い鏡を1〜2面。実物写真(2面・橙色の縁)を参考
function mirror(parent,x,y,rot,R=.3){const g=new THREE.Group();g.position.set(x,y,0);g.rotation.y=rot;parent.add(g);
  const d=.045,Rs=(R*R+d*d)/(2*d),th=Math.asin(R/Rs);const cap=new THREE.SphereGeometry(Rs,96,32,0,Math.PI*2,0,th);cap.rotateX(Math.PI/2);cap.translate(0,0,-Rs+d);   // 凸面(+Z向き)
  add(g,cap,new THREE.MeshStandardMaterial({color:0xe6eaec,roughness:.05,metalness:1,envMapIntensity:1.6}));
  const rim=add(g,new THREE.TorusGeometry(R+.012,.018,14,96),RM.orange,0,0,.006);rim.scale.set(1,1,.8);
  const back=new THREE.SphereGeometry(Rs*1.04,64,24,0,Math.PI*2,0,th);back.rotateX(-Math.PI/2);back.translate(0,0,Rs*1.04-.03);add(g,back,new THREE.MeshStandardMaterial({color:0x8d9396,roughness:.55,metalness:.5,side:THREE.DoubleSide}));  // 裏(灰色)
  add(g,new THREE.CylinderGeometry(R+.02,R+.02,.012,64),RM.orange,0,0,-.045).rotation.x=Math.PI/2;
  return g;}
export default {id:'jp-facility-curve-mirror',name:'カーブミラー(丸形・2面)',
  desc:'見通しの悪い交差点に立つ、凸面の道路反射鏡。橙色の柱に丸い鏡を1面または2面取り付ける。鏡の縁も橙色。',
  dims:'鏡 φ600mm(φ800・φ1000もある) / 柱 鋼管φ76.3 / 鏡の中心高 約3.3m(代表値)',focus:[0,3.3,0],view:[1.8,.1,5],
  options:[optChoice('mirrors','鏡の数',[['2','2面'],['1','1面']],'2')],
  build(){const root=new THREE.Group();const H=3.7;
    add(root,new THREE.CylinderGeometry(.0381,.0381,H,40),RM.orange,0,H/2,0);add(root,new THREE.SphereGeometry(.0385,24,10,0,Math.PI*2,0,Math.PI/2),RM.orange,0,H,0);add(root,new THREE.CylinderGeometry(.075,.075,.014,32),RM.zincDull,0,.007,0);
    for(const y of[1.5,1.62]){const t=add(root,new THREE.TorusGeometry(.043,.007,10,32),RM.zinc,0,y,0);t.rotation.x=Math.PI/2;}
    const tag=add(root,roundBox(.08,.16,.025,.01,.003),new THREE.MeshStandardMaterial({color:0x7a3a1a,roughness:.6}),0,2.2,.055);
    const two=opt(root,'mirrors','2'),one=opt(root,'mirrors','1');
    for(const [o,list] of[[two,[[-.42,deg(-12)],[.42,deg(12)]]],[one,[[0,0]]]]){
      for(const [x,rot] of list){const arm=new THREE.Group();o.add(arm);arm.position.set(0,3.3,0);bar(arm,[0,.0,0],[x*.7,0,.05],.016,RM.zinc);bar(arm,[0,-.18,0],[x*.7,-.02,.05],.014,RM.zinc);mirror(arm,x,0,rot);}}
    return {root,lamps:{}};}};
