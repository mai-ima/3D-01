import {THREE,RM,add,roundBox,opt,optChoice,concreteMat}from '../../kit/road-parts.js';
// グレーチング(側溝蓋): 道路脇の側溝にかぶせる鋼製の格子蓋。実物写真(路地の側溝)を参考
export default {id:'jp-surface-grating',name:'グレーチング(側溝蓋)',
  desc:'側溝の上にかぶせる鋼製の格子蓋。縦の平鋼(ベアリングバー)を細かく並べ、横の丸鋼で留める。水を通しながら、歩行者や車が上を通れる。',
  dims:'幅 約0.3m・長さ約1.0m・厚さ約0.04m / バー間隔 約0.03m(代表値)',focus:[0,0,0],view:[.5,.8,1.3],
  options:[optChoice('type','蓋の種類',[['bar','鋼製グレーチング'],['slit','コンクリートのスリット蓋']],'bar')],
  build(){const root=new THREE.Group();const W=.4,Lg=1.0;const mat=new THREE.MeshStandardMaterial({color:0x5f666a,roughness:.5,metalness:.75});
    const conc=concreteMat('#b7b5ad',0,[1,1]);
    // 側溝の本体(コンクリート)。上面は路面と同じ高さで、中は暗い溝
    const out=new THREE.Shape();out.moveTo(-W/2-.1,-Lg/2-.1);out.lineTo(W/2+.1,-Lg/2-.1);out.lineTo(W/2+.1,Lg/2+.1);out.lineTo(-W/2-.1,Lg/2+.1);out.closePath();
    const hole=new THREE.Path();hole.moveTo(-W/2,-Lg/2);hole.lineTo(-W/2,Lg/2);hole.lineTo(W/2,Lg/2);hole.lineTo(W/2,-Lg/2);hole.closePath();out.holes.push(hole);
    const cg=new THREE.ExtrudeGeometry(out,{depth:.08,bevelEnabled:false});cg.rotateX(-Math.PI/2);add(root,cg,conc,0,-.08,0);
    add(root,new THREE.BoxGeometry(W,.01,Lg),new THREE.MeshStandardMaterial({color:0x15181a,roughness:1}),0,-.075,0);                                     // 溝の底(暗い)
    // 受け枠(アングル)
    for(const sx of[-1,1])add(root,new THREE.BoxGeometry(.03,.03,Lg+.0),mat,sx*(W/2+.005),-.015,0);
    for(const sz of[-1,1])add(root,new THREE.BoxGeometry(W+.04,.03,.03),mat,0,-.015,sz*(Lg/2+.005));
    // 溝の側壁(深さ0.25m)と、底の水勾配
    for(const sx of[-1,1])add(root,new THREE.BoxGeometry(.04,.22,Lg+.2),conc,sx*(W/2+.02),-.19,0);
    // 鋼製グレーチング: 長手方向の平鋼(ベアリングバー、高さ32mm・厚さ5mm)を30mm間隔で並べ、丸鋼(クロスバー)で留める
    const bar=opt(root,'type','bar');const n=Math.round(W/.03),bars=new THREE.InstancedMesh(new THREE.BoxGeometry(.005,.032,Lg-.02),mat,n),m4=new THREE.Matrix4();
    for(let i=0;i<n;i++){m4.makeTranslation(-W/2+.015+i*(W-.03)/(n-1),-.016,0);bars.setMatrixAt(i,m4);}bars.castShadow=true;bars.receiveShadow=true;bar.add(bars);
    for(let k=0;k<7;k++){const z=-Lg/2+.04+k*(Lg-.08)/6;add(bar,new THREE.CylinderGeometry(.005,.005,W-.01,10),mat,0,-.02,z).rotation.z=Math.PI/2;}
    for(const sx of[-1,1])for(const z of[-Lg/2+.12,Lg/2-.12])add(bar,new THREE.CylinderGeometry(.009,.009,.006,16),mat,sx*(W/2-.004),.002,z);   // 受け枠への固定ボルト
    // コンクリート製スリット蓋: 厚い蓋に細長い水抜き穴が並ぶ
    const sl=opt(root,'type','slit');const cs=new THREE.Shape();cs.moveTo(-W/2,-Lg/2);cs.lineTo(W/2,-Lg/2);cs.lineTo(W/2,Lg/2);cs.lineTo(-W/2,Lg/2);cs.closePath();
    for(let k=0;k<7;k++){const z=-Lg/2+.07+k*(Lg-.14)/6;const h=new THREE.Path();h.moveTo(-.12,z-.012);h.lineTo(.12,z-.012);h.lineTo(.12,z+.012);h.lineTo(-.12,z+.012);h.closePath();cs.holes.push(h);}
    const sg=new THREE.ExtrudeGeometry(cs,{depth:.06,bevelEnabled:false});sg.rotateX(-Math.PI/2);add(sl,sg,conc,0,-.057,0);
    return {root,lamps:{}};}};
