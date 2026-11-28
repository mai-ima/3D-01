// 全モデルの AO 回帰テスト: 画質「高」相当(AOあり)と、AOなしを同じ画角で撮り、AOで不自然に暗くなった領域(黒い四角など)を探す
//   node 3d/tools/check-ao-all.cjs [id…]
const {launch,openViewer}=require('./lib/open-viewer.cjs');const {PNG}=require('pngjs');const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'../..');
(async()=>{const idx=JSON.parse(fs.readFileSync(path.join(ROOT,'3d/models/index.json')));const want=process.argv.slice(2);const b=await launch();
  const p=await openViewer(b,{query:'?env='+(process.env.AOENV||'day')+'&thumb=1',w:420,h:420,page:'all'});
  const luma=(d,i)=>.299*d[i]+.587*d[i+1]+.114*d[i+2];let bad=0;fs.mkdirSync('/tmp/aoall',{recursive:true});
  const setQ=async q=>{await p.evaluate(q=>document.querySelector(`#qSeg button[data-q=${q}]`).click(),q);await p.waitForTimeout(900);};
  for(const e of idx.models){if(want.length&&!want.includes(e.id))continue;
    await setQ('low');await p.evaluate(id=>__api.openModel(id),e.id);await p.waitForTimeout(2500);
    await p.evaluate(()=>{const e=__api.entry;if(e.states&&e.states.length){__api.setMode('manual');__api.sig.setState(e.states[0].id,true);}__api.flyTo('all',true);});   // 点滅・自動切替を止めて、同じ状態で比べる
    await p.waitForTimeout(1200);const N=PNG.sync.read(await p.screenshot());await setQ('high');await p.waitForTimeout(1500);const A=PNG.sync.read(await p.screenshot());let n=0,tot=A.width*A.height;
    for(let i=0;i<A.data.length;i+=4){const la=luma(A.data,i),ln=luma(N.data,i);if(ln>70&&la<ln*.4)n++;}
    const r=n/tot,ng=r>.004;if(ng){bad++;fs.writeFileSync(`/tmp/aoall/${e.id}_ao.png`,PNG.sync.write(A));fs.writeFileSync(`/tmp/aoall/${e.id}_no.png`,PNG.sync.write(N));}
    console.log(ng?'✗':'○',e.id.padEnd(30),`AOで暗くなった領域 ${(r*100).toFixed(2)}%`);}
  await b.close();console.log(bad?`\n黒い領域の疑い ${bad} 件(/tmp/aoall に画像)`:'\nAO の黒い領域: なし');process.exit(bad?1:0);})();
