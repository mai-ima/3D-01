import {THREE,RM,add,opt,optChoice,roundBox}from '../../kit/road-parts.js';
// 点字ブロック(視覚障害者誘導用ブロック)。形状はJIS T 9251(2014)の値に基づく: 1枚300×300mm・突起の高さ5mm・点状は5×5個(間隔55〜60mm)・線状は4本(間隔75mm)
const N=6,S=.3,T=.06;
export default {id:'jp-surface-tenji',name:'点字ブロック(視覚障害者誘導用ブロック)',
  desc:'黄色いブロックの表面に、線状の突起(誘導ブロック=進む向き)または点状の突起(警告ブロック=止まって確認)が並ぶ。1枚30cm角、6枚を並べて見せる。色は黄色(標準)・灰色を選べる。角は面取りしてあり、継ぎ目に目地がある。',
  dims:'1枚 0.30×0.30m・厚さ0.06m / 突起の高さ 5mm・点の間隔 約60mm・線状は4本で間隔75mm(JIS T 9251の値を元にした代表値)',focus:[0,0,0],view:[.3,1.0,1.8],
  options:[optChoice('type','種類',[['dot','警告(点状)'],['line','誘導(線状)']],'dot'),optChoice('color','色',[['yellow','黄色'],['gray','灰色']],'yellow')],
  build(){const root=new THREE.Group();
    const mats={yellow:new THREE.MeshStandardMaterial({color:0xe4b712,roughness:.72}),gray:new THREE.MeshStandardMaterial({color:0x9a9b9c,roughness:.8})};
    const dotG=new THREE.CylinderGeometry(.006,.0095,.005,24);
    for(const [ck,mat] of Object.entries(mats)){const c=opt(root,'color',ck);
      for(let i=0;i<N;i++)add(c,roundBox(S-.006,T,S-.006,.004,.002),mat,(i-(N-1)/2)*S,-T/2+.003,0);      // 1枚ずつの板。角は面取り
      const dot=opt(c,'type','dot'),line=opt(c,'type','line');
      const dots=new THREE.InstancedMesh(dotG,mat,N*25),m4=new THREE.Matrix4();let k=0;
      for(let i=0;i<N;i++)for(let a=0;a<5;a++)for(let b=0;b<5;b++){m4.makeTranslation((i-(N-1)/2)*S+(a-2)*.06,.0025+.003,(b-2)*.06);dots.setMatrixAt(k++,m4);}dots.castShadow=true;dots.receiveShadow=true;dot.add(dots);
      for(let i=0;i<N;i++)for(let a=0;a<4;a++){const g=roundBox(.017,.005,.27,.0022,.001);add(line,g,mat,(i-(N-1)/2)*S+(a-1.5)*.075,.0025+.003,0);}}
    add(root,new THREE.BoxGeometry(N*S+.1,.002,S+.1),new THREE.MeshStandardMaterial({color:0x4f5052,roughness:.95}),0,-.003,0);      // 目地(板の下の暗い面)
    return {root,lamps:{}};}};
