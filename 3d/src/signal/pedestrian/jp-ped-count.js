import {HG,POLE_H,THREE,addButton,addSpeaker,dotLamp,opt,optBody,optToggle,pedHousing,reg,setBody} from '../../kit/signal-parts.js';
const bars=[];for(let i=0;i<8;i++)bars.push('b'+i);
  const st=[{id:'r',label:'赤',on:['red']},{id:'g',label:'青',on:['walk']}];
  for(let n=8;n>=1;n--)st.push({id:'gb'+n,label:`青点滅 残${n}`,flash:['walk'],on:bars.slice(0,n)});
  st.push({id:'off',label:'消灯'});
  const cyc=[{s:'r',d:6},{s:'g',d:6}];for(let n=8;n>=1;n--)cyc.push({s:'gb'+n,d:1});
export default {id:'jp-ped-count',group:'road-ped',name:'歩行者用 残り時間表示付き',
    desc:'青点滅の間、人型の横に並んだ表示灯が残り時間を示す灯器(待ち時間・残り時間表示)。渡り切れるかの判断を助ける。',
    dims:'本体 約0.58×0.80×0.17m(推定)',focus:[0,2.35,.2],view:[.5,.2,4.2],night:null,states:st,cycle:cyc,
    options:[optBody('gray'),optToggle('button','押ボタン箱'),optToggle('sound','音響装置'),optToggle('hood','庇(旧型)')],
    build(){setBody('#b7bcbe');const root=new THREE.Group(),L={};POLE_H(root,3.0,.0572,.0572);const h=pedHousing(root,L,{y:2.3,pr:.0572,withBar:true,mat:HG});const bo=opt(root,'button','on');addButton(bo,L,1.15,.0605);const so=opt(root,'sound','on');addSpeaker(so,2.78,.058);
      for(let i=0;i<8;i++)reg(L,'b'+i,dotLamp(h.g,.2,.31-i*.088,h.D/2,.021,'yellow'));return {root,lamps:L};}};
