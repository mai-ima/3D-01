import {THREE,add,roundBox} from '../../kit/index.js';
import {TM,railMesh,ballastBed,ballastStones,sleeperGeo,seatDetail,concreteMat,ballastMat} from '../../kit/track-parts.js';
const LEN=12,GAUGE=1.067,HEAD=.065,SEAT=.045;      // まくらぎ上面を y=+0.045 に置く
export default {id:'jp-track-ballast',name:'砂利道床 軌道(狭軌1067mm・50Nレール・PCまくらぎ)',
  desc:'JR在来線・私鉄で最も一般的な有道床軌道。50Nレール、3号PCまくらぎ(長さ2.0m・間隔0.6m)、板ばねクリップ、バラスト道床。12mごとに連結して使う。',
  dims:'軌間1067mm / 長さ12m / 道床幅 約4.8m',options:[],
  build(){const root=new THREE.Group(),L={};
    add(root,ballastBed(LEN),ballastMat());
    const zs=[];for(let i=0;i<LEN/.6;i++)zs.push(-LEN/2+.3+i*.6);
    const sg=sleeperGeo(2.0),cm=concreteMat();for(const z of zs){const s=add(root,sg,cm,0,SEAT,z);}
    for(const sx of[-1,1]){const rx=sx*(GAUGE/2+HEAD/2);const r=railMesh(LEN);r.position.set(rx,SEAT+.008,0);r.rotation.z=sx*.025;root.add(r);   // 1/40 の内傾
      for(const z of zs)seatDetail(root,rx,SEAT,z,sx);}
    root.add(ballastStones(LEN,4200,{sleeperZ:zs,mat:ballastMat()}));
    return {root,lamps:L};}};
