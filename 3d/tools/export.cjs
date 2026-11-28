// 使い方: node 3d/tools/export.cjs [id ...]
//   → 3d/models/<カテゴリ>/<サブカテゴリ>/<モデルID>/{model.glb, meta.json} と 3d/models/index.json を生成
const {chromium}=require('./lib/playwright.cjs');const esbuild=require('esbuild');const fs=require('fs');const path=require('path');const {execSync}=require('child_process');
const ROOT=path.resolve(__dirname,'../..'),NM=path.join(ROOT,'node_modules/three/'),OUT=path.join(ROOT,'3d/models');
(async()=>{
  execSync('node '+path.join(__dirname,'gen-registry.cjs'),{stdio:'inherit'});
  const res=await esbuild.build({entryPoints:[path.join(__dirname,'export-entry.js')],bundle:true,format:'esm',write:false,external:['three','three/addons/*']});
  const html=`<!doctype html><script type="importmap">{"imports":{"three":"https://unpkg.com/three@0.170.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.170.0/examples/jsm/"}}</script><script type="module" src="https://local.test/b.js"></script><body>`;
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
  p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load/.test(m.text()))console.log('C:',m.text().slice(0,300))});
  await p.route('https://unpkg.com/three@0.170.0/**',r=>r.fulfill({path:NM+r.request().url().replace('https://unpkg.com/three@0.170.0/',''),contentType:'text/javascript'}));
  await p.route('https://local.test/b.js',r=>r.fulfill({body:res.outputFiles[0].text,contentType:'text/javascript'}));
  await p.route('https://local.test/',r=>r.fulfill({body:html,contentType:'text/html'}));
  // 文字の干渉の検出: 画像を作る fillText の外接枠を記録し、同じ画像の中で重なっているものを書き出し時に報告する(矢印や図形との重なりは目視)
  await p.addInitScript(()=>{const F=CanvasRenderingContext2D.prototype.fillText;window.__tb=new Map();
    CanvasRenderingContext2D.prototype.fillText=function(t,x,y,mw){try{const m=this.measureText(t);let w=m.width;if(mw&&w>mw)w=mw;const px=parseFloat((this.font.match(/(\d+(?:\.\d+)?)px/)||[0,12])[1]);const asc=m.actualBoundingBoxAscent||px*.8,dsc=m.actualBoundingBoxDescent||px*.2;
      const al=this.textAlign;let x0=al==='center'?x-w/2:(al==='right'||al==='end')?x-w:x;const y0=this.textBaseline==='middle'?y-(asc+dsc)/2:y-asc;let a=window.__tb.get(this.canvas);if(!a){a=[];window.__tb.set(this.canvas,a);}a.push({t,x:x0,y:y0,w,h:asc+dsc});}catch(e){}return F.call(this,t,x,y,mw);};});
  await p.goto('https://local.test/');await p.waitForFunction('window.__ready',{timeout:60000});
  const all=await p.evaluate('listIds()');const want=process.argv.slice(2);const ids=want.length?all.filter(i=>want.includes(i)):all;
  const idxPath=path.join(OUT,'index.json');let index=fs.existsSync(idxPath)?JSON.parse(fs.readFileSync(idxPath)):{categories:{},models:[]};
  index.categories=JSON.parse(fs.readFileSync(path.join(ROOT,'3d/src/categories.json')));
  for(const id of ids){await p.evaluate('window.__tb=new Map()');const r=await p.evaluate(i=>exportOne(i),id);
    const ov=await p.evaluate(()=>{const out=[];for(const [c,a] of window.__tb){for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const A=a[i],B=a[j];const ix=Math.min(A.x+A.w,B.x+B.w)-Math.max(A.x,B.x),iy=Math.min(A.y+A.h,B.y+B.h)-Math.max(A.y,B.y);
      if(ix>2&&iy>2){const ar=ix*iy,sm=Math.min(A.w*A.h,B.w*B.h);if(sm>0&&ar/sm>.2)out.push(`「${A.t}」と「${B.t}」(${Math.round(ar/sm*100)}%)`);}}}return out;});
    if(r.floorArea>.002&&!/^(roadway|track)$/.test(r.path[0]))console.log(`  △ 地面と同じ高さで上を向いた面 ${r.floorArea.toFixed(3)}㎡(ビューアの地面と重なって乱れる。底を少し下げるか、わずかに浮かす)`);
    if(ov.length){console.log('  △ 文字の重なり:',[...new Set(ov)].slice(0,8).join(' / '));}const dir=path.join(OUT,...r.path,id);fs.mkdirSync(dir,{recursive:true});
    const buf=Buffer.from(r.b64,'base64');fs.writeFileSync(path.join(dir,'model.glb'),buf);
    const rel=[...r.path,id].join('/');const entry={...r.meta,dir:rel,file:rel+'/model.glb',thumb:rel+'/thumb.jpg',bytes:buf.length};
    fs.writeFileSync(path.join(dir,'meta.json'),JSON.stringify(entry,null,1));
    index.models=index.models.filter(m=>m.id!==id);index.models.push(entry);
    console.log(rel.padEnd(46),String(r.meta.tris).padStart(7),'tris',((buf.length/1048576).toFixed(1)+'MB').padStart(7),r.meta.size.join('×'));}
  index.models.sort((a,b)=>a.dir.localeCompare(b.dir));fs.writeFileSync(idxPath,JSON.stringify(index,null,1));await b.close();
})();
