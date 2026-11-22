// 全モデル監査: 各モデルを「全体」「灯器アップ」で撮影し、スクリーンショットを出力する
//   node 3d/tools/audit.cjs <outDir> [env=studio] [id ...]
const {launch,openViewer}=require('./lib/open-viewer.cjs');const fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'../..');
(async()=>{const [out,env='studio',...want]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
  const idx=JSON.parse(fs.readFileSync(path.join(ROOT,'3d/models/index.json')));const b=await launch();
  const p=await openViewer(b,{query:`?env=${env}&thumb=1`,w:560,h:680,page:'all'});
  for(const e of idx.models){if(want.length&&!want.includes(e.id))continue;
    for(const v of['all','lamp']){const first=e.cycle?e.cycle[0].s:(e.states&&e.states[0]&&e.states[0].id);
      await p.evaluate(async([id,v,st])=>{await __api.select(id,true);if(st){__api.setMode('manual');__api.sig.setState(st,true);}__api.flyTo(v,true);},[e.id,v,first||null]);
      await p.waitForTimeout(1500);await p.screenshot({path:path.join(out,`${e.id}__${v}.png`)});}
    console.log('audit',e.id);}
  await b.close();})();
