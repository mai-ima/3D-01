import {FONT,THREE,add,bar,canvasTex,clamp,opt,optChoice,plate,plateBody,plateFace,polyShape,RM,arrowPath,bolt}from '../../kit/road-parts.js';
// 案内標識(方面・距離)。一般道の青地と、高速道路の緑地を選べる。支柱は2本(鋼管φ114.3)
const W=1.8,H=.62;
const face=(bg,l1,l2)=>canvasTex(1024,360,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle=bg;g.beginPath();g.roundRect(14,14,w-28,h-28,18);g.fill();
  g.fillStyle='#fff';g.textAlign='left';g.font=`700 ${h*.3}px ${FONT}`;
  arrowPath(g,90,h*.3,h*.26,h*.2,270);g.fillText(l1[0],160,h*.4,w*.5);g.textAlign='right';g.fillText(l1[1],w-60,h*.4,w*.28);
  g.textAlign='left';arrowPath(g,90,h*.72,h*.26,h*.2,0);g.fillText(l2[0],160,h*.82,w*.5);g.textAlign='right';g.fillText(l2[1],w-60,h*.82,w*.28);});
export default {id:'jp-sign-guide',name:'案内標識(方面・距離)',
  desc:'方面と距離を示す案内標識。一般道の青地と高速道路の緑地を選べる。大きな板なので、鋼管φ114.3の支柱2本に、上下の横桁で取り付ける。',
  dims:'板 約1.8×0.62m / 支柱 鋼管φ114.3(代表値)',focus:[0,3.7,0],view:[1.5,.1,6],
  options:[optChoice('type','板の種類',[['blue','一般道(青)'],['green','高速道路(緑)']],'blue')],
  build(){const root=new THREE.Group();const post=4.4,x=.7;
    for(const sx of[-x,x]){add(root,new THREE.CylinderGeometry(.0572,.0572,post,40),RM.zinc,sx,post/2,0);add(root,new THREE.SphereGeometry(.0585,24,12,0,Math.PI*2,0,Math.PI/2),RM.zinc,sx,post,0);add(root,new THREE.CylinderGeometry(.09,.09,.02,32),RM.zincDull,sx,.01,0);}
    const g=new THREE.Group();g.position.set(0,3.75,.13);root.add(g);
    const sh=polyShape([[-W/2,H/2],[W/2,H/2],[W/2,-H/2],[-W/2,-H/2]],.04);plateBody(g,sh,.006);
    const L1=['東京','12km'],L2=['横浜','38km'];
    plateFace(opt(g,'type','blue'),sh,W,H,face('#0b4f9e',L1,L2),{t:.006});plateFace(opt(g,'type','green'),sh,W,H,face('#0a6b44',['名古屋','52km'],['岐阜','31km']),{t:.006});
    for(const y of[3.75+H/2-.08,3.75-H/2+.08]){bar(root,[-x-.06,y,.07],[x+.06,y,.07],.022);for(const sx of[-x,x]){add(root,new THREE.BoxGeometry(.14,.05,.05),RM.zinc,sx,y,.045);for(const k of[-.04,.04])bolt(root,sx+k,y,.075,.009);}
      for(const sx of[-.45,.45])bar(root,[sx,y,.07],[sx,y,.125],.016);}
    return {root,lamps:{}};}};
