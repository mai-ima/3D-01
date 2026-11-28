// Playwright でビューアを開く(unpkg の three はローカル node_modules に差し替え)
const {chromium}=require('./playwright.cjs');const fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'../../..'),NM=path.join(ROOT,'node_modules/three/');
async function launch(){return chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});}
async function openViewer(browser,{query='',w=1400,h=860,dpr=1,page:pg='signals'}={}){
  const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr});const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load|GL Driver|ERR_FAILED/.test(m.text()))console.log('C:',m.text().slice(0,300));});
  await p.route('https://unpkg.com/three@0.170.0/**',r=>r.fulfill({path:NM+r.request().url().replace('https://unpkg.com/three@0.170.0/',''),contentType:'text/javascript'}));
  for(const [pkg,ver,dir] of[['n8ao','2.1.0','n8ao'],['postprocessing','6.39.6','postprocessing']])   // 外部ライブラリ(公開版は unpkg から読む)をローカルの node_modules に差し替え
    await p.route(`https://unpkg.com/${pkg}@${ver}/**`,r=>r.fulfill({path:path.join(ROOT,'node_modules',dir,r.request().url().replace(`https://unpkg.com/${pkg}@${ver}/`,'')),contentType:'text/javascript'}));
  await p.route('https://fonts.googleapis.com/**',r=>r.abort());
  await p.route('https://local.test/**',r=>{const u=new URL(r.request().url());let f=u.pathname.endsWith('.html')?path.join(ROOT,process.env.VIEWER_DIST||'dist',u.pathname.slice(1)):u.pathname.startsWith('/models/')?path.join(ROOT,'3d',decodeURIComponent(u.pathname)):path.join(ROOT,decodeURIComponent(u.pathname));
    if(u.pathname.startsWith('/assets/')){f=path.join(ROOT,'3d',decodeURIComponent(u.pathname));if(!fs.existsSync(f))f=path.join(ROOT,'3d/dist/pub',decodeURIComponent(u.pathname));}
    if(!fs.existsSync(f)&&u.pathname.startsWith('/models/'))f=path.join(ROOT,'3d/dist/pub',decodeURIComponent(u.pathname));
    if(fs.existsSync(f)&&fs.statSync(f).isFile())r.fulfill({path:f,contentType:f.endsWith('.html')?'text/html; charset=utf-8':undefined});else r.fulfill({status:404,body:''});});
  await p.goto('https://local.test/'+pg+'.html'+query);await p.waitForFunction('window.__ready',{timeout:180000});return p;}
module.exports={launch,openViewer};
