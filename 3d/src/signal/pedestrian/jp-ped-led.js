import {POLE_H,SPED,THREE,addButton,addSpeaker,opt,optBody,optToggle,pedHousing,setBody} from '../../kit/signal-parts.js';
export default {id:'jp-ped-led',group:'road-ped',name:'歩行者用 角形LED灯器(人型)',
  desc:'国内標準の歩行者用灯器。上が赤の立ち姿、下が青(青緑)の歩行姿。青は渡り終えるまで点灯し、終わりが近づくと点滅する。',
  dims:'本体 約0.40×0.80×0.17m(推定)',focus:[0,2.35,.2],view:[.5,.2,4],night:null,states:SPED,cycle:[{s:'r',d:7},{s:'g',d:6},{s:'gb',d:4}],
  options:[optBody('gray'),optToggle('button','押ボタン箱'),optToggle('sound','音響装置'),optToggle('hood','庇(旧型)')],
  build(){setBody('#b7bcbe');const root=new THREE.Group(),L={};POLE_H(root,3.0,.0572,.0572);pedHousing(root,L,{y:2.3,pr:.0572});const bo=opt(root,'button','on');addButton(bo,L,1.15,.0605);const so=opt(root,'sound','on');addSpeaker(so,2.78,.058);return {root,lamps:L};}};
