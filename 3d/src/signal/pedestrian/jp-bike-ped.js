import {HG,POLE_H,SPED,THREE,bikeTexture,optBody,optToggle,pedHousing,setBody} from '../../kit/signal-parts.js';
export default {id:'jp-bike-ped',group:'road-ped',name:'自転車・歩行者用灯器',
  desc:'自転車横断帯のある横断歩道などで使う灯器。自転車の図柄が赤(止まれ)と青(進め)で点灯する。',
  dims:'本体 約0.40×0.80×0.17m(推定)',focus:[0,2.35,.2],view:[.5,.2,4],night:null,states:SPED,cycle:[{s:'r',d:7},{s:'g',d:6},{s:'gb',d:4}],
  options:[optBody('gray'),optToggle('hood','庇(旧型)')],
  build(){setBody('#b7bcbe');const root=new THREE.Group(),L={};POLE_H(root,3.0,.0572,.0572);pedHousing(root,L,{y:2.3,pr:.0572,mat:HG,pictoWalk:bikeTexture(),pictoStand:bikeTexture()});return {root,lamps:L};}};
