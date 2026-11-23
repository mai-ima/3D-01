// ビューアを単一HTMLにビルド: dist/signals.html(信号のみ) と dist/all.html(全3Dモデル)
const esbuild=require('esbuild'),fs=require('fs'),path=require('path');const ROOT=path.resolve(__dirname,'../..'),V=path.join(ROOT,'3d/viewer');
const r=esbuild.buildSync({entryPoints:[path.join(V,'main.js')],bundle:true,format:'esm',write:false,external:['three','three/addons/*'],legalComments:'none'});
const js=r.outputFiles[0].text.replace(/<\/script>/g,'<\\/script>');
const css=fs.readFileSync(path.join(V,'ui.css'),'utf8');const rd=n=>fs.readFileSync(path.join(V,n),'utf8').replace('/*__CSS__*/',()=>css);
const builds=[{out:'signals',tpl:'index.html',root:'signal',title:'信号灯器ライブラリ',h1:'日本の信号灯器ライブラリ'},{out:'all',tpl:'library.html',root:null,title:'3Dモデルライブラリ',h1:'3Dモデルライブラリ'}];
const B64=!!process.env.B64,OUTDIR=B64?path.join(ROOT,'3d/dist'):path.join(ROOT,'dist');fs.mkdirSync(OUTDIR,{recursive:true});
for(const b of builds){const html=rd(b.tpl).replace('__TITLE__',b.title).replace('__H1__',b.h1).replace('/*__BUNDLE__*/',()=>`window.__VIEWER__=${JSON.stringify({root:b.root,b64:B64})};\n`+js);
  fs.writeFileSync(path.join(OUTDIR,b.out+'.html'),html);console.log(path.relative(ROOT,OUTDIR)+'/'+b.out+'.html',(html.length/1024|0)+'KB');}
