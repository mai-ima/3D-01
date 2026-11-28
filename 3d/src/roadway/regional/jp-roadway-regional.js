import {THREE,RM,add,opt,optChoice,PAINT,pave,verge,line,curb,guardrail}from '../../kit/roadway-parts.js';
// 主要地方道(2車線): 車線3.0m×2・路肩0.5m。歩道を持たない形と、両側に縁石と側溝を持つ形
const SH=.5,LN=3.0,W=SH*2+LN*2;
export default {id:'jp-roadway-regional',name:'主要地方道(2車線)',
  desc:'主要地方道の2車線の車道。車線3.0m・路肩0.5m。中央線は白の破線か黄色の実線。路側は舗装のみ・縁石と側溝・ガードパイプ風のガードレールから選べる。',
  dims:`幅 ${W}m(車線3.0m×2+路肩0.5m×2)・区画長20m・外側線 白実線0.15m・中央線 白破線5m+5m(代表値)`,focus:[3.5,0,0],view:[9,4,14],
  options:[optChoice('center','中央線',[['dash','白の破線'],['yellow','黄色の実線(追越し禁止)']],'dash'),
    optChoice('side','路側の形',[['off','舗装のみ'],['curb','縁石と側溝'],['guard','ガードレール']],'curb')],
  build(){const root=new THREE.Group();verge(root,-2,0);pave(root,0,W);
    line(root,SH,.15,'solid');line(root,W-SH,.15,'solid');
    line(opt(root,'center','dash'),W/2,.15,[5,5]);line(opt(root,'center','yellow'),W/2,.15,'solid',PAINT.yellow);
    const c=opt(root,'side','curb');curb(c,0,-1);curb(c,W,1);
    const g=opt(root,'side','guard');guardrail(g,-.15);guardrail(g,W+.15);
    return {root,lamps:{}};}};
