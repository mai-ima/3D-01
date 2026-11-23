import {FONT,THREE,add,bar,canvasTex,circleShape,clamp,opt,optChoice,optToggle,plateBody,plateFace,plate,polyShape,RM,signPole,arrowPath,faceMat}from '../../kit/road-parts.js';
// 規制標識「最高速度」(円形・赤縁・白地に黒の数字)。速度は選べる。補助標識(区間・矢印)を付けられる
const R=.3,SPEEDS=[30,40,50,60];
const face=v=>canvasTex(512,512,(g,W,H)=>{g.fillStyle='#fff';g.fillRect(0,0,W,H);g.save();g.beginPath();g.arc(W/2,H/2,W/2,0,7);g.clip();g.fillStyle='#fff';g.fillRect(0,0,W,H);
  g.fillStyle='#c3161c';g.beginPath();g.arc(W/2,H/2,W/2,0,Math.PI*2);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(W/2,H/2,W/2*.7,0,Math.PI*2);g.fill();g.restore();
  g.fillStyle='#111';g.textAlign='center';g.font=`700 ${W*.38}px Arial,"Helvetica",sans-serif`;g.fillText(String(v),W/2,H/2+W*.135,W*.6);});
export default {id:'jp-sign-speed',name:'規制標識 最高速度(円形)',
  desc:'白地に赤い縁と黒い数字の円形標識。速度(30〜60)を選べる。補助標識は「区間」を示す矢印の板で、付け外しできる。',
  dims:'φ600mm(大型は800mm) / 支柱 鋼管φ60.5(代表値)',focus:[0,2.3,0],view:[.8,.1,3.4],
  options:[optChoice('speed','制限速度',SPEEDS.map(v=>[String(v),`${v} km/h`]),'40'),optToggle('aux','補助標識(矢印)','on')],
  build(){const root=new THREE.Group();signPole(root,2.8);
    const g=new THREE.Group();g.position.set(0,2.3,.062);root.add(g);plateBody(g,circleShape(R));
    for(const v of SPEEDS){const o=opt(g,'speed',String(v));plateFace(o,circleShape(R*.985),2*R*.985,2*R*.985,face(v));}
    clamp(root,2.55,.03025,.058);clamp(root,2.05,.03025,.058);
    const ax=opt(root,'aux','on');const a=new THREE.Group();a.position.set(0,1.88,.06);ax.add(a);
    const sh=polyShape([[-.28,.1],[.28,.1],[.28,-.1],[-.28,-.1]],.04);
    plate(a,sh,.56,.2,canvasTex(512,184,(g2,W,H)=>{g2.fillStyle='#fff';g2.fillRect(0,0,W,H);g2.strokeStyle='#c3161c';g2.lineWidth=14;g2.strokeRect(7,7,W-14,H-14);g2.fillStyle='#c3161c';arrowPath(g2,W/2,H/2,W*.62,H*.46,270);arrowPath(g2,W/2,H/2,W*.62,H*.46,90);}),{});
    clamp(ax,1.88,.03025,.056);return {root,lamps:{}};}};
