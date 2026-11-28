import {THREE,RM,add,opt,optChoice,PAINT,pave,verge,slab,line,guardrail,wireRope,wall,WALL_F,WALL_SINGLE,delineator,concreteMat}from '../../kit/roadway-parts.js';
// 高速自動車国道(上下線)。道路構造令: 車線3.5m・左路肩2.5m(縮小1.75m)・右路肩1.25m・中央帯4.5m。区画線: 車線境界線 白破線 長さ8m・間隔12m・幅0.15m、外側線 白実線 幅0.20m(警察の設置基準)
const L=3.5,SL=2.5,SR=1.25;
export default {id:'jp-roadway-expressway',name:'高速自動車国道(上下線)',
  desc:'高速自動車国道の本線(上下線)。車線3.5m・左路肩2.5m・右路肩1.25m・中央帯。車線境界線は白破線(8m+12m)、外側線は白実線。中央分離帯の形(コンクリート壁F型・単スロープ・ワイヤロープ・植栽)と、路側の形(舗装のみ・ガードレール・壁高欄)を選べる。',
  dims:'片側 車線3.5m×2・路肩 左2.5m/右1.25m・中央帯 約4.5m・全幅 約24.5m・区画長20m(道路構造令と警察の設置基準の値)',focus:[12,0,0],view:[26,6,30],
  options:[optChoice('median','中央分離帯',[['wall','コンクリート壁(F型)'],['single','コンクリート壁(単スロープ)'],['wire','ワイヤロープ'],['green','植栽帯']],'wall'),
    optChoice('side','路側の形',[['off','舗装のみ'],['guard','ガードレール'],['wallr','壁高欄']],'guard')],
  build(){const root=new THREE.Group();verge(root,-3,0);const N=2,a=SL+L*N+SR,med=3.0,W=a*2+med;
    pave(root,0,a);pave(root,a+med,W);const mc=a+med/2;
    for(const [o,dir] of[[0,1],[W,-1]]){const out=o,inner=o+dir*(SL+L*N);
      line(root,o+dir*SL,.2,'solid');line(root,o+dir*(SL+L*N),.2,'solid');for(let i=1;i<N;i++)line(root,o+dir*(SL+L*i),.15,[8,12]);}
    wall(opt(root,'median','wall'),mc,WALL_F);wall(opt(root,'median','single'),mc,WALL_SINGLE);wireRope(opt(root,'median','wire'),mc,4);
    slab(opt(root,'median','green'),a,a+med,concreteMat('#7f9363',9000,[1,6]),.02,.12);
    const g=opt(root,'side','guard');guardrail(g,-.3);guardrail(g,W+.3);
    const wr=opt(root,'side','wallr');wall(wr,-.2,[[-.2,0],[.2,0],[.2,.8],[-.2,.8]].map(([x,y])=>[x,y]));wall(wr,W+.2,[[-.2,0],[.2,0],[.2,.8],[-.2,.8]]);
    return {root,lamps:{}};}};
