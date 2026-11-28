import {THREE,EXC,RM,add,bolt,opt,optChoice,greenFace,canvasTex,FONT,signBoard,roundBox,faceMat,concreteMat}from '../../kit/expressway-parts.js';
// 距離標(キロポスト): 路線の起点からの距離を示す。100mごとは白地・緑字、1kmごとは緑地・白字
const tx=(bg,fg,big,small)=>canvasTex(256,360,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle=bg;g.beginPath();g.roundRect(10,10,w-20,h-20,14);g.fill();g.strokeStyle=fg;g.lineWidth=6;g.beginPath();g.roundRect(22,22,w-44,h-44,8);g.stroke();
  g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.42}px ${FONT}`;g.fillText(big,w/2,h*.42,w*.82);g.font=`700 ${h*.14}px ${FONT}`;g.fillText(small,w/2,h*.78,w*.8);});
export default {id:'jp-exp-kilopost',name:'距離標(キロポスト)',
  desc:'路線の起点からの距離を示す小さな標識。100mごとは白地に緑字(数字は小数点以下1桁)、1kmごとは緑地に白字。支柱に立てる形と、壁・防護柵に取り付ける形を選べる。',
  dims:'板 約0.2×0.28m・高さ 約1.1m(板寸法は代表値)',focus:[0,.95,0],view:[.9,.1,2.2],
  options:[optChoice('kind','種類',[['k100','100m標(白地)'],['k1000','1km標(緑地)']],'k100'),optChoice('mount','取付',[['post','支柱'],['wall','コンクリート壁']],'post')],
  build(){const root=new THREE.Group();const zinc=RM.zinc;
    const faces={k100:tx('#f4f4ee',EXC.green,'245','.3km'),k1000:tx(EXC.green,'#fff','245','km')};
    const po=opt(root,'mount','post');add(po,new THREE.BoxGeometry(.07,1.05,.07),RM.white,0,.525,0);add(po,new THREE.BoxGeometry(.08,.06,.08),RM.white,0,1.05,0);add(po,new THREE.CylinderGeometry(.06,.06,.015,20),zinc,0,.008,0);
    const wl=opt(root,'mount','wall');add(wl,new THREE.BoxGeometry(.9,.9,.4),concreteMat('#b7b5ad',0,[1,1]),0,.45,-.21);
    for(const m of['post','wall']){const mo=m==='post'?po:wl;for(const k of Object.keys(faces)){const o=opt(mo,'kind',k);signBoard(o,.2,.28,faces[k],0,m==='post'?.86:.62,m==='post'?.05:.012,.02);}}
    return {root,lamps:{}};}};
