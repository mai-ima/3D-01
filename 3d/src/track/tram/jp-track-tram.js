import {THREE,add,roundBox,tex} from '../../kit/index.js';
import {TM,settsTexture,asphaltTex} from '../../kit/track-parts.js';
const LEN=10,GAUGE=1.435;
const girder=(sign)=>{const P=[[-.075,-.18],[.075,-.18],[.075,-.16],[.016,-.14],[.016,-.085],[.055,-.075],[.055,-.012],[.032,-.012],[.032,-.045],[0,-.045],[0,0],[-.05,0],[-.055,-.01],[-.055,-.075],[-.016,-.085],[-.016,-.14],[-.075,-.16]];
  const q=sign>0?P:P.map(([x,y])=>[-x,y]).reverse();const s=new THREE.Shape();q.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;};
export default {id:'jp-track-tram',name:'併用軌道(路面電車・溝付きレール・敷石舗装)',
  desc:'道路に埋め込まれた路面電車の軌道。フランジウェイ(溝)付きのガーダーレールと御影石の敷石舗装、両側はアスファルト。広島電鉄などの標準軌1435mm。',
  dims:'軌間1435mm / 長さ10m / 幅5.0m',options:[],
  build(){const root=new THREE.Group(),L={};
    const setts=settsTexture();const sm=(rx,rz)=>{const t=setts.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,rz);t.userData.mimeType='image/jpeg';return new THREE.MeshStandardMaterial({map:t,roughness:.85});};
    const asp=new THREE.MeshStandardMaterial({map:asphaltTex([1,4]),roughness:.95});
    const strip=(x0,x1,m,rep)=>{const w=x1-x0;const g=new THREE.PlaneGeometry(w,LEN);g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/1.0,uv.getY(i)*LEN/1.0);add(root,g,m,(x0+x1)/2,-.003,0);};
    const half=GAUGE/2,rw=.055;
    strip(-1.9,-half-rw,sm(1,1),0);strip(-half+rw,half-rw,sm(1,1),0);strip(half+rw,1.9,sm(1,1),0);strip(-2.5,-1.9,asp);strip(1.9,2.5,asp);
    add(root,new THREE.BoxGeometry(5.0,.3,LEN),new THREE.MeshStandardMaterial({color:0x8a8a86,roughness:.95}),0,-.153,0);       // 路盤
    for(const sx of[-1,1]){const g=new THREE.ExtrudeGeometry(girder(-sx),{depth:LEN,bevelEnabled:false});g.translate(0,0,-LEN/2);add(root,g,TM.rail,sx*half,0,0);
      add(root,new THREE.BoxGeometry(.028,.0025,LEN),TM.railTop,sx*half+sx*.026,.0005,0);}
    for(let i=0;i<LEN/1.5;i++)for(const sx of[-1,1])add(root,roundBox(.17,.012,.05,.004,.002),TM.fastener,sx*half,-.17,-LEN/2+.75+i*1.5);   // 軌間保持
    return {root,lamps:L};}};
