import {THREE,RM,add,opt,optChoice,PAINT,pave,verge,line,curb,guardrail,delineator}from '../../kit/roadway-parts.js';
// 一般国道(2車線): 車線3.25m×2・路肩0.75m。中央線の種類と、路側の形(舗装のみ・縁石と側溝・ガードレール)を選べる
// 数値は道路構造令の第3種の代表値(路肩0.5〜1.25m、車線3.0〜3.5m)に基づく代表値
const SH=.75,LN=3.25,W=SH*2+LN*2;
export default {id:'jp-roadway-national',name:'一般国道(2車線)',
  desc:'一般国道の2車線の車道。車線3.25m・路肩0.75m。中央線は白の破線・黄色の実線(追越し禁止)・黄色の二重線を選べる。路側は舗装のみ・縁石と側溝・ガードレールの3種。',
  dims:`幅 ${W}m(車線3.25m×2+路肩0.75m×2)・区画長20m・外側線 白実線0.15m・中央線 白破線5m+5m(代表値)`,focus:[4,0,0],view:[10,4,16],
  options:[optChoice('center','中央線',[['dash','白の破線(追越し可)'],['yellow','黄色の実線(追越し禁止)'],['double','黄色の二重線']],'dash'),
    optChoice('side','路側の形',[['off','舗装のみ'],['curb','縁石と側溝'],['guard','ガードレール']],'off')],
  build(){const root=new THREE.Group();verge(root,-2,0);pave(root,0,W);
    line(root,SH,.15,'solid');line(root,W-SH,.15,'solid');
    line(opt(root,'center','dash'),W/2,.15,[5,5]);line(opt(root,'center','yellow'),W/2,.15,'solid',PAINT.yellow);
    const d=opt(root,'center','double');line(d,W/2-.1,.15,'solid',PAINT.yellow);line(d,W/2+.1,.15,'solid',PAINT.yellow);
    const c=opt(root,'side','curb');curb(c,0,-1);curb(c,W,1);
    const g=opt(root,'side','guard');guardrail(g,-.15);guardrail(g,W+.15);for(const z of[-5,5]){delineator(g,-.15,'white');delineator(g,W+.15,'white');}
    return {root,lamps:{}};}};
