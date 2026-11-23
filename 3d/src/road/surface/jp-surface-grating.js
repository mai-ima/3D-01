import {THREE,RM,add,roundBox}from '../../kit/road-parts.js';
// グレーチング(側溝蓋): 道路脇の側溝にかぶせる鋼製の格子蓋。実物写真(路地の側溝)を参考
export default {id:'jp-surface-grating',name:'グレーチング(側溝蓋)',
  desc:'側溝の上にかぶせる鋼製の格子蓋。縦の平鋼(ベアリングバー)を細かく並べ、横の丸鋼で留める。水を通しながら、歩行者や車が上を通れる。',
  dims:'幅 約0.3m・長さ約1.0m・厚さ約0.04m / バー間隔 約0.03m(代表値)',focus:[0,0,0],view:[.3,1.6,.9],
  build(){const root=new THREE.Group();const W=.4,Lg=1.0,y0=-.006;const mat=new THREE.MeshStandardMaterial({color:0x6c7276,roughness:.5,metalness:.75});
    add(root,new THREE.BoxGeometry(W+.12,.06,Lg+.12),new THREE.MeshStandardMaterial({color:0xa6a59f,roughness:.9}),0,-.03-.002,0);        // 側溝の本体(コンクリート)
    const fr=new THREE.Shape();fr.moveTo(-W/2-.03,-Lg/2-.03);fr.lineTo(W/2+.03,-Lg/2-.03);fr.lineTo(W/2+.03,Lg/2+.03);fr.lineTo(-W/2-.03,Lg/2+.03);fr.closePath();
    const hole=new THREE.Path();hole.moveTo(-W/2,-Lg/2);hole.lineTo(-W/2,Lg/2);hole.lineTo(W/2,Lg/2);hole.lineTo(W/2,-Lg/2);hole.closePath();fr.holes.push(hole);
    const fg=new THREE.ExtrudeGeometry(fr,{depth:.04,bevelEnabled:false});fg.rotateX(-Math.PI/2);add(root,fg,mat,0,-.04+.001,0);                     // 枠
    const n=Math.round(Lg/.03);const bars=new THREE.InstancedMesh(new THREE.BoxGeometry(.006,.04,W),mat,n),m4=new THREE.Matrix4();
    for(let i=0;i<n;i++){m4.makeTranslation(0,-.02+.001,-Lg/2+.015+i*(Lg-.03)/(n-1));bars.setMatrixAt(i,m4);}bars.rotation.y=Math.PI/2;bars.castShadow=true;bars.receiveShadow=true;root.add(bars);
    for(let k=0;k<6;k++){const x=-W/2+.03+k*(W-.06)/5;add(root,new THREE.CylinderGeometry(.006,.006,Lg,12),mat,x,-.012,0).rotation.x=Math.PI/2;}
    return {root,lamps:{}};}};
