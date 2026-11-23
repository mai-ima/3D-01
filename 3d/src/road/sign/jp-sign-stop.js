import {FONT,THREE,add,bar,canvasTex,clamp,plate,polyShape,signPole}from '../../kit/road-parts.js';
// 規制標識「一時停止」(逆三角形・赤縁・白地に赤字「止まれ」)。支柱は鋼管φ60.5
const S=.8,HH=S*Math.sqrt(3)/2;
export default {id:'jp-sign-stop',name:'規制標識 一時停止(止まれ)',
  desc:'逆三角形の規制標識。赤い縁と白地に赤の「止まれ」「STOP」。鋼管の支柱に、バンド金具で板を留める。',
  dims:'一辺 約0.8m / 支柱 鋼管φ60.5 / 板の中心高 約2.1m(代表値)',focus:[0,2.1,0],view:[.8,.1,3.2],options:[],
  build(){const root=new THREE.Group();signPole(root,2.7);
    const map=canvasTex(512,444,(g,W,H)=>{g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#c3161c';g.beginPath();g.moveTo(0,0);g.lineTo(W,0);g.lineTo(W/2,H);g.closePath();g.fill();
      const cx=W/2,cy=H/3,k=.64;g.fillStyle='#fff';g.beginPath();g.moveTo(cx+(0-cx)*k,cy+(0-cy)*k);g.lineTo(cx+(W-cx)*k,cy+(0-cy)*k);g.lineTo(cx+(W/2-cx)*k,cy+(H-cy)*k);g.closePath();g.fill();
      g.fillStyle='#c3161c';g.textAlign='center';g.font=`700 ${W*.2}px ${FONT}`;g.fillText('止まれ',W/2,H*.33,W*.5);g.font=`700 ${W*.085}px Arial,sans-serif`;g.fillText('STOP',W/2,H*.5,W*.3);});
    const sh=polyShape([[-S/2,HH/3],[S/2,HH/3],[0,-2*HH/3]],.045);const g=new THREE.Group();g.position.set(0,2.15,.062);root.add(g);plate(g,sh,S,HH,map,{cy:-HH/6});
    clamp(root,2.42,.03025,.058);clamp(root,1.9,.03025,.058);return {root,lamps:{}};}};
