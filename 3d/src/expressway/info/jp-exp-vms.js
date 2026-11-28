import {THREE,EXC,RM,EXM,add,bar,roundBox,lightPanel,opt,optChoice,optToggle,canvasTex,FONT,truss}from '../../kit/expressway-parts.js';
// 道路情報板(可変情報板)。NEXCO 広域情報板(K型)の仕様書の値に基づく: 文字高450mm・文字幅390mm、LEDは10mmピッチ、18文字×2段(縦108×横864ドット=8.64×1.08m)、
// 名称部は緑地・白文字(2.2×0.4m)、上に黄色の点滅灯2灯(交互点滅)。文字式の表示色は橙が基本で、通行止めなどは赤。
const PITCH=.01;
/** LED の点(ドット)で文字を表す画像。lines=[{t,color}]。1ドットを2×2画素で描く */
function ledTex(cols,rows,lines){return canvasTex(cols*2,rows*2,(g,W,H)=>{g.fillStyle='#000';g.fillRect(0,0,W,H);
  const o=document.createElement('canvas');o.width=cols;o.height=rows;const og=o.getContext('2d',{willReadFrequently:true});
  const n=lines.length;const lh=rows/n;
  lines.forEach((ln,i)=>{og.clearRect(0,0,cols,rows);og.fillStyle='#fff';og.textAlign='center';og.textBaseline='middle';og.font=`700 ${Math.min(45,lh*.92)}px ${FONT}`;
    og.fillText(ln.t,cols/2,lh*(i+.5)+1,cols*.97);const d=og.getImageData(0,Math.floor(lh*i),cols,Math.ceil(lh)).data;
    for(let y=0;y<Math.ceil(lh);y++)for(let x=0;x<cols;x++){const on=d[(y*cols+x)*4+3]>110;g.fillStyle=on?ln.color:'#16191c';g.beginPath();g.arc(x*2+1,(Math.floor(lh*i)+y)*2+1,on?.92:.7,0,7);g.fill();}});});}
/** 図形式(フリーパターン): 三角の注意記号と矢印、文字 */
function graphTex(cols,rows){return canvasTex(cols*2,rows*2,(g,W,H)=>{g.fillStyle='#000';g.fillRect(0,0,W,H);
  const d=(x,y,c)=>{g.fillStyle=c;g.beginPath();g.arc(x*2+1,y*2+1,.92,0,7);g.fill();};
  const o=document.createElement('canvas');o.width=cols;o.height=rows;const og=o.getContext('2d',{willReadFrequently:true});
  const paint=(fn,col)=>{og.clearRect(0,0,cols,rows);fn(og);const dd=og.getImageData(0,0,cols,rows).data;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(dd[(y*cols+x)*4+3]>110)d(x,y,col);};
  paint(c=>{c.fillStyle='#fff';c.beginPath();c.moveTo(60,8);c.lineTo(112,96);c.lineTo(8,96);c.closePath();c.fill();c.globalCompositeOperation='destination-out';c.fillRect(56,36,8,34);c.fillRect(56,76,8,10);},'#ff3b2f');
  paint(c=>{c.fillStyle='#fff';c.fillRect(150,50,cols*.55,10);c.beginPath();c.moveTo(150+cols*.55,30);c.lineTo(150+cols*.55+30,55);c.lineTo(150+cols*.55,80);c.fill();},'#ffc01c');
  paint(c=>{c.fillStyle='#fff';c.font=`700 36px ${FONT}`;c.textBaseline='middle';c.fillText('渋滞 3km',150,24);},'#33e07a');
  paint(c=>{c.fillStyle='#fff';c.font=`700 36px ${FONT}`;c.textBaseline='middle';c.fillText('所要 15分',150,88);},'#f2f2f2');});}
const MSG={
  accident:{label:'事故渋滞',lines:[{t:'事故渋滞 5km',color:'#ff9a1f'},{t:'吹田JCT 先頭',color:'#ff9a1f'}]},
  snow:{label:'雪・チェーン規制',lines:[{t:'雪のため 50km/h規制',color:'#ff9a1f'},{t:'チェーン規制 実施中',color:'#ff9a1f'}]},
  closed:{label:'通行止め',lines:[{t:'通行止',color:'#ff3a2a'},{t:'岡崎IC→豊田JCT',color:'#ff9a1f'}]},
  etc:{label:'ETC専用入口',lines:[{t:'ETC専用入口',color:'#ff9a1f'},{t:'現金車 利用不可',color:'#ff9a1f'}]}};
const SIZES={k:{label:'K型(広域)18字×2段',cols:864,rows:108},a:{label:'文字式 12字×2段',cols:576,rows:108}};
const keys=[];for(const s of Object.keys(SIZES)){for(const m of Object.keys(MSG))keys.push(`disp_${m}_${s}`);keys.push(`disp_graphic_${s}`);}
const ST=[{id:'on',label:'表示(点滅灯 交互)',on:keys,flash:['fl1'],flash2:['fl2']},{id:'off',label:'消灯'}];
export default {id:'jp-exp-vms',name:'道路情報板(可変情報板)',
  desc:'渋滞・事故・規制を知らせる電光の情報板。NEXCOの広域情報板(K型)の仕様に基づき、文字高450mm・LED 10mmピッチ・18字×2段。名称部(緑地)と、上の黄色い点滅灯2灯を備える。文字式(事故渋滞・雪・通行止め・ETC専用入口)と図形式を選べる。',
  dims:'K型: 表示面 約8.64×1.08m(縦108×横864ドット・10mmピッチ)・名称部 2.2×0.4m・板の下端 5.0m。文字式12字は約5.76m(推)。大きさは仕様書の値',focus:[0,5.8,0],view:[5,.1,22],night:'on',states:ST,cycle:[{s:'on',d:8},{s:'off',d:3}],
  options:[optChoice('size','大きさ',Object.entries(SIZES).map(([k,v])=>[k,v.label]),'k'),
    optChoice('type','表示の形式',[['text','文字式(橙・赤のLED)'],['graphic','図形式(フルカラー)']],'text'),
    optChoice('msg','文字式の内容',Object.entries(MSG).map(([k,v])=>[k,v.label]),'accident'),
    optChoice('support','支持の形',[['gantry','門型'],['cantilever','片持ち']],'gantry')],
  build(){const root=new THREE.Group(),L={};const y0=5.0;
    const gt=opt(root,'support','gantry'),ct=opt(root,'support','cantilever');
    for(const x of[-7.2,7.2]){add(gt,new THREE.CylinderGeometry(.22,.24,7.4,28),RM.zinc,x,3.7,0);add(gt,new THREE.CylinderGeometry(.32,.32,.05,28),RM.zincDull,x,.025,0);}
    truss(gt,[-7.2,6.9,0],[7.2,6.9,0],.8,14,.055);
    add(ct,new THREE.CylinderGeometry(.24,.28,7.4,28),RM.zinc,-6.4,3.7,0);add(ct,new THREE.CylinderGeometry(.36,.36,.05,28),RM.zincDull,-6.4,.025,0);truss(ct,[-6.4,6.9,0],[5.2,6.9,0],.8,10,.055);
    for(const [sk,S] of Object.entries(SIZES)){const so=opt(root,'size',sk);const W=S.cols*PITCH,H=S.rows*PITCH;
      add(so,roundBox(W+.3,H+.3,.34,.04,.01),EXM.canopyDark,0,y0+H/2+.15,.17);add(so,new THREE.BoxGeometry(W+.4,.05,.38),RM.zincDull,0,y0+H+.33,.17);
      for(const sx of[-.38,.38])bar(so,[sx*W,y0+H+.33,.1],[sx*W,6.9,.1],.035);
      const ty=opt(so,'type','text');for(const [mk,M] of Object.entries(MSG)){const mo=opt(ty,'msg',mk);const k=`disp_${mk}_${sk}`;
        const p=lightPanel(L,k,mo,new THREE.PlaneGeometry(W,H),'white',0,y0+H/2+.15,.35,ledTex(S.cols,S.rows,M.lines));p.mat.map=null;p.mat.color.set(0x07090b);}
      const gr=opt(so,'type','graphic');const gp=lightPanel(L,`disp_graphic_${sk}`,gr,new THREE.PlaneGeometry(W,H),'white',0,y0+H/2+.15,.35,graphTex(S.cols,S.rows));gp.mat.map=null;gp.mat.color.set(0x07090b);
      // 名称部(緑地・白文字)と点滅灯(黄・交互)
      const nx=-W/2+1.3,ny=y0+H+.33+.28;add(so,roundBox(2.2,.4,.08,.02,.006),RM.zincDull,nx,ny,.2);
      add(so,new THREE.PlaneGeometry(2.14,.34),new THREE.MeshStandardMaterial({map:canvasTex(1024,170,(g,w,h)=>{g.fillStyle=EXC.green;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.62}px ${FONT}`;g.fillText('東名高速 情報',w/2,h*.54,w*.9);}),roughness:.4}),nx,ny,.245);
      for(const [fk,fx] of[['fl1',-W/2+.2],['fl2',W/2-.2]]){add(so,new THREE.CylinderGeometry(.03,.03,.3,12),RM.zinc,fx,y0+H+.5,.17);lightPanel(L,fk,so,new THREE.CircleGeometry(.14,28),'yellow',fx,y0+H+.75,.19);}}
    return {root,lamps:L};}};
