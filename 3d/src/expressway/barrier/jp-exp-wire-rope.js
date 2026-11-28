import {THREE,RM,add,bar,bolt,opt,optChoice,roundBox,concreteMat}from '../../kit/expressway-parts.js';
// ワイヤロープ式防護柵(暫定2車線の中央分離): 細い支柱にロープを3〜5本張る。ロープφ18mm・支柱φ89.1mm・支柱間隔3.0m
const Y={3:[.55,.76,.97],4:[.44,.62,.8,.98],5:[.4,.55,.7,.85,1.0]};
export default {id:'jp-exp-wire-rope',name:'ワイヤロープ式防護柵',
  desc:'暫定2車線の高速道路の中央に立つ、ロープを張った防護柵。対向車線への飛び出しを防ぐ。ロープの本数(3・4・5本)を選べる。',
  dims:'ロープ φ18mm・最上段 約1.0m・支柱 φ89.1mm・間隔 3.0m・端末は基礎ブロック(資料の数値を元にした代表値)',focus:[0,.6,0],view:[3,.2,7.5],
  options:[optChoice('ropes','ロープの本数',[['3','3本'],['4','4本'],['5','5本']],'3')],
  build(){const root=new THREE.Group();const conc=concreteMat('#b7b5ad',0,[1,1]);
    const rope=new THREE.MeshStandardMaterial({color:0xa4a9ac,roughness:.35,metalness:.85});const N=5;
    for(let i=0;i<=N*1;i++){const z=-7.5+i*3;add(root,new THREE.CylinderGeometry(.0446,.0446,1.1,20),RM.zinc,0,.55,z);add(root,new THREE.CylinderGeometry(.052,.052,.09,20),RM.zinc,0,1.1,z);
      add(root,new THREE.CylinderGeometry(.057,.057,.18,20),RM.zincDull,0,.09,z);add(root,new THREE.BoxGeometry(.012,.12,.012),RM.reflOrange,.0,.0,z).visible=false;}
    for(const [k,ys] of Object.entries(Y)){const o=opt(root,'ropes',k);for(const y of ys){const r=add(o,new THREE.CylinderGeometry(.009,.009,15,10),rope,.0,y,0);r.rotation.x=Math.PI/2;
      for(let i=0;i<=N;i++)add(o,new THREE.BoxGeometry(.03,.034,.03),RM.zincDull,.045,y,-7.5+i*3);}}
    // 端末: 基礎ブロックから立ち上がる端末支柱と、ロープの端末金具(ターンバックル・クレビス)・アンカーボルト
    for(const sz of[-1,1]){const z=sz*7.9;add(root,new THREE.CylinderGeometry(.05,.05,1.1,20),RM.zinc,0,.95,z);
      for(const y of[.55,.76,.97]){add(root,new THREE.CylinderGeometry(.014,.014,.16,12),RM.zincDull,0,y,z-sz*.1).rotation.x=Math.PI/2;add(root,roundBox(.05,.04,.05,.006,.002),RM.zinc,.0,y,z);}
      for(const dx of[-.22,.22])for(const dz of[-.45,.45])add(root,new THREE.CylinderGeometry(.012,.012,.07,10),RM.zinc,dx,.43,z+dz);}
    // ロープ支柱の細部: 根元のスリーブの継ぎ目、ロープを留める金具(クリップ)、頭のキャップ
    for(let i=0;i<=N;i++){const z=-7.5+i*3;add(root,new THREE.TorusGeometry(.058,.006,8,28),RM.zincDull,0,.18,z).rotation.x=Math.PI/2;
      for(const y of[.55,.76,.97])add(root,roundBox(.035,.03,.045,.004,.002),RM.zincDull,.0,y,z+.03);}
    add(root,new THREE.BoxGeometry(.7,.4,1.2),conc,0,.2,-8.1);add(root,new THREE.BoxGeometry(.7,.4,1.2),conc,0,.2,8.1);                    // 端末の基礎
    for(const sz of[-1,1])add(root,new THREE.BoxGeometry(.06,.16,.012),RM.reflOrange,0,.82,sz*7.5);
    return {root,lamps:{}};}};
