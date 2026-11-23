// 実写の素材(PBR テクスチャ・HDRI)を Poly Haven(CC0)から取得する: node 3d/tools/fetch-assets.cjs
//   取得先: 3d/assets/textures/<素材>/{diff,nor,rough,ao}.jpg と 3d/assets/hdri/<名前>.hdr、ライセンス情報は 3d/assets/SOURCES.json
const fs=require('fs'),path=require('path'),https=require('https');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'3d/assets');
const TEX=[ // [保存名, Poly Haven の素材名, 用途]
  ['asphalt','asphalt_02','車道のアスファルト'],['pavers','brick_pavement_02','歩道のレンガ舗装'],['concrete','concrete_floor_02','コンクリート(縁石・基礎)'],
  ['galv','corrugated_iron_02','亜鉛めっき鋼の質感(傷・汚れ)'],
];
const HDRI=[['sky_day','kloofendal_48d_partly_cloudy_puresky','昼の空(屋外)']];
const get=(u)=>new Promise((res,rej)=>https.get(u,{headers:{'User-Agent':'3d-library-assets'}},r=>{if(r.statusCode>=300&&r.statusCode<400&&r.headers.location)return res(get(r.headers.location));
  if(r.statusCode!==200){r.resume();return rej(new Error(u+' → '+r.statusCode));}const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej));
(async()=>{fs.mkdirSync(path.join(OUT,'textures'),{recursive:true});fs.mkdirSync(path.join(OUT,'hdri'),{recursive:true});const src=[];
  for(const [name,ph,use] of TEX){const files=JSON.parse(await get('https://api.polyhaven.com/files/'+ph)),info=JSON.parse(await get('https://api.polyhaven.com/info/'+ph));
    const dir=path.join(OUT,'textures',name);fs.mkdirSync(dir,{recursive:true});
    for(const [key,out] of[['Diffuse','diff'],['nor_gl','nor'],['Rough','rough'],['AO','ao']]){const f=files[key]&&files[key]['1k']&&files[key]['1k'].jpg;if(!f)continue;fs.writeFileSync(path.join(dir,out+'.jpg'),await get(f.url));}
    src.push({name,source:'Poly Haven',asset:ph,license:'CC0',authors:Object.keys(info.authors||{}),use,url:'https://polyhaven.com/a/'+ph});console.log('texture',name,'←',ph);}
  for(const [name,ph,use] of HDRI){const files=JSON.parse(await get('https://api.polyhaven.com/files/'+ph)),info=JSON.parse(await get('https://api.polyhaven.com/info/'+ph));
    fs.writeFileSync(path.join(OUT,'hdri',name+'.hdr'),await get(files.hdri['1k'].hdr.url));src.push({name,source:'Poly Haven',asset:ph,license:'CC0',authors:Object.keys(info.authors||{}),use,url:'https://polyhaven.com/a/'+ph});console.log('hdri',name,'←',ph);}
  fs.writeFileSync(path.join(OUT,'SOURCES.json'),JSON.stringify(src,null,1));console.log('完了 → 3d/assets (ライセンス情報: SOURCES.json)');})().catch(e=>{console.error(e.message);process.exit(1);});
