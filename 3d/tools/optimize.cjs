// GLB の最適化(glTF-Transform): 頂点溶接 + 量子化 + テクスチャの WebP 圧縮(読み込みを軽くする。three の GLTFLoader は EXT_texture_webp に対応)。ノード名/マテリアル名(lamp_* / opt_* / lens_*)は保持する。
//   使い方: node 3d/tools/optimize.cjs   (export.cjs の後に実行。index.json の bytes も更新)
// ※ 既定の `optimize`(メッシュ結合・マテリアル統合)は使わない: ランプや任意部品の識別が壊れるため。
const {execFileSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'3d/models'),bin=path.join(ROOT,'node_modules/.bin/gltf-transform');
const webp=!process.env.NO_WEBP;const idxPath=path.join(OUT,'index.json'),idx=JSON.parse(fs.readFileSync(idxPath));const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gltfopt-'));let before=0,after=0;
for(const m of idx.models){const f=path.join(OUT,m.file),w=path.join(tmp,'w.glb'),q=path.join(tmp,'q.glb');before+=fs.statSync(f).size;
  execFileSync(bin,['weld',f,w],{stdio:'ignore'});execFileSync(bin,['quantize',w,q],{stdio:'ignore'});
  if(webp){const z=path.join(tmp,'z.glb');try{execFileSync(bin,['webp',q,z,'--quality','86','--slots','*'],{stdio:'ignore'});fs.copyFileSync(z,f);}catch(e){fs.copyFileSync(q,f);}}else fs.copyFileSync(q,f);m.bytes=fs.statSync(f).size;after+=m.bytes;fs.writeFileSync(path.join(OUT,m.dir,'meta.json'),JSON.stringify(m,null,1));
  console.log(m.id.padEnd(24),(m.bytes/1048576).toFixed(2)+'MB');}
fs.writeFileSync(idxPath,JSON.stringify(idx,null,1));console.log(`total ${(before/1048576).toFixed(1)}MB → ${(after/1048576).toFixed(1)}MB`);
