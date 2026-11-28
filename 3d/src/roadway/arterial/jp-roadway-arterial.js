import {THREE,RM,add,opt,optChoice,PAINT,pave,verge,slab,line,guardrail,wireRope,wall,WALL_F,delineator,concreteMat}from '../../kit/roadway-parts.js';
// 高規格幹線道路(一般国道の自動車専用道路など): 暫定2車線(中央にワイヤロープ等)と、分離帯のある4車線
const L=3.5;
export default {id:'jp-roadway-arterial',name:'高規格幹線道路(自動車専用道路)',
  desc:'高規格幹線道路(一般国道の自動車専用道路や地域高規格道路)の車道。中央にワイヤロープなどを置く暫定2車線と、コンクリート壁の分離帯を持つ4車線を選べる。車線3.5m・路肩1.25m。',
  dims:'暫定2車線: 幅 9.5m(車線3.5m×2+路肩1.25m×2)/ 4車線: 幅 約19m(分離帯3.0m)・区画長20m(代表値。設計速度80km/h級を想定)',focus:[5,0,0],view:[12,4,18],
  options:[optChoice('section','断面',[['two','暫定2車線'],['four','4車線(分離帯付き)']],'two'),
    optChoice('median','暫定2車線の中央',[['wire','ワイヤロープ'],['line','白の実線のみ']],'wire')],
  build(){const root=new THREE.Group();verge(root,-2,0);
    const two=opt(root,'section','two'),W2=1.25*2+L*2;pave(two,0,W2);line(two,1.25,.15,'solid');line(two,W2-1.25,.15,'solid');
    line(opt(two,'median','line'),W2/2,.2,'solid');wireRope(opt(two,'median','wire'),W2/2,3);
    for(const x of[-.3,W2+.3])delineator(two,x,x<0?'white':'orange');
    const four=opt(root,'section','four'),a=1.25+L*2+1.25,med=3.0,W4=a*2+med;pave(four,0,a);pave(four,a+med,W4);slab(four,a,a+med,concreteMat('#9aa27c',9000,[1,6]),-.05,.1);
    for(const o of[0,a+med]){line(four,o+1.25,.2,'solid');line(four,o+a-1.25,.2,'solid');line(four,o+1.25+L,.15,[8,12]);}
    wall(four,a+med/2,WALL_F);guardrail(four,-.3);guardrail(four,W4+.3);
    return {root,lamps:{}};}};
