import {THREE,RM,add,bar,bolt,lightPanel,roundBox,opt,optChoice}from '../../kit/expressway-parts.js';
// 高速道路の道路照明ポール(LED): 1灯の片持ち(路側)・2灯の双頭(中央分離帯)・曲線アームを選べる
const ST=[{id:'on',label:'点灯',on:['lampA','lampB']},{id:'off',label:'消灯'}];
export default {id:'jp-exp-light-pole',name:'道路照明ポール(高速道路)',
  desc:'高速道路のIC・料金所・分離帯に立つ照明ポール。路側用の1灯(片持ち)と、中央分離帯用の2灯(双頭)を選べる。夜は点灯する。',
  dims:'ポール高 約10m・アーム長 約2.0m・灯具 約0.9×0.4m(代表値)',focus:[0,9,0],view:[4,.1,14],night:'on',states:ST,cycle:[{s:'on',d:8},{s:'off',d:4}],
  options:[optChoice('type','形式',[['single','片持ち(1灯)'],['double','双頭(2灯)']],'single')],
  build(){const root=new THREE.Group(),L={};const H=10;const zinc=RM.zincDull;
    add(root,new THREE.CylinderGeometry(.085,.17,H,8),zinc,0,H/2,0);add(root,new THREE.CylinderGeometry(.24,.24,.04,8),zinc,0,.02,0);add(root,new THREE.CylinderGeometry(.19,.24,.4,8),zinc,0,.24,0);
    // 柱の細部: 根元のボルト・ナット(8本)、点検口(ハンドホール)の扉とビス、継ぎ目の溶接の盛り上がり、アースの端子
    for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;const nut=add(root,new THREE.CylinderGeometry(.022,.022,.03,6),RM.zinc,Math.cos(a)*.215,.055,Math.sin(a)*.215);add(root,new THREE.CylinderGeometry(.008,.008,.09,10),RM.zinc,Math.cos(a)*.215,.1,Math.sin(a)*.215);}
    {const d=add(root,roundBox(.13,.42,.012,.02,.004),RM.zinc,0,.95,.119);for(const sx of[-.045,.045])for(const sy of[-.17,.17])bolt(root,sx,.95+sy,.127,.008);
     add(root,roundBox(.04,.05,.01,.005,.002),RM.zinc,0,1.3,.1);}
    for(const y of[3.3,6.6])add(root,new THREE.TorusGeometry(.14-y*.0073+.045,.007,10,48),zinc,0,y,0).rotation.x=Math.PI/2;
    const arm=(g,s,key)=>{bar(g,[0,H-.35,0],[s*1.2,H+.35,0],.045,zinc);bar(g,[s*1.1,H+.3,0],[s*2.0,H+.4,0],.04,zinc);const lg=new THREE.Group();lg.position.set(s*2.0,H+.37,0);g.add(lg);
      add(lg,roundBox(.9,.12,.42,.05,.01),RM.zincDull,0,.0,0);
      for(let k=0;k<11;k++)add(lg,new THREE.BoxGeometry(.7,.05,.012),RM.zincDull,0,.085,-.17+k*.034);           // 放熱フィン
      add(lg,roundBox(.8,.012,.36,.01,.003),new THREE.MeshPhysicalMaterial({color:0xcfd8dc,roughness:.05,transmission:0,transparent:true,opacity:.55,clearcoat:1}),0,-.062,0);   // 灯具のカバー(透明)
      add(lg,new THREE.CylinderGeometry(.045,.05,.1,24),zinc,-s*.42,.04,0).rotation.z=s*Math.PI/2;                // 取付けの首
      for(const z of[-.15,.15])bolt(lg,-s*.3,.062,z,.01,'y');lightPanel(L,key,lg,new THREE.PlaneGeometry(.78,.34).rotateX(-Math.PI/2),'white',0,-.07,0);};
    const sg=opt(root,'type','single');arm(sg,1,'lampA');
    const db=opt(root,'type','double');arm(db,1,'lampA');arm(db,-1,'lampB');
    return {root,lamps:L};}};
