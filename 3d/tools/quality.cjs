// 品質監査(数値): 全モデルの GLB を読み、現実品質に足りない疑いのあるものを報告する
//   node 3d/tools/quality.cjs [--all]      目視の監査(npm run audit)とあわせて使う
// 基準は「新品の状態の実物と同等」。汚れ・経年劣化の表現は評価しない(ないことを減点しない)
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'../..'),M=path.join(ROOT,'3d/models'),showAll=process.argv.includes('--all');
// カテゴリごとの下限(三角形数)。小さな部品が主役のモデルは緩く、大型の構造物は高めにする
const MIN_TRIS=[[/^signal\//,8000],[/^track\//,2500],[/^road\/(sign|lighting)/,1500],[/^road\//,700],[/^expressway\/(tollgate|sign|info|lighting)/,2500],[/^expressway\//,500]];
(async()=>{const {NodeIO}=await import('@gltf-transform/core');const {ALL_EXTENSIONS}=await import('@gltf-transform/extensions');
  const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);const idx=JSON.parse(fs.readFileSync(path.join(M,'index.json')));let warn=0;const rows=[];
  for(const e of idx.models){const doc=await io.read(path.join(M,e.file));const root=doc.getRoot();const w=[];
    let tris=0,verts=0,unnamed=0,meshes=0;const mats=new Set();
    for(const mesh of root.listMeshes()){for(const p of mesh.listPrimitives()){const pos=p.getAttribute('POSITION');const ind=p.getIndices();if(!pos)continue;verts+=pos.getCount();tris+=(ind?ind.getCount():pos.getCount())/3;if(p.getMaterial())mats.add(p.getMaterial());}}
    for(const n of root.listNodes()){if(n.getMesh()){meshes++;if(!n.getName())unnamed++;}}
    const tex=root.listTextures();let maxTex=0,nonPow=0;for(const t of tex){const s=t.getSize();if(s){maxTex=Math.max(maxTex,s[0],s[1]);if((s[0]&(s[0]-1))||(s[1]&(s[1]-1)))nonPow++;}}
    const size=e.size||[0,0,0];const cat=e.path?e.path.join('/'):e.file;
    const need=(MIN_TRIS.find(([re])=>re.test(cat))||[0,0])[1];
    if(tris<need)w.push(`ディテール不足の疑い(三角形 ${Math.round(tris)} < ${need})`);
    if(mats.size<3)w.push(`材質が少ない(${mats.size}種)。質感の差が出にくい`);
    if(Math.max(...size)>45||Math.max(...size)<.08)w.push(`寸法が不自然(${size.map(v=>v.toFixed(2)).join('×')}m)`);
    if(maxTex>2048)w.push(`テクスチャが大きすぎる(${maxTex}px)`);
    for(const o of(e.options||[])){if(o.type==='color')continue;const names=new Set();for(const n of root.listNodes())if(n.getName().startsWith('opt_'+o.id+'_'))names.add(n.getName());
      const need2=o.choices.filter(c=>c.id!=='off').length;if(names.size<need2)w.push(`オプション ${o.id}: GLB 内の選択肢 ${names.size} < 定義 ${need2}`);}
    rows.push({id:e.id,cat,tris:Math.round(tris),mats:mats.size,tex:tex.length,size,w});warn+=w.length;
    if(w.length||showAll)console.log((w.length?'△ ':'○ ')+e.id.padEnd(30),`三角形 ${String(Math.round(tris)).padStart(7)}  材質 ${mats.size}  画像 ${tex.length}  ${size.map(v=>v.toFixed(2)).join('×')}m`);
    for(const x of w)console.log('     -',x);}
  fs.writeFileSync(path.join(process.env.TMPDIR||'/tmp','quality.json'),JSON.stringify(rows,null,1));
  console.log(`\n品質監査(数値) ${idx.models.length}モデル: 指摘 ${warn} 件`);})();
