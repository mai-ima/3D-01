import {THREE,RM,add,bar,opt,optToggle,roundBox,canvasTex}from '../../kit/road-parts.js';
// 三角コーン(カラーコーン)と、コーンの上に渡すコーンバー: 工事や車線規制で使う
export default {id:'jp-const-cone',name:'三角コーン(カラーコーン)',
  desc:'赤橙色の樹脂のコーンに、白い反射帯が付く。底は四角い土台。コーンバーは、2つのコーンの間に渡す黄黒の縞の棒で、付け外しできる。',
  dims:'高さ 約0.7m・底面 約0.36m角(代表値)',focus:[0,.4,0],view:[.7,.3,2.4],
  options:[optToggle('band','反射帯','on'),optToggle('bar','コーンバー(黄黒)')],
  build(){const root=new THREE.Group();
    const mat=new THREE.MeshPhysicalMaterial({color:0xea4f12,roughness:.5,clearcoat:.4});
    add(root,roundBox(.36,.36,.03,.03,.006),mat,0,.015,0).rotation.x=-Math.PI/2;                                                // 土台(四角)
    const prof=[[.0,.03],[.138,.03],[.135,.055],[.052,.66],[.034,.7],[.0,.7]].map(([r,y])=>new THREE.Vector2(r,y));
    const cone=add(root,new THREE.LatheGeometry(prof,64),mat);                                                                   // 本体の円錐
    add(root,new THREE.CylinderGeometry(.034,.036,.04,32),mat,0,.69,0);add(root,new THREE.CylinderGeometry(.141,.141,.012,48),mat,0,.045,0);
    const bd=opt(root,'band','on');for(const [y,h] of[[.5,.1],[.38,.04]]){const r=.138-(y-.03)*(.138-.052)/.63;add(bd,new THREE.CylinderGeometry(r-.0,r+.006,h,64,1,true),RM.reflWhite,0,y,0);}
    const br=opt(root,'bar','on');const stripe=canvasTex(512,64,(g,W,H)=>{g.fillStyle='#f1c40f';g.fillRect(0,0,W,H);g.fillStyle='#16130a';for(let x=-64;x<W+64;x+=64){g.beginPath();g.moveTo(x,H);g.lineTo(x+32,H);g.lineTo(x+32+64,0);g.lineTo(x+64,0);g.fill();}});
    const rm=new THREE.MeshStandardMaterial({map:stripe,roughness:.5});const rodG=new THREE.CylinderGeometry(.018,.018,1.4,24);rodG.rotateZ(Math.PI/2);
    add(br,rodG,rm,.7,.66,0);add(br,new THREE.CylinderGeometry(.034,.034,.05,24),RM.rubber,0,.66,0).rotation.z=0;
    return {root,lamps:{}};}};
