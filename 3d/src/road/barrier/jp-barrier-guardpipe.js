import {THREE,RM,add,bar,opt,optChoice,optToggle}from '../../kit/road-parts.js';
// ガードパイプ(横断防止柵): 黒い逆U字の鋼管を並べた歩行者用の柵。路肩や歩道の端で見られる(実物写真を参考)
const U=1.0,H=.9,N=4;
function tubeU(r){const c=new THREE.CurvePath();const R=.14;
  c.add(new THREE.LineCurve3(new THREE.Vector3(-U/2,0,0),new THREE.Vector3(-U/2,H-R,0)));c.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-U/2,H-R,0),new THREE.Vector3(-U/2,H,0),new THREE.Vector3(-U/2+R,H,0)));
  c.add(new THREE.LineCurve3(new THREE.Vector3(-U/2+R,H,0),new THREE.Vector3(U/2-R,H,0)));c.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(U/2-R,H,0),new THREE.Vector3(U/2,H,0),new THREE.Vector3(U/2,H-R,0)));
  c.add(new THREE.LineCurve3(new THREE.Vector3(U/2,H-R,0),new THREE.Vector3(U/2,0,0)));return new THREE.TubeGeometry(c,96,r,16,false);}
export default {id:'jp-barrier-guardpipe',name:'ガードパイプ(横断防止柵)',
  desc:'黒い逆U字の鋼管を並べた、歩行者用の柵。路肩や歩道の端で、横断を防ぐために使われる。色(黒・白・亜鉛めっき)を選べ、反射材を付けられる。',
  dims:'1スパン 約1.0m / 高さ 約0.9m / 鋼管φ60.5(代表値)',focus:[0,.6,0],view:[2.4,.7,5],
  options:[optChoice('color','色',[['black','黒'],['white','白'],['zinc','亜鉛めっき']],'black'),optToggle('reflector','反射材','on')],
  build(){const root=new THREE.Group();
    for(const [id,m] of[['black',RM.black],['white',RM.white],['zinc',RM.zinc]]){const o=opt(root,'color',id);
      for(let i=0;i<N;i++){const x=(i-(N-1)/2)*U;const u=new THREE.Mesh(tubeU(.0302),m);u.position.x=x;o.add(u);const m2=add(o,new THREE.CylinderGeometry(.0302,.0302,U-.0,32),m,x,H*.5,0);m2.rotation.z=Math.PI/2;
        for(const sx of[-U/2,U/2])add(o,new THREE.CylinderGeometry(.045,.045,.01,32),m,x+sx,.005,0);}
      for(let i=0;i<N-1;i++){const x=(i-(N-1)/2)*U+U/2;add(o,new THREE.BoxGeometry(.05,.05,.05),m,x,.9*.5,0).visible=false;}}
    const rf=opt(root,'reflector','on');for(let i=0;i<N;i++){const x=(i-(N-1)/2)*U;add(rf,new THREE.BoxGeometry(.2,.036,.006),RM.reflWhite,x,H,.036);}
    return {root,lamps:{}};}};
