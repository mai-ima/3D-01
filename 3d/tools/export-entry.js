// ブラウザ内で実行: 登録された全モデルを組み立てて GLB(バイナリ)に変換する
import {MODELS} from '../src/registry.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {THREE,DIRT,config} from '../src/kit/index.js';
DIRT.userData.mimeType='image/jpeg';
const b64=buf=>{let s='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);};
window.listIds=()=>MODELS.map(m=>m.def.id);
window.exportOne=async(id)=>{
  const {path,def}=MODELS.find(m=>m.def.id===id);config.sprites=false;
  const {root,lamps}=def.build();root.name=id;
  // 消灯状態で出力。点灯色は userData.litColor に保持(ランタイム側で復元)
  for(const [k,L] of Object.entries(lamps)){for(const m of[L.mat,L.matB]){if(!m)continue;m.userData={lamp:k,litColor:'#'+L.color.e.toString(16).padStart(6,'0'),litIntensity:3.4};m.emissive.set(0x000000);m.emissiveIntensity=1;}}
  let tris=0;root.traverse(o=>{if(o.isMesh){if(!o.geometry.index)o.geometry=mergeVertices(o.geometry,1e-5);const g=o.geometry;tris+=((g.index?g.index.count:g.attributes.position.count)/3)*(o.isInstancedMesh?o.count:1);
    for(const m of[].concat(o.material))m.bumpMap=null;}});
  root.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(root);
  const scene=new THREE.Scene();scene.add(root);
  const buf=await new Promise((res,rej)=>new GLTFExporter().parse(scene,res,rej,{binary:true,onlyVisible:false,maxTextureSize:1024}));
  const {build,...meta}=def;
  const lampInfo=Object.entries(lamps).map(([k,L])=>({key:k,color:L.color.hex,lit:'#'+L.color.e.toString(16).padStart(6,'0')}));
  return {path,meta:{...meta,path,lamps:lampInfo,tris:Math.round(tris),size:bb.getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(2))},b64:b64(buf)};
};
window.__ready=true;
