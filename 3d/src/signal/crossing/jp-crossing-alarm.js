import {setBody,optBody,THREE,MAT,COL,LED,add,rod,bolt,pole,mastArm,roundBox,rrShape,housing,makeLamp,config,arrowTexture,pedTexture,bikeTexture,opt,lensMaterial,domeLens,cv,tex,allLamps,HG,HK,reg,deg,dotLamp,cylLamp,hw,hanger,strap,horizHead,vertHead,POLE_H,S3,CY3,SPED,xTexture,pedHousing,railBody,stripePole,arrowStates,OPT_LENS,optToggle,addSpeaker,addButton,tramHead} from '../../kit/signal-parts.js';
// 実物写真(京急・JR九州等の踏切)に合わせた現行形: 黄黒縞の警報柱+黄黒の×字標識+丸形警報灯+矢印2つの方向指示器
function longArrow(dir){const c=cv(512,192),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,512,192);g.fillStyle='#fff';g.translate(256,96);if(dir==='right')g.scale(-1,1);
  g.beginPath();g.moveTo(-230,0);g.lineTo(-110,-78);g.lineTo(-110,-30);g.lineTo(230,-30);g.lineTo(230,30);g.lineTo(-110,30);g.lineTo(-110,78);g.closePath();g.fill();return tex(c);}
function planeLamp(parent,x,y,z,w,h,color,map){const c=COL[color];const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);const mat=lensMaterial(0x1a0710,c.e,map);mat.clearcoat=.3;mat.roughness=.35;
  const lens=add(g,new THREE.PlaneGeometry(w,h),mat,0,0,.002);const L={g,mat,glow:null,lens,v:0,t:0,color:c,key:null};allLamps.push(L);return L;}
function xBoard(parent,y){const cb=new THREE.Group();cb.position.set(0,y,.1);parent.add(cb);const len=1.4,n=7,sg=len/n,wd=.2;
  for(const s of[1,-1]){const b=new THREE.Group();b.rotation.z=s*.64;b.position.z=s>0?0:.012;cb.add(b);for(let i=0;i<n;i++)add(b,new THREE.BoxGeometry(sg,wd,.012),i%2?MAT.black:MAT.yel,(i-(n-1)/2)*sg,0,0);}  // 端が黄・中央が黒の縞
  for(const [dx,dy] of[[-.05,.03],[.05,-.03]])bolt(cb,dx,dy,.03,.012);}
function roundLamp(parent,L,key,x,y){const g=new THREE.Group();g.position.set(x,y,.1);parent.add(g);
  const body=add(g,new THREE.CylinderGeometry(.2,.2,.24,56,1,true),MAT.black);body.rotation.x=Math.PI/2;body.position.z=.02;                 // 円筒のケース
  add(g,new THREE.CircleGeometry(.2,56),MAT.black,0,0,-.1);
  const hat=add(g,new THREE.CylinderGeometry(.27,.27,.016,56),MAT.black,0,.215,.04);                                                  // 上のひさし(帽子)
  add(g,new THREE.CylinderGeometry(.2,.2,.03,56),MAT.black,0,.2,.04);
  const bk=add(g,roundBox(.34,.34,.02,.04,.004),MAT.black,0,0,-.13);bk.visible=true;                                                 // 後ろの背板
  reg(L,key,makeLamp(g,0,0,.13,.15,'red',LED,{hood:.05,gap:2.4,hoodMat:MAT.black}));
  rod(parent,[0,y,.0],[x*.92,y,.05],.026,MAT.black);add(parent,new THREE.CylinderGeometry(.095,.095,.1,28),MAT.black,0,y,0);}
const sign=(txt,{bg='#f2a900',fg='#111',w=.52,h=.26,font=70}={})=>{const c=cv(512,Math.round(512*h/w)),x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.strokeStyle=fg;x.lineWidth=8;x.strokeRect(4,4,c.width-8,c.height-8);x.fillStyle=fg;x.textAlign='center';x.font=`700 ${font}px "Noto Sans JP",sans-serif`;x.fillText(txt,256,c.height/2+font*.34,480);return new THREE.MeshStandardMaterial({map:tex(c),roughness:.5});};
export default {id:'jp-crossing-alarm',name:'踏切警報機(丸形警報灯・方向指示器・×字標識)',
  desc:'実物写真に合わせた現行形。黄黒縞の警報柱に、黄黒の×字標識、円筒ケースにひさしを載せた赤色警報灯(左右交互に点滅)、矢印2つの列車進行方向指示器、「踏切注意」標識、ホーン、非常ボタン箱を備える。',
  dims:'柱高 約3.9m / 警報灯の発光面 約φ300mm(推定)',focus:[0,2.7,.2],view:[.9,.3,6.6],night:null,
  states:[{id:'idle',label:'平常'},{id:'alarm',label:'警報(交互点滅)',flash:['l1','l3'],flash2:['l2','l4'],on:['em']},{id:'alarmL',label:'警報+左矢印',flash:['l1','l3'],flash2:['l2','l4'],on:['dirL','em']},{id:'alarmR',label:'警報+右矢印',flash:['l1','l3'],flash2:['l2','l4'],on:['dirR','em']},{id:'sp',label:'特殊信号発光機',flash:['sp']}],
  cycle:[{s:'idle',d:6},{s:'alarm',d:3},{s:'alarmL',d:8}],
  options:[optToggle('lamps2','警報灯 2段(上段を追加)'),optToggle('dir','列車進行方向指示器','on'),optToggle('signs','標識(踏切注意・カメラ監視中)','on'),optToggle('horn','警報音ホーン','on'),optToggle('emergency','非常ボタン箱','on'),optToggle('sp','特殊信号発光機')],
  build(){const root=new THREE.Group(),L={};const H=3.9,r=.07;
    for(let i=0;i<Math.floor(H/.22);i++)add(root,new THREE.CylinderGeometry(r+.0015,r+.0015,.22,56,1,true),i%2?MAT.yel:MAT.black,0,.11+i*.22,0);       // 黄黒の縞(下から黒)
    add(root,new THREE.CylinderGeometry(r*1.9,r*1.9,.03,56),MAT.galv,0,.015,0);add(root,new THREE.CylinderGeometry(r*1.12,r*1.12,.14,40),MAT.black,0,H+.07,0);add(root,new THREE.CylinderGeometry(r*1.12,r*1.12,.015,40),MAT.steel,0,H,0);   // 黒い円筒キャップ
    xBoard(root,3.3);
    roundLamp(root,L,'l1',-.52,2.62);roundLamp(root,L,'l2',.52,2.62);
    const l2o=opt(root,'lamps2','off');roundLamp(l2o,L,'l3',-.52,2.05);roundLamp(l2o,L,'l4',.52,2.05);
    const dg=opt(root,'dir','on');const bx=new THREE.Group();bx.position.set(0,1.62,.17);dg.add(bx);add(bx,roundBox(.56,.5,.16,.025,.006),MAT.black);
    for(const sy of[.17,-.17])add(bx,new THREE.BoxGeometry(.5,.012,.012),MAT.steel,0,sy*.0,.0);bolt(bx,.24,.2,.08,.012);
    reg(L,'dirR',planeLamp(bx,0,.12,.082,.4,.15,'red',longArrow('right')));reg(L,'dirL',planeLamp(bx,0,-.12,.082,.4,.15,'red',longArrow('left')));rod(dg,[0,1.62,.02],[0,1.62,.11],.03,MAT.black);
    const sg=opt(root,'signs','on');add(sg,new THREE.BoxGeometry(.54,.28,.012),MAT.black,0,1.2,.1);add(sg,new THREE.PlaneGeometry(.52,.26),sign('踏切注意'),0,1.2,.107);
    add(sg,new THREE.BoxGeometry(.54,.16,.012),MAT.black,0,.95,.1);add(sg,new THREE.PlaneGeometry(.52,.14),sign('カメラ監視中',{bg:'#f4f4f0',fg:'#b3161b',w:.52,h:.14,font:62}),0,.95,.107);
    const hn=opt(root,'horn','on');const hh=new THREE.Group();hh.position.set(0,3.62,.12);hn.add(hh);const cone=add(hh,new THREE.CylinderGeometry(.14,.04,.22,32),MAT.white);cone.rotation.x=Math.PI/2;cone.position.z=.08;add(hh,new THREE.CylinderGeometry(.05,.05,.12,20),MAT.galv,0,0,-.04).rotation.x=Math.PI/2;
    const em=opt(root,'emergency','on');const eb=new THREE.Group();eb.position.set(0,.62,.15);em.add(eb);add(eb,roundBox(.26,.36,.14,.02,.005),new THREE.MeshStandardMaterial({color:0xd9d2bd,roughness:.6}));
    reg(L,'em',dotLamp(eb,0,-.08,.072,.04,'red'));add(eb,new THREE.PlaneGeometry(.2,.12),sign('非常ボタン',{bg:'#f4f4f0',fg:'#b3161b',w:.2,h:.12,font:56}),0,.09,.072);
    const spo=opt(root,'sp','off');add(spo,roundBox(.22,.14,.22,.03,.006),MAT.black,0,H+.34,0);reg(L,'sp',cylLamp(spo,0,H+.51,0,.07,.13,'red'));add(spo,new THREE.CylinderGeometry(.09,.09,.02,32),MAT.black,0,H+.595,0);
    return {root,lamps:L};}};
