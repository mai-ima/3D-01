import {THREE,RM,add,opt,optChoice,optToggle,canvasTex,concreteMat}from '../../kit/expressway-parts.js';
// 遮音壁: H形鋼の支柱と遮音板。金属(吸音)・透明・下部コンクリート+上部透明、の3種と、上端の形を選べる
const metal=()=>canvasTex(256,256,(g,w,h)=>{g.fillStyle='#c7ccce';g.fillRect(0,0,w,h);g.fillStyle='#a8aeb1';for(let y=0;y<h;y+=16)g.fillRect(0,y,w,5);for(let y=0;y<h;y+=32)for(let x=8;x<w;x+=16){g.fillStyle='#6b7276';g.beginPath();g.arc(x,y+11,2.6,0,7);g.fill();}});
export default {id:'jp-exp-noise-wall',name:'遮音壁',
  desc:'高速道路の脇に連続して立つ防音の壁。金属の吸音板、透明板(日照と眺望を保つ)、下部がコンクリートで上部が透明の組み合わせ、の3種を選べる。上端を内側に曲げた形も付けられる。',
  dims:'高さ 3m・支柱間隔 2m・H形鋼 200×200mm(代表値。実際の高さは騒音の予測で個別に決まる)',focus:[0,1.7,0],view:[4,.25,10],
  options:[optChoice('panel','遮音板',[['metal','金属(吸音)'],['clear','透明板'],['mix','下部コンクリート+上部透明']],'metal'),optToggle('cap','上端の曲がり(先端改良型)')],
  build(){const root=new THREE.Group();const H=3.0,N=5,span=2;const steel=new THREE.MeshStandardMaterial({color:0x7c8489,roughness:.55,metalness:.7});
    const clear=new THREE.MeshPhysicalMaterial({color:0xcfe0e4,roughness:.06,transmission:0,transparent:true,opacity:.35,clearcoat:1,side:THREE.DoubleSide});
    const conc=concreteMat('#b7b5ad',0,[1,1]);const mm=new THREE.MeshStandardMaterial({map:metal(),roughness:.5,metalness:.4});
    // 支柱は H 形鋼(200×200・フランジとウェブ)。足元に基礎のコンクリート、ベースプレートとアンカーボルト、遮音板を留めるボルト
    for(let i=0;i<=N;i++){const z=-N*span/2+i*span;add(root,new THREE.BoxGeometry(.2,H,.012),steel,0,H/2,z);add(root,new THREE.BoxGeometry(.012,H,.2),steel,0,H/2,z);
      for(const sx of[-1,1])add(root,new THREE.BoxGeometry(.008,H,.2),steel,sx*.1,H/2,z);
      add(root,new THREE.BoxGeometry(.34,.5,.4),conc,0,.15,z);add(root,new THREE.BoxGeometry(.3,.016,.3),steel,0,.41,z);
      for(const sx of[-1,1])for(const sz of[-1,1]){add(root,new THREE.CylinderGeometry(.012,.012,.07,10),steel,sx*.12,.44,z+sz*.12);add(root,new THREE.CylinderGeometry(.018,.018,.012,6),steel,sx*.12,.475,z+sz*.12);}
      for(let k=0;k<9;k++)for(const sz of[-1,1]){add(root,new THREE.CylinderGeometry(.011,.011,.012,6),steel,.107,.6+k*.3,z+sz*.06).rotation.z=Math.PI/2;}}
    for(let i=0;i<N;i++){const z=-N*span/2+i*span+span/2;
      add(opt(root,'panel','metal'),new THREE.BoxGeometry(.08,H-.1,span-.1),mm,0,H/2,z);
      for(let k=1;k<8;k++)add(opt(root,'panel','metal'),new THREE.BoxGeometry(.03,H-.12,.02),steel,.05,H/2,z-span/2+.05+k*(span-.1)/8);   // 吸音板の補強リブ
      add(opt(root,'panel','clear'),new THREE.BoxGeometry(.03,H-.1,span-.1),clear,0,H/2,z);
      const mx=opt(root,'panel','mix');add(mx,new THREE.BoxGeometry(.12,1.1,span-.1),conc,0,.55,z);add(mx,new THREE.BoxGeometry(.03,H-1.25,span-.1),clear,0,1.15+(H-1.25)/2,z);}
    const cp=opt(root,'cap','on');for(let i=0;i<N;i++){const z=-N*span/2+i*span+span/2;const c=add(cp,new THREE.BoxGeometry(.5,.05,span-.1),mm,.2,H+.06,z);c.rotation.z=-.35;}
    return {root,lamps:{}};}};
