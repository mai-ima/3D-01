import {FONT,THREE,canvasTex,clamp,opt,optChoice,plateBody,plateFace,polyShape,signPole}from '../../kit/road-parts.js';
// 警戒標識(ひし形・黄地・黒縁)。図柄を選べる(十字路・信号機あり・踏切あり)
const D=.45*Math.SQRT2/2,SYM={cross:'十字路',signal:'信号機あり',rail:'踏切あり'};
const face=k=>canvasTex(512,512,(g,W,H)=>{g.fillStyle='#f3c211';g.fillRect(0,0,W,H);g.fillStyle='#111';g.strokeStyle='#111';g.lineCap='butt';
  const c=W/2;
  if(k==='cross'){g.lineWidth=W*.085;g.beginPath();g.moveTo(c,H*.2);g.lineTo(c,H*.8);g.moveTo(W*.2,c);g.lineTo(W*.8,c);g.stroke();}
  if(k==='signal'){g.fillRect(W*.4,H*.2,W*.2,H*.6);for(const [y,col] of[[.31,'#d33'],[.5,'#fb0'],[.69,'#2b6']]){g.fillStyle=col;g.beginPath();g.arc(c,H*y,W*.062,0,7);g.fill();}}
  if(k==='rail'){g.lineWidth=W*.06;g.beginPath();g.moveTo(W*.28,H*.25);g.lineTo(W*.72,H*.75);g.moveTo(W*.72,H*.25);g.lineTo(W*.28,H*.75);g.stroke();g.lineWidth=W*.03;g.beginPath();g.moveTo(W*.26,H*.28);g.lineTo(W*.74,H*.28);g.moveTo(W*.26,H*.72);g.lineTo(W*.74,H*.72);g.stroke();}
  g.lineWidth=W*.035;g.strokeStyle='#111';g.strokeRect(0,0,0,0);});
export default {id:'jp-sign-warning',name:'警戒標識(ひし形)',
  desc:'黄色の地に黒い縁と図柄のひし形標識。「十字路」「信号機あり」「踏切あり」などの図柄を選べる。',
  dims:'一辺 約0.45m(代表値) / 支柱 鋼管φ60.5',focus:[0,2.2,0],view:[.7,.1,3],
  options:[optChoice('symbol','図柄',Object.entries(SYM),'cross')],
  build(){const root=new THREE.Group();signPole(root,2.7);const g=new THREE.Group();g.position.set(0,2.2,.062);root.add(g);
    const sh=polyShape([[0,D],[D,0],[0,-D],[-D,0]],.035);plateBody(g,sh);
    for(const k of Object.keys(SYM)){const o=opt(g,'symbol',k);plateFace(o,polyShape([[0,D*.975],[D*.975,0],[0,-D*.975],[-D*.975,0]],.03),2*D,2*D,face(k));
      const edge=new THREE.Shape();/* 黒縁は画像側に任せる */}
    clamp(root,2.42,.03025,.058);clamp(root,2.0,.03025,.058);return {root,lamps:{}};}};
