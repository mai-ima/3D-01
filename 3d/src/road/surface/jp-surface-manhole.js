import {THREE,RM,add,canvasTex,opt,optChoice}from '../../kit/road-parts.js';
// マンホール蓋(鋳鉄): 下水道などの点検口。表面は滑り止めの突起(立体)と、中央の文字・文様の円
// ※ 模様は画像ではなく形状で作る(どの環境でも確実に見え、凹凸の陰影も出る)
const R=.3;
function label(txt,sub){return canvasTex(512,512,(g,W,H)=>{g.clearRect(0,0,W,H);g.fillStyle='#cfd5d8';g.textAlign='center';
  g.font=`700 ${W*.26}px "Noto Sans JP","WenQuanYi Zen Hei",sans-serif`;g.fillText(txt,W/2,H/2+(sub?-W*.0:W*.09),W*.8);
  if(sub){g.font=`700 ${W*.13}px "Noto Sans JP","WenQuanYi Zen Hei",sans-serif`;g.fillText(sub,W/2,H/2+W*.2,W*.6);}});}
export default {id:'jp-surface-manhole',name:'マンホール蓋',
  desc:'道路にはまる鋳鉄の丸い蓋。表面は滑り止めの突起が並び、中央の円に用途の文字が入る。下水道(おすい)と水道を選べる。',
  dims:'蓋 φ600mm・枠 φ約0.75m・厚さ約0.06m(代表値)',focus:[0,0,0],view:[0,.9,1.2],
  options:[optChoice('use','用途',[['sewer','下水道'],['water','水道']],'sewer')],
  build(){const root=new THREE.Group();const iron=new THREE.MeshStandardMaterial({color:0x4a4f53,roughness:.55,metalness:.6});
    const dark=new THREE.MeshStandardMaterial({color:0x2c3033,roughness:.7,metalness:.4});
    add(root,new THREE.CylinderGeometry(.37,.37,.06,72),dark,0,-.03+.004,0);                                                    // 受け枠
    add(root,new THREE.CylinderGeometry(R,R,.04,72),iron,0,-.02+.003,0);                                                        // 蓋の本体(上面 +0.003)
    const ring=add(root,new THREE.TorusGeometry(.335,.012,10,72),dark,0,.004,0);ring.rotation.x=Math.PI/2;                      // 枠と蓋のすきま
    // 滑り止めの突起(中央の円の外側に、格子状に並べる)
    const bump=new THREE.BoxGeometry(.026,.006,.026),pts=[];
    for(let y=-.27;y<=.27;y+=.036)for(let x=-.27;x<=.27;x+=.036){const r=Math.hypot(x,y);if(r>.17&&r<.285)pts.push([x,y]);}
    const im=new THREE.InstancedMesh(bump,iron,pts.length),m4=new THREE.Matrix4();pts.forEach(([x,z],i)=>{m4.makeTranslation(x,.003+.003,z);im.setMatrixAt(i,m4);});im.castShadow=true;im.receiveShadow=true;root.add(im);
    const c1=add(root,new THREE.TorusGeometry(.165,.007,10,72),iron,0,.0075,0);c1.rotation.x=Math.PI/2;                         // 中央の円の縁
    const c2=add(root,new THREE.TorusGeometry(.292,.006,10,72),iron,0,.0075,0);c2.rotation.x=Math.PI/2;                        // 外周の縁
    // 用途の文字(中央の円の上に貼る板)
    for(const [k,txt,sub] of[['sewer','おすい','下水道'],['water','水道','']]){const o=opt(root,'use',k);
      const pl=new THREE.PlaneGeometry(.3,.3);pl.rotateX(-Math.PI/2);
      add(o,pl,new THREE.MeshStandardMaterial({map:label(txt,sub),transparent:true,roughness:.5,metalness:.5,depthWrite:false,side:THREE.DoubleSide}),0,.0095,0);}
    return {root,lamps:{}};}};
