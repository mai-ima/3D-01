// 総当たりテスト: 全モデル × 全オプション選択肢 × 全現示 を実際のビューアで切り替え、不具合の証拠を集める
//   node 3d/tools/fuzz.cjs [id…]     出力: 不具合の疑い(コンソールエラー・NaN・空のバウンディング・ノード表示の矛盾・ランプが点かない 等)
const {launch,openViewer}=require('./lib/open-viewer.cjs');const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'../..'),idx=JSON.parse(fs.readFileSync(path.join(ROOT,'3d/models/index.json')));const want=process.argv.slice(2);
(async()=>{const b=await launch();const issues=[];const add=(id,m)=>{issues.push([id,m]);console.log('✗',id.padEnd(26),m);};
  const p=await openViewer(b,{query:'?thumb=1&env=studio',w:480,h:480,page:'all'});
  const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load|GL Driver|ERR_FAILED|404/.test(m.text()))errs.push(m.text().slice(0,160));});
  for(const e of idx.models){if(want.length&&!want.includes(e.id))continue;errs.length=0;
    const r=await p.evaluate(async(e)=>{const out=[];const log=m=>out.push(m);
      await __api.select(e.id,true);const s=__api.sig;
      // 1) 形状: 全メッシュの頂点・バウンディングボックスに NaN/Infinity がないか、空でないか
      let meshes=0;s.root.traverse(o=>{if(o.isMesh){meshes++;const g=o.geometry;g.computeBoundingBox();const bb=g.boundingBox;if(!bb||[...bb.min.toArray(),...bb.max.toArray()].some(v=>!isFinite(v)))log('NaN/Infinity の頂点: '+o.name);
        const pa=g.attributes.position;if(!pa||pa.count===0)log('頂点が空: '+o.name);}});
      if(!meshes)log('メッシュが1つもない');
      // 2) 全オプションの全選択肢: 選んだ choice のノードだけが表示になるか
      for(const op of e.options||[]){for(const c of op.choices){try{s.setOption(op.id,c.id);}catch(x){log(`setOption ${op.id}=${c.id} が例外: ${x.message}`);continue;}
        if(op.type==='color')continue;
        const nodes=[];s.root.traverse(o=>{const m=/^opt_([^_]+)_([^_]+?)(?:_\d+)?$/.exec(o.name);if(m&&m[1]===op.id)nodes.push([m[2],o]);});
        for(const [ch,o] of nodes){let vis=o.visible;let p2=o.parent;while(p2&&p2!==s.root.parent){if(!p2.visible&&!p2.name.startsWith('opt_')){vis=false;break;}p2=p2.parent;}
          const want=(ch===c.id);if(op.id!=='lens'&&ch!=='off'&&o.visible!==want)log(`オプション ${op.id}=${c.id}: ノード ${o.name} の表示が ${o.visible}(期待 ${want})`);}}
        s.setOption(op.id,op.default);}
      // 3) 全現示: ランプが想定どおり点灯するか(値が 1 に近づく)
      for(const st of e.states||[]){__api.setMode('manual');s.setState(st.id,true);
        for(const k of['on']){for(const l of st[k]||[]){const L=s.lamps[l];if(!L){log(`状態 ${st.id}: ランプ ${l} が実行時に存在しない`);continue;}if(!(L.t>=.99))log(`状態 ${st.id}: ランプ ${l} の目標値が ${L.t}`);}}}
      // 4) 表示サイズ: 画面に入るか(カメラ距離が異常でないか)
      const d=__api.camera.position.distanceTo(__api.controls.target);if(!isFinite(d)||d>200||d<.1)log(`カメラ距離が異常: ${d}`);
      return out;},e);
    for(const m of r)add(e.id,m);
    // 5) 各状態・背景で例外が出ないか(夜・濡れ・軌道あり)
    for(const env of['day','dusk','night']){await p.evaluate(x=>__api.setEnv(x),env);await p.waitForTimeout(150);}
    await p.evaluate(()=>__api.setEnv('studio'));
    for(const m of errs)add(e.id,'コンソール: '+m);}
  await b.close();console.log(`\n不具合の疑い: ${issues.length} 件 / ${idx.models.length} モデル`);fs.writeFileSync(path.join(process.env.TMPDIR||'/tmp','fuzz.json'),JSON.stringify(issues,null,1));process.exit(issues.length?1:0);})();
