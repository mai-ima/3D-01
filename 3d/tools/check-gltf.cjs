// GLB の規格検証(Khronos glTF-Validator): node 3d/tools/check-gltf.cjs [--warn]
//   エラーがあれば終了コード1。--warn で警告も表示。他のソフト(Blender・Unity・各種ビューア)で開けることの保証になる
const fs=require('fs'),path=require('path'),validator=require('gltf-validator');
const ROOT=path.resolve(__dirname,'../..'),M=path.join(ROOT,'3d/models'),showWarn=process.argv.includes('--warn');
// 既知で許容する項目: 量子化(KHR_mesh_quantization)を使うのは意図どおり。UNUSED_OBJECT 等は最適化後の無害な残り
const IGNORE=new Set(['UNUSED_OBJECT','NODE_EMPTY','UNDECLARED_EXTENSION']);
(async()=>{const idx=JSON.parse(fs.readFileSync(path.join(M,'index.json')));let E=0,W=0,bad=0;const codes={};
  for(const e of idx.models){const f=path.join(M,e.file);const buf=new Uint8Array(fs.readFileSync(f));
    const r=await validator.validateBytes(buf,{uri:e.file,maxIssues:50,ignoredIssues:[...IGNORE]});
    const iss=r.issues.messages;const errs=iss.filter(m=>m.severity===0),warns=iss.filter(m=>m.severity===1);E+=errs.length;W+=warns.length;
    if(errs.length){bad++;console.log('✗',e.id);for(const m of errs.slice(0,4))console.log('   ',m.code,m.message.slice(0,110),m.pointer||'');}
    for(const m of warns)codes[m.code]=(codes[m.code]||0)+1;
    if(showWarn&&warns.length){console.log('△',e.id);for(const m of warns.slice(0,3))console.log('   ',m.code,m.message.slice(0,100));}}
  const ws=Object.entries(codes).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}×${v}`).join(' ');
  console.log(`\nglTF 検証 ${idx.models.length}モデル: エラー ${E}(${bad}モデル) / 警告 ${W}${ws?'  ['+ws+']':''}`);process.exit(E?1:0);})();
