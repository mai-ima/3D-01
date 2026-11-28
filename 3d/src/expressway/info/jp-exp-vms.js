import {THREE,EXC,RM,EXM,add,bar,roundBox,lightPanel,opt,optChoice,canvasTex,FONT,truss}from '../../kit/expressway-parts.js';
// 道路情報板(可変情報板)。NEXCO 3社の標準仕様書(施設機材仕様書集 令和元年7月)の値に基づく型式ごとの再現:
//   LEDは10mmピッチ・1字=縦45×横39ドット(間隔48ドット)・文字は橙・赤・黄緑・緑・白など。名称部は緑地・白文字。点滅灯は黄1灯または赤2灯の交互点滅。
const PITCH=.01;
// 型式: W×H=筐体の外形[m]、cols×rows=LEDのドット数(字数×段数)、plate=名称部の寸法、lamps=点滅灯
const KINDS={
  a:{label:'A/F型(流出部・8字×2段)',W:4.02,H:1.75,cols:384,rows:108,plate:null,lamps:'r2'},
  b:{label:'B型(インター入口・8字×2段)',W:4.02,H:1.95,cols:384,rows:108,plate:[2.2,'名神高速道路'],lamps:'y1'},
  d:{label:'D型(トンネル入口・7字×2段)',W:3.54,H:1.95,cols:336,rows:108,plate:[2.0,'トンネル情報'],lamps:'r2'},
  j:{label:'J型(JCT・8字×2段)',W:4.02,H:1.95,cols:384,rows:108,plate:[2.2,'東名'],lamps:'r2'},
  k:{label:'K型(広域・18字×2段)',W:8.82,H:1.95,cols:864,rows:108,plate:[2.2,'広域情報'],lamps:'y2'},
  c:{label:'C1型(料金所・19字×3段)',W:9.3,H:1.8,cols:912,rows:162,plate:null,lamps:'y2'}};
const O='#ff9a1f',R='#ff3a2a',W='#f2f2f2',G='#33e07a',Y='#ffd23a';
// 表示内容: 行ごとに(文字,色)の並び。書き方は実際の板の写真(NEXCO・阪神・首都高)と同じ: 区間は「最後尾ー先頭」・IC名はICを付けない・JCTは大文字・単位は「km」「分」
const MSG={
  accident:{label:'事故渋滞',lines:[[['秦野中井ー横浜町田',W]],[['事故',R],[' 渋滞13km 40分',O],[' ▲',R]]]},
  works:{label:'工事渋滞',lines:[[['甲賀土山ー亀山西JCT',W]],[['工事',R],['渋滞 2km',O]]]},
  rain:{label:'雨・速度規制',lines:[[['鳥栖JCTー菊水',W]],[['雨50㌔規制',O]]]},
  snow:{label:'雪・チェーン規制',lines:[[['大月ー河口湖',W]],[['チェーン規制',O]]]},
  fog:{label:'霧',lines:[[['新地→岩沼',W]],[['キリ走行注意',O]]]},
  slip:{label:'スリップ注意',lines:[[['全線',G]],[['スリップ注意',O]]]},
  closed:{label:'災害通行止',lines:[[['太宰府ー福岡',W]],[['災害通行止',R]]]},
  safe:{label:'安全運転の呼びかけ',lines:[[['「あおり運転」を起こさない!',W]],[['思いやりと、ゆずり合いの運転を',W]]]}};
const cache={};
/** LEDの点で表す画像(JPEG)。lines=[[ [文字,色],… ],…]。1ドット=2×2画素 */
function ledTex(cols,rows,lines,key){if(cache[key])return cache[key];
  return cache[key]=canvasTex(cols*2,rows*2,(g,Wd,Ht)=>{g.fillStyle='#000';g.fillRect(0,0,Wd,Ht);g.fillStyle='#15181b';
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){g.beginPath();g.arc(x*2+1,y*2+1,.68,0,7);g.fill();}
    const o=document.createElement('canvas');o.width=cols;o.height=rows;const og=o.getContext('2d',{willReadFrequently:true});
    const n=lines.length,lh=rows/n,fs=Math.min(45,lh*.92);og.font=`700 ${fs}px ${FONT}`;
    lines.forEach((segs,i)=>{let tw=0;const ws=segs.map(([t])=>{const w=og.measureText(t).width;tw+=w;return w;});const k=Math.min(1,cols*.97/tw);let x=(cols-tw*k)/2;
      segs.forEach(([t,c],si)=>{og.clearRect(0,0,cols,rows);og.save();og.font=`700 ${fs}px ${FONT}`;og.translate(x,lh*(i+.5)+1);og.scale(k,1);og.textAlign='left';og.textBaseline='middle';og.fillText(t,0,0);og.restore();
        const y0=Math.floor(lh*i),h=Math.ceil(lh),d=og.getImageData(0,y0,cols,h).data;g.fillStyle=c;
        for(let y=0;y<h;y++)for(let xx=0;xx<cols;xx++)if(d[(y*cols+xx)*4+3]>110){g.beginPath();g.arc(xx*2+1,(y0+y)*2+1,.92,0,7);g.fill();}
        x+=ws[si]*k;});});},{jpeg:true});}
/** 図形式(フリーパターン): 注意の三角・矢印・文字。幅に合わせて配置を変える */
function graphTex(cols,rows,key){if(cache[key])return cache[key];
  return cache[key]=canvasTex(cols*2,rows*2,(g,Wd,Ht)=>{g.fillStyle='#000';g.fillRect(0,0,Wd,Ht);g.fillStyle='#15181b';
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){g.beginPath();g.arc(x*2+1,y*2+1,.68,0,7);g.fill();}
    const o=document.createElement('canvas');o.width=cols;o.height=rows;const og=o.getContext('2d',{willReadFrequently:true});
    const paint=(fn,col)=>{og.globalCompositeOperation='source-over';og.clearRect(0,0,cols,rows);fn(og);const dd=og.getImageData(0,0,cols,rows).data;g.fillStyle=col;
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(dd[(y*cols+x)*4+3]>110){g.beginPath();g.arc(x*2+1,y*2+1,.92,0,7);g.fill();}};
    const s=Math.min(rows*.9,cols*.28),fs=Math.min(36,rows*.33),x0=s+cols*.06;
    paint(c=>{c.fillStyle='#fff';c.beginPath();c.moveTo(s*.55,rows*.06);c.lineTo(s*1.05,rows*.06+s*.9);c.lineTo(s*.05,rows*.06+s*.9);c.closePath();c.fill();c.globalCompositeOperation='destination-out';c.fillRect(s*.5,rows*.06+s*.3,s*.1,s*.32);c.fillRect(s*.5,rows*.06+s*.68,s*.1,s*.1);},R);
    paint(c=>{c.fillStyle='#fff';c.font=`700 ${fs}px ${FONT}`;c.textBaseline='middle';c.fillText('渋滞 3km',x0,rows*.25,cols-x0-4);},G);
    paint(c=>{c.fillStyle='#fff';c.font=`700 ${fs}px ${FONT}`;c.textBaseline='middle';c.fillText('所要 15分',x0,rows*.77,cols-x0-4);},W);
    paint(c=>{c.fillStyle='#fff';c.fillRect(x0,rows*.46,(cols-x0)*.8,rows*.08);c.beginPath();c.moveTo(x0+(cols-x0)*.8,rows*.34);c.lineTo(x0+(cols-x0)*.8+rows*.18,rows*.5);c.lineTo(x0+(cols-x0)*.8,rows*.66);c.fill();},Y);});}
const keys=[];for(const k of Object.keys(KINDS)){for(const m of Object.keys(MSG))keys.push(`disp_${m}_${k}`);keys.push(`disp_graphic_${k}`);}
const f1=Object.keys(KINDS).map(k=>`fl1_${k}`),f2=Object.entries(KINDS).filter(([k,v])=>v.lamps[1]==='2').map(([k])=>`fl2_${k}`);
const ST=[{id:'on',label:'表示(点滅灯 交互)',on:keys,flash:f1,flash2:f2},{id:'off',label:'消灯'}];
export default {id:'jp-exp-vms',name:'道路情報板(可変情報板)',
  desc:'渋滞・事故・規制を知らせる電光の情報板。NEXCOの標準仕様書の型式(A/F・B・D・J・K・C1)ごとに、外形・字数・段数・名称部(緑地)・点滅灯(黄1灯または赤2灯の交互点滅)を再現。文字式は実際の書き方(区間は最後尾ー先頭・事故は赤・渋滞は橙・単位はkm・㌔・分)で、事故渋滞・工事渋滞・雨や雪の規制・霧・スリップ・災害通行止・安全運転の呼びかけを選べる。図形式(フリーパターン)も選べる。',
  dims:'LED 10mmピッチ・1字 縦450×横390mm。外形: A/F 4.02×1.75m・B/J 4.02×1.95m・D 3.54×1.95m・K 8.82×1.95m・C1 9.3×1.8m・厚さ0.3m。名称部 2.2×0.4m(D型は2.0m)。板の下端 5.0m(仕様書の値)',
  focus:[0,5.8,0],view:[5,.1,22],night:'on',states:ST,cycle:[{s:'on',d:8},{s:'off',d:3}],
  options:[optChoice('size','型式',Object.entries(KINDS).map(([k,v])=>[k,v.label]),'k'),
    optChoice('type','表示の形式',[['text','文字式(橙・赤・緑・白のLED)'],['graphic','図形式(フリーパターン)']],'text'),
    optChoice('msg','文字式の内容',Object.entries(MSG).map(([k,v])=>[k,v.label]),'accident'),
    optChoice('support','支持の形',[['gantry','門型'],['cantilever','片持ち']],'gantry')],
  build(){const root=new THREE.Group(),L={};const y0=5.0;
    const gt=opt(root,'support','gantry'),ct=opt(root,'support','cantilever');
    for(const x of[-7.2,7.2]){add(gt,new THREE.CylinderGeometry(.22,.24,7.6,28),RM.zinc,x,3.8,0);add(gt,new THREE.CylinderGeometry(.32,.32,.05,28),RM.zincDull,x,.025,0);}
    truss(gt,[-7.2,7.0,0],[7.2,7.0,0],.8,14,.055);
    add(ct,new THREE.CylinderGeometry(.24,.28,7.6,28),RM.zinc,-6.4,3.8,0);add(ct,new THREE.CylinderGeometry(.36,.36,.05,28),RM.zincDull,-6.4,.025,0);truss(ct,[-6.4,7.0,0],[5.4,7.0,0],.8,10,.055);
    for(const [sk,S] of Object.entries(KINDS)){const so=opt(root,'size',sk);const Wd=S.cols*PITCH,Hd=S.rows*PITCH;
      // 筐体(外形は仕様書の値)。表示面は筐体の下側、名称部は上側
      const hy=y0+S.H/2;add(so,roundBox(S.W,S.H,.3,.04,.01),EXM.canopyDark,0,hy,.15);
      const dy=y0+.08+Hd/2+(S.plate?0:(S.H-.16-Hd)/2);
      for(const sx of[-.36,.36])bar(so,[sx*S.W,y0+S.H,.1],[sx*S.W,7.0,.1],.035);
      const ty=opt(so,'type','text');for(const [mk,M] of Object.entries(MSG)){const mo=opt(ty,'msg',mk);
        const p=lightPanel(L,`disp_${mk}_${sk}`,mo,new THREE.PlaneGeometry(Wd,Hd),'white',0,dy,.305,ledTex(S.cols,S.rows,M.lines,`${S.cols}x${S.rows}:${mk}`));p.mat.map=null;p.mat.color.set(0x07090b);}
      const gr=opt(so,'type','graphic');const gp=lightPanel(L,`disp_graphic_${sk}`,gr,new THREE.PlaneGeometry(Wd,Hd),'white',0,dy,.305,graphTex(S.cols,S.rows,`${S.cols}x${S.rows}:graphic`));gp.mat.map=null;gp.mat.color.set(0x07090b);
      // 名称部(緑地・白文字): 筐体の上側
      if(S.plate){const [pw,name]=S.plate;const py=y0+S.H-.28;add(so,new THREE.PlaneGeometry(pw-.06,.34),new THREE.MeshStandardMaterial({map:canvasTex(1024,Math.round(1024*.34/(pw-.06)),(g,w,h)=>{g.fillStyle=EXC.green;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.68}px ${FONT}`;g.fillText(name,w/2,h*.54,w*.92);}),roughness:.4}),-S.W/2+pw/2+.12,py,.307);}
      // 点滅灯(筐体の上): 黄1灯 / 黄2灯 / 赤2灯
      const col=S.lamps[0]==='r'?'red':'yellow',nl=+S.lamps[1];
      for(let i=0;i<nl;i++){const fx=nl===1?S.W/2-.3:(i?S.W/2-.3:-S.W/2+.3);add(so,new THREE.CylinderGeometry(.03,.03,.22,12),RM.zinc,fx,y0+S.H+.11,.15);
        lightPanel(L,`fl${i+1}_${sk}`,so,new THREE.CircleGeometry(.15,28),col,fx,y0+S.H+.36,.17);}
    }
    return {root,lamps:L};}};
