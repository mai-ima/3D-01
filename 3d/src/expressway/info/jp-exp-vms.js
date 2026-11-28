import {THREE,EXC,RM,EXM,add,bar,roundBox,lightPanel,opt,optChoice,canvasTex,FONT,truss}from '../../kit/expressway-parts.js';
// 道路情報板(可変情報板): 文字式(橙のLED)と図形式(フルカラー)。門型や片持ちの支柱に付く
const dots=(g,w,h,s=5)=>{g.save();g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=1.6;for(let x=0;x<w;x+=s){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(let y=0;y<h;y+=s){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}g.restore();};
const textTex=()=>canvasTex(1024,320,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#ffa430';g.textAlign='center';g.textBaseline='middle';g.font=`700 120px ${FONT}`;g.fillText('事故渋滞 先頭5km',w/2,90,w*.92);g.fillText('次のIC 迂回して下さい',w/2,230,w*.92);dots(g,w,h);});
const graphTex=()=>canvasTex(1024,320,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);
  g.fillStyle='#ff3b2f';g.beginPath();g.moveTo(130,40);g.lineTo(230,220);g.lineTo(30,220);g.closePath();g.fill();g.fillStyle='#000';g.fillRect(122,95,16,70);g.fillRect(122,180,16,16);
  g.strokeStyle='#ffd23a';g.lineWidth=18;g.beginPath();g.moveTo(300,160);g.lineTo(980,160);g.stroke();g.fillStyle='#ffd23a';g.beginPath();g.moveTo(980,100);g.lineTo(1020,160);g.lineTo(980,220);g.closePath();g.fill();
  g.fillStyle='#2dd36b';g.textAlign='left';g.textBaseline='middle';g.font=`700 70px ${FONT}`;g.fillText('渋滞 3km',330,60);g.fillStyle='#fff';g.fillText('所要 15分',330,260);dots(g,w,h);});
const ST=[{id:'on',label:'表示',on:['disp_t','disp_g']},{id:'off',label:'消灯'}];
export default {id:'jp-exp-vms',name:'道路情報板(可変情報板)',
  desc:'渋滞や事故・規制を知らせる電光の情報板。文字式(橙のLEDで2段)と図形式(フルカラーの図記号と文字)を選べる。支柱は門型と片持ち。',
  dims:'板 約4.5×1.4m・下端 5.0m・門型の柱間 約13m(代表値。実物は設置場所の型(A〜K型)で寸法が違う)',focus:[0,5.6,0],view:[4,.1,21],night:'on',states:ST,cycle:[{s:'on',d:8},{s:'off',d:3}],
  options:[optChoice('type','表示の形式',[['text','文字式(橙のLED)'],['graphic','図形式(フルカラー)']],'text'),optChoice('support','支持の形',[['gantry','門型'],['cantilever','片持ち']],'gantry')],
  build(){const root=new THREE.Group(),L={};const W=4.5,H=1.4,y0=5.0;
    const gt=opt(root,'support','gantry'),ct=opt(root,'support','cantilever');
    for(const x of[-6.5,6.5]){add(gt,new THREE.CylinderGeometry(.2,.216,7.0,28),RM.zinc,x,3.5,0);add(gt,new THREE.CylinderGeometry(.3,.3,.05,28),RM.zincDull,x,.025,0);}
    truss(gt,[-6.5,6.5,0],[6.5,6.5,0],.7,13,.05);
    add(ct,new THREE.CylinderGeometry(.22,.26,7.0,28),RM.zinc,-5.2,3.5,0);add(ct,new THREE.CylinderGeometry(.34,.34,.05,28),RM.zincDull,-5.2,.025,0);truss(ct,[-5.2,6.5,0],[2.6,6.5,0],.7,8,.05);
    const boardX=-1.2;
    for(const k of['text','graphic']){const o=opt(root,'type',k);add(o,roundBox(W+.2,H+.2,.3,.04,.01),EXM.canopyDark,boardX,y0+H/2+.0,.15);
      lightPanel(L,k==='text'?'disp_t':'disp_g',o,new THREE.PlaneGeometry(W,H),'white',boardX,y0+H/2,.31,k==='text'?textTex():graphTex());
      for(const sx of[-1,1])bar(o,[boardX+sx*1.4,y0+H+.1,.1],[boardX+sx*1.4,6.5,.1],.03);
      add(o,new THREE.BoxGeometry(W+.3,.05,.34),RM.zincDull,boardX,y0+H+.12,.15);}
    return {root,lamps:L};}};
