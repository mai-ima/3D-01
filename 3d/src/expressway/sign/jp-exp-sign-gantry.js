import {THREE,EXC,RM,add,bar,bolt,roundBox,opt,optChoice,greenFace,canvasTex,FONT,txt,exitNumber,signBoard,truss,arrowPath,PX}from '../../kit/expressway-parts.js';
// 高速道路の案内標識(門型・片持ち)。支持の形と、板の書き方(標識令の種類ごと: 出口の予告2km/1km/500m・出口(行動点)・国道番号つき・ETC専用つき・JCT・方面と車線・SA/PA・料金所・都市高速)を選べる。
// 書き方の根拠: 標識令・国交省通知(白文字・緑地/出口番号は白地に緑字/ETC専用は紫地/国道番号は青地/方面別の部分は青地/ローマ字は和文の1/2の高さ)と、実物写真の見比べ
const W=PX;
/** 緑地の板。draw は (g,w,h) で内容を描く */
const gf=(wm,hm,draw)=>greenFace(wm,hm,draw);
/** 国道番号の盾(青地・白字) */
function shield(g,x,y,s,n){g.save();g.fillStyle='#1a56b0';g.beginPath();g.moveTo(x,y-s*.5);g.lineTo(x+s*.5,y-s*.35);g.lineTo(x+s*.42,y+s*.3);g.lineTo(x,y+s*.55);g.lineTo(x-s*.42,y+s*.3);g.lineTo(x-s*.5,y-s*.35);g.closePath();g.fill();
  g.strokeStyle='#fff';g.lineWidth=3;g.stroke();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=`700 ${s*.42}px ${FONT}`;g.fillText(n,x,y+s*.02,s*.7);g.restore();}
/** 路線番号の白枠(E1 など) */
function routeBox(g,x,y,s,n){g.save();g.strokeStyle='#fff';g.lineWidth=5;g.beginPath();g.roundRect(x,y,s*1.15,s*.8,s*.12);g.stroke();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=`700 ${s*.5}px ${FONT}`;g.fillText(n,x+s*.575,y+s*.42,s);g.restore();}
const exitBox=(g,x,y,n,s=100)=>{g.save();g.fillStyle='#fff';g.fillRect(x,y,s*1.15,s);g.fillStyle=EXC.green;g.textAlign='center';g.textBaseline='middle';g.font=`700 ${s*.72}px ${FONT}`;g.fillText(n,x+s*.575,y+s*.52,s);g.restore();};
const eng=(g,s,x,y,h,o={})=>txt(g,s,x,y,h,{weight:500,...o});
const ARROW_NE=(g,x,y,len,wid)=>arrowPath(g,x,y,len,wid,45);

const BOARDS={
  exit2:{label:'出口の予告 2km',list:()=>[{w:3.6,h:1.7,tex:gf(3.6,1.7,(g,w,h)=>{exitBox(g,50,h*.3,'35',h*.34);txt(g,'岡崎',w*.27,h*.4,h*.4);eng(g,'Okazaki',w*.27,h*.78,h*.17);txt(g,'2km',w*.84,h*.55,h*.34,{align:'center'});})}]},
  exit1:{label:'出口の予告 1km',list:()=>[{w:4.2,h:2.0,tex:gf(4.2,2.0,(g,w,h)=>{exitBox(g,40,h*.12,'35',h*.26);txt(g,'岡崎',w*.17,h*.26,h*.28,{maxW:w*.3});eng(g,'Okazaki',w*.17,h*.52,h*.12,{maxW:w*.3});txt(g,'出口',w*.52,h*.26,h*.2);eng(g,'Exit',w*.52,h*.5,h*.1);txt(g,'1km',w*.96,h*.26,h*.22,{align:'right'});
      txt(g,'豊田・名古屋',40,h*.78,h*.2,{maxW:w*.48});eng(g,'Toyota / Nagoya',w*.52,h*.88,h*.1,{maxW:w*.28});ARROW_NE(g,w*.9,h*.72,h*.34,h*.22);})}]},
  exit500:{label:'出口の予告 500m(国道番号つき)',list:()=>[{w:5.4,h:2.2,tex:gf(5.4,2.2,(g,w,h)=>{shield(g,w*.08,h*.2,h*.22,'1');exitBox(g,w*.15,h*.09,'35',h*.22);txt(g,'岡崎',w*.29,h*.22,h*.2,{maxW:w*.2});eng(g,'Okazaki',w*.29,h*.42,h*.09,{maxW:w*.2});txt(g,'出口 500m',w*.96,h*.22,h*.17,{align:'right'});
      txt(g,'国道1号',40,h*.62,h*.18,{maxW:w*.3});txt(g,'豊橋・名古屋',40,h*.84,h*.17,{maxW:w*.4});eng(g,'Route 1  Toyohashi / Nagoya',w*.5,h*.86,h*.09,{maxW:w*.32});ARROW_NE(g,w*.91,h*.66,h*.38,h*.24);})}]},
  exitEtc:{label:'出口(ETC専用)',list:()=>[{w:4.2,h:.5,tex:canvasTex(Math.round(4.2*W),120,(g,w,h)=>{g.fillStyle=EXC.purple;g.fillRect(0,0,w,h);g.strokeStyle='#fff';g.lineWidth=6;g.strokeRect(8,8,w-16,h-16);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.6}px ${FONT}`;g.fillText('ETC専用',w/2,h*.54);})},
    {w:4.2,h:2.0,tex:gf(4.2,2.0,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(40,h*.12,h*.3,h*.26);g.fillStyle=EXC.purple;g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.2}px ${FONT}`;g.fillText('12',40+h*.15,h*.26);g.fillStyle='#fff';
      txt(g,'スマートIC',w*.17,h*.26,h*.22,{maxW:w*.55});eng(g,'Smart IC',w*.17,h*.5,h*.1);ARROW_NE(g,w*.9,h*.3,h*.34,h*.22);txt(g,'ETC専用',40,h*.78,h*.2,{maxW:w*.4});txt(g,'出口 800m',w*.96,h*.8,h*.18,{align:'right'});})}]},
  action:{label:'出口(行動点・方面別の青)',list:()=>[{w:4.6,h:2.4,tex:gf(4.6,2.4,(g,w,h)=>{exitBox(g,50,h*.1,'35',h*.2);txt(g,'岡崎',w*.2,h*.2,h*.22);eng(g,'Okazaki',w*.2,h*.37,h*.09);ARROW_NE(g,w*.88,h*.3,h*.42,h*.26);txt(g,'出口',w*.6,h*.22,h*.16);
      g.save();g.fillStyle='#1a56b0';g.fillRect(40,h*.52,w-80,h*.38);g.restore();shield(g,w*.1,h*.71,h*.2,'1');txt(g,'豊橋・浜松',w*.2,h*.65,h*.15);eng(g,'Toyohashi / Hamamatsu',w*.2,h*.83,h*.08);txt(g,'国道1号',w*.62,h*.7,h*.16);})}]},
  branch:{label:'方面と車線',list:()=>[{w:5.2,h:2.4,tex:gf(5.2,2.4,(g,w,h)=>{const cols=[['東京','Tokyo','E1'],['横浜','Yokohama','E1'],['名古屋','Nagoya','E1']];cols.forEach(([a,b,r],i)=>{const cx=w*(.18+.32*i);routeBox(g,cx-h*.17,h*.06,h*.2,r);txt(g,a,cx,h*.4,h*.2,{align:'center',maxW:w*.28});eng(g,b,cx,h*.56,h*.09,{align:'center',maxW:w*.28});arrowPath(g,cx,h*.8,h*.32,h*.22,0);});
    g.fillStyle='#fff';g.fillRect(w*.34,h*.1,4,h*.8);g.fillRect(w*.66,h*.1,4,h*.8);})}]},
  jct:{label:'JCT予告(路線番号つき)',list:()=>[{w:4.8,h:2.2,tex:gf(4.8,2.2,(g,w,h)=>{routeBox(g,40,h*.08,h*.26,'E1');txt(g,'東名高速',w*.18,h*.2,h*.19,{maxW:w*.36});eng(g,'Tomei Expwy',w*.18,h*.38,h*.08,{maxW:w*.36});routeBox(g,40,h*.5,h*.26,'E52');txt(g,'新東名高速',w*.18,h*.62,h*.19,{maxW:w*.4});eng(g,'Shin-Tomei Expwy',w*.18,h*.8,h*.08,{maxW:w*.4});
      txt(g,'御殿場JCT',w*.6,h*.22,h*.14,{maxW:w*.22});eng(g,'Gotemba JCT',w*.6,h*.4,h*.08,{maxW:w*.22});txt(g,'1km',w*.6,h*.68,h*.22);g.strokeStyle='#fff';g.lineWidth=18;g.beginPath();g.moveTo(w*.92,h*.92);g.lineTo(w*.92,h*.5);g.lineTo(w*.88,h*.1);g.stroke();g.beginPath();g.moveTo(w*.92,h*.5);g.lineTo(w*.96,h*.12);g.stroke();})}]},
  pa:{label:'SA・PAの予告(施設の記号つき)',list:()=>[{w:4.2,h:2.0,tex:gf(4.2,2.0,(g,w,h)=>{txt(g,'足柄SA',w*.06,h*.26,h*.3);eng(g,'Ashigara SA',w*.06,h*.52,h*.12);txt(g,'1km',w*.78,h*.3,h*.3,{align:'center'});
      g.fillStyle='#fff';const ic=['P','i','燃','食','WC'];ic.forEach((c,i)=>{const x=w*.08+i*w*.18;g.save();g.fillStyle='#fff';g.fillRect(x,h*.62,h*.26,h*.26);g.fillStyle=EXC.green;g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.18}px ${FONT}`;g.fillText(c,x+h*.13,h*.76);g.restore();});})}]},
  exit112:{label:'出口(方面+出口の2段・112型)',list:()=>[{w:4.0,h:2.0,tex:gf(4.0,2.0,(g,w,h)=>{shield(g,w*.09,h*.25,h*.26,'1');txt(g,'岡崎',w*.2,h*.22,h*.26,{maxW:w*.5});eng(g,'Okazaki',w*.2,h*.45,h*.1,{maxW:w*.4});
      g.fillRect(24,h*.52,w-48,4);exitBox(g,40,h*.6,'35',h*.28);arrowPath(g,w*.44,h*.74,h*.34,h*.22,315);txt(g,'出口',w*.55,h*.68,h*.2);eng(g,'EXIT',w*.55,h*.88,h*.1);})}]},
  pa2:{label:'IC・PAの予告(3段・施設記号)',list:()=>[{w:4.4,h:2.6,tex:gf(4.4,2.6,(g,w,h)=>{exitBox(g,40,h*.06,'5',h*.2);txt(g,'甲南',w*.17,h*.16,h*.17,{maxW:w*.25});txt(g,'出口',w*.5,h*.13,h*.12);eng(g,'Konan EXIT',w*.5,h*.27,h*.07,{maxW:w*.4});
      g.fillRect(24,h*.34,w-48,3);[['P',0],['i',1]].forEach(([c,i])=>{g.save();g.fillStyle='#fff';g.fillRect(40+i*h*.2,h*.4,h*.17,h*.17);g.fillStyle=EXC.green;g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.13}px ${FONT}`;g.fillText(c,40+i*h*.2+h*.085,h*.485);g.restore();});
      txt(g,'甲南',w*.3,h*.48,h*.17,{maxW:w*.25});eng(g,'Konan',w*.3,h*.62,h*.07);g.fillRect(24,h*.68,w-48,3);txt(g,'出口・PA',40,h*.82,h*.17);txt(g,'500m',w*.96,h*.82,h*.2,{align:'right'});eng(g,'EXIT',w*.5,h*.9,h*.07);})}]},
  jct2:{label:'JCT予告(2枚並び・中央にJCT名)',list:()=>[{w:6.0,h:2.4,tex:gf(6.0,2.4,(g,w,h)=>{routeBox(g,40,h*.06,h*.22,'E2A');txt(g,'中国道',w*.16,h*.17,h*.16,{maxW:w*.2});eng(g,'CHUGOKU EXP',w*.16,h*.31,h*.06,{maxW:w*.2});txt(g,'津山 舞鶴 大阪',40,h*.58,h*.17,{maxW:w*.38});eng(g,'Tsuyama Maizuru Osaka',40,h*.74,h*.07,{maxW:w*.38});arrowPath(g,w*.42,h*.82,h*.3,h*.2,315);
      g.fillRect(w*.46,0,4,h);g.fillRect(w*.56,0,4,h);g.save();g.fillStyle='#fff';g.fillRect(w*.464,h*.3,w*.096,h*.4);g.fillStyle=EXC.green;g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.1}px ${FONT}`;g.fillText('5-1',w*.512,h*.4);g.font=`700 ${h*.075}px ${FONT}`;g.fillText('神戸',w*.512,h*.53);g.fillText('JCT',w*.512,h*.62);g.restore();
      routeBox(g,w*.6,h*.06,h*.22,'E1A');txt(g,'新名神',w*.69,h*.17,h*.16,{maxW:w*.2});eng(g,'SHIN-MEISHIN EXP',w*.69,h*.31,h*.06,{maxW:w*.26});txt(g,'高槻 京都',w*.6,h*.58,h*.17,{maxW:w*.32});eng(g,'Takatsuki Kyoto',w*.6,h*.74,h*.07,{maxW:w*.32});arrowPath(g,w*.93,h*.78,h*.32,h*.2,0);})}]},
  toll2:{label:'料金所予告(白い見出し+2分割)',list:()=>[{w:4.8,h:2.4,tex:gf(4.8,2.4,(g,w,h)=>{g.save();g.fillStyle='#fff';g.fillRect(24,24,w-48,h*.26);g.fillStyle=EXC.green;g.textAlign='left';g.textBaseline='middle';g.font=`700 ${h*.15}px ${FONT}`;g.fillText('本線料金所 1.2 km',50,h*.15);g.font=`500 ${h*.08}px ${FONT}`;g.textAlign='right';g.fillText('TOLL GATE',w-50,h*.16);g.restore();
      g.fillRect(w/2-2,h*.3,4,h*.66);routeBox(g,40,h*.36,h*.2,'E24');txt(g,'京奈和道方面',w*.14,h*.46,h*.14,{maxW:w*.3});eng(g,'For KEINAWA EXP',40,h*.66,h*.07,{maxW:w*.4});g.save();g.fillStyle='#f2c500';arrowPath(g,w*.25,h*.84,h*.26,h*.18,0);g.restore();
      routeBox(g,w*.54,h*.36,h*.2,'E89');txt(g,'第二京阪',w*.67,h*.46,h*.14,{maxW:w*.25});eng(g,'DAINI-KEIHAN EXP',w*.54,h*.66,h*.07,{maxW:w*.4});arrowPath(g,w*.67,h*.84,h*.26,h*.18,0);arrowPath(g,w*.8,h*.84,h*.26,h*.18,0);})}]},
  choice:{label:'ルート選択案内(所要時間つき)',list:()=>[{w:4.6,h:2.5,tex:gf(4.6,2.5,(g,w,h)=>{txt(g,'四日市JCTまで',40,h*.1,h*.12,{maxW:w*.5});eng(g,'Yokkaichi',w*.55,h*.1,h*.07);
      for(const [i,[r,ja,en,m,dir]] of[['E1A','新名神ルート','SHIN-MEISHIN EXP ROUTE','25分',0],['E23','東名阪ルート','HIGASHI-MEIHAN EXP ROUTE','30分',315]].entries()){const y=h*(.22+i*.38);
        g.save();g.fillStyle='#fff';g.beginPath();g.roundRect(40,y,h*.3,h*.2,10);g.fill();g.fillStyle=EXC.green;g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.13}px ${FONT}`;g.fillText(r,40+h*.15,y+h*.105,h*.27);g.restore();
        txt(g,ja,w*.22,y+h*.07,h*.13,{maxW:w*.32});eng(g,en,w*.22,y+h*.165,h*.06,{maxW:w*.36});arrowPath(g,w*.62,y+h*.1,h*.2,h*.15,dir);
        g.save();g.fillStyle='#000';g.fillRect(w*.7,y-4,w*.25,h*.24);g.fillStyle='#ffb21c';g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.15}px ${FONT}`;g.fillText(m,w*.825,y+h*.11,w*.22);g.restore();}})}]},
  shutoNew:{label:'都市高速の入口(白い見出し+入口番号)',list:()=>[{w:4.0,h:2.6,tex:gf(4.0,2.6,(g,w,h)=>{g.save();g.fillStyle='#fff';g.fillRect(24,24,w-48,h*.26);g.strokeStyle=EXC.green;g.lineWidth=6;g.beginPath();g.moveTo(w*.09,h*.05);g.lineTo(w*.15,h*.05);g.lineTo(w*.15,h*.2);g.lineTo(w*.12,h*.25);g.lineTo(w*.09,h*.2);g.closePath();g.stroke();
      g.fillStyle=EXC.green;g.textAlign='center';g.textBaseline='middle';g.font=`700 ${h*.1}px ${FONT}`;g.fillText('4',w*.12,h*.14);g.textAlign='left';g.font=`700 ${h*.13}px ${FONT}`;g.fillText('首都高',w*.2,h*.12);g.font=`500 ${h*.065}px ${FONT}`;g.fillText('SHUTOKO EXPWY',w*.2,h*.22);g.restore();
      g.save();g.fillStyle='#fff';g.fillRect(40,h*.4,w*.34,h*.17);g.fillStyle=EXC.green;g.textAlign='left';g.textBaseline='middle';g.font=`700 ${h*.1}px ${FONT}`;g.fillText('入口 402',55,h*.485);g.restore();txt(g,'外苑',w*.42,h*.46,h*.2);eng(g,'Gaien',w*.42,h*.64,h*.08);arrowPath(g,w*.9,h*.52,h*.3,h*.2,90);
      txt(g,'中央道方面',40,h*.84,h*.16,{maxW:w*.5});eng(g,'Chuo',w*.6,h*.86,h*.08);})}]},
  hanshin:{label:'阪神高速の出口(路線-ランプ番号)',list:()=>[{w:3.8,h:2.2,tex:gf(3.8,2.2,(g,w,h)=>{txt(g,'梅田',40,h*.26,h*.3);eng(g,'Umeda',40,h*.52,h*.11);txt(g,'出口 600m',w*.96,h*.26,h*.16,{align:'right'});
      g.save();g.strokeStyle='#fff';g.lineWidth=5;g.strokeRect(40,h*.64,w*.34,h*.24);g.fillStyle='#fff';g.textAlign='left';g.textBaseline='middle';g.font=`700 ${h*.1}px ${FONT}`;g.fillText('EXIT',52,h*.72);g.font=`700 ${h*.12}px ${FONT}`;g.fillText('11-03',52,h*.83);g.restore();arrowPath(g,w*.62,h*.76,h*.36,h*.24,315);})}]},
  nagoya:{label:'名古屋高速の出口(R番号+青い目的地板)',list:()=>[{w:3.8,h:2.5,tex:gf(3.8,2.5,(g,w,h)=>{exitBox(g,40,h*.08,'R07',h*.2);txt(g,'丸の内',w*.3,h*.2,h*.24,{maxW:w*.4});eng(g,'Marunouchi',w*.3,h*.38,h*.09,{maxW:w*.35});txt(g,'出口',w*.7,h*.16,h*.14);eng(g,'EXIT',w*.7,h*.3,h*.08);arrowPath(g,w*.9,h*.28,h*.34,h*.22,45);
      g.save();g.fillStyle='#1a56b0';g.fillRect(40,h*.52,w-80,h*.38);g.restore();shield(g,w*.1,h*.71,h*.2,'19');txt(g,'名古屋駅',w*.2,h*.66,h*.16,{maxW:w*.4});txt(g,'方面',w*.7,h*.66,h*.12);eng(g,'Nagoya Sta.',w*.2,h*.82,h*.08);})}]},
  toll:{label:'料金所予告',list:()=>[{w:4.2,h:2.0,tex:gf(4.2,2.0,(g,w,h)=>{txt(g,'料金所',60,h*.34,h*.3);eng(g,'Toll Gate',60,h*.7,h*.14);txt(g,'1km',w*.52,h*.5,h*.26);g.fillStyle=EXC.purple;g.fillRect(w*.74,h*.2,w*.2,h*.5);g.fillStyle='#fff';txt(g,'ETC',w*.84,h*.45,h*.2,{align:'center'});})}]},
  shuto:{label:'都市高速の出口(3桁の番号)',list:()=>[{w:3.8,h:2.5,tex:gf(3.8,2.5,(g,w,h)=>{exitBox(g,50,h*.1,'607',h*.2);txt(g,'向島',w*.3,h*.2,h*.22);eng(g,'Mukojima',w*.3,h*.38,h*.09);txt(g,'出口',w*.6,h*.2,h*.14);eng(g,'Exit',w*.6,h*.36,h*.08);ARROW_NE(g,w*.88,h*.25,h*.36,h*.22);
      g.save();g.fillStyle='#1a56b0';g.fillRect(40,h*.52,w-80,h*.38);g.restore();txt(g,'墨堤通り',w*.1,h*.64,h*.14);txt(g,'白髭橋',w*.1,h*.82,h*.14);eng(g,'Bokutei-dori / Shirahige Br.',w*.45,h*.76,h*.075,{maxW:w*.5});})}]}
};
const keys=Object.keys(BOARDS);
export default {id:'jp-exp-sign-gantry',name:'案内標識(門型・片持ち)',
  desc:'高速道路の大きな案内標識。支持の形(門型・片持ち)と、板の書き方を選べる。出口の予告(2km・1km・500m)、出口(行動点)、ETC専用つき、国道番号つき(青い盾)、方面と車線、JCT予告(路線番号つき)、SA・PAの予告、料金所予告、都市高速の出口。標識板の下端は路面から約5.0m。',
  dims:'板の下端 5.0m・門型の柱間 約13m・片持ちの腕 約7m・板 約3.6〜5.2×1.7〜2.5m・文字高 和文30cmの系列・ローマ字は1/2(標識令の値。板の寸法は地名の字数で決まる)',focus:[0,5.8,0],view:[5,.12,21],
  options:[optChoice('support','支持の形',[['gantry','門型(オーバーヘッド)'],['cantilever','片持ち(オーバーハング)']],'gantry'),
    optChoice('board','板の書き方',keys.map(k=>[k,BOARDS[k].label]),'exit1')],
  build(){const root=new THREE.Group();const H=5.0;
    const gt=opt(root,'support','gantry'),ct=opt(root,'support','cantilever');
    for(const x of[-6.5,6.5]){add(gt,new THREE.CylinderGeometry(.2,.216,7.6,28),RM.zinc,x,3.8,0);add(gt,new THREE.CylinderGeometry(.3,.3,.05,28),RM.zincDull,x,.025,0);}
    truss(gt,[-6.5,6.95,0],[6.5,6.95,0],.7,13,.05);
    add(ct,new THREE.CylinderGeometry(.22,.26,7.6,28),RM.zinc,-5.2,3.8,0);add(ct,new THREE.CylinderGeometry(.34,.34,.05,28),RM.zincDull,-5.2,.025,0);truss(ct,[-5.2,6.95,0],[2.6,6.95,0],.7,8,.05);
    for(const k of keys){const o=opt(root,'board',k);let y=H;const items=BOARDS[k].list();let maxw=0;
      // 先頭が追加の小さな板(ETC専用など)のときは、その下に主板を置く: 主板=最後の要素
      const main=items[items.length-1];signBoard(o,main.w,main.h,main.tex,0,y+main.h/2,.18);for(const yy of[y+.3,y+main.h-.3])bar(o,[-main.w/2-.1,yy,.1],[main.w/2+.1,yy,.1],.025);maxw=main.w;let top=y+main.h;
      for(const ex of items.slice(0,-1)){signBoard(o,ex.w,ex.h,ex.tex,0,top+ex.h/2+.02,.18);top+=ex.h+.02;}
      for(const xx of[-maxw*.33,maxw*.33])bar(o,[xx,top+.02,.1],[xx,6.95,.1],.03);}
    return {root,lamps:{}};}};
