import {THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
export default {id:'jp-crossing-alarm',group:'rail',name:'踏切警報機(全方向形警報灯・方向指示器・特殊信号発光機)',
  desc:'黄黒の警報柱に×字標識、全方向形の赤色警報灯(左右交互に点滅)、列車進行方向指示器、頂部の特殊信号発光機を備える現行の踏切警報機。',
  dims:'全方向形警報灯 約0.33×0.27×0.30m、発光面φ170〜190mm(メーカー公表値)',focus:[0,2.7,.2],view:[.8,.3,6],night:null,
  states:[{id:'idle',label:'平常'},{id:'alarm',label:'警報(交互点滅)',flash:['l1'],flash2:['l2']},{id:'alarm+dir',label:'警報+方向指示',flash:['l1'],flash2:['l2'],on:['dir']},{id:'sp',label:'特殊信号発光機',flash:['sp']}],
  cycle:[{s:'idle',d:6},{s:'alarm',d:3},{s:'alarm+dir',d:8}],
  options:[optToggle('dir','列車進行方向指示器','on'),optToggle('sp','特殊信号発光機','on')],
  build(){const root=new THREE.Group(),L={};const H=3.9;stripePole(root,H,.07);
    const cb=new THREE.Group();cb.position.set(0,3.35,.1);root.add(cb);
    for(const s of[1,-1]){const b=new THREE.Group();b.rotation.z=s*.62;cb.add(b);add(b,roundBox(1.35,.19,.026,.01,.004),MAT.red);add(b,new THREE.BoxGeometry(1.29,.12,.004),MAT.white,0,0,.015);}
    rod(root,[0,2.62,.02],[0,2.62,.15],.025);add(root,roundBox(1.0,.06,.06,.01,.003),MAT.galv,0,2.62,.17);
    for(const [k,x] of[['l1',-.34],['l2',.34]]){const g=new THREE.Group();g.position.set(x,2.62+.17,.17);root.add(g);add(g,roundBox(.33,.27,.3,.04,.006),HK,0,-.215,0);reg(L,k,cylLamp(g,0,0,0,.095,.17,'red'));add(g,new THREE.CylinderGeometry(.115,.115,.02,48),HK,0,.105,0);}
    const dgo=opt(root,'dir','on');const dg=new THREE.Group();dg.position.set(0,2.0,.15);dgo.add(dg);housing(dg,.3,.2,.1,.04,HK);reg(L,'dir',makeLamp(dg,0,0,.05,.075,'red',arrowTexture('left'),{hood:.08,gap:1.6}));
    rod(dgo,[0,2.0,.02],[0,2.0,.1],.022);
    const spo=opt(root,'sp','on');add(spo,roundBox(.22,.14,.22,.03,.006),HK,0,H+.1,.0);reg(L,'sp',cylLamp(spo,0,H+.27,0,.07,.13,'red'));add(spo,new THREE.CylinderGeometry(.09,.09,.02,32),HK,0,H+.355,0);
    return {root,lamps:L};}};
