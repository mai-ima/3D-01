// ビューアの動作確認(スモークテスト): npm run smoke  (先に npm run viewer でビルドしておく)
//  一覧の折りたたみ / オプション切替 / 現示 / ライブラリの検索・詳細 / 遮断機の動き
const {launch,openViewer}=require('./lib/open-viewer.cjs');
(async()=>{const b=await launch();let ok=true;const T=(n,c,d='')=>{if(!c)ok=false;console.log(c?'✓':'✗',n,d);};
 // 信号ビューア
 let p=await openViewer(b,{query:'?model=jp-combo-arm-ped&env=day',w:1300,h:820,page:'signals'});await p.waitForTimeout(4500);
 let r=await p.evaluate(async()=>{const s=__api.sig;const out={};
   out.groups=document.querySelectorAll('.grp').length;out.items=document.querySelectorAll('.item').length;
   // 折りたたみ
   const h=document.querySelector('.gh');h.click();out.collapsed=h.parentElement.dataset.open==='0';h.click();out.reopened=h.parentElement.dataset.open==='1';
   // オプション: 押ボタン箱 off/on、灯火方式、本体色
   const vis=n=>{let v=null;s.root.traverse(o=>{if(o.name===n)v=o.visible;});return v;};
   s.setOption('button','off');out.btnOff=vis('opt_button_on');s.setOption('button','on');out.btnOn=vis('opt_button_on');
   s.setOption('lens','bulb');out.bulb=vis('opt_lens_bulb');out.led=vis('opt_lens_led');
   s.setOption('body','green');const m=[];s.root.traverse(o=>{if(o.isMesh)[].concat(o.material).forEach(x=>{if(x.name==='body_main')m.push(x.color.getHexString());});});out.bodyColor=m[0];
   // 状態
   __api.setMode('manual');s.setState('s4');await new Promise(r=>setTimeout(r,600));out.walkLit=s.lamps.p_walk.v>.5;out.redLit=s.lamps.v_red.v>.5;
   return out;});
 T('一覧の折りたたみ',r.groups>=5&&r.collapsed&&r.reopened,`groups=${r.groups}`);
 T('押ボタン箱の付け外し',r.btnOff===false&&r.btnOn===true);
 T('灯火方式の切替(電球式)',r.bulb===true&&r.led===false);
 T('本体色(深緑)',r.bodyColor&&r.bodyColor!=='b7bcbe',r.bodyColor);
 T('現示の点灯(車 赤 / 歩 青)',r.walkLit&&r.redLit);
 await p.context().close();
 // ライブラリ
 p=await openViewer(b,{query:'',w:1300,h:820,page:'all'});await p.waitForTimeout(2500);
 r=await p.evaluate(async()=>{const o={};o.cards=document.querySelectorAll('.card').length;
   document.getElementById('search').value='踏切';document.getElementById('search').dispatchEvent(new Event('input'));o.search=document.querySelectorAll('.card').length;
   document.getElementById('search').value='';document.getElementById('search').dispatchEvent(new Event('input'));
   await __api.openModel('jp-crossing-gate');await new Promise(r=>setTimeout(r,2500));o.detail=document.getElementById('app').dataset.view;
   __api.setMode('manual');__api.sig.setState('closed');await new Promise(r=>setTimeout(r,5500));o.arm=__api.sig.armNode&&+__api.sig.armNode.rotation.z.toFixed(2);
   __api.showView('grid');o.back=document.getElementById('app').dataset.view;return o;});
 T('ライブラリの一覧',r.cards===26,`cards=${r.cards}`);T('検索(踏切)',r.search>=2&&r.search<26,`hits=${r.search}`);
 T('詳細表示→一覧へ戻る',r.detail==='detail'&&r.back==='grid');T('遮断機の降下',r.arm!==null&&Math.abs(r.arm)<.15,`arm=${r.arm}`);
 await b.close();process.exit(ok?0:1);})();
