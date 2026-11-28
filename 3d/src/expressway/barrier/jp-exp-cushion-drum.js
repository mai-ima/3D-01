import {THREE,RM,add,opt,optChoice,canvasTex}from '../../kit/expressway-parts.js';
// クッションドラム(衝撃吸収施設): 分岐の先端などに置く、水や砂の入った円柱。1基・3基(逆V字)・5基(くさび形)の並べ方を選べる
const wrap=()=>canvasTex(512,256,(g,w,h)=>{g.fillStyle='#f4c40f';g.fillRect(0,0,w,h);const n=8,cw=w/n;for(let i=0;i<n;i++){for(let j=0;j<2;j++){g.fillStyle=(i+j)%2?'#d6231e':'#f6f4ea';g.fillRect(i*cw,h*.25+j*h*.25,cw,h*.25);}}});
const CFG={single:[[0,0]],v3:[[0,0],[-.34,.62],[.34,.62]],wedge5:[[0,0],[-.34,.62],[.34,.62],[-.68,1.24],[.68,1.24],[0,1.24]]};
export default {id:'jp-exp-cushion-drum',name:'クッションドラム',
  desc:'分岐部や島の先端に置く衝撃吸収施設。黄色の円柱に赤白の反射帯がある。1基、3基(逆V字)、5〜6基(くさび形)の並べ方を選べる。',
  dims:'φ0.6m×高さ 0.8m(1基あたり。国内の製品の代表値)',focus:[0,.5,.5],view:[1.8,.3,3.8],
  options:[optChoice('layout','並べ方',[['single','1基'],['v3','3基(逆V字)'],['wedge5','6基(くさび形)']],'v3')],
  build(){const root=new THREE.Group();const body=new THREE.MeshStandardMaterial({map:wrap(),roughness:.55});const lid=new THREE.MeshStandardMaterial({color:0xf0c010,roughness:.5});
    for(const [k,pts] of Object.entries(CFG)){const o=opt(root,'layout',k);for(const [x,z] of pts){add(o,new THREE.CylinderGeometry(.29,.3,.8,40),body,x,.4,z);add(o,new THREE.CylinderGeometry(.3,.3,.03,40),lid,x,.8,z);add(o,new THREE.TorusGeometry(.3,.015,10,40),lid,x,.8,z).rotation.x=Math.PI/2;
      add(o,new THREE.CylinderGeometry(.31,.31,.04,40),RM.black,x,.02,z);}}
    return {root,lamps:{}};}};
