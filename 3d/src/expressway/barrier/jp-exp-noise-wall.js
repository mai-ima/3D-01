import {THREE,RM,add,opt,optChoice,optToggle,canvasTex}from '../../kit/expressway-parts.js';
// 遮音壁: H形鋼の支柱と遮音板。金属(吸音)・透明・下部コンクリート+上部透明、の3種と、上端の形を選べる
const metal=()=>canvasTex(256,256,(g,w,h)=>{g.fillStyle='#c7ccce';g.fillRect(0,0,w,h);g.fillStyle='#a8aeb1';for(let y=0;y<h;y+=16)g.fillRect(0,y,w,5);for(let y=0;y<h;y+=32)for(let x=8;x<w;x+=16){g.fillStyle='#6b7276';g.beginPath();g.arc(x,y+11,2.6,0,7);g.fill();}});
export default {id:'jp-exp-noise-wall',name:'遮音壁',
  desc:'高速道路の脇に連続して立つ防音の壁。金属の吸音板、透明板(日照と眺望を保つ)、下部がコンクリートで上部が透明の組み合わせ、の3種を選べる。上端を内側に曲げた形も付けられる。',
  dims:'高さ 3m・支柱間隔 2m・H形鋼 200×200mm(代表値。実際の高さは騒音の予測で個別に決まる)',focus:[0,1.7,0],view:[4,.25,10],
  options:[optChoice('panel','遮音板',[['metal','金属(吸音)'],['clear','透明板'],['mix','下部コンクリート+上部透明']],'metal'),optToggle('cap','上端の曲がり(先端改良型)')],
  build(){const root=new THREE.Group();const H=3.0,N=5,span=2;const steel=new THREE.MeshStandardMaterial({color:0x7c8489,roughness:.55,metalness:.7});
    const clear=new THREE.MeshPhysicalMaterial({color:0xcfe0e4,roughness:.06,transmission:0,transparent:true,opacity:.35,clearcoat:1,side:THREE.DoubleSide});
    const conc=new THREE.MeshStandardMaterial({color:0xb7b5ad,roughness:.93});const mm=new THREE.MeshStandardMaterial({map:metal(),roughness:.5,metalness:.4});
    for(let i=0;i<=N;i++){const z=-N*span/2+i*span;add(root,new THREE.BoxGeometry(.2,H,.012),steel,0,H/2,z).scale.z=1;add(root,new THREE.BoxGeometry(.012,H,.2),steel,0,H/2,z);add(root,new THREE.BoxGeometry(.2,.2,.3),conc,0,.0,z);add(root,new THREE.BoxGeometry(.2,.012,.2),steel,0,H/2,z);}
    for(let i=0;i<N;i++){const z=-N*span/2+i*span+span/2;
      add(opt(root,'panel','metal'),new THREE.BoxGeometry(.08,H-.1,span-.1),mm,0,H/2,z);
      add(opt(root,'panel','clear'),new THREE.BoxGeometry(.03,H-.1,span-.1),clear,0,H/2,z);
      const mx=opt(root,'panel','mix');add(mx,new THREE.BoxGeometry(.12,1.1,span-.1),conc,0,.55,z);add(mx,new THREE.BoxGeometry(.03,H-1.25,span-.1),clear,0,1.15+(H-1.25)/2,z);}
    const cp=opt(root,'cap','on');for(let i=0;i<N;i++){const z=-N*span/2+i*span+span/2;const c=add(cp,new THREE.BoxGeometry(.5,.05,span-.1),mm,.2,H+.06,z);c.rotation.z=-.35;}
    return {root,lamps:{}};}};
