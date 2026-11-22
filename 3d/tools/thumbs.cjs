// サムネイル生成: NODE_PATH=$(npm root -g) node 3d/tools/thumbs.cjs [id ...] → 3d/models/<dir>/thumb.jpg
const {launch,openViewer}=require('./lib/open-viewer.cjs');const fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'../..');
(async()=>{const idx=JSON.parse(fs.readFileSync(path.join(ROOT,'3d/models/index.json')));const want=process.argv.slice(2);const b=await launch();
  for(const e of idx.models){if(want.length&&!want.includes(e.id))continue;const first=e.cycle?e.cycle[0].s:(e.states&&e.states[0]&&e.states[0].id);
    const p=await openViewer(b,{query:`?thumb=1&model=${e.id}&env=studio${first?'&state='+encodeURIComponent(first):''}`,w:216,h:272,dpr:2,page:'all'});
    await p.waitForTimeout(1200);await p.screenshot({path:path.join(ROOT,'3d/models',e.dir,'thumb.jpg'),type:'jpeg',quality:82});await p.context().close();console.log('thumb',e.id);}
  await b.close();})();
