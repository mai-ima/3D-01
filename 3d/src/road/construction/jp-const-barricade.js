import {THREE,RM,add,bar,bolt,canvasTex,lightPanel,roundBox}from '../../kit/road-parts.js';
// 工事用バリケード(横型・点滅灯付き): 黄黒の縞の板を2段に渡し、上に点滅灯を載せる
const ST=[{id:'off',label:'消灯'},{id:'flash',label:'点滅',flash:['lamp']}];
export default {id:'jp-const-barricade',name:'工事用バリケード(点滅灯付き)',
  desc:'工事現場や車線規制で使う、2段の縞板のバリケード。黄色と黒の縞が斜めに走り、上に琥珀色の点滅灯が付く。夜間は灯が点滅する。',
  dims:'幅 約1.2m・高さ 約1.0m・板の高さ 約0.2m(代表値)',focus:[0,.9,0],view:[1.1,.4,3.4],night:'flash',states:ST,cycle:[{s:'flash',d:10}],
  build(){const root=new THREE.Group(),L={};const W=1.2;
    const stripe=canvasTex(1024,170,(g,w,h)=>{g.fillStyle='#f1c40f';g.fillRect(0,0,w,h);g.fillStyle='#16130a';for(let x=-170;x<w+170;x+=170){g.beginPath();g.moveTo(x,h);g.lineTo(x+85,h);g.lineTo(x+85+170,0);g.lineTo(x+170,0);g.fill();}});
    const bm=new THREE.MeshStandardMaterial({map:stripe,roughness:.45});
    for(const y of[.85,.55]){add(root,roundBox(W,.2,.025,.01,.004),bm,0,y,0);for(const sx of[-1,1])bar(root,[sx*(W/2-.04),y,-.014],[sx*(W/2-.04),y,-.04],.012,RM.zinc);}
    for(const sx of[-1,1]){const x=sx*(W/2-.06);bar(root,[x,.97,0],[x,0,-.0],.02,RM.zinc);bar(root,[x,.62,-.02],[x+sx*.02,0,-.5],.018,RM.zinc);bar(root,[x,.62,-.02],[x+sx*.02,0,.5],.018,RM.zinc);
      for(const z of[-.5,.5])add(root,new THREE.BoxGeometry(.1,.012,.06),RM.zincDull,x+sx*.02,.006,z);}
    add(root,new THREE.CylinderGeometry(.06,.07,.03,32),RM.black,0,.985,0);
    const body=add(root,new THREE.CylinderGeometry(.075,.075,.1,40),new THREE.MeshPhysicalMaterial({color:0xf2f2e8,roughness:.4}),0,1.06,0);
    const lens=new THREE.SphereGeometry(.07,40,20,0,Math.PI*2,0,Math.PI*.55);lightPanel(L,'lamp',root,lens,'orange',0,1.115,0);
    return {root,lamps:L};}};
