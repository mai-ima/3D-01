// 3d/src 配下の「カテゴリ/…/モデル.js」を走査して 3d/src/registry.js を生成する
const fs=require('fs'),path=require('path');const SRC=path.resolve(__dirname,'../src');const out=[];
function walk(d,rel){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.isDirectory()){if(['kit'].includes(e.name)&&!rel)continue;walk(path.join(d,e.name),rel?rel+'/'+e.name:e.name);}
  else if(e.name.endsWith('.js')&&rel&&e.name!=='registry.js')out.push({rel,file:rel+'/'+e.name});}}
walk(SRC,'');out.sort((a,b)=>a.file.localeCompare(b.file));
let js='// 自動生成: node 3d/tools/gen-registry.cjs\n';out.forEach((o,i)=>js+=`import m${i} from './${o.file}';\n`);
js+='export const MODELS=[\n'+out.map((o,i)=>`  {path:${JSON.stringify(o.rel.split('/'))},def:m${i}},`).join('\n')+'\n];\n';
fs.writeFileSync(path.join(SRC,'registry.js'),js);console.log(out.length,'models registered');
