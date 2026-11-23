// ビューアの背景・地面・照明(スタジオ / 昼 / 夕方 / 夜、地面は道路・路面電車・鉄道・踏切)
import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const tex=(c,rep,srgb=true)=>{const t=new THREE.CanvasTexture(c);t.anisotropy=16;if(srgb)t.colorSpace=THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;};
function noise(size,base,n,spread=210){const c=cv(size,size),g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,size,size);
  for(let i=0;i<n;i++){const v=Math.random()*spread|0;g.fillStyle=`rgba(${v},${v},${v},${Math.random()*.5+.1})`;g.beginPath();g.arc(Math.random()*size,Math.random()*size,Math.random()*1.6+.4,0,7);g.fill();}return c;}
const mesh=(p,geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.receiveShadow=true;p.add(m);return m;};
const plane=(p,w,d,mat,x,y,z,ry=0)=>{const m=mesh(p,new THREE.PlaneGeometry(w,d),mat,x,y,z);m.rotation.x=-Math.PI/2;m.rotation.z=ry;return m;};

export const PRESET={
  day:{elev:42,az:.55,turb:3,ray:1.1,mie:.004,exp:.5,sunI:3.2,sunC:0xfff1dc,env:.8,fog:0xc4d3e2,win:0,bloomS:.28,bloomT:1.5,glow:.2,hemi:0},
  dusk:{elev:3,az:.9,turb:9,ray:2.4,mie:.012,exp:.5,sunI:1.8,sunC:0xff9a58,env:.7,fog:0x8d7f98,win:.4,bloomS:.5,bloomT:1.0,glow:.4,hemi:.18},
  night:{elev:-9,az:.9,turb:6,ray:1,mie:.003,exp:1.0,sunI:.7,sunC:0x86a0e0,env:.8,fog:0x0b1020,win:.45,bloomS:.7,bloomT:.85,glow:.55,hemi:.55},
  studio:{exp:.72,env:.7,bloomS:.22,bloomT:1.3,glow:.16,hemi:0},
};

/** 実写のPBR素材(Poly Haven・CC0)を、拡散・法線・粗さ・AOとして材質へ割り当てる。読み込めなければ何もしない(手描きの素材のまま) */
const _tl=new THREE.TextureLoader();
export function applyPBR(mat,dir,rep,{normal=1,rough=true,ao=true,color=true}={}){
  const ld=(f,srgb)=>new Promise(res=>_tl.load(dir+'/'+f,t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.anisotropy=16;if(srgb)t.colorSpace=THREE.SRGBColorSpace;res(t);},undefined,()=>res(null)));
  return Promise.all([ld('diff.jpg',true),ld('nor.jpg',false),ld('rough.jpg',false),ld('ao.jpg',false)]).then(([d,n,r,a])=>{
    if(d&&color){mat.map=d;mat.color.set(0xffffff);}if(n){mat.normalMap=n;mat.normalScale=new THREE.Vector2(normal,normal);mat.bumpMap=null;}
    if(r&&rough){mat.roughnessMap=r;mat.roughness=1;}if(a&&ao){mat.aoMap=a;mat.aoMapIntensity=.8;}mat.needsUpdate=true;return !!d;});}
export function createEnvironment({scene,renderer,bloom,sun}){
  const root=new THREE.Group();scene.add(root);
  const hemi=new THREE.HemisphereLight(0x6f86c4,0x2a2622,0);scene.add(hemi);
  const pmrem=new THREE.PMREMGenerator(renderer);let envRT=null;
  const sky=new Sky();sky.scale.setScalar(1000);const skyScene=new THREE.Scene();skyScene.add(sky);
  const roomEnv=pmrem.fromScene(new RoomEnvironment(),.04).texture;
  // studio background gradient
  const gc=cv(4,256),gg=gc.getContext('2d'),gr=gg.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#aab0b6');gr.addColorStop(1,'#80878e');gg.fillStyle=gr;gg.fillRect(0,0,4,256);
  const studioBg=new THREE.CanvasTexture(gc);studioBg.colorSpace=THREE.SRGBColorSpace;

  /* --- materials --- */
  const asphaltC=noise(1024,'#3b3d40',40000);{const g=asphaltC.getContext('2d');for(let i=0;i<2200;i++){g.fillStyle=`rgba(${150+Math.random()*80|0},${150+Math.random()*80|0},${150+Math.random()*80|0},.5)`;g.beginPath();g.arc(Math.random()*1024,Math.random()*1024,Math.random()*2.2+.8,0,7);g.fill();}}
  const roadMat=new THREE.MeshPhysicalMaterial({map:tex(asphaltC,[30,30]),bumpMap:tex(asphaltC,[30,30],false),bumpScale:1.6,roughness:.92,color:0xd2d2d2});
  const pc=cv(512,512),pg=pc.getContext('2d');pg.fillStyle='#74757a';pg.fillRect(0,0,512,512);for(let i=0;i<30000;i++){const v=100+Math.random()*90|0;pg.fillStyle=`rgba(${v},${v},${v+3},.35)`;pg.fillRect(Math.random()*512,Math.random()*512,2,2);}
  pg.strokeStyle='#4d4f53';pg.lineWidth=4;for(const p of[0,256,512]){pg.beginPath();pg.moveTo(p,0);pg.lineTo(p,512);pg.stroke();pg.beginPath();pg.moveTo(0,p);pg.lineTo(512,p);pg.stroke();}
  const walkMat=new THREE.MeshStandardMaterial({map:tex(pc,[40,6]),bumpMap:tex(pc,[40,6],false),bumpScale:2,roughness:.85});
  const concrete=new THREE.MeshStandardMaterial({color:0xa4a5a8,roughness:.8});
  /* 実写のPBR素材(3d/assets/textures)。素材1枚が約2〜3m四方に見える繰り返し回数にする */
  const AS='assets/textures';                       // ビューアと同じ階層の assets/ から読む(ビルドが 3d/assets をコピーする)
  applyPBR(roadMat,AS+'/asphalt',[26,26],{normal:.9,ao:false});
  applyPBR(walkMat,AS+'/pavers',[34,5],{normal:1.0,ao:false}).then(()=>{walkMat.color.set(0xd6d6d6);});   // 実写の素材は暗めなので、明るさを補正
  applyPBR(concrete,AS+'/concrete',[30,.5],{normal:.7,ao:false});
  const paint=new THREE.MeshStandardMaterial({color:0xe9e9e4,roughness:.7,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const paintY=paint.clone();paintY.color.set(0xe3b81a);
  const steel=new THREE.MeshStandardMaterial({color:0x8a8f93,roughness:.35,metalness:.9});
  const rust=new THREE.MeshStandardMaterial({color:0x6c4a3a,roughness:.6,metalness:.7});
  const tc=cv(256,256),tg=tc.getContext('2d');tg.fillStyle='#d9ae1c';tg.fillRect(0,0,256,256);
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){const x=26+i*51,y=26+j*51,g2=tg.createRadialGradient(x-4,y-4,1,x,y,14);g2.addColorStop(0,'#f6d34d');g2.addColorStop(1,'#a8820d');tg.fillStyle=g2;tg.beginPath();tg.arc(x,y,13,0,7);tg.fill();}
  const tenMat=new THREE.MeshStandardMaterial({map:tex(tc,[80,1]),bumpMap:tex(tc,[80,1],false),bumpScale:3,roughness:.6});
  const bc=noise(512,'#6d6a66',30000,230);const ballastMat=new THREE.MeshStandardMaterial({map:tex(bc,[6,30]),bumpMap:tex(bc,[6,30],false),bumpScale:4,roughness:1});
  const grassC=noise(512,'#4a5b34',20000,170);const grassMat=new THREE.MeshStandardMaterial({map:tex(grassC,[20,20]),roughness:1});
  const sleeperMat=new THREE.MeshStandardMaterial({color:0x8d8a84,roughness:.9});

  /* --- grounds --- */
  const G={};
  G.studio=new THREE.Group();{const rc=cv(256,256),rg=rc.getContext('2d'),gr2=rg.createRadialGradient(128,128,20,128,128,128);gr2.addColorStop(0,'#fff');gr2.addColorStop(.45,'#fff');gr2.addColorStop(1,'#000');rg.fillStyle=gr2;rg.fillRect(0,0,256,256);
    const am=new THREE.CanvasTexture(rc);const f=mesh(G.studio,new THREE.CircleGeometry(16,96),new THREE.MeshStandardMaterial({color:0x8a9097,roughness:.8,transparent:true,alphaMap:am,depthWrite:false}),0,0,0);f.rotation.x=-Math.PI/2;f.renderOrder=-1;}
  // 道路: 歩道(縁石・点字ブロック)+車道+横断歩道+車線。cwx=横断歩道の位置
  function makeRoad(cwx){const g=new THREE.Group();
    mesh(g,new THREE.BoxGeometry(120,.15,10),walkMat,0,-.075,-2.7);mesh(g,new THREE.BoxGeometry(120,.17,.26),concrete,0,-.065,2.33);
    plane(g,120,.3,tenMat,0,.004,1.9);const rd=plane(g,120,60,roadMat,0,-.15,32.4);G.roadMat=roadMat;
    const mk=new THREE.Group();g.add(mk);g.userData.mk=mk;   // 軌道を敷くときは隠す路面標示
    for(let i=0;i<10;i++)plane(mk,3.6,.45,paint,cwx,-.146,3.4+i*.9);          // 横断歩道(車道を横切る向き)
    plane(g,120,.15,paint,0,-.146,2.9);plane(mk,120,.15,paint,0,-.146,9.9);   // 外側線
    for(let i=-12;i<12;i++)plane(mk,3,.15,paint,i*5+1,-.146,6.4);              // 中央線(破線)
    return g;}
  G.road=makeRoad(8);                       // 車道がX方向(歩行者用の確認用: 灯器は車道側=+Zを向く)
  G.roadZ=makeRoad(-8);G.roadZ.rotation.y=Math.PI/2;   // 車道がZ方向(車両用: 車は+Zから来て灯器は+Zを向く。アームは+X=車道上へ伸びる)
  G.rail=new THREE.Group();{const g=G.rail;plane(g,1400,1400,grassMat,0,-.42,0);plane(g,2.4,160,ballastMat,-3.9,-.4,0);plane(g,2.4,160,ballastMat,3.9,-.4,0);}
  G.crossing=new THREE.Group();{const g=G.crossing;plane(g,1400,1400,grassMat,0,-.42,0);
    const rm=roadMat;G.crossMat=rm;
    plane(g,7.2,153,rm,0,0,8.5);
    plane(g,.14,100,paint,-3.35,.003,35);plane(g,.14,100,paint,3.35,.003,35);for(let i=0;i<14;i++)plane(g,.14,2.2,paint,0,.003,i*5+1);
    G.deck=new THREE.Group();g.add(G.deck);mesh(G.deck,new THREE.BoxGeometry(7.2,.195,5.4),new THREE.MeshStandardMaterial({color:0x8d8f90,roughness:.92}),0,.0975-.2,-6.2).position.y=.0975;
    G.deck.visible=false;}
  G.base=new THREE.Group();{plane(G.base,1400,1400,new THREE.MeshStandardMaterial({color:0x5a5f64,roughness:1}),0,-.165,0);}   // 遠景ビルの足元(地面の端が見えないように)
  // 遠景(スカイライン)
  G.skyline=new THREE.Group();{const fc=cv(512,512),g=fc.getContext('2d'),ec=cv(512,512),ge=ec.getContext('2d');g.fillStyle='#5d6872';g.fillRect(0,0,512,512);ge.fillStyle='#000';ge.fillRect(0,0,512,512);
    for(let y=0;y<14;y++)for(let x=0;x<16;x++){const px=x*32,py=y*36,v=Math.random();g.fillStyle=`hsl(${205+Math.random()*16},${12+Math.random()*10}%,${30+v*22}%)`;g.fillRect(px+2,py+3,28,26);g.fillStyle='rgba(255,255,255,.16)';g.fillRect(px+2,py+3,28,3);
      if(Math.random()<.38){ge.globalAlpha=.5+Math.random()*.5;ge.fillStyle=['#ffd9a0','#ffe8c2','#bcd6ff'][Math.random()*3|0];ge.fillRect(px+3,py+4,26,24);ge.globalAlpha=1;}}
    const fm=tex(fc),em=tex(ec);fm.wrapS=fm.wrapT=em.wrapS=em.wrapT=THREE.RepeatWrapping;G.winMats=[];let s=11;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
    for(let x=-260;x<260;x+=24+rnd()*18){if(Math.abs(x)<26)continue;const w=14+rnd()*16,h=24+rnd()*70,d=22,zz=-70-rnd()*50;
      const geo=new THREE.BoxGeometry(w,h,d);const uv=geo.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k)*w/15,uv.getY(k)*h/24);
      const m=new THREE.MeshStandardMaterial({map:fm,emissiveMap:em,emissive:0xffffff,emissiveIntensity:0,roughness:.4,metalness:.3,color:new THREE.Color().setHSL(.58,.05,.55+rnd()*.3)});G.winMats.push(m);
      const b=mesh(G.skyline,geo,m,x,h/2,zz);b.receiveShadow=false;}}
  const SCENES=['studio','road','roadZ','rail','crossing','skyline','base'];      // シーン構成要素の一覧(表示切替の対象)
  for(const k of SCENES){G[k].visible=false;root.add(G[k]);}

  /* --- state --- */
  const cur={mode:'studio',group:'road',wet:false,track:false,deck:false};
  const skyCache={};
  function skyEnv(p,key){if(skyCache[key])return skyCache[key];const u=sky.material.uniforms;u.turbidity.value=p.turb;u.rayleigh.value=p.ray;u.mieCoefficient.value=p.mie;u.mieDirectionalG.value=.8;
    const sd=new THREE.Vector3().setFromSphericalCoords(1,Math.PI/2-THREE.MathUtils.degToRad(p.elev),p.az);u.sunPosition.value.copy(sd);
    const ld=p.elev>0?sd:new THREE.Vector3().setFromSphericalCoords(1,Math.PI/2-.7,.6);
    envRT=pmrem.fromScene(skyScene);return (skyCache[key]={ld,tex:envRT.texture});}
  function groundFor(group){return group==='rail'?'rail':group==='crossing'?'crossing':group==='roadZ'?'roadZ':'road';}
  function apply(){const {mode,group,wet}=cur,p=PRESET[mode];
    for(const k of SCENES)G[k].visible=false;
    const out=mode!=='studio';
    if(!out){G.studio.visible=true;G.studio.position.y=cur.track?-.42:0;scene.environment=roomEnv;scene.background=studioBg;scene.fog=null;scene.environmentIntensity=p.env;scene.backgroundIntensity=1;
      sun.position.set(5,9,7);sun.color.set(0xfff4e6);sun.intensity=2.2;hemi.intensity=0;}
    else{const e=skyEnv(p,mode);scene.environment=e.tex;scene.background=e.tex;scene.environmentIntensity=p.env;scene.backgroundIntensity=mode==='night'?.8:1;
      scene.fog=new THREE.Fog(p.fog,70,420);
      sun.position.copy(e.ld).multiplyScalar(40);sun.color.set(p.sunC);sun.intensity=p.sunI;hemi.intensity=p.hemi;
      G[groundFor(group)].visible=true;G.skyline.visible=true;G.base.visible=true;G.roadZ.userData.mk.visible=!(cur.track&&group==='roadZ');for(const m of G.winMats)m.emissiveIntensity=p.win;
      G.deck.visible=cur.deck&&group==='crossing';const w=wet;
      for(const m of[G.roadMat,G.crossMat]){if(!m)continue;
        if(m.roughnessMap){m.roughness=w?.35:1;m.color.set(w?0x9a9aa0:0xffffff);}                   // 実写の粗さマップに倍率をかける(濡れると小さく)
        else{m.roughness=w?.3:.92;m.color.set(w?0x8a8a90:0xd2d2d2);}
        m.envMapIntensity=w?1.5:.6;if(m.normalMap)m.normalScale.setScalar(w?.45:.9);else m.bumpScale=w?.5:1.6;}}
    renderer.toneMappingExposure=p.exp;bloom.strength=p.bloomS;bloom.threshold=p.bloomT;}
  return {
    set(o){Object.assign(cur,o);apply();},
    get glow(){return PRESET[cur.mode].glow;},get cur(){return cur;},
    /** モデルを置く位置(地面に合わせる) */
    
    isOutdoor(){return cur.mode!=='studio';},
  };
}
