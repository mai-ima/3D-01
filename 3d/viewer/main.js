import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {loadModel,cycleAt} from '../runtime/model-runtime.js';
import {createEnvironment} from './env.js';

const $=id=>document.getElementById(id);
const V=window.__VIEWER__||{root:null};
let CATS={};
const TRACK_IDS={ballast:'jp-track-ballast',slab:'jp-track-slab',tram:'jp-track-tram'};

/* ---------- renderer ---------- */
const canvas=$('gl'),stage=$('stage');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
const COARSE=matchMedia('(pointer:coarse)').matches||Math.min(innerWidth,innerHeight)<700;   // スマホ・タブレット: 描画負荷を下げる
renderer.setPixelRatio(Math.min(devicePixelRatio,COARSE?1.75:2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.05,800);camera.position.set(5,3,9);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=.35;controls.maxDistance=60;controls.maxPolarAngle=Math.PI/2-.01;controls.autoRotateSpeed=1.4;
const composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:COARSE?2:4}));
composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.25,.55,1.3);composer.addPass(bloom);composer.addPass(new OutputPass());
const sun=new THREE.DirectionalLight(0xffffff,2);sun.castShadow=true;sun.shadow.mapSize.set(COARSE?2048:4096,COARSE?2048:4096);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-7,near:1,far:140});sun.shadow.bias=-.0003;sun.shadow.normalBias=.02;sun.shadow.radius=3;
scene.add(sun,sun.target);
const plight=new THREE.PointLight(0xffffff,0,9,2);scene.add(plight);
const env=createEnvironment({scene,renderer,bloom,sun});
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(stage);resize();

/* ---------- state ---------- */
let catalog=[],entry=null,sig=null,mode='auto',speed=1,clock=0,envName='studio',wet=false,disp='shade',showDims=false,spin=false;
let trackType='none',onTrack=false;
const cache=new Map(),orig=new Map();let tween=null,loadToken=0,boxInfo=null,dimGroup=null,uiSig='',trackGroup=null;
const q=new URLSearchParams(location.search),THUMB=q.has('thumb');
const storeGet=k=>{try{return localStorage.getItem(k);}catch{return null;}};const storeSet=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};

/* ---------- classification ---------- */
const isTrack=e=>e.path[0]==='track';
function sceneGroup(e){const [a,b]=e.path;if(a==='track')return b==='tram'?'road':'rail';if(b==='rail')return 'rail';if(b==='crossing')return 'crossing';return 'road';}
function defaultTrack(e){const [a,b]=e.path;if(a==='track')return 'none';if(b==='tram')return 'tram';if(b==='rail'||b==='crossing')return 'ballast';return 'none';}
const trackFrame=g=>g==='rail'?{rot:0,x:0,z:0}:g==='crossing'?{rot:Math.PI/2,x:0,z:-6.2}:{rot:Math.PI/2,x:0,z:9};
const pathKey=e=>e.path.join('/');
const catName=k=>CATS[k]||k.split('/').pop();

/* ---------- catalog tree ---------- */
function buildRail(){const rail=$('rail');rail.innerHTML='';const tops=[...new Set(catalog.map(e=>e.path[0]))].sort((a,b)=>Object.keys(CATS).indexOf(a)-Object.keys(CATS).indexOf(b));
  for(const top of tops){const inTop=catalog.filter(e=>e.path[0]===top);
    if(!V.root){const h0=document.createElement('div');h0.className='gh0';h0.textContent=`${catName(top)}  ·  ${inTop.length}`;rail.appendChild(h0);}
    const order=Object.keys(CATS);const subs=[...new Set(inTop.map(pathKey))].sort((a,b)=>order.indexOf(a)-order.indexOf(b));
    for(const sk of subs){const items=inTop.filter(e=>pathKey(e)===sk);const h=document.createElement('div');h.className='gh';if(V.root)h.style.top='0';h.innerHTML=`<span>${catName(sk)}</span><span>${items.length}</span>`;rail.appendChild(h);
      for(const e of items){const b=document.createElement('button');b.className='item';b.dataset.id=e.id;
        b.innerHTML=`<span class="th" style="background-image:url('models/${e.thumb}')"></span><span><b>${e.name}</b><small>${e.id}</small></span>`;
        b.addEventListener('click',()=>{select(e.id);$('app').dataset.tab='ctl';});rail.appendChild(b);}}}
  $('count').textContent=`${catalog.length} MODELS · GLB`;}
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
async function getTrackModel(id){const e=catalog.find(x=>x.id===id)||ALL.find(x=>x.id===id);if(!e)return null;let m=cache.get(id);if(!m){m=await loadModel(`models/${e.file}`,e,{glow:false});cache.set(id,m);}return {m,e};}
async function buildTrack(){if(trackGroup){scene.remove(trackGroup);trackGroup=null;}const g=sceneGroup(entry);const fr=trackFrame(g);
  const self=isTrack(entry);let src=null;
  if(self){src={m:sig,e:entry};}else if(trackType!=='none'){src=await getTrackModel(TRACK_IDS[trackType]);}
  if(!src)return;const len=src.e.size[2];const n=Math.ceil(70/len/2);trackGroup=new THREE.Group();trackGroup.position.set(fr.x,0,fr.z);trackGroup.rotation.y=fr.rot;scene.add(trackGroup);
  for(let i=-n;i<=n;i++){if(self&&i===0)continue;const c=src.m.root.clone(true);c.position.z=i*len;c.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});trackGroup.add(c);}}
function placeModel(){const g=sceneGroup(entry),fr=trackFrame(g);const r=sig.root;
  if(isTrack(entry)){r.rotation.y=fr.rot;r.position.set(fr.x,0,fr.z);}
  else{r.rotation.y=0;const has=trackType!=='none';
    if(onTrack&&has){r.position.set(fr.x,0,fr.rot?fr.z:0);}
    else r.position.set(g==='rail'&&has?-2.9:g==='crossing'?-3.7:0,0,0);}
  r.updateMatrixWorld(true);}
async function refreshTrack(){const tracked=isTrack(entry)||trackType!=='none';env.set({track:tracked,deck:trackType==='ballast'&&!isTrack(entry),group:sceneGroup(entry)});placeModel();await buildTrack();measure();if(showDims)buildDims();}

/* ---------- loading / selecting ---------- */
async function select(id,instant=false){const e=catalog.find(x=>x.id===id)||catalog[0];if(!e)return;const token=++loadToken;
  $('loading').style.display='grid';$('loading').textContent='LOADING…';
  try{let s=cache.get(e.id);if(!s||s.root.parent&&s!==sig&&false){s=await loadModel(`models/${e.file}`,e);cache.set(e.id,s);}
    if(token!==loadToken)return;
    if(sig)scene.remove(sig.root);
    entry=e;sig=s;sig.glowK=env.glow;scene.add(sig.root);
    trackType=defaultTrack(e);onTrack=false;$('onTrack').checked=false;
    const self=isTrack(e);document.querySelectorAll('#trackSeg button').forEach(b=>b.classList.toggle('on',b.dataset.k===trackType));$('trackSeg').classList.toggle('off',self);$('onTrackSw').classList.toggle('off',self);
    clock=0;mode=entry.cycle?'auto':'manual';buildStates();buildOptions();
    if(entry.states&&entry.states.length){if(mode==='manual')sig.setState(entry.states[0].id,true);else sig.setState(cycleAt(entry.cycle,0).s,true);}
    applyDisplay();await refreshTrack();
    $('grp').textContent=e.path.map(catName).join(' / ');$('mname').textContent=e.name;$('desc').textContent=e.desc;$('dims').textContent=e.dims||'';$('fid').textContent=e.dir;
    $('fSize').textContent=`${e.size[1].toFixed(2)} m`;$('fTris').textContent=`${(e.tris/1000).toFixed(e.tris>99999?0:1)}k`;$('fBytes').textContent=`${(e.bytes/1048576).toFixed(1)} MB`;
    document.querySelectorAll('.item').forEach(b=>b.classList.toggle('sel',b.dataset.id===e.id));const it=document.querySelector(`.item[data-id="${e.id}"]`);if(it&&!THUMB)it.scrollIntoView({block:'nearest'});
    storeSet('last',e.id);if(!THUMB&&location.hash.slice(1)!==e.id)history.replaceState(null,'','#'+e.id);
    flyTo(q.get('view')||'all',instant||THUMB);uiSig='';$('loading').style.display='none';
  }catch(err){console.error(err);$('loading').textContent='読み込みに失敗しました: '+err.message;}}

/* ---------- camera ---------- */
function measure(){const b=new THREE.Box3().setFromObject(sig.root);boxInfo={box:b,center:b.getCenter(new THREE.Vector3()),size:b.getSize(new THREE.Vector3())};}
function viewPose(name){const {center:c,size:s}=boxInfo,d=Math.max(s.x,s.y,s.z);const fov=THREE.MathUtils.degToRad(camera.fov/2);
  let dist=(d*.62)/Math.tan(fov)*1.12;dist*=Math.max(1,1.15/camera.aspect);
  const dirs={all:[.55,.22,1],front:[0,.04,1],side:[1,.04,0],back:[0,.04,-1],top:[0,1,.001]};
  if(name==='lamp'&&entry.focus){const f=entry.focus,v=entry.view,r=sig.root.position;const tgt=new THREE.Vector3(r.x+f[0],f[1]+.1,r.z+f[2]);const k=camera.aspect<1?1.9:1;return {pos:tgt.clone().add(new THREE.Vector3(v[0]*k,v[1]*k,v[2]*k)),tgt};}
  const dir=new THREE.Vector3(...(dirs[name]||dirs.all)).normalize();const tgt=c.clone();if(name==='all')tgt.y=Math.min(c.y,s.y*.5);
  if(isTrack(entry)){dist=Math.max(s.y*3,3.2)*1.4*Math.max(1,1.2/camera.aspect);tgt.copy(c);tgt.x=entry.path[1]==='tram'?c.x:c.x;}
  return {pos:tgt.clone().add(dir.multiplyScalar(dist)),tgt};}
function flyTo(name,instant){const p=viewPose(name);document.querySelectorAll('#views button').forEach(b=>b.classList.toggle('on',b.dataset.v===name));
  if(instant){camera.position.copy(p.pos);controls.target.copy(p.tgt);tween=null;return;}
  tween={t:0,fp:camera.position.clone(),ft:controls.target.clone(),tp:p.pos,tt:p.tgt};}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
canvas.addEventListener('pointerdown',()=>{tween=null;document.querySelectorAll('#views button').forEach(b=>b.classList.remove('on'));});
canvas.addEventListener('wheel',()=>{tween=null;},{passive:true});

/* ---------- display modes ---------- */
const clay=new THREE.MeshStandardMaterial({color:0xc9cdd0,roughness:.85,metalness:0});
function applyDisplay(){if(!sig)return;sig.root.traverse(o=>{if(!o.isMesh)return;if(!orig.has(o))orig.set(o,o.material);const m0=orig.get(o),isLamp=/^lamp[B]?_/.test(o.name);
  o.material=(disp==='clay'&&!isLamp)?clay:m0;for(const m of[].concat(o.material))m.wireframe=disp==='wire'&&!isLamp;});}
function label(text){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.fillStyle='#0b0e11e6';g.beginPath();g.roundRect(2,2,252,60,10);g.fill();g.strokeStyle='#f2b01e';g.lineWidth=2;g.stroke();
  g.fillStyle='#fff';g.font='600 30px "IBM Plex Mono",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,34);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.renderOrder=10;return s;}
function buildDims(){clearDims();const b=new THREE.Box3().setFromObject(sig.root),size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());
  dimGroup=new THREE.Group();const h=new THREE.Box3Helper(b,0xf2b01e);h.material.depthTest=false;h.renderOrder=9;dimGroup.add(h);
  const u=Math.max(size.x,size.y,size.z)*.09;const mk=(t,x,y,z)=>{const s=label(t);s.scale.set(u*4,u,1);s.position.set(x,y,z);dimGroup.add(s);};
  mk(`H ${size.y.toFixed(2)} m`,b.max.x+u*1.5,center.y,b.max.z);mk(`W ${size.x.toFixed(2)} m`,center.x,b.min.y-u*.2,b.max.z+u*.4);mk(`D ${size.z.toFixed(2)} m`,b.max.x+u*1.5,b.min.y+u*.3,center.z);scene.add(dimGroup);}
function clearDims(){if(dimGroup){scene.remove(dimGroup);dimGroup=null;}}

/* ---------- controls wiring ---------- */
function toggleOn(id,on){$(id).classList.toggle('on',on);}
document.querySelectorAll('#views button').forEach(b=>b.addEventListener('click',()=>flyTo(b.dataset.v)));
document.querySelectorAll('#disp button').forEach(b=>b.addEventListener('click',()=>setDisp(b.dataset.d)));
function setDisp(d){disp=d;document.querySelectorAll('#disp button').forEach(x=>x.classList.toggle('on',x.dataset.d===d));applyDisplay();}
$('tDims').addEventListener('click',()=>{showDims=!showDims;toggleOn('tDims',showDims);showDims?buildDims():clearDims();});
$('tSpin').addEventListener('click',()=>{spin=!spin;toggleOn('tSpin',spin);controls.autoRotate=spin;});
document.querySelectorAll('#modes button').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.m)));
function setEnv(n){envName=n;document.querySelectorAll('#envSeg button').forEach(x=>x.classList.toggle('on',x.dataset.e===n));env.set({mode:n,group:entry?sceneGroup(entry):'road'});
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
document.querySelectorAll('#tabs button').forEach(b=>b.addEventListener('click',()=>{$('app').dataset.tab=b.dataset.t;document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x===b));}));
addEventListener('keydown',e=>{if(e.target.matches('input,textarea')||e.metaKey||e.ctrlKey||!entry)return;const k=e.key.toLowerCase();
  if(k==='arrowright')step(1);else if(k==='arrowleft')step(-1);else if(k==='a')setMode('auto');else if(k==='m')setMode('manual');else if(k==='n')setMode('night');
  else if(k==='w')setDisp(disp==='wire'?'shade':'wire');else if(k==='c')setDisp(disp==='clay'?'shade':'clay');
  else if('1234'.includes(k)&&k.length===1)setEnv(['studio','day','dusk','night'][+k-1]);});
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(entry&&id&&id!==entry.id&&catalog.some(e=>e.id===id))select(id);});

/* ---------- loop ---------- */
const clk=new THREE.Clock(),tmp=new THREE.Vector3(),LK={studio:.7,day:.5,dusk:4,night:7};
function frame(){requestAnimationFrame(frame);const dt=Math.min(clk.getDelta(),.1),t=clk.elapsedTime;
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
  buildRail();setEnv(q.get('env')||'studio');
  if(THUMB){for(const id of['rail','ctl','tabs'])$(id)&&($(id).style.display='none');document.querySelector('header').style.display='none';$('bar').style.display='none';$('nav').style.display='none';$('title').style.display='none';
    $('app').style.gridTemplateColumns='1fr';$('app').style.gridTemplateRows='1fr';}
  const start=location.hash.slice(1)||q.get('model')||storeGet('last')||catalog[0].id;
  await select(catalog.some(e=>e.id===start)?start:catalog[0].id,true);
  if(q.get('state')&&sig){mode='manual';sig.setState(q.get('state'),true);}
  if(q.get('opt')){for(const kv of q.get('opt').split(',')){const [a,b]=kv.split(':');sig.setOption(a,b);}buildOptions();}
  if(q.get('track')){trackType=q.get('track');await refreshTrack();flyTo(q.get('view')||'all',true);}
  if(q.get('ontrack')){onTrack=true;await refreshTrack();flyTo(q.get('view')||'all',true);}
  if(q.get('disp'))setDisp(q.get('disp'));
  frame();window.__ready=true;window.__api={select,setEnv,setMode,setDisp,flyTo,refreshTrack,get sig(){return sig;},camera,controls,get entry(){return entry;},get ALL(){return ALL;}};
})();
