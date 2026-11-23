import {THREE,RM,add,bar,bolt,deg,opt,optToggle,roundBox}from '../../kit/road-parts.js';
// ガードレール(たわみ性防護柵 Gr-C 型): 波形のビーム+鋼管支柱。支柱の間隔は2m、ビームは4mを継いで8m分
const SP=2,N=4,LEN=SP*N;
function beamGeo(len){ // 波形ビームの断面(縦=u, 奥行=v)を長さ方向に押し出す
  const h=.311,t=.0032,pts=[[-h/2,0],[-h/2+.02,0],[-h/2+.04,.07],[-h/2+.085,.07],[-h/2+.105,0],[h/2-.105,0],[h/2-.085,.07],[h/2-.04,.07],[h/2-.02,0],[h/2,0]];
  const s=new THREE.Shape();pts.forEach(([u,v],i)=>i?s.lineTo(v,u):s.moveTo(v,u));for(let i=pts.length-1;i>=0;i--)s.lineTo(pts[i][1]+t,pts[i][0]);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:len,bevelEnabled:false});g.translate(0,0,-len/2);g.rotateY(Math.PI/2);return g;}
export default {id:'jp-barrier-guardrail',name:'ガードレール(Gr-C型・波形ビーム)',
  desc:'路側に並ぶ、波形の鋼製ビームと鋼管支柱の防護柵。ビームは4mごとに重ねてボルトで継ぎ、支柱はφ114.3。反射板は付け外しできる。',
  dims:'ビーム 幅0.311m・厚3.2mm・長4m / 支柱 鋼管φ114.3 間隔2m / ビーム中心高 約0.5m(代表値)',focus:[0,.6,0],view:[3,.9,6.5],
  options:[optToggle('reflector','反射板(オレンジ)','on')],
  build(){const root=new THREE.Group();const cy=.5;
    for(let i=0;i<=N;i++){const x=-LEN/2+i*SP;
      add(root,new THREE.CylinderGeometry(.05715,.05715,.88,40),RM.zinc,x,.44,0);add(root,new THREE.CylinderGeometry(.0575,.0575,.012,40),RM.zincDull,x,.88,0).scale.set(1,1,1);add(root,new THREE.SphereGeometry(.0575,28,10,0,Math.PI*2,0,Math.PI/2),RM.zinc,x,.88,0);
      const br=add(root,roundBox(.1,.17,.06,.012,.004),RM.zinc,x,cy,.09);                                                             // ブラケット(ビームの受け)
      for(const dy of[-.045,.045])bolt(root,x,cy+dy,.125,.012);}
    for(let k=0;k<2;k++){const len=4.0,x=-LEN/2+2+k*4;const b=add(root,beamGeo(len),RM.zinc,x,cy,.115);b.position.z=.115;}
    for(const x of[-LEN/2+4,-LEN/2+8]){} /* ビームの継ぎ目(ラップ部) */
    for(const x of[0]){add(root,roundBox(.34,.34,.006,.01,.002),RM.zincDull,x,cy,.185);for(const dx of[-.1,.1])for(const dy of[-.1,.1])bolt(root,x+dx,cy+dy,.19,.01);}
    const ro=opt(root,'reflector','on');for(let i=0;i<=N;i++){const x=-LEN/2+i*SP;add(ro,new THREE.CylinderGeometry(.034,.034,.008,32),RM.reflOrange,x,cy,.195).rotation.x=Math.PI/2;}
    return {root,lamps:{}};}};
