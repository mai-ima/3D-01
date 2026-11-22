// 使い方: NODE_PATH=$(npm root -g) node 3d/tools/export.cjs [id ...]
//   → 3d/models/<カテゴリ>/<サブカテゴリ>/<モデルID>/{model.glb, meta.json} と 3d/models/index.json を生成
const {chromium}=require('playwright');const esbuild=require('esbuild');const fs=require('fs');const path=require('path');const {execSync}=require('child_process');
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
  await p.goto('https://local.test/');await p.waitForFunction('window.__ready',{timeout:60000});
  const all=await p.evaluate('listIds()');const want=process.argv.slice(2);const ids=want.length?all.filter(i=>want.includes(i)):all;
  const idxPath=path.join(OUT,'index.json');let index=fs.existsSync(idxPath)?JSON.parse(fs.readFileSync(idxPath)):{categories:{},models:[]};
  index.categories=JSON.parse(fs.readFileSync(path.join(ROOT,'3d/src/categories.json')));
  for(const id of ids){const r=await p.evaluate(i=>exportOne(i),id);const dir=path.join(OUT,...r.path,id);fs.mkdirSync(dir,{recursive:true});
    const buf=Buffer.from(r.b64,'base64');fs.writeFileSync(path.join(dir,'model.glb'),buf);
    const rel=[...r.path,id].join('/');const entry={...r.meta,dir:rel,file:rel+'/model.glb',thumb:rel+'/thumb.jpg',bytes:buf.length};
    fs.writeFileSync(path.join(dir,'meta.json'),JSON.stringify(entry,null,1));
    index.models=index.models.filter(m=>m.id!==id);index.models.push(entry);
    console.log(rel.padEnd(46),String(r.meta.tris).padStart(7),'tris',((buf.length/1048576).toFixed(1)+'MB').padStart(7),r.meta.size.join('×'));}
  index.models.sort((a,b)=>a.dir.localeCompare(b.dir));fs.writeFileSync(idxPath,JSON.stringify(index,null,1));await b.close();
})();
