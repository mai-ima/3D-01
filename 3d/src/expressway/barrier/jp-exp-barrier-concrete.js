import {THREE,RM,add,opt,optChoice,canvasTex}from '../../kit/expressway-parts.js';
// 中央分離帯のコンクリート壁(剛性防護柵)。断面の型(F型・単スロープ・フロリダ型・直壁)と、上部の付属物(防眩板・金網)を選べる
const P={f:[[-.3,0],[.3,0],[.3,.08],[.26,.33],[.1,.81],[-.1,.81],[-.26,.33],[-.3,.08]],
  single:[[-.25,0],[.25,0],[.11,1.1],[-.11,1.1]],
  florida:[[-.31,0],[.31,0],[.31,.12],[.16,.62],[.12,.95],[-.12,.95],[-.16,.62],[-.31,.12]],
  vertical:[[-.2,0],[.2,0],[.2,.9],[-.2,.9]]};
const TOP={f:.81,single:1.1,florida:.95,vertical:.9};
const meshTex=()=>canvasTex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#9aa0a3';g.lineWidth=3;for(let i=-h;i<w+h;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i+h,h);g.stroke();g.beginPath();g.moveTo(i+h,0);g.lineTo(i,h);g.stroke();}});
export default {id:'jp-exp-barrier-concrete',name:'コンクリート壁(中央分離帯)',
  desc:'高速道路の中央分離帯などに連続して立つコンクリートの防護壁。断面の型(F型・単スロープ・フロリダ型・直壁)と、上部に付ける防眩板・金網を選べる。',
  dims:'長さ 3mのブロック×3・高さ 0.8〜1.1m・底幅 0.4〜0.62m(代表値。型ごとの高さは国の資料に数値がなく推定)',focus:[0,.9,0],view:[3.4,.3,7.5],
  options:[optChoice('profile','断面の型',[['f','F型'],['single','単スロープ型'],['florida','フロリダ型'],['vertical','直壁型']],'f'),
    optChoice('top','上部の付属物',[['off','なし'],['glare','防眩板'],['mesh','金網(落下防止)']],'off')],
  build(){const root=new THREE.Group();const conc=new THREE.MeshStandardMaterial({color:0xb7b5ad,roughness:.93});
    const green=new THREE.MeshStandardMaterial({color:0x2f5d45,roughness:.6});const meshM=new THREE.MeshStandardMaterial({map:meshTex(),transparent:true,side:THREE.DoubleSide,roughness:.6,alphaTest:.2});
    for(const k of Object.keys(P)){const o=opt(root,'profile',k);const sh=new THREE.Shape(P[k].map(([x,y])=>new THREE.Vector2(x,y)));
      for(let i=0;i<3;i++){const g=new THREE.ExtrudeGeometry(sh,{depth:2.98,bevelEnabled:false});g.translate(0,0,-1.49);add(o,g,conc,0,0,(i-1)*3);}
      add(o,new THREE.BoxGeometry(.1,.012,.2),RM.reflOrange,0,TOP[k]+.006,-3.05+.0).visible=true;                       // 天端の橙の反射体
      const h=TOP[k];const gl=opt(o,'top','glare');for(let z=-4.2;z<=4.2;z+=.5){const p=add(gl,new THREE.BoxGeometry(.02,.7,.4),green,0,h+.35,z);p.rotation.y=.5;}
      add(gl,new THREE.BoxGeometry(.05,.05,9),RM.zinc,0,h+.04,0);
      const me=opt(o,'top','mesh');add(me,new THREE.PlaneGeometry(9,1.3),meshM,0,h+.65,0).rotation.y=Math.PI/2;
      for(const z of[-4.5,-1.5,1.5,4.5])add(me,new THREE.CylinderGeometry(.03,.03,1.3,10),RM.zinc,0,h+.65,z);
      add(me,new THREE.BoxGeometry(.04,.04,9),RM.zinc,0,h+1.3,0);}
    return {root,lamps:{}};}};
