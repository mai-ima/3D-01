import {HG,MAT,THREE,add,dotLamp,reg,roundBox} from '../../kit/signal-parts.js';
export default {id:'jp-crossing-gate',group:'rail',name:'踏切遮断機(遮断かん・屈折式)',
  desc:'黄色と黒の縞の遮断かんが降下して道路を遮断する(水平時は路面上0.8m)。中間に折損防止の屈折継ぎ目を持つ。かんに赤色灯2灯を備え、警報中に点滅。かんの昇降はビューアでも動作を確認できる。',
  dims:'遮断かん長 約4.5m / 水平時の高さ0.8m(告示の基準値)',focus:[2,.9,.2],view:[1.2,.6,8.5],night:null,anim:{node:'gate_arm',axis:'z'},
  states:[{id:'open',label:'上昇(開)',arm:1.45},{id:'closing',label:'降下中',arm:.7,flash:['a1','a2']},{id:'closed',label:'降下(閉)',arm:0,flash:['a1','a2']}],
  cycle:[{s:'open',d:6},{s:'closing',d:1.5},{s:'closed',d:6}],
  build(){const root=new THREE.Group(),L={};add(root,new THREE.BoxGeometry(.7,.24,.5),new THREE.MeshStandardMaterial({color:0x9a9a96,roughness:.9,map:null}),0,.12,0);
    const col=add(root,roundBox(.34,1.02,.3,.05,.008),MAT.white,0,.74,0);for(let i=0;i<5;i++)add(root,new THREE.BoxGeometry(.346,.07,.302),MAT.black,0,.45+i*.18,0);
    const arm=new THREE.Group();arm.name='gate_arm';arm.position.set(.05,.8,.2);root.add(arm);
    add(arm,new THREE.CylinderGeometry(.012,.012,4.5,16),MAT.steel).rotation.z=Math.PI/2;arm.children[0].position.x=2.1;
    for(let i=0;i<10;i++){const s=add(arm,new THREE.CylinderGeometry(.034,.034,.44,24),i%2?MAT.black:MAT.yel,.22+i*.44,0,0);s.rotation.z=Math.PI/2;}
    add(arm,roundBox(.2,.1,.09,.02,.004),MAT.galv,2.2,0,0);add(arm,new THREE.CylinderGeometry(.03,.03,.11,20),MAT.steel,2.2,0,0).rotation.x=Math.PI/2;   // 屈折式の継ぎ目(折損防止)
    add(arm,roundBox(.5,.28,.2,.03,.006),HG,-.3,0,0);
    reg(L,'a1',dotLamp(arm,1.5,.0,.04,.05,'red'));reg(L,'a2',dotLamp(arm,3.1,.0,.04,.05,'red'));
    add(root,new THREE.CylinderGeometry(.03,.03,.5,16),MAT.galv,.05,1.25,.2);
    // 細部: 基礎のアンカーボルト、本体の扉(継ぎ目・取っ手・ビス)、雨よけの帽子、遮断かんの先端キャップ・補強バンド・おもり、警報灯のひさし
    for(const sx of[-1,1])for(const sz of[-1,1]){add(root,new THREE.CylinderGeometry(.012,.012,.1,12),MAT.steel,sx*.28,.29,sz*.2);add(root,new THREE.CylinderGeometry(.02,.02,.014,6),MAT.steel,sx*.28,.245,sz*.2);}
    add(root,roundBox(.30,.9,.01,.01,.003),MAT.galv,0,.74,.156);add(root,roundBox(.03,.14,.02,.006,.002),MAT.steel,.1,.74,.168);
    for(const sx of[-.12,.12])for(const sy of[.35,1.1])add(root,new THREE.CylinderGeometry(.008,.008,.01,10),MAT.steel,sx,sy,.162).rotation.x=Math.PI/2;
    add(root,new THREE.CylinderGeometry(.2,.17,.05,32),MAT.white,0,1.27,0);add(root,new THREE.CylinderGeometry(.16,.2,.04,32),MAT.white,0,1.31,0);
    add(arm,new THREE.CylinderGeometry(.04,.034,.03,24),MAT.black,4.34,0,0).rotation.z=Math.PI/2;
    for(const x of[1.0,2.0,3.0])add(arm,new THREE.TorusGeometry(.036,.004,8,36),MAT.steel,x,0,0).rotation.y=Math.PI/2;
    for(const x of[-.55,-.7,-.85])add(arm,new THREE.CylinderGeometry(.09,.09,.04,32),MAT.galv,x,0,0).rotation.z=Math.PI/2;
    for(const x of[1.5,3.1]){const v=add(arm,new THREE.CylinderGeometry(.075,.075,.06,24,1,true,0,Math.PI),MAT.black,x,.0,.045);v.rotation.set(Math.PI/2,0,0);}
    return {root,lamps:L};}};
