import {THREE,RM,add,opt,optChoice}from '../../kit/road-parts.js';
// 点字ブロック(視覚障害者誘導用ブロック): 線状(誘導)と点状(警告)。色は黄色が標準
const N=6,S=.3,T=.06;
export default {id:'jp-surface-tenji',name:'点字ブロック(視覚障害者誘導用ブロック)',
  desc:'黄色いブロックの表面に、線状の突起(誘導ブロック=進む向き)または点状の突起(警告ブロック=止まって確認)が並ぶ。1枚30cm角、6枚を並べて見せる。',
  dims:'1枚 0.30×0.30m・厚さ0.06m / 突起の高さ 約5mm(代表値)',focus:[0,0,0],view:[.2,1.8,1.4],
  options:[optChoice('type','種類',[['dot','警告(点状)'],['line','誘導(線状)']],'dot')],
  build(){const root=new THREE.Group();const yel=new THREE.MeshStandardMaterial({color:0xe0b414,roughness:.7});
    const base=new THREE.BoxGeometry(S-.004,T,S-.004);
    for(let i=0;i<N;i++)add(root,base,yel,(i-(N-1)/2)*S,-T/2+.0005,0);
    const dot=opt(root,'type','dot'),line=opt(root,'type','line');
    const dg=new THREE.CylinderGeometry(.0125,.0145,.006,20),n=N*25,dots=new THREE.InstancedMesh(dg,yel,n),m4=new THREE.Matrix4();let c=0;
    for(let i=0;i<N;i++)for(let a=0;a<5;a++)for(let b=0;b<5;b++){m4.makeTranslation((i-(N-1)/2)*S+(a-2)*.055,.003+.0005,(b-2)*.055);dots.setMatrixAt(c++,m4);}dots.castShadow=true;dots.receiveShadow=true;dot.add(dots);
    for(let i=0;i<N;i++)for(let a=0;a<4;a++){const g=new THREE.BoxGeometry(.017,.006,.26);g.translate(0,0,0);add(line,g,yel,(i-(N-1)/2)*S+(a-1.5)*.065,.0035,0);}
    return {root,lamps:{}};}};
