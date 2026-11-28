// スマホ最適化の調査: iPhone 相当の画面(390×844・タッチ)で全画面・全タブを開き、はみ出し・小さすぎる操作部品・文字の切れ・部品の重なりを検出する
//   node 3d/tools/audit-mobile.cjs [出力先=/tmp/mobile] [幅=390] [高さ=844]
const {launch,openViewer}=require('./lib/open-viewer.cjs');const fs=require('fs');
const CHECK=()=>{const vw=innerWidth,vh=innerHeight,out=[];const vis=e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity>0.05;};
  const sel=e=>{let s=e.tagName.toLowerCase();if(e.id)s+='#'+e.id;else if(e.className&&typeof e.className==='string')s+='.'+e.className.trim().split(/\s+/).slice(0,2).join('.');const t=(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,14);return s+(t?`「${t}」`:'');};
  const scrollParent=e=>{for(let p=e.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowX;if((o==='auto'||o==='scroll')&&p.scrollWidth>p.clientWidth+1)return true;}return false;};
  if(document.documentElement.scrollWidth>vw+1)out.push(['横スクロールが出る',`ページ幅 ${document.documentElement.scrollWidth} > 画面 ${vw}`]);
  const ints=[...document.querySelectorAll('button,a,input,select,label.sw,[role=button],summary')].filter(vis);
  for(const e of ints){const r=e.getBoundingClientRect();
    if(r.right>vw+1||r.left<-1)out.push(['画面の外にはみ出す',sel(e)+` (${Math.round(r.left)}〜${Math.round(r.right)})`]);
    else if(r.bottom>vh+1&&!scrollParent(e)&&getComputedStyle(e).position==='fixed')out.push(['画面の下にはみ出す',sel(e)]);
    if((r.width<40||r.height<40)&&!(e.tagName==='INPUT'&&e.type==='checkbox'))out.push(['タップ部品が小さい(40px未満)',sel(e)+` ${Math.round(r.width)}×${Math.round(r.height)}`]);
    if(e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflow!=='visible'&&e.tagName!=='INPUT')out.push(['文字が切れる',sel(e)+` (${e.scrollWidth}>${e.clientWidth})`]);}
  for(let i=0;i<ints.length;i++)for(let j=i+1;j<ints.length;j++){const a=ints[i],b=ints[j];if(a.contains(b)||b.contains(a))continue;    const clip=(e,R)=>{for(let q=e.parentElement;q;q=q.parentElement){const o=getComputedStyle(q).overflowY,ox=getComputedStyle(q).overflowX;if(o==='auto'||o==='scroll'||ox==='auto'||ox==='scroll'){const Q=q.getBoundingClientRect();return {left:Math.max(R.left,Q.left),right:Math.min(R.right,Q.right),top:Math.max(R.top,Q.top),bottom:Math.min(R.bottom,Q.bottom),width:Math.max(0,Math.min(R.right,Q.right)-Math.max(R.left,Q.left)),height:Math.max(0,Math.min(R.bottom,Q.bottom)-Math.max(R.top,Q.top))};}}return R;};   // スクロールする枠の中の部品は、枠からはみ出した部分(見えない部分)を除いて比べる
    const A=clip(a,a.getBoundingClientRect()),B=clip(b,b.getBoundingClientRect());
    const ix=Math.min(A.right,B.right)-Math.max(A.left,B.left),iy=Math.min(A.bottom,B.bottom)-Math.max(A.top,B.top);if(ix>6&&iy>6&&ix*iy>.25*Math.min(A.width*A.height,B.width*B.height))out.push(['操作部品が重なる',sel(a)+' × '+sel(b)]);}
  for(const e of document.querySelectorAll('body *')){if(!vis(e))continue;if(e.children.length===0&&(e.textContent||'').trim()){const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<11)out.push(['文字が小さい(11px未満)',sel(e)+` ${fs}px`]);}}
  return [...new Map(out.map(o=>[o.join('|'),o])).values()];};
(async()=>{const [dir='/tmp/mobile',W='390',H='844']=process.argv.slice(2);fs.mkdirSync(dir,{recursive:true});const b=await launch();const all=[];
  for(const page of(process.env.PAGES||'all,signals').split(',')){let p;try{p=await openViewer(b,{query:'?env=day',w:+W,h:+H,dpr:1,page});}catch(e){console.log(page,'を開けませんでした:',e.message.slice(0,80));continue;}
    const run=async(name,fn)=>{if(fn)await p.evaluate(fn);await p.waitForTimeout(1500);const r=await p.evaluate(CHECK);await p.screenshot({path:`${dir}/${page}_${name}.png`});for(const x of r){if(name==='category'&&x[0]==='操作部品が重なる')continue;all.push([page+'/'+name,...x]);}console.log(page+'/'+name,r.length,'件');};
    await run('list');
    if(page==='all'){await run('category',()=>{document.getElementById('treeBtn')&&document.getElementById('treeBtn').click();});await run('category_closed',()=>{document.getElementById('treeBtn')&&document.getElementById('treeBtn').click();});
      await run('detail_signal',()=>__api.openModel('jp-veh-h300-arm'));}
    else await run('detail',()=>__api.select&&__api.select('jp-veh-h300-arm',true));
    for(const t of['info','ctl','view'])await run('tab_'+t,`__api.setTab('${t}')`);
    await run('sheet_full',()=>__api.setSheet&&__api.setSheet(__api.snaps()[2]));await run('sheet_min',()=>__api.setSheet&&__api.setSheet(__api.snaps()[0]));
    if(page==='all'){await run('detail_vms',()=>{__api.setSheet&&__api.setSheet(__api.snaps()[1]);__api.openModel('jp-exp-vms');});await run('detail_road',()=>__api.openModel('jp-roadway-expressway'));}}
  await b.close();
  const by={};for(const [s,k,d] of all)(by[k]=by[k]||[]).push(`${s}: ${d}`);
  for(const [k,v] of Object.entries(by)){console.log(`\n■ ${k}(${v.length}件)`);for(const l of v.slice(0,14))console.log('  -',l);}
  fs.writeFileSync(dir+'/report.json',JSON.stringify(all,null,1));console.log(`\nスマホ調査: 指摘 ${all.length} 件(画像は ${dir})`);})();
