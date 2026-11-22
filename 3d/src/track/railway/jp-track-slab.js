import {THREE,add,roundBox} from '../../kit/index.js';
import {TM,railMesh,seatDetail,concreteMat} from '../../kit/track-parts.js';
const LEN=9.86,GAUGE=1.435,HEAD=.065;
export default {id:'jp-track-slab',name:'スラブ軌道(標準軌1435mm・60kgレール)',
  desc:'新幹線・高架橋・地下鉄で使われるコンクリート軌道スラブ。軌道スラブ(約2.34×4.93m)2枚分を1単位とし、締結装置を0.625m間隔で配置。',
  dims:'軌間1435mm / 長さ9.86m / スラブ幅2.34m',options:[],
  build(){const root=new THREE.Group(),L={};const cm=concreteMat();
    add(root,new THREE.BoxGeometry(3.4,.3,LEN),new THREE.MeshStandardMaterial({color:0x8f8e8a,roughness:.95}),0,-.35,0);                // 路盤コンクリート
    add(root,new THREE.BoxGeometry(2.34,.05,LEN),new THREE.MeshStandardMaterial({color:0x6f716f,roughness:.9}),0,-.175,0);              // CAモルタル層
    for(const z of[-2.465,2.465]){add(root,roundBox(2.34,.19,4.91,.03,.008),cm,0,-.08,z);
      // 中央の凹み(凸形緩衝材の座)
      add(root,new THREE.CylinderGeometry(.26,.26,.02,48),new THREE.MeshStandardMaterial({color:0x6b6c68,roughness:.9}),0,.015,z).position.y=.016;}
    add(root,new THREE.BoxGeometry(.2,.004,LEN),new THREE.MeshStandardMaterial({color:0x585a58,roughness:.9}),0,.016,0);
    const zs=[];for(let i=0;i<LEN/.625;i++)zs.push(-LEN/2+.3125+i*.625);
    for(const sx of[-1,1]){const rx=sx*(GAUGE/2+HEAD/2);const r=railMesh(LEN,{h:.174,headW:.065,baseW:.145,webT:.016});r.position.set(rx,.026,0);root.add(r);
      for(const z of zs){add(root,new THREE.BoxGeometry(.24,.014,.22),TM.fastener,rx,.0215,z);
        for(const dx of[-.085,.085])for(const dz of[-.07,.07])add(root,new THREE.CylinderGeometry(.011,.011,.02,6),TM.clip,rx+dx*2.4/2.4*1.0,.034,z+dz);
        seatDetail(root,rx,.014,z,sx);}}
    return {root,lamps:L};}};
