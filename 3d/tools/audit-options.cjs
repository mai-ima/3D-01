// 全選択肢の監査: 全モデル × 全オプションの選択肢を1つずつ表示して撮影し、一覧シート(PNG)にまとめる
//   node 3d/tools/audit-options.cjs <出力先> [env=day] [絞り込み(IDの一部)…]
// 見落としを減らすため、文字の干渉・床との重なり・欠け・向きの誤りを目視する用
const {launch,openViewer}=require('./lib/open-viewer.cjs');const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'../..');
(async()=>{const [out,env='day',...flt]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
  const idx=JSON.parse(fs.readFileSync(path.join(ROOT,'3d/models/index.json')));const b=await launch();
  const p=await openViewer(b,{query:`?env=${env}&thumb=1`,w:420,h:420,page:'all'});let n=0;
  for(const e of idx.models){if(flt.length&&!flt.some(f=>e.id.includes(f)))continue;
    const opts=(e.options||[]).filter(o=>o.type!=='color'&&o.choices);
    const jobs=[[null,null]];for(const o of opts)for(const c of o.choices)if(c.id!==o.default)jobs.push([o.id,c.id]);
    await p.evaluate(async id=>{await __api.select(id,true);},e.id);await p.waitForTimeout(1200);
    for(const [oid,cid] of jobs){await p.evaluate(([id,o,c,st])=>{__api.openModel&&0;if(o){__api.sig.setOption(o,c);}if(st){__api.setMode('manual');__api.sig.setState(st,true);}__api.refreshTrack&&__api.refreshTrack();__api.flyTo('all',true);},[e.id,oid,cid,e.cycle?e.cycle[0].s:(e.states&&e.states[0]&&e.states[0].id)]);
      await p.waitForTimeout(700);const f=`${String(++n).padStart(4,'0')}__${e.id}__${oid||'default'}-${cid||''}.png`;await p.screenshot({path:path.join(out,f)});
      if(oid)await p.evaluate(([o,d])=>__api.sig.setOption(o,d),[oid,opts.find(x=>x.id===oid).default]);}
    console.log('audit',e.id,jobs.length);}
  await b.close();})();
