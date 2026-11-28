import {THREE,EXC,RM,add,opt,optChoice,greenFace,txt,signBoard,signPole,clamp,roundBox}from '../../kit/expressway-parts.js';
// 高速道路ナンバリングの路線番号標識(標識令118の3): 緑地・白字、頭の E は高速、C は環状。首都高など都市高速の路線標識も選べる
const R={e1:['E1','東名高速道路','TOMEI EXPWY'],e4:['E4','東北自動車道','TOHOKU EXPWY'],e20:['E20','中央自動車道','CHUO EXPWY'],c4:['C4','首都圏中央連絡自動車道','KEN-O EXPWY'],
  shuto_c1:['C1','都心環状線','INNER CIRCULAR'],shuto_b:['B','湾岸線','BAYSHORE ROUTE']};
const face=([n,ja,en])=>greenFace(.75,.75,(g,w,h)=>{txt(g,n,w/2,h*.42,h*.5,{align:'center',maxW:w*.8});txt(g,ja,w/2,h*.74,h*.1,{align:'center',maxW:w*.84,weight:500});txt(g,en,w/2,h*.88,h*.065,{align:'center',maxW:w*.8,weight:500});});
export default {id:'jp-exp-sign-route',name:'路線番号標識(高速道路ナンバリング)',
  desc:'「E1」「C4」のような高速道路の路線番号の標識。緑地に白字。頭のEは高速道路、Cは環状道路を表す。NEXCOの路線(東名・東北道・中央道・圏央道)と、首都高(都心環状線・湾岸線)の標識を選べる。',
  dims:'板 約0.75×0.75m・支柱 鋼管φ76.3・板の下端 約1.8m(標識の設置基準。拡大して使う場合の代表値)',focus:[0,2.1,0],view:[1.6,.1,4.2],
  options:[optChoice('route','路線',[['e1','E1 東名'],['e4','E4 東北道'],['e20','E20 中央道'],['c4','C4 圏央道'],['shuto_c1','C1 首都高 都心環状線'],['shuto_b','B 首都高 湾岸線']],'e1')],
  build(){const root=new THREE.Group();signPole(root,2.8,.038);
    for(const k of Object.keys(R)){const o=opt(root,'route',k);signBoard(o,.75,.75,face(R[k]),0,2.15,.06,.04);}
    for(const y of[1.95,2.4])clamp(root,y,.038,.05);
    return {root,lamps:{}};}};
