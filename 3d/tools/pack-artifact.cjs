// アーティファクト公開用に 3d/dist/pub/ を作る(GLB は base64 テキストにして配信可能な形式へ)
//   B64=1 node 3d/tools/build-viewer.cjs && node 3d/tools/pack-artifact.cjs   → 公開ファイル一覧(JSON)を標準出力
const fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'../..'),SRC=path.join(ROOT,'3d/models'),PUB=path.join(ROOT,'3d/dist/pub/models');
fs.rmSync(path.join(ROOT,'3d/dist/pub'),{recursive:true,force:true});const files=[];
const copy=(rel,fn)=>{const d=path.join(PUB,rel);fs.mkdirSync(path.dirname(d),{recursive:true});fn(path.join(SRC,rel),d);files.push({path:'models/'+(rel.endsWith('model.glb')?rel+'.b64.txt':rel)});};
const idx=JSON.parse(fs.readFileSync(path.join(SRC,'index.json')));
copy('index.json',(s,d)=>fs.copyFileSync(s,d));
for(const m of idx.models){copy(m.file,(s,d)=>fs.writeFileSync(d+'.b64.txt',fs.readFileSync(s).toString('base64')));copy(m.thumb,(s,d)=>fs.copyFileSync(s,d));}
// 実写の素材(PBR テクスチャ・HDRI)も同梱する。ビューアが使うマップだけ(ao・未使用の素材は除く)。.hdr は配信できないので base64 テキストにする
const AS=path.join(ROOT,'3d/assets'),PA=path.join(ROOT,'3d/dist/pub/assets');
const put=(rel,buf)=>{const d=path.join(PA,rel);fs.mkdirSync(path.dirname(d),{recursive:true});fs.writeFileSync(d,buf);files.push({path:'assets/'+rel});};
for(const tx of['asphalt','pavers','concrete'])for(const m of['diff','nor','rough'])put(`textures/${tx}/${m}.jpg`,fs.readFileSync(path.join(AS,'textures',tx,m+'.jpg')));
for(const h of fs.readdirSync(path.join(AS,'hdri')))put(`hdri/${h}.b64.txt`,fs.readFileSync(path.join(AS,'hdri',h)).toString('base64'));
console.log(JSON.stringify(files));
