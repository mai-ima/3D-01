// 依存関係の検査: node 3d/tools/check-deps.cjs   (README「依存の関係」の規則を機械的に確かめる)
const fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'../..');
const walk=(d,o=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(['models','dist','node_modules'].includes(e.name))continue;walk(p,o);}else if(e.name.endsWith('.js'))o.push(p);}return o;};
const rel=p=>path.relative(ROOT,p).split(path.sep).join('/');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');          // コメント内の import 例を無視
const re=/(?:^|[\s;}])(?:import|export)\b[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|(?:^|[\s;])import\s*['"]([^'"]+)['"]/g;
const rules=[
  [/^3d\/src\/kit\/index\.js$/,()=>false,'kit/index.js は他のファイルに依存しない'],
  [/^3d\/src\/kit\/(signal|track|road)-parts\.js$/,t=>t==='3d/src/kit/index.js','部品ファイルは kit/index.js だけに依存する'],
  [/^3d\/src\/signal\//,t=>t==='3d/src/kit/signal-parts.js','信号モデルは signal-parts.js だけを import する'],
  [/^3d\/src\/kit\/expressway-parts\.js$/,t=>t==='3d/src/kit/road-parts.js','高速道路の部品は road-parts.js だけに依存する'],
  [/^3d\/src\/expressway\//,t=>t==='3d/src/kit/expressway-parts.js','高速道路モデルは expressway-parts.js だけを import する'],
  [/^3d\/src\/kit\/roadway-parts\.js$/,t=>t==='3d/src/kit/road-parts.js','道路(車道)の部品は road-parts.js だけに依存する'],
  [/^3d\/src\/roadway\//,t=>t==='3d/src/kit/roadway-parts.js','道路(車道)モデルは roadway-parts.js だけを import する'],
  [/^3d\/src\/road\//,t=>t==='3d/src/kit/road-parts.js','道路モデルは road-parts.js だけを import する'],
  [/^3d\/src\/track\//,t=>t==='3d/src/kit/index.js'||t==='3d/src/kit/track-parts.js','軌道モデルは kit だけを import する'],
  [/^3d\/runtime\//,()=>false,'runtime は相対 import をしない(Three.js だけに依存)'],
  [/^3d\/viewer\//,t=>t==='3d/runtime/model-runtime.js'||t==='3d/viewer/env.js','viewer は runtime と env だけを相対 import する(src は参照しない)'],
];
let bad=0;
for(const f of walk(path.join(ROOT,'3d'))){const r=rel(f);const src=strip(fs.readFileSync(f,'utf8'));let m;re.lastIndex=0;
  while((m=re.exec(src))){const t=m[1]||m[2]||m[3];if(!t||!t.startsWith('.'))continue;const target=rel(path.resolve(path.dirname(f),t));
    if(r.startsWith('3d/tools/')||r==='3d/src/registry.js')continue;                    // ツールと自動生成の registry は対象外
    for(const [pat,ok,msg] of rules)if(pat.test(r)&&!ok(target)){bad++;console.log('✗',r,'→',target,'\n   ',msg);}}}
console.log(bad?`\n依存関係の違反 ${bad} 件`:'依存関係: 違反なし');process.exit(bad?1:0);
