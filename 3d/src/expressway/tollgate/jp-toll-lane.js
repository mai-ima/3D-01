import {THREE,RM,EXM,EXC,add,bolt,roundBox,lightPanel,opt,optChoice,optToggle,prism,laneBoardTex,speedTex,nameTex,blueZoneTex,canvasTex,redWhite,deg}from '../../kit/expressway-parts.js';
// 料金所の1レーン(NEXCOなど): キャノピー・レーン種別表示板・通行信号・開閉バー・ブース島・島端
// 差分(オプション): キャノピーの型(門型/アーチ型)・表示板の種別・島端の型・速度表示・ETCアンテナ・地名板・路面の青い標示
const ALL=['b_etc','b_etcPlain','b_mix','b_gen','spd'];
const ST=[{id:'go_p',label:'ETC 通行可(紫)',on:[...ALL,'sig_p'],arm:1.45},{id:'go_g',label:'一般 通行可(緑)',on:[...ALL,'sig_g'],arm:1.45},
  {id:'stop',label:'閉鎖(赤)',on:[...ALL,'sig_r'],arm:0},{id:'off',label:'消灯(休止)',arm:0}];
export default {id:'jp-toll-lane',name:'料金所レーン(ETC・一般)',
  desc:'高速道路の料金所の1レーン。屋根(キャノピー)・レーン種別表示板・通行信号・開閉バー・ブース島を備える。屋根の型(門型/アーチ型)、表示板(ETC専用・ETC・ETC/一般・一般)、島端(クッション・曲面・ドラム)、速度表示などを選べる。',
  dims:'レーン幅 3.2m(島の内側)・島の長さ 6m・屋根の下端 約4.0m・開閉バー長 約3.1m(代表値。実物は料金所ごとに異なる)',
  focus:[0,2.4,1],view:[4.2,.2,10.5],night:'go_p',states:ST,cycle:[{s:'go_p',d:5},{s:'stop',d:3},{s:'go_g',d:5},{s:'stop',d:3}],anim:{node:'toll_bar',axis:'z'},
  options:[
    optChoice('canopy','屋根の型',[['flat','門型(平屋根)'],['arch','アーチ型(白い脚)']],'flat'),
    optChoice('lane','表示板の種別',[['etc','ETC専用'],['etcPlain','ETC(英字のみ)'],['mix','ETC・一般'],['gen','一般']],'etc'),
    optChoice('head','島端の型',[['cushion','クッション(赤白)'],['fiber','曲面(クリーム色)'],['drum','クッションドラム']],'cushion'),
    optChoice('antenna','ETCアンテナ',[['canopy','屋根下'],['island','島の支柱'],['off','なし']],'canopy'),
    optToggle('speed','速度表示(20km/h以下)','on'),optToggle('name','地名板','on'),optToggle('blue','路面の青い標示','on')],
  build(){const root=new THREE.Group(),L={};const hw=1.6;
    const conc=new THREE.MeshStandardMaterial({color:0xb8b6ae,roughness:.9});
    /* 路面(料金所はコンクリート舗装) */
    /* ブース島(左右) */
    for(const sx of[-1,1]){const x=sx*(hw+.5);add(root,new THREE.BoxGeometry(1,.22,6),conc,x,.11,0);
      add(root,new THREE.BoxGeometry(1.06,.04,6.06),EXM.cream,x,.23,0);}
    /* 左の島: ブース(機器箱)と開閉バーの支持部 */
    const bx=-(hw+.5);add(root,roundBox(.62,1.3,1.1,.05,.01),EXM.cabinet,bx,.22+.65,-.4);
    add(root,new THREE.BoxGeometry(.5,.34,.02),EXM.glass,bx+.0,1.2,-.4+.56).rotation.y=0;
    add(root,new THREE.BoxGeometry(.2,.2,.2),EXM.canopyDark,bx+.36,1.35,-.2);
    /* 開閉バー: 赤白の縞。屈折はしない直線棒 */
    const bar=new THREE.Group();bar.name='toll_bar';bar.position.set(-hw+.02,1.35,-.2);root.add(bar);
    for(let i=0;i<12;i++){const s=add(bar,new THREE.CylinderGeometry(.03,.03,.26,20),redWhite(i),.13+i*.26,0,0);s.rotation.z=Math.PI/2;}
    add(bar,roundBox(.16,.12,.12,.02,.004),EXM.canopyDark,-.04,0,0);
    /* 島端の型 */
    for(const sx of[-1,1]){const x=sx*(hw+.5);
      const head=opt(root,'head','cushion');for(let i=0;i<6;i++){const z0=3+i*.22,z1=z0+.22,h0=.95-i*.15,h1=.95-(i+1)*.15;
        add(head,prism([[z0,.22],[z1,.22],[z1,.22+Math.max(.1,h1)],[z0,.22+h0]],.9),redWhite(i),x,0,0);}
      const fib=opt(root,'head','fiber');const sh=[[3,.22],[3,1.25],[3.35,1.2],[3.8,.7],[4.3,.35],[4.7,.22]];
      add(fib,prism(sh,.9),EXM.creamWhite,x,0,0);add(fib,prism([[3.05,.95],[3.07,1.0],[3.32,.95],[3.3,.9]],.92),RM.red,x,0,0);
      const dr=opt(root,'head','drum');for(let k=0;k<3;k++){const z=3.5+k*.55;const d=add(dr,new THREE.CylinderGeometry(.27,.27,.8,28),RM.yellow,x+(k%2?.15:-.15)*0,.22+.4,z);
        add(dr,new THREE.CylinderGeometry(.272,.272,.12,28),RM.black,x,.22+.55,z);add(dr,new THREE.CylinderGeometry(.272,.272,.12,28),RM.black,x,.22+.25,z);}}
    /* 屋根: レーン上空。表示板と信号はどちらの型でも同じ位置 */
    const fl=opt(root,'canopy','flat');
    for(const sx of[-1,1])add(fl,roundBox(.42,4.3,.5,.03,.01),EXM.pillar,sx*2.75,2.15,0);
    add(fl,roundBox(6.2,1.0,1.5,.05,.012),EXM.canopy,0,4.5,0);add(fl,new THREE.BoxGeometry(6.4,.1,1.7),EXM.canopyDark,0,4.0,0);
    add(fl,new THREE.BoxGeometry(6.4,.08,1.7),EXM.canopyDark,0,5.03,0);
    const ar=opt(root,'canopy','arch');
    for(const sx of[-1,1]){const x=sx*1.95;add(ar,new THREE.CylinderGeometry(.17,.19,3.55,28),EXM.creamWhite,x,3.55/2,0);
      const t=add(ar,new THREE.TorusGeometry(.8,.17,18,24,Math.PI/2),EXM.creamWhite,x-sx*.8,3.55,0);t.rotation.z=sx<0?Math.PI/2:0;}
    add(ar,roundBox(3.7,1.0,1.5,.06,.012),EXM.canopyDark,0,4.5,0);
    /* 表示板(レーン種別)。背面から光る */
    const bd=new THREE.BoxGeometry(1.72,.64,.1);
    for(const k of['etc','etcPlain','mix','gen']){const o=opt(root,'lane',k);add(o,roundBox(1.82,.74,.12,.03,.008),EXM.canopyDark,0,4.5,.74);
      const p=lightPanel(L,'b_'+k,o,new THREE.PlaneGeometry(1.7,.62),'white',0,4.5,.808,laneBoardTex(k));}
    /* 通行信号(紫・緑・赤の3灯) */
    const sg=add(root,roundBox(1.0,.4,.2,.04,.008),EXM.canopyDark,0,3.55,.74);
    const lampG=new THREE.CircleGeometry(.14,32);
    lightPanel(L,'sig_p',root,lampG,'purple',-.32,3.55,.85);lightPanel(L,'sig_g',root,lampG,'green',0,3.55,.85);lightPanel(L,'sig_r',root,lampG,'red',.32,3.55,.85);
    /* ETCアンテナ */
    const ac=opt(root,'antenna','canopy');const an=add(ac,roundBox(.55,.12,.55,.03,.008),EXM.cabinet,0,3.9,-.2);an.rotation.x=deg(12);add(ac,new THREE.CylinderGeometry(.03,.03,.1,12),EXM.canopyDark,0,3.98,-.2);
    const ai=opt(root,'antenna','island');const rx=hw+.5;add(ai,new THREE.CylinderGeometry(.045,.045,2.6,16),EXM.cabinet,rx,1.5,1.2);const a2=add(ai,roundBox(.5,.12,.5,.03,.008),EXM.cabinet,rx-.3,2.85,1.2);a2.rotation.z=deg(20);
    /* 速度表示(赤LED) */
    const sp=opt(root,'speed','on');const sx=hw+.5;add(sp,new THREE.CylinderGeometry(.04,.04,1.6,12),EXM.cabinet,sx,.22+.8,1.8);
    add(sp,roundBox(.58,1.12,.22,.03,.008),EXM.canopyDark,sx,2.3,1.8);lightPanel(L,'spd',sp,new THREE.PlaneGeometry(.5,1.0),'red',sx,2.3,1.92,speedTex());
    /* 地名板 */
    const nm=opt(root,'name','on');add(nm,roundBox(5.6,.8,.1,.02,.006),EXM.canopyDark,0,5.5,.72);
    add(nm,new THREE.PlaneGeometry(5.5,.72),new THREE.MeshStandardMaterial({map:nameTex('浜松いなさ北','Hamamatsu-Inasa-kita',1536,196),roughness:.4}),0,5.5,.775);
    /* 路面の青い標示 */
    const bl=opt(root,'blue','on');const bp=add(bl,new THREE.PlaneGeometry(3.1,5),new THREE.MeshStandardMaterial({map:blueZoneTex(),roughness:.8}),0,.004,6);bp.rotation.x=-Math.PI/2;
    return {root,lamps:L};}};
