import {THREE,RM,add,bar,lightPanel,roundBox,opt,optChoice}from '../../kit/expressway-parts.js';
// 高速道路の道路照明ポール(LED): 1灯の片持ち(路側)・2灯の双頭(中央分離帯)・曲線アームを選べる
const ST=[{id:'on',label:'点灯',on:['lampA','lampB']},{id:'off',label:'消灯'}];
export default {id:'jp-exp-light-pole',name:'道路照明ポール(高速道路)',
  desc:'高速道路のIC・料金所・分離帯に立つ照明ポール。路側用の1灯(片持ち)と、中央分離帯用の2灯(双頭)を選べる。夜は点灯する。',
  dims:'ポール高 約10m・アーム長 約2.0m・灯具 約0.9×0.4m(代表値)',focus:[0,9,0],view:[4,.1,14],night:'on',states:ST,cycle:[{s:'on',d:8},{s:'off',d:4}],
  options:[optChoice('type','形式',[['single','片持ち(1灯)'],['double','双頭(2灯)']],'single')],
  build(){const root=new THREE.Group(),L={};const H=10;const zinc=RM.zincDull;
    add(root,new THREE.CylinderGeometry(.085,.17,H,8),zinc,0,H/2,0);add(root,new THREE.CylinderGeometry(.24,.24,.04,8),zinc,0,.02,0);add(root,new THREE.CylinderGeometry(.19,.24,.4,8),zinc,0,.24,0);
    const arm=(g,s,key)=>{bar(g,[0,H-.35,0],[s*1.2,H+.35,0],.045,zinc);bar(g,[s*1.1,H+.3,0],[s*2.0,H+.4,0],.04,zinc);const lg=new THREE.Group();lg.position.set(s*2.0,H+.37,0);g.add(lg);
      add(lg,roundBox(.9,.12,.42,.05,.01),RM.zincDull,0,.0,0);lightPanel(L,key,lg,new THREE.PlaneGeometry(.78,.34).rotateX(-Math.PI/2),'white',0,-.07,0);};
    const sg=opt(root,'type','single');arm(sg,1,'lampA');
    const db=opt(root,'type','double');arm(db,1,'lampA');arm(db,-1,'lampB');
    return {root,lamps:L};}};
