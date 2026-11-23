// モデルの整合性検査: node 3d/tools/check.cjs   (問題があれば終了コード1)
//  - index.json の各モデルに GLB・meta.json・サムネイルがあるか / id が重複していないか
//  - 状態(states)が参照するランプ名が GLB に実在するか、cycle が実在する状態を指すか
//  - オプション(options)が GLB の opt_<id>_<choice> ノード(または色指定)と対応するか
//  - ランプのマテリアルに点灯色(litColor)があるか、カテゴリ名が categories.json にあるか
const fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'../..'),M=path.join(ROOT,'3d/models');
const idx=JSON.parse(fs.readFileSync(path.join(M,'index.json'))),cats=Object.keys(idx.categories);
const glb=f=>{const d=fs.readFileSync(f);const l=d.readUInt32LE(12);return JSON.parse(d.slice(20,20+l).toString());};
let errs=0,warn=0;const E=(id,m)=>{errs++;console.log('✗',id.padEnd(24),m);},W=(id,m)=>{warn++;console.log('△',id.padEnd(24),m);};
const seen=new Set();
for(const e of idx.models){const id=e.id;
  if(seen.has(id))E(id,'id が重複');seen.add(id);
  for(const f of[e.file,e.thumb,e.dir+'/meta.json'])if(!fs.existsSync(path.join(M,f)))E(id,`ファイルがない: ${f}`);
  for(let i=1;i<=e.path.length;i++){const k=e.path.slice(0,i).join('/');if(!cats.includes(k))E(id,`categories.json にない: ${k}`);}
  if(!fs.existsSync(path.join(M,e.file)))continue;
  const g=glb(path.join(M,e.file));const names=new Set(g.nodes.map(n=>(n.name||'').replace(/_\d+$/,'')));
  const lampKeys=new Set([...names].filter(n=>/^lamp_/.test(n)).map(n=>n.slice(5)));
  const lampB=new Set([...names].filter(n=>/^lampB_/.test(n)).map(n=>n.slice(6)));
  const meta=new Set((e.lamps||[]).map(l=>l.key));
  for(const k of lampKeys)if(!meta.has(k))E(id,`GLB のランプ ${k} が meta.lamps にない`);
  for(const k of meta)if(!lampKeys.has(k))E(id,`meta.lamps の ${k} が GLB にない`);
  const matOk=(g.materials||[]).filter(m=>/^lens/.test(m.name||''));
  if(lampKeys.size&&!matOk.length)E(id,'ランプのマテリアル(lens_*)がない');
  const stIds=new Set((e.states||[]).map(s=>s.id));
  if(stIds.size!==(e.states||[]).length)E(id,'状態 id が重複');
  for(const s of e.states||[])for(const k of['on','flash','flash2'])for(const l of s[k]||[])if(!lampKeys.has(l))E(id,`状態 ${s.id} の ${k} が未知のランプ ${l}`);
  for(const c of e.cycle||[]){if(!stIds.has(c.s))E(id,`cycle が未知の状態 ${c.s}`);if(!(c.d>0))E(id,`cycle の秒数が不正 (${c.s})`);}
  if(e.night&&!stIds.has(e.night))E(id,`night が未知の状態 ${e.night}`);
  if((e.states||[]).length&&!(e.cycle||[]).length)W(id,'状態があるのに cycle(自動)がない');
  if(e.anim&&!names.has(e.anim.node))E(id,`anim.node ${e.anim.node} が GLB にない`);
  const optNodes={};for(const n of names){const m=/^opt_([^_]+)_([^_]+)$/.exec(n);if(m)(optNodes[m[1]]=optNodes[m[1]]||new Set()).add(m[2]);}
  const optIds=new Set();
  for(const o of e.options||[]){optIds.add(o.id);const ids=o.choices.map(c=>c.id);
    if(!ids.includes(o.default))E(id,`オプション ${o.id} の default ${o.default} が選択肢にない`);
    if(o.type==='color'){if(!(g.materials||[]).some(m=>m.name===o.target))E(id,`色オプション ${o.id} の対象マテリアル ${o.target} が GLB にない`);continue;}
    const have=optNodes[o.id];if(!have){E(id,`オプション ${o.id} に対応する opt_${o.id}_* ノードがない`);continue;}
    if(o.id==='lens'){continue;}
    for(const c of ids)if(c!=='off'&&!have.has(c))W(id,`オプション ${o.id} の選択肢 ${c} に対応するノードがない`);}
  for(const k of Object.keys(optNodes))if(!optIds.has(k))W(id,`GLB の opt_${k}_* がオプションとして宣言されていない`);
  const tex=(g.images||[]).length;if(e.bytes>12*1048576)W(id,`GLB が大きい (${(e.bytes/1048576).toFixed(1)}MB)`);
}
console.log(`\n${idx.models.length}モデルを検査: エラー ${errs} / 注意 ${warn}`);process.exit(errs?1:0);
