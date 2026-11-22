// 目視確認: node 3d/tools/shot.cjs <prefix> '<[[name,"js",waitMs],...]>' [query] [w] [h] [page]
const {launch,openViewer}=require('./lib/open-viewer.cjs');
(async()=>{const [prefix,steps,query,w,h,page]=process.argv.slice(2);const b=await launch();const p=await openViewer(b,{query:query||'',w:+(w||1400),h:+(h||860),page:page||'signals'});
  for(const [name,js,wait] of JSON.parse(steps)){if(js)await p.evaluate(js);await p.waitForTimeout(wait||3000);await p.screenshot({path:`${prefix}_${name}.png`});}await b.close();})();
