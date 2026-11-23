import {THREE,RM,add,concreteMat,opt,optChoice}from '../../kit/road-parts.js';
// 歩車道境界ブロック(縁石): 歩道と車道を分ける。車道側が高い「マウンドアップ」型と、出入口の「切下げ」型
const L=4,W=.18,B=.5;
function profile(h,drop){const s=new THREE.Shape();const x=W/2;s.moveTo(-x,0);s.lineTo(x,0);s.lineTo(x,h-.025);s.lineTo(x-.02,h);s.lineTo(-x+.02,h-.012);s.lineTo(-x,h-.03);s.closePath();return s;}
export default {id:'jp-surface-curb',name:'縁石(歩車道境界ブロック)',
  desc:'歩道と車道の境を示すコンクリートのブロック。通常のマウンドアップ型は車道側が約15cm高い。出入口の切下げ型は、高さを低くしてある。4mのブロックを継ぎ目つきで並べる。',
  dims:'幅 約0.18m・高さ 約0.15m(切下げ型は0.05m)・ブロック長 約1m(代表値)',focus:[0,.08,0],view:[.7,.5,2.4],
  options:[optChoice('type','形',[['normal','マウンドアップ'],['drop','切下げ']],'normal')],
  build(){const root=new THREE.Group();const cm=concreteMat('#b4b3ac',30000,[3,1]);
    for(const [id,h] of[['normal',.15],['drop',.05]]){const o=opt(root,'type',id);for(let i=0;i<4;i++){const g=new THREE.ExtrudeGeometry(profile(h,false),{depth:.99,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:2});g.translate(0,0,-.495);g.rotateY(Math.PI/2);add(o,g,cm,-1.5+i*1,0,0);}}
    return {root,lamps:{}};}};
