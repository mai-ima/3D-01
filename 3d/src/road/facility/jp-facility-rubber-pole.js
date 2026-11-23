import {THREE,RM,add,opt,optChoice}from '../../kit/road-parts.js';
// ラバーポール(ポストコーン): 車線の分離や進入防止に使う、倒れてもすぐ起き上がる弾力のあるポール
export default {id:'jp-facility-rubber-pole',name:'ラバーポール',
  desc:'道路の中央や出入口に立てる、弾力のある樹脂のポール。車が当たっても倒れて起き上がる。反射帯付きで、色(白・黄・赤)を選べる。',
  dims:'φ約0.09m・高さ約0.9m / 底板 φ約0.3m(代表値)',focus:[0,.6,0],view:[.7,.3,2.6],
  options:[optChoice('color','色',[['white','白'],['yellow','黄'],['red','赤']],'white')],
  build(){const root=new THREE.Group();const base=add(root,new THREE.CylinderGeometry(.15,.16,.03,64),RM.rubber,0,.015,0);add(root,new THREE.CylinderGeometry(.075,.1,.06,48),RM.rubber,0,.06,0);
    for(const [id,m] of[['white',RM.white],['yellow',RM.yellow],['red',RM.red]]){const o=opt(root,'color',id);add(o,new THREE.CylinderGeometry(.045,.05,.82,48),m,0,.5,0);add(o,new THREE.SphereGeometry(.045,32,14,0,Math.PI*2,0,Math.PI/2),m,0,.91,0);
      for(const y of[.76,.6])add(o,new THREE.CylinderGeometry(.0515,.0515,.08,48,1,false),id==='red'?RM.reflWhite:RM.reflRed,0,y,0);}
    return {root,lamps:{}};}};
