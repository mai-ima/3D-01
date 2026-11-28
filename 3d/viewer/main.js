import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {loadModel,cycleAt} from '../runtime/model-runtime.js';
import {createEnvironment} from './env.js';

const $=id=>document.getElementById(id);
const q=new URLSearchParams(location.search),THUMB=q.has('thumb');
const V=window.__VIEWER__||{root:null};
const LIB=!V.root;   // ライブラリ(全モデル)か、信号ビューアか
let CATS={};
const TRACK_IDS={ballast:'jp-track-ballast',slab:'jp-track-slab',tram:'jp-track-tram'};

/* ---------- 画質設定(低/高) ---------- */
const _sg=k=>{try{return localStorage.getItem(k);}catch{return null;}};
const QUAL={low:{dpr:1.25,shadow:1024,samples:0,bloom:false,ao:false,gap:32,minDpr:.6,label:'低'},high:{dpr:2,shadow:4096,samples:4,bloom:true,ao:true,gap:0,minDpr:.75,label:'高'}};
let quality=_sg('quality')||(((navigator.hardwareConcurrency||4)<6&&matchMedia('(pointer:coarse)').matches)?'low':'high');if(!QUAL[quality])quality='high';
const Q=()=>QUAL[quality];
/* ---------- renderer ---------- */
const canvas=$('gl'),stage=$('stage');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
const COARSE=matchMedia('(pointer:coarse)').matches||Math.min(innerWidth,innerHeight)<700;   // スマホ・タブレット: 描画負荷を下げる
renderer.setPixelRatio(Math.min(devicePixelRatio,Q().dpr));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.05,800);camera.position.set(5,3,9);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=.35;controls.maxDistance=60;controls.maxPolarAngle=Math.PI/2-.01;controls.autoRotateSpeed=1.4;
const composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:Q().samples}));
composer.addPass(new RenderPass(scene,camera));
const gtao=new GTAOPass(scene,camera,256,256);gtao.output=GTAOPass.OUTPUT[q.get('aoout')||'Default']||GTAOPass.OUTPUT.Default;gtao.updateGtaoMaterial({radius:.9,distanceExponent:1.2,thickness:2.5,scale:2.2,samples:16,distanceFallOff:1,screenSpaceRadius:false});gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:12});
// AO の下準備(法線・深度の描画)に、背景テクスチャと寸法表示の板・線が混ざると、画面に黒い四角が出る。AO の計算中だけ外す
{const _r=gtao.render.bind(gtao);gtao.render=function(...a){const bg=scene.background,dg=typeof dimGroup!=='undefined'?dimGroup:null;scene.background=null;if(dg)dg.visible=false;try{_r(...a);}finally{scene.background=bg;if(dg)dg.visible=true;}};}
composer.addPass(gtao);                                         // 接触の陰影(アンビエントオクルージョン): 接合部・地面との接地・くぼみに自然な影を出す
const bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.25,.55,1.3);composer.addPass(bloom);composer.addPass(new OutputPass());
const sun=new THREE.DirectionalLight(0xffffff,2);sun.castShadow=true;sun.shadow.mapSize.set(Q().shadow,Q().shadow);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-7,near:1,far:140});sun.shadow.bias=-.0003;sun.shadow.normalBias=.02;sun.shadow.radius=3;
scene.add(sun,sun.target);
const plight=new THREE.PointLight(0xffffff,0,9,2);scene.add(plight);
const env=createEnvironment({scene,renderer,bloom,sun});
let dprMax=Math.min(devicePixelRatio,Q().dpr),dprNow=dprMax,ema=16.7,tAdapt=0,lastTs=0;
bloom.enabled=Q().bloom;gtao.enabled=Q().ao&&(!THUMB||q.has('ao'));
let SH=0;const mqPhone=matchMedia('(max-width:980px)'),mqLand=matchMedia('(max-width:980px) and (orientation:landscape) and (max-height:560px)');
const sheetOn=()=>!THUMB&&mqPhone.matches&&!mqLand.matches;
function coverH(){if(!sheetOn())return 0;const sh=$('sheet'),st=stage.getBoundingClientRect(),r=sh.getBoundingClientRect();return Math.max(0,Math.min(st.height,st.bottom-r.top));}   // ステージの下に重なっているシートの実高さ
function applyView(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;const c=coverH();
  if(c>0){camera.setViewOffset(w,h,0,Math.round(c/2),w,h);}else camera.clearViewOffset();camera.updateProjectionMatrix();}   // 3Dモデルをシートに隠れない領域の中央へ   // 3Dモデルをシートに隠れない領域の中央へ
let userMoved=false;
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;applyView();if(!userMoved&&typeof entry!=='undefined'&&entry&&boxInfo)setTimeout(()=>flyTo(curView||'all',true),0);}
new ResizeObserver(resize).observe(stage);resize();

/* ---------- state ---------- */
let catalog=[],entry=null,sig=null,mode='auto',speed=1,clock=0,envName='studio',wet=false,disp='shade',showDims=false,spin=false;
let trackType='none',onTrack=false;
const cache=new Map(),orig=new Map();let tween=null,loadToken=0,boxInfo=null,dimGroup=null,uiSig='',trackGroup=null;
const storeGet=k=>{try{return localStorage.getItem(k);}catch{return null;}};const storeSet=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};

/* ---------- classification ---------- */
const isTrack=e=>e.path[0]==='track';
function sceneGroup(e){const [a,b]=e.path;if(a==='track')return b==='tram'?'roadZ':'rail';if(b==='rail')return 'rail';if(b==='crossing')return 'crossing';if(b==='pedestrian')return 'road';return 'roadZ';}
function defaultTrack(e){const [a,b]=e.path;if(a==='track')return 'none';if(b==='tram')return 'tram';if(b==='rail'||b==='crossing')return 'ballast';return 'none';}
const trackFrame=g=>g==='rail'?{rot:0,x:0,y:0,z:0}:g==='crossing'?{rot:Math.PI/2,x:0,y:trackType==='tram'?.006:0,z:-6.2}:g==='roadZ'?{rot:0,x:8.5,y:-.14,z:0}:{rot:Math.PI/2,x:0,y:-.14,z:19.5};   // 道路上の軌道は路面(-0.15)に合わせる
const pathKey=e=>e.path.join('/');
const catName=k=>CATS[k]||k.split('/').pop();

/* ---------- カテゴリ一覧(折りたためる) ---------- */
const chevron='<svg class="i" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
const closed=new Set(JSON.parse(storeGet('closed')||'[]'));const saveClosed=()=>storeSet('closed',JSON.stringify([...closed]));
const order=()=>Object.keys(CATS);
function buildRail(){const rail=$('rail');rail.innerHTML='';
  const subs=[...new Set(catalog.map(pathKey))].sort((a,b)=>order().indexOf(a)-order().indexOf(b));
  for(const sk of subs){const items=catalog.filter(e=>pathKey(e)===sk);const g=document.createElement('section');g.className='grp';g.dataset.k=sk;g.dataset.open=closed.has(sk)?'0':'1';
    const h=document.createElement('button');h.className='gh';h.setAttribute('aria-expanded',closed.has(sk)?'false':'true');h.innerHTML=`${chevron}<span>${catName(sk)}</span><span class="n">${items.length}</span>`;
    h.addEventListener('click',()=>{const o=g.dataset.open==='1';g.dataset.open=o?'0':'1';h.setAttribute('aria-expanded',o?'false':'true');o?closed.add(sk):closed.delete(sk);saveClosed();});g.appendChild(h);
    const body=document.createElement('div');body.className='gb';
    for(const e of items){const b=document.createElement('button');b.className='item';b.dataset.id=e.id;
      b.innerHTML=`<img loading="lazy" alt="" src="models/${e.thumb}"><span><b>${e.name}</b><small>${e.id}</small></span>`;
      b.addEventListener('click',()=>{select(e.id);setTab('ctl');if(sheetOn()&&SH<peekH()+40)setSheet(snaps()[1]);});body.appendChild(b);}
    g.appendChild(body);rail.appendChild(g);}
  const c=$('count');if(c)c.textContent=`${catalog.length}モデル`;}
function openGroupOf(e){const g=document.querySelector(`.grp[data-k="${pathKey(e)}"]`);if(g&&g.dataset.open==='0'){g.dataset.open='1';g.querySelector('.gh').setAttribute('aria-expanded','true');closed.delete(pathKey(e));saveClosed();}}
/* ---------- ライブラリ: 検索・ツリー・一覧 ---------- */
let filterKey='',query='',sortBy='cat',view='grid';const treeClosed=new Set(JSON.parse(storeGet('treeClosed')||'[]'));
function libList(){let l=catalog.filter(e=>(!filterKey||pathKey(e)===filterKey||pathKey(e).startsWith(filterKey+'/'))&&(!query||(e.name+' '+e.id+' '+(e.desc||'')).toLowerCase().includes(query)));
  if(sortBy==='name')l=[...l].sort((a,b)=>a.name.localeCompare(b.name,'ja'));else if(sortBy==='tris')l=[...l].sort((a,b)=>b.tris-a.tris);return l;}
function renderTree(){const t=$('tree');t.innerHTML='';const mkBtn=(cls,html,key,n)=>{const b=document.createElement('button');b.className=`tn ${cls}`+(filterKey===key?' sel':'');b.innerHTML=`${html}<span class="n">${n}</span>`;return b;};
  const all=mkBtn('top','<span>すべてのモデル</span>','',catalog.length);all.addEventListener('click',()=>{filterKey='';renderTree();renderGrid();$('app').classList.remove('tree-open');});t.appendChild(all);
  const tops=[...new Set(catalog.map(e=>e.path[0]))].sort((a,b)=>order().indexOf(a)-order().indexOf(b));
  for(const top of tops){const wrap=document.createElement('div');wrap.className='tg';wrap.dataset.open=treeClosed.has(top)?'0':'1';
    const inTop=catalog.filter(e=>e.path[0]===top);const th=mkBtn('top',`${chevron}<span>${catName(top)}</span>`,top,inTop.length);
    th.addEventListener('click',()=>{const o=wrap.dataset.open==='1';if(filterKey===top){wrap.dataset.open=o?'0':'1';o?treeClosed.add(top):treeClosed.delete(top);storeSet('treeClosed',JSON.stringify([...treeClosed]));}else{filterKey=top;wrap.dataset.open='1';treeClosed.delete(top);renderTree();renderGrid();}});
    wrap.appendChild(th);const body=document.createElement('div');body.className='tb';
    for(const sk of [...new Set(inTop.map(pathKey))].sort((a,b)=>order().indexOf(a)-order().indexOf(b))){const sb=mkBtn('sub',`<span>${catName(sk)}</span>`,sk,inTop.filter(e=>pathKey(e)===sk).length);sb.addEventListener('click',()=>{filterKey=sk;renderTree();renderGrid();$('app').classList.remove('tree-open');});body.appendChild(sb);}
    wrap.appendChild(body);t.appendChild(wrap);}}
function renderGrid(){const l=libList(),g=$('grid');g.innerHTML='';$('gtitle').textContent=filterKey?catName(filterKey):'すべてのモデル';$('gcount').textContent=`${l.length}件`;
  if(!l.length){g.innerHTML='<div class="empty">条件に合うモデルがありません。</div>';return;}
  for(const e of l){const b=document.createElement('button');b.className='card';b.innerHTML=`<div class="ph"><img loading="lazy" alt="" src="models/${e.thumb}"></div><div class="tx"><b>${e.name}</b><div class="meta"><span class="chip b">${catName(pathKey(e))}</span><span class="chip">${(e.tris/1000).toFixed(e.tris>99999?0:1)}k 三角形</span><span class="chip">${e.bytes<1048576*.95?Math.max(1,Math.round(e.bytes/1024))+'KB':(e.bytes/1048576).toFixed(1)+'MB'}</span></div></div>`;
    b.addEventListener('click',()=>openModel(e.id));g.appendChild(b);}}
function showView(v){view=v;$('app').dataset.view=v;if(v==='grid'){try{history.replaceState(null,'',location.pathname+location.search);}catch{}controls.autoRotate=false;spin=false;toggleOn('tSpin',false);}}
async function openModel(id){showView('detail');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));resize();await select(id,true);setTab('info');}
function buildLibrary(){renderTree();renderGrid();
  $('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderGrid();});
  document.querySelectorAll('#sortSeg button').forEach(b=>b.addEventListener('click',()=>{sortBy=b.dataset.s;document.querySelectorAll('#sortSeg button').forEach(x=>x.classList.toggle('on',x===b));renderGrid();}));
  $('back').addEventListener('click',()=>showView('grid'));$('treeBtn').addEventListener('click',()=>$('app').classList.toggle('tree-open'));}
const lampHex=key=>{const l=(entry.lamps||[]).find(x=>x.key===key);return l?l.color:'#666';};
function buildStates(){const box=$('states');box.innerHTML='';const has=entry.states&&entry.states.length;
  $('stateSec').style.display=has?'':'none';$('noState').style.display=has?'none':'';
  if(has)for(const s of entry.states){const b=document.createElement('button');const k=(s.on||s.flash||s.flash2||[])[0];
    b.innerHTML=`<i style="background:${k?lampHex(k):'#444'}"></i>${s.label}`;b.dataset.s=s.id;b.addEventListener('click',()=>{setMode('manual');sig.setState(s.id);uiSig='';});box.appendChild(b);}
  const tl=$('tl');tl.innerHTML='';if(entry.cycle)for(const c of entry.cycle){const i=document.createElement('i');i.style.flex=c.d;tl.appendChild(i);}
  $('modes').querySelector('[data-m=night]').disabled=!entry.night;}
function buildOptions(){const box=$('opts');box.innerHTML='';const ops=entry.options||[];$('optSec').style.display=ops.length?'':'none';
  for(const op of ops){const w=document.createElement('div');w.className='opt';w.innerHTML=`<span>${op.label}</span>`;const seg=document.createElement('div');seg.className='seg sm';
    for(const c of op.choices){const b=document.createElement('button');b.textContent=c.label;b.dataset.c=c.id;if(c.id===sig.options[op.id])b.classList.add('on');
      b.addEventListener('click',()=>{sig.setOption(op.id,c.id);seg.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));applyDisplay();});seg.appendChild(b);}
    w.appendChild(seg);box.appendChild(w);}}
function setMode(m){if(!entry.states||!entry.states.length)return;if(m==='night'&&!entry.night)return;mode=m;if(m==='night')sig.setState(entry.night);uiSig='';}

/* ---------- track (線路) ---------- */
async function getTrackModel(id){const e=ALL.find(x=>x.id===id);if(!e)return null;let m=cache.get(id);if(!m){m=await loadModel(`models/${e.file}`,e,{glow:false,b64:V.b64});cache.set(id,m);}return {m,e};}
async function buildTrack(){if(trackGroup){scene.remove(trackGroup);trackGroup=null;}const g=sceneGroup(entry);const fr=trackFrame(g);
  const self=isTrack(entry);let src=null;
  if(self){src={m:sig,e:entry};}else if(trackType!=='none'){src=await getTrackModel(TRACK_IDS[trackType]);}
  if(!src)return;const len=src.e.size[2];const n=Math.ceil(70/len/2);trackGroup=new THREE.Group();trackGroup.position.set(fr.x,fr.y,fr.z);trackGroup.rotation.y=fr.rot;scene.add(trackGroup);
  for(let i=-n;i<=n;i++){if(self&&i===0)continue;const c=src.m.root.clone(true);c.position.z=i*len;c.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});trackGroup.add(c);}}
function placeModel(){const g=sceneGroup(entry),fr=trackFrame(g);const r=sig.root;
  if(isTrack(entry)){r.rotation.y=fr.rot;r.position.set(fr.x,fr.y,fr.z);}
  else{r.rotation.y=0;const has=trackType!=='none';
    if(onTrack&&has){r.position.set(fr.x,fr.y,g==='rail'?0:fr.z);}
    else r.position.set(g==='rail'&&has?-2.9:g==='crossing'?-3.7:0,0,0);}
  r.updateMatrixWorld(true);}
async function refreshTrack(){const tracked=isTrack(entry)||trackType!=='none';env.set({track:tracked,deck:trackType==='ballast'&&!isTrack(entry),group:sceneGroup(entry)});placeModel();await buildTrack();measure();if(showDims)buildDims();}

/* ---------- memory: 読み込み済みモデルは最大6件(iPhoneのメモリ対策) ---------- */
const isTrackId=id=>Object.values(TRACK_IDS).includes(id);
function trimCache(keep){const ids=[...cache.keys()].filter(id=>id!==keep&&!isTrackId(id));while(ids.length>5){const id=ids.shift(),m=cache.get(id);if(m&&m!==sig){m.dispose();cache.delete(id);}}
  const order=[...cache.keys()].filter(id=>id!==keep);}
/* ---------- loading / selecting ---------- */
async function select(id,instant=false){const e=catalog.find(x=>x.id===id)||catalog[0];if(!e)return;const token=++loadToken;
  $('spin').hidden=false;$('loading').style.display='none';
  try{let s=cache.get(e.id);if(!s||s.root.parent&&s!==sig&&false){s=await loadModel(`models/${e.file}`,e,{b64:V.b64});cache.set(e.id,s);}
    if(token!==loadToken)return;
    if(sig)scene.remove(sig.root);
    entry=e;sig=s;sig.glowK=env.glow;scene.add(sig.root);
    trackType=defaultTrack(e);onTrack=false;$('onTrack').checked=false;
    const self=isTrack(e);document.querySelectorAll('#trackSeg button').forEach(b=>b.classList.toggle('on',b.dataset.k===trackType));$('trackSeg').classList.toggle('off',self);$('onTrackSw').classList.toggle('off',self);
    clock=0;mode=entry.cycle?'auto':'manual';buildStates();buildOptions();
    if(entry.states&&entry.states.length){if(mode==='manual')sig.setState(entry.states[0].id,true);else sig.setState(cycleAt(entry.cycle,0).s,true);}
    applyDisplay();await refreshTrack();
    $('grp').textContent=e.path.map((_,i)=>catName(e.path.slice(0,i+1).join('/'))).join(' / ');$('mname').textContent=e.name;$('desc').textContent=e.desc;$('dims').textContent=e.dims||'';$('fid').textContent=e.dir;
    $('fSize').textContent=`${e.size[1].toFixed(2)} m`;$('fTris').textContent=`${(e.tris/1000).toFixed(e.tris>99999?0:1)}k`;$('fBytes').textContent=e.bytes<1048576*.95?`${Math.max(1,Math.round(e.bytes/1024))} KB`:`${(e.bytes/1048576).toFixed(1)} MB`;
    document.querySelectorAll('.item').forEach(b=>b.classList.toggle('sel',b.dataset.id===e.id));if(!LIB){openGroupOf(e);const it=document.querySelector(`.item[data-id="${e.id}"]`);if(it&&!THUMB)it.scrollIntoView({block:'nearest'});}
    storeSet('last',e.id);if(!THUMB&&location.hash.slice(1)!==e.id)history.replaceState(null,'','#'+e.id);
    userMoved=false;flyTo(q.get('view')||'all',instant||THUMB);uiSig='';$('spin').hidden=true;trimCache(e.id);
  }catch(err){console.error(err);$('spin').hidden=true;$('loading').style.display='grid';$('loading').textContent='読み込みに失敗しました: '+err.message;}}

/* ---------- camera ---------- */
function measure(){const b=new THREE.Box3().setFromObject(sig.root);boxInfo={box:b,center:b.getCenter(new THREE.Vector3()),size:b.getSize(new THREE.Vector3())};}
function viewPose(name){const {center:c,size:s}=boxInfo;const tf=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  const H=stage.clientHeight,Hv=Math.max(120,H-coverH()-54),k=H/Hv;   // 下のボタン列ぶんも避ける                    // シートに隠れない高さに収める
  const vFit=(s.y*.62)/tf*k*1.08,hFit=(Math.hypot(s.x,s.z)*.55)/(tf*camera.aspect);
  let dist=Math.max(vFit,hFit,.8);
  const dirs={all:[.55,.22,1],front:[0,.04,1],side:[1,.04,0],back:[0,.04,-1],top:[0,1,.001]};
  if(name==='lamp'&&entry.focus){const f=entry.focus,v=entry.view,r=sig.root.position;const tgt=new THREE.Vector3(r.x+f[0],f[1]+.1,r.z+f[2]);const k=camera.aspect<1?1.9:1;return {pos:tgt.clone().add(new THREE.Vector3(v[0]*k,v[1]*k,v[2]*k)),tgt};}
  const dir=new THREE.Vector3(...(dirs[name]||dirs.all)).normalize();const tgt=c.clone();if(name==='all')tgt.y=Math.min(c.y,s.y*.5);
  if(isTrack(entry)){dist=Math.max(s.y*3,3.2)*1.4*Math.max(1,1.2/camera.aspect);tgt.copy(c);tgt.x=entry.path[1]==='tram'?c.x:c.x;}
  return {pos:tgt.clone().add(dir.multiplyScalar(dist)),tgt};}
function applyQuality(q,save=true){if(!QUAL[q])return;quality=q;const c=Q();if(save)storeSet('quality',q);
  dprMax=Math.min(devicePixelRatio,c.dpr);dprNow=dprMax;renderer.setPixelRatio(dprNow);
  sun.shadow.mapSize.set(c.shadow,c.shadow);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
  for(const rt of[composer.renderTarget1,composer.renderTarget2]){rt.samples=c.samples;rt.dispose();}
  bloom.enabled=c.bloom;gtao.enabled=c.ao;resize();document.querySelectorAll('#qSeg button').forEach(b=>b.classList.toggle('on',b.dataset.q===q));}
document.querySelectorAll('#qSeg button').forEach(b=>b.addEventListener('click',()=>applyQuality(b.dataset.q)));
let curView='all';
function flyTo(name,instant){curView=name;const p=viewPose(name);document.querySelectorAll('#views button').forEach(b=>b.classList.toggle('on',b.dataset.v===name));
  if(instant){camera.position.copy(p.pos);controls.target.copy(p.tgt);tween=null;return;}
  tween={t:0,fp:camera.position.clone(),ft:controls.target.clone(),tp:p.pos,tt:p.tgt};}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
canvas.addEventListener('pointerdown',()=>{userMoved=true;tween=null;document.querySelectorAll('#views button').forEach(b=>b.classList.remove('on'));});
canvas.addEventListener('wheel',()=>{tween=null;},{passive:true});

/* ---------- display modes ---------- */
const clay=new THREE.MeshStandardMaterial({color:0xc9cdd0,roughness:.85,metalness:0});
function applyDisplay(){if(!sig)return;sig.root.traverse(o=>{if(!o.isMesh)return;if(!orig.has(o))orig.set(o,o.material);const m0=orig.get(o),isLamp=/^lamp[B]?_/.test(o.name);
  o.material=(disp==='clay'&&!isLamp)?clay:m0;for(const m of[].concat(o.material))m.wireframe=disp==='wire'&&!isLamp;});}
function label(text){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.fillStyle='#ffffffee';g.beginPath();g.roundRect(2,2,252,60,6);g.fill();g.strokeStyle='#0b4f9e';g.lineWidth=2;g.stroke();
  g.fillStyle='#0b4f9e';g.font='700 32px "Barlow Condensed",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,34);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.renderOrder=10;return s;}
function buildDims(){clearDims();const b=new THREE.Box3().setFromObject(sig.root),size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());
  dimGroup=new THREE.Group();const h=new THREE.Box3Helper(b,0x0b4f9e);h.material.depthTest=false;h.renderOrder=9;dimGroup.add(h);
  const u=Math.max(size.x,size.y,size.z)*.09;const mk=(t,x,y,z)=>{const s=label(t);s.scale.set(u*4,u,1);s.position.set(x,y,z);dimGroup.add(s);};
  mk(`H ${size.y.toFixed(2)} m`,b.max.x+u*1.5,center.y,b.max.z);mk(`W ${size.x.toFixed(2)} m`,center.x,b.min.y-u*.2,b.max.z+u*.4);mk(`D ${size.z.toFixed(2)} m`,b.max.x+u*1.5,b.min.y+u*.3,center.z);scene.add(dimGroup);}
function clearDims(){if(dimGroup){scene.remove(dimGroup);dimGroup=null;}}

/* ---------- controls wiring ---------- */
function toggleOn(id,on){$(id).classList.toggle('on',on);}
document.querySelectorAll('#views button').forEach(b=>b.addEventListener('click',()=>flyTo(b.dataset.v)));
document.querySelectorAll('#disp button').forEach(b=>b.addEventListener('click',()=>setDisp(b.dataset.d)));
function setDisp(d){disp=d;storeSet('disp',d);document.querySelectorAll('#disp button').forEach(x=>x.classList.toggle('on',x.dataset.d===d));applyDisplay();}
$('tDims').addEventListener('click',()=>{showDims=!showDims;toggleOn('tDims',showDims);showDims?buildDims():clearDims();});
$('tSpin').addEventListener('click',()=>{spin=!spin;toggleOn('tSpin',spin);controls.autoRotate=spin;});
document.querySelectorAll('#modes button').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.m)));
function setEnv(n){envName=n;storeSet('env',n);document.querySelectorAll('#envSeg button').forEach(x=>x.classList.toggle('on',x.dataset.e===n));env.set({mode:n,group:entry?sceneGroup(entry):'road'});
  if(sig)sig.glowK=env.glow;const out=n!=='studio';$('wetSw').classList.toggle('off',!out);
  $('title').classList.toggle('dark',n==='night'||n==='dusk');$('loading').classList.toggle('dark',n==='night'||n==='dusk');}
document.querySelectorAll('#envSeg button').forEach(b=>b.addEventListener('click',()=>setEnv(b.dataset.e)));
$('wet').addEventListener('change',e=>{wet=e.target.checked;env.set({wet});});
document.querySelectorAll('#trackSeg button').forEach(b=>b.addEventListener('click',async()=>{trackType=b.dataset.k;document.querySelectorAll('#trackSeg button').forEach(x=>x.classList.toggle('on',x===b));await refreshTrack();flyTo('all');}));
$('onTrack').addEventListener('change',async e=>{onTrack=e.target.checked;await refreshTrack();flyTo('all');});
$('speed').addEventListener('input',e=>{speed=+e.target.value;$('speedV').textContent=speed.toFixed(1)+'×';});
const idx=()=>catalog.findIndex(e=>e.id===entry.id);
const step=d=>select(catalog[(idx()+d+catalog.length)%catalog.length].id);
$('prev').addEventListener('click',()=>step(-1));$('next').addEventListener('click',()=>step(1));
function setTab(t){if(LIB)$('ctl').dataset.tab=t;else $('app').dataset.tab=t;document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===t));}
document.querySelectorAll('#tabs button').forEach(b=>b.addEventListener('click',()=>{setTab(b.dataset.t);if(sheetOn()&&SH<peekH()+40)setSheet(snaps()[1]);}));
/* ---------- bottom sheet (phone) ---------- */
const vh=()=>(window.visualViewport&&window.visualViewport.height)||innerHeight;
const peekH=()=>78,snaps=()=>[peekH(),Math.round((vh()-56)*.44),Math.round((vh()-56)*.82)];
function setSheet(h){userMoved=false;const prev=SH;SH=Math.max(peekH(),Math.min(h,snaps()[2]));const sh=$('sheet');document.documentElement.style.setProperty('--sh',SH+'px');if(sheetOn())sh.style.height=SH+'px';else sh.style.height='';applyView();storeSet('sheet',String(SH/Math.max(1,vh())));if(entry)requestAnimationFrame(()=>flyTo(curView||'all',true));}
(()=>{const g=$('grab');let y0=0,h0=0,drag=false,t0=0;
  g.addEventListener('pointerdown',e=>{drag=true;y0=e.clientY;h0=SH;t0=performance.now();g.setPointerCapture(e.pointerId);$('sheet').style.transition='none';});
  g.addEventListener('pointermove',e=>{if(!drag)return;SH=Math.max(peekH(),Math.min(h0+(y0-e.clientY),snaps()[2]));$('sheet').style.height=SH+'px';document.documentElement.style.setProperty('--sh',SH+'px');applyView();});
  const end=e=>{if(!drag)return;drag=false;$('sheet').style.transition='height .18s ease-out';const v=(y0-e.clientY)/Math.max(1,performance.now()-t0),sn=snaps();let tgt=h0+(y0-e.clientY)+v*120;
    tgt=sn.reduce((a,b)=>Math.abs(b-tgt)<Math.abs(a-tgt)?b:a);setSheet(tgt);setTimeout(()=>{$('sheet').style.transition='';},220);if(entry&&curView)setTimeout(()=>flyTo(curView),230);};
  g.addEventListener('pointerup',end);g.addEventListener('pointercancel',end);
  g.addEventListener('click',()=>{if(Math.abs(y0-0)>=0&&!drag&&SH<=peekH()+4)setSheet(snaps()[1]);});
  const init=()=>{const r=parseFloat(storeGet('sheet')||'');const sn=snaps();setSheet(isFinite(r)&&r>0?Math.max(sn[0],Math.min(sn[2],Math.round(r*vh()))):sn[1]);};
  init();addEventListener('resize',()=>{const r=SH/Math.max(1,vh());setTimeout(()=>setSheet(Math.round(r*vh())),50);});
  if(window.visualViewport)visualViewport.addEventListener('resize',()=>setSheet(SH));
  mqLand.addEventListener&&mqLand.addEventListener('change',()=>setSheet(SH));mqPhone.addEventListener&&mqPhone.addEventListener('change',()=>setSheet(SH));
})();
addEventListener('keydown',e=>{if(e.target.matches('input,textarea')||e.metaKey||e.ctrlKey||!entry)return;const k=e.key.toLowerCase();
  if(k==='arrowright')step(1);else if(k==='arrowleft')step(-1);else if(k==='a')setMode('auto');else if(k==='m')setMode('manual');else if(k==='n')setMode('night');
  else if(k==='w')setDisp(disp==='wire'?'shade':'wire');else if(k==='c')setDisp(disp==='clay'?'shade':'clay');
  else if('1234'.includes(k)&&k.length===1)setEnv(['studio','day','dusk','night'][+k-1]);});
addEventListener('keydown',e=>{if(e.target.matches('input,textarea')||e.metaKey||e.ctrlKey)return;if(e.key.toLowerCase()==='q')applyQuality(quality==='high'?'low':'high');});
addEventListener('keydown',e=>{if(LIB&&e.key==='Escape'&&view==='detail')showView('grid');});
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(!id||!catalog.some(e=>e.id===id))return;if(LIB&&view==='grid')openModel(id);else if(entry&&id!==entry.id)select(id);});

/* ---------- loop ---------- */
const clk=new THREE.Clock(),tmp=new THREE.Vector3(),LK={studio:.7,day:.5,dusk:4,night:7};
function frame(ts){requestAnimationFrame(frame);if(document.hidden||(LIB&&view==='grid'))return;
  if(ts-lastTs<Math.max(Q().gap,COARSE?14:0))return;lastTs=ts;                       // スマホは最大約50fpsに抑えて発熱・電池を節約
  const raw=clk.getDelta();const dt=Math.min(raw,.5),t=clk.elapsedTime;   // 極端に長い停止(タブ切替など)だけ打ち切る
  ema=ema*.94+Math.min(raw*1000,100)*.06;tAdapt+=raw;
  if(tAdapt>1.2){tAdapt=0;if(ema>30&&dprNow>Q().minDpr){dprNow=Math.max(Q().minDpr,dprNow-.25);renderer.setPixelRatio(dprNow);resize();}   // 重いときは解像度を自動で下げる
    else if(ema<18&&dprNow<dprMax){dprNow=Math.min(dprMax,dprNow+.25);renderer.setPixelRatio(dprNow);resize();}
    if(q.has('fps')){$('fps').style.display='block';$('fps').textContent=`${(1000/ema).toFixed(0)}fps · dpr ${dprNow}`;}}
  if(sig&&entry){let info=null;const has=entry.states&&entry.states.length;
    if(has){if(mode==='auto'&&entry.cycle){clock+=dt*speed;info=cycleAt(entry.cycle,clock);if(sig.stateId!==info.s)sig.setState(info.s);}
      sig.update(dt,t);
      const b=sig.brightest();if(b){b.meshes[0].getWorldPosition(tmp);plight.position.copy(tmp).add(new THREE.Vector3(0,0,.9));plight.color.copy(b.lit);plight.intensity=b.v*LK[envName];}else plight.intensity=0;
      const sg=mode+'|'+sig.stateId;if(sg!==uiSig){uiSig=sg;document.querySelectorAll('#modes button').forEach(x=>x.classList.toggle('on',x.dataset.m===mode));document.querySelectorAll('#states button').forEach(x=>x.classList.toggle('on',x.dataset.s===sig.stateId));}
      const segs=$('tl').children;const st=entry.states.find(s=>s.id===sig.stateId);
      if(info){for(let i=0;i<segs.length;i++)segs[i].classList.toggle('on',i===info.index);$('tlName').textContent=st?st.label:'';$('tlRem').textContent=info.rem.toFixed(1)+' s';}
      else{for(const s of segs)s.classList.remove('on');$('tlName').textContent=(mode==='night'?'夜間: ':'手動: ')+(st?st.label:'');$('tlRem').textContent='';}}
    else{plight.intensity=0;}}
  if(tween){tween.t=Math.min(1,tween.t+dt/.9);const e=ease(tween.t);camera.position.lerpVectors(tween.fp,tween.tp,e);controls.target.lerpVectors(tween.ft,tween.tt,e);if(tween.t>=1)tween=null;}
  controls.update();composer.render();}

/* ---------- boot ---------- */
let ALL=[];
(async()=>{
  let idxJson;try{idxJson=await (await fetch('models/index.json')).json();}catch(e){$('loading').textContent='models/index.json を読み込めません';return;}
  CATS=idxJson.categories;ALL=idxJson.models;catalog=V.root?ALL.filter(e=>e.path[0]===V.root):ALL;
  document.querySelectorAll('#qSeg button').forEach(b=>b.classList.toggle('on',b.dataset.q===quality));
  if(LIB)buildLibrary();else buildRail();setEnv(q.get('env')||storeGet('env')||'studio');
  if(THUMB){for(const id of['rail','ctl','tabs','tree'])$(id)&&($(id).style.display='none');const hd=document.querySelector('.hdr');if(hd)hd.style.display='none';$('bar').style.display='none';$('nav').style.display='none';$('title').style.display='none';const bk=$('back');if(bk)bk.style.display='none';
    const gl=$('gallery');if(gl)gl.style.display='none';const dt=$('detail');if(dt){dt.style.display='block';$('sheet').style.display='none';}$('app').dataset.view='detail';
    $('app').style.gridTemplateColumns='1fr';$('app').style.gridTemplateRows='1fr';const dt2=$('detail');if(dt2){dt2.style.gridRow='1';dt2.style.gridColumn='1';dt2.style.display='block';dt2.style.height='100%';}$('stage').style.height='100%';$('stage').style.gridColumn='1';$('stage').style.gridRow='1';}
  const want=location.hash.slice(1)||q.get('model');
  if(LIB&&!THUMB){view='grid';if(want&&catalog.some(e=>e.id===want))await openModel(want);}
  else{const start=want||storeGet('last')||catalog[0].id;if(LIB)view='detail';await select(catalog.some(e=>e.id===start)?start:catalog[0].id,true);}
  if(q.get('state')&&sig){mode='manual';sig.setState(q.get('state'),true);}
  if(q.get('opt')&&sig){for(const kv of q.get('opt').split(',')){const [a,b]=kv.split(':');sig.setOption(a,b);}buildOptions();}
  if(q.get('track')&&sig){trackType=q.get('track');await refreshTrack();flyTo(q.get('view')||'all',true);}
  if(q.get('ontrack')&&sig){onTrack=true;await refreshTrack();flyTo(q.get('view')||'all',true);}
  if(q.get('disp')||storeGet('disp'))setDisp(q.get('disp')||storeGet('disp'));
  frame();window.__ready=true;window.__api={showView,openModel,setSheet,snaps,setTab,select,setEnv,setMode,setDisp,flyTo,refreshTrack,get sig(){return sig;},camera,controls,get entry(){return entry;},get ALL(){return ALL;}};
})();
