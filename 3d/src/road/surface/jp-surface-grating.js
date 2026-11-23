import {THREE,RM,add,roundBox}from '../../kit/road-parts.js';
// グレーチング(側溝蓋): 道路脇の側溝にかぶせる鋼製の格子蓋。実物写真(路地の側溝)を参考
export default {id:'jp-surface-grating',name:'グレーチング(側溝蓋)',
  desc:'側溝の上にかぶせる鋼製の格子蓋。縦の平鋼(ベアリングバー)を細かく並べ、横の丸鋼で留める。水を通しながら、歩行者や車が上を通れる。',
  dims:'幅 約0.3m・長さ約1.0m・厚さ約0.04m / バー間隔 約0.03m(代表値)',focus:[0,0,0],view:[.5,.8,1.3],
  build(){const root=new THREE.Group();const W=.4,Lg=1.0;const mat=new THREE.MeshStandardMaterial({color:0x5f666a,roughness:.5,metalness:.75});
    const conc=new THREE.MeshStandardMaterial({color:0xa6a59f,roughness:.9});
    // 側溝の本体(コンクリート)。上面は路面と同じ高さで、中は暗い溝
    const out=new THREE.Shape();out.moveTo(-W/2-.1,-Lg/2-.1);out.lineTo(W/2+.1,-Lg/2-.1);out.lineTo(W/2+.1,Lg/2+.1);out.lineTo(-W/2-.1,Lg/2+.1);out.closePath();
    const hole=new THREE.Path();hole.moveTo(-W/2,-Lg/2);hole.lineTo(-W/2,Lg/2);hole.lineTo(W/2,Lg/2);hole.lineTo(W/2,-Lg/2);hole.closePath();out.holes.push(hole);
    const cg=new THREE.ExtrudeGeometry(out,{depth:.08,bevelEnabled:false});cg.rotateX(-Math.PI/2);add(root,cg,conc,0,-.08,0);
    add(root,new THREE.BoxGeometry(W,.01,Lg),new THREE.MeshStandardMaterial({color:0x15181a,roughness:1}),0,-.075,0);                                     // 溝の底(暗い)
    // 受け枠(アングル)
    for(const sx of[-1,1])add(root,new THREE.BoxGeometry(.03,.03,Lg+.0),mat,sx*(W/2+.005),-.015,0);
    for(const sz of[-1,1])add(root,new THREE.BoxGeometry(W+.04,.03,.03),mat,0,-.015,sz*(Lg/2+.005));
    // 格子: 長手方向の平鋼(ベアリングバー)を幅方向に並べ、丸鋼で留める
    const n=Math.round(W/.03),bars=new THREE.InstancedMesh(new THREE.BoxGeometry(.005,.032,Lg-.02),mat,n),m4=new THREE.Matrix4();
    for(let i=0;i<n;i++){m4.makeTranslation(-W/2+.015+i*(W-.03)/(n-1),-.016,0);bars.setMatrixAt(i,m4);}bars.castShadow=true;bars.receiveShadow=true;root.add(bars);
    for(let k=0;k<7;k++){const z=-Lg/2+.04+k*(Lg-.08)/6;add(root,new THREE.CylinderGeometry(.005,.005,W-.01,10),mat,0,-.02,z).rotation.z=Math.PI/2;}
    return {root,lamps:{}};}};
