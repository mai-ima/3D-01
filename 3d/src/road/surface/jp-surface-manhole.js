import {THREE,RM,add,canvasTex,opt,optChoice}from '../../kit/road-parts.js';
// マンホール蓋(鋳鉄): 下水道などの点検口。表面の模様は、滑り止めの格子と中央の文様
function pat(kind){return canvasTex(1024,1024,(g,W,H)=>{g.fillStyle='#4d5154';g.fillRect(0,0,W,H);g.fillStyle='#656a6d';
  for(let y=34;y<H;y+=44)for(let x=34;x<W;x+=44){if(Math.hypot(x-W/2,y-H/2)<W*.46)g.fillRect(x-16,y-16,32,32);}                       // 滑り止めの角
  g.fillStyle='#4d5154';g.beginPath();g.arc(W/2,H/2,W*.3,0,7);g.fill();g.strokeStyle='#8c9296';g.lineWidth=14;g.beginPath();g.arc(W/2,H/2,W*.3,0,7);g.stroke();
  g.fillStyle='#8c9296';g.textAlign='center';g.font=`700 ${W*.12}px "Noto Sans JP","WenQuanYi Zen Hei",sans-serif`;
  if(kind==='sewer'){g.fillText('おすい',W/2,H/2-W*.01);g.font=`700 ${W*.06}px "Noto Sans JP","WenQuanYi Zen Hei",sans-serif`;g.fillText('下水道',W/2,H/2+W*.1);}
  else{g.fillText('水道',W/2,H/2+W*.04);}
  g.strokeStyle='#8c9296';g.lineWidth=8;g.beginPath();g.arc(W/2,H/2,W*.47,0,7);g.stroke();},{jpeg:true});}
export default {id:'jp-surface-manhole',name:'マンホール蓋',
  desc:'道路にはまる鋳鉄の丸い蓋。表面は滑り止めの角が並び、中央に用途の文字が入る。下水道(おすい)と水道を選べる。',
  dims:'蓋 φ600mm・枠 φ約0.75m・厚さ約0.06m(代表値)',focus:[0,0,0],view:[0,1.6,.6],
  options:[optChoice('use','用途',[['sewer','下水道'],['water','水道']],'sewer')],
  build(){const root=new THREE.Group();
    const fr=add(root,new THREE.CylinderGeometry(.37,.37,.06,72),new THREE.MeshStandardMaterial({color:0x3f4346,roughness:.6,metalness:.5}),0,-.03+.004,0);
    for(const k of['sewer','water']){const o=opt(root,'use',k);const lid=add(o,new THREE.CylinderGeometry(.3,.3,.04,72),new THREE.MeshStandardMaterial({color:0x707579,roughness:.55,metalness:.55}),0,-.016+.004,0);
      const top=new THREE.CircleGeometry(.298,72);top.rotateX(-Math.PI/2);add(o,top,new THREE.MeshStandardMaterial({map:pat(k),roughness:.5,metalness:.5}),0,.0045,0);}
    const ring=add(root,new THREE.TorusGeometry(.335,.012,8,72),new THREE.MeshStandardMaterial({color:0x2d3033,roughness:.7}),0,.0035,0);ring.rotation.x=Math.PI/2;
    return {root,lamps:{}};}};
