import {THREE,EXC,RM,add,bar,bolt,roundBox,opt,optChoice,optToggle,greenFace,txt,exitNumber,signBoard,truss,arrowPath,deg}from '../../kit/expressway-parts.js';
// 高速道路の案内標識(門型・片持ち)。板の種類(出口予告・方面と車線・JCT予告・料金所予告)と、支持の形を選べる。
const B={
  exit:()=>greenFace(4.2,2.2,(g,w,h)=>{txt(g,'岡崎・豊田',60,h*.32,h*.27,{maxW:w*.5});txt(g,'Okazaki / Toyota',60,h*.62,h*.12,{maxW:w*.5,weight:500});
    exitNumber(g,w*.6,h*.12,'35');txt(g,'出口',w*.6,h*.66,h*.19);txt(g,'2km',w*.6,h*.86,h*.15);arrowPath(g,w*.9,h*.5,h*.55,h*.3,45);}),
  branch:()=>greenFace(5.2,2.4,(g,w,h)=>{const cols=[['東京','Tokyo'],['横浜','Yokohama'],['名古屋','Nagoya']];cols.forEach(([a,b],i)=>{const cx=w*(.2+.3*i);txt(g,a,cx,h*.28,h*.22,{align:'center',maxW:w*.26});txt(g,b,cx,h*.46,h*.1,{align:'center',weight:500,maxW:w*.26});arrowPath(g,cx,h*.76,h*.36,h*.26,0);});
    g.fillStyle='#fff';g.fillRect(w*.34,h*.1,4,h*.8);g.fillRect(w*.64,h*.1,4,h*.8);}),
  jct:()=>greenFace(4.8,2.2,(g,w,h)=>{txt(g,'E1',60,h*.28,h*.22);txt(g,'東名高速',200,h*.3,h*.2,{maxW:w*.4});txt(g,'御殿場JCT',60,h*.68,h*.2,{maxW:w*.5});txt(g,'1km',w*.62,h*.72,h*.16);arrowPath(g,w*.88,h*.5,h*.6,h*.3,45);}),
  toll:()=>greenFace(4.2,2.0,(g,w,h)=>{txt(g,'料金所',60,h*.34,h*.3);txt(g,'TOLL GATE',60,h*.7,h*.14,{weight:500});txt(g,'1km',w*.52,h*.5,h*.26);g.fillStyle=EXC.purple;g.fillRect(w*.74,h*.2,w*.2,h*.5);g.fillStyle='#fff';txt(g,'ETC',w*.84,h*.45,h*.2,{align:'center'});})
};
const SZ={exit:[4.2,2.2],branch:[5.2,2.4],jct:[4.8,2.2],toll:[4.2,2.0]};
export default {id:'jp-exp-sign-gantry',name:'案内標識(門型・片持ち)',
  desc:'高速道路の大きな案内標識。支持の形(門型・片持ち)と、板の種類(出口予告・方面と車線・JCT予告・料金所予告)を選べる。標識板の下端は路面から約5.0m。',
  dims:'板の下端 5.0m・門型の柱間 約13m・片持ちの腕 約7m・板 約4〜5×2〜2.4m(代表値。実物は地名の字数で決まる)',focus:[0,5.8,0],view:[5,.12,21],
  options:[optChoice('support','支持の形',[['gantry','門型(オーバーヘッド)'],['cantilever','片持ち(オーバーハング)']],'gantry'),
    optChoice('board','板の種類',[['exit','出口予告'],['branch','方面と車線'],['jct','JCT予告'],['toll','料金所予告']],'exit')],
  build(){const root=new THREE.Group();const H=5.0;
    const gt=opt(root,'support','gantry'),ct=opt(root,'support','cantilever');
    // 門型: 2本の柱+トラスの梁(板の上を渡す)
    for(const x of[-6.5,6.5]){add(gt,new THREE.CylinderGeometry(.2,.216,7.2,28),RM.zinc,x,3.6,0);add(gt,new THREE.CylinderGeometry(.3,.3,.05,28),RM.zincDull,x,.025,0);}
    truss(gt,[-6.5,6.55,0],[6.5,6.55,0],.7,13,.05);
    // 片持ち: 左の柱から腕が伸びる
    add(ct,new THREE.CylinderGeometry(.22,.26,7.2,28),RM.zinc,-5.2,3.6,0);add(ct,new THREE.CylinderGeometry(.34,.34,.05,28),RM.zincDull,-5.2,.025,0);
    truss(ct,[-5.2,6.55,0],[2.6,6.55,0],.7,8,.05);
    // 板(下端が H=5.0m)
    for(const k of Object.keys(B)){const o=opt(root,'board',k);const [w,h]=SZ[k];const cx=(k==='branch'?0:0);
      signBoard(o,w,h,B[k](),cx,H+h/2,.18);
      // 取付金具(板の背面の横材)
      for(const yy of[H+.3,H+h-.3])bar(o,[-w/2-.1,yy,.1],[w/2+.1,yy,.1],.025);
      for(const xx of[-w*.33,w*.33])bar(o,[xx,H+h+.02,.1],[xx,6.55,.1],.03);}
    return {root,lamps:{}};}};
