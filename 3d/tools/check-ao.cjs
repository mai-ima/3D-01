// 回帰テスト(黒い車体の信号機などは黒が多いので、明るい色のモデルで見る): 画質「高」(AO あり)で、モデルの周りに黒い四角が出ないこと。寸法表示を出した状態も確認する
//   node 3d/tools/check-ao.cjs [id…]
const {launch,openViewer}=require('./lib/open-viewer.cjs');const {PNG}=require('pngjs');
(async()=>{const ids=process.argv.slice(2);const want=ids.length?ids:['jp-const-cone','jp-exp-wire-rope','jp-exp-cushion-drum','jp-exp-noise-wall'];const b=await launch();
  const p=await openViewer(b,{query:'?thumb=1&ao',w:430,h:700,page:'all'});let bad=0;
  const black=async()=>{const im=PNG.sync.read(await p.screenshot());let n=0;for(let i=0;i<im.data.length;i+=4)if(im.data[i]<8&&im.data[i+1]<8&&im.data[i+2]<8)n++;return n/(im.width*im.height);};
  for(const id of want){await p.evaluate(id=>__api.openModel(id),id);await p.waitForTimeout(4000);
    for(const dims of[false,true]){if(dims)await p.evaluate(()=>document.getElementById('tDims').click());await p.waitForTimeout(1200);const r=await black();
      const ng=r>.01;if(ng)bad++;console.log(ng?'✗':'○',id,dims?'(寸法あり)':'',`黒い画素 ${(r*100).toFixed(2)}%`);}
    await p.evaluate(()=>{const t=document.getElementById('tDims');if(t.classList.contains('on'))t.click();});}
  await b.close();console.log(bad?`\n黒い四角の疑い ${bad} 件`:'\nAO の黒い四角: なし');process.exit(bad?1:0);})();
