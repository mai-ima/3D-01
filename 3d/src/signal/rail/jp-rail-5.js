import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
export default {id:'jp-rail-5',group:'rail',name:'鉄道信号機 色灯式5灯(速度段階現示)',
  desc:'上から黄・黄・赤・黄・青の5灯式。進行(青)・減速(青+黄)・注意(黄)・警戒(黄2灯)・停止(赤)の5現示で列車の許容速度を指示する。',
  dims:'レンズ約φ190(推定)。配列は一般的な形式の一例',focus:[0,4.15,.4],view:[.8,.3,6],night:null,
  states:[{id:'stop',label:'停止',on:['red']},{id:'warn',label:'警戒',on:['y1','y2']},{id:'caution',label:'注意',on:['y3']},{id:'slow',label:'減速',on:['y3','green']},{id:'go',label:'進行',on:['green']},{id:'off',label:'消灯'}],
  cycle:[{s:'go',d:5},{s:'slow',d:3},{s:'caution',d:3},{s:'warn',d:3},{s:'stop',d:5}],
  options:[OPT_LENS],
  build(){const r=railBody(['y1','y2','red','y3','green'],['yellow','yellow','red','yellow','green']);return {root:r.root,lamps:r.lamps};}};
