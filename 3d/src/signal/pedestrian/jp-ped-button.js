import {POLE_H,THREE,addButton,addSpeaker} from '../../kit/signal-parts.js';
export default {id:'jp-ped-button',group:'road-ped',name:'歩行者用押ボタン箱+音響装置',
  desc:'黄色の押ボタン箱と、視覚障がい者向けの音響用スピーカー箱。ボタンを押すと「おまちください」灯が点灯する。',
  dims:'押ボタン箱 約0.16×0.30×0.09m(推定)',focus:[0,1.25,.2],view:[.35,.15,2.2],night:null,
  states:[{id:'idle',label:'待機'},{id:'wait',label:'おまちください',on:['wait']},{id:'ack',label:'受付(点滅)',flash:['wait']}],cycle:[{s:'idle',d:4},{s:'ack',d:2},{s:'wait',d:5}],
  build(){const root=new THREE.Group(),L={};POLE_H(root,2.6,.058,.05);addSpeaker(root,2.05,.054);addButton(root,L,1.18,.054);return {root,lamps:L};}};
