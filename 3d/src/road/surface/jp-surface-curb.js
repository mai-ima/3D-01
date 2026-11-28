import {THREE,RM,add,concreteMat,opt,optChoice,optToggle,bolt}from '../../kit/road-parts.js';
// 歩車道境界ブロック(縁石)。A型(高さ約15cm・車道側が立つ)、B型(高さ約15cm・角が大きく丸い)、C型(出入口の切下げ・高さ約5cm)。目地・面取り・L型側溝つき
const L=4,Bk=1,W=.18;
function prof(h,r,slope){const s=new THREE.Shape(),x=W/2;s.moveTo(-x,0);s.lineTo(x,0);s.lineTo(x,h-r);s.quadraticCurveTo(x,h,x-r,h);s.lineTo(-x+slope,h);s.lineTo(-x,h-slope*1.2);s.closePath();return s;}
const TYPES={a:{h:.15,r:.012,s:.02,label:'A型(標準・高さ15cm)'},b:{h:.15,r:.04,s:.035,label:'B型(角が丸い)'},c:{h:.05,r:.012,s:.01,label:'C型(切下げ・高さ5cm)'}};
export default {id:'jp-surface-curb',name:'縁石(歩車道境界ブロック)',
  desc:'歩道と車道の境を示すコンクリートのブロック。A型(標準)、B型(角が丸い)、C型(出入口の切下げ)を選べる。1mのブロックを目地つきで並べ、車道側にL型側溝を付けることもできる。',
  dims:'幅 0.18m・高さ 0.15m(C型は0.05m)・ブロック長 1m・L型側溝 幅0.3m(代表値)',focus:[0,.08,0],view:[.7,.5,2.4],
  options:[optChoice('type','形',Object.entries(TYPES).map(([k,v])=>[k,v.label]),'a'),optToggle('gutter','L型側溝(車道側)')],
  build(){const root=new THREE.Group();const cm=concreteMat('#b4b3ac',30000,[3,1]);const joint=new THREE.MeshStandardMaterial({color:0x2c2d2e,roughness:.95});
    for(const [k,T] of Object.entries(TYPES)){const o=opt(root,'type',k);
      for(let i=0;i<L/Bk;i++){const g=new THREE.ExtrudeGeometry(prof(T.h,T.r,T.s),{depth:Bk-.012,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:2});g.translate(0,0,-(Bk-.012)/2);g.rotateY(Math.PI/2);
        const m=add(o,g,cm,-L/2+Bk/2+i*Bk,0,0);m.castShadow=true;m.receiveShadow=true;
        if(i>0)add(o,new THREE.BoxGeometry(.012,T.h*.96,W*.96),joint,-L/2+i*Bk,T.h*.48,0).rotation.y=0;}
      add(o,new THREE.BoxGeometry(L,.02,W+.04),joint,0,.001,0);}
    // L型側溝: 縁石の車道側(-Z)に敷く
    const gu=opt(root,'gutter','on');for(let i=0;i<L/Bk;i++){const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.3,0);s.lineTo(.3,.05);s.lineTo(.06,.05);s.lineTo(.04,.1);s.lineTo(0,.1);s.closePath();
      const g=new THREE.ExtrudeGeometry(s,{depth:Bk-.012,bevelEnabled:false});g.translate(0,0,-(Bk-.012)/2);g.rotateY(Math.PI/2);const m=add(gu,g,cm,-L/2+Bk/2+i*Bk,-.1,-W/2-.3);m.castShadow=true;m.receiveShadow=true;}
    return {root,lamps:{}};}};
