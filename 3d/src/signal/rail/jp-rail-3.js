import {OPT_LENS_BULB,optToggle,railBody} from '../../kit/signal-parts.js';
export default {id:'jp-rail-3',group:'rail',name:'鉄道信号機 色灯式3灯(閉塞・場内・出発)',
  desc:'上から緑・黄・赤の3灯式(実物写真で最上段が緑、最下段が赤)。赤=停止、黄=注意(25km/h以下などの速度制限)、青=進行。黒い背景板と長い円筒フードで遠くから視認させる。',
  dims:'レンズ約φ190(推定)。灯器配列は事業者で異なる場合あり',focus:[0,3.9,.4],view:[.7,.3,5.5],night:null,
  states:[{id:'stop',label:'停止(赤)',on:['red']},{id:'caution',label:'注意(黄)',on:['yellow']},{id:'go',label:'進行(青)',on:['green']},{id:'off',label:'消灯'}],
  cycle:[{s:'go',d:6},{s:'caution',d:4},{s:'stop',d:6}],
  options:[OPT_LENS_BULB,optToggle('ladder','はしご','on'),optToggle('plate','番線札','on')],
  build(){const r=railBody(['green','yellow','red'],['green','yellow','red']);return {root:r.root,lamps:r.lamps};}};
