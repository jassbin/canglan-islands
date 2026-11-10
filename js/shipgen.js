
























import * as THREE from 'three';


const M = {
  
  hull : new THREE.MeshStandardMaterial({ color: 0x76818c, metalness: .40, roughness: .52, vertexColors: true }),
  hull2: new THREE.MeshStandardMaterial({ color: 0x828d97, metalness: .38, roughness: .54 }),
  deck : new THREE.MeshStandardMaterial({ color: 0x3a434b, metalness: .30, roughness: .66 }),
  super: new THREE.MeshStandardMaterial({ color: 0x8b959f, metalness: .34, roughness: .56 }),
  dark : new THREE.MeshStandardMaterial({ color: 0x232b32, metalness: .38, roughness: .55 }),
  mast : new THREE.MeshStandardMaterial({ color: 0x9aa4ad, metalness: .45, roughness: .46 }),
  pad  : null,                                     
  deckTex: null,
};




(function(){
  const cv=document.createElement('canvas'); cv.width=cv.height=256;
  const g=cv.getContext('2d');
  g.fillStyle='#39414a'; g.fillRect(0,0,256,256);
  
  for(let i=0;i<900;i++){
    const x=Math.random()*256, y=Math.random()*256, v=40+Math.random()*26|0;
    g.fillStyle='rgba('+v+','+(v+5)+','+(v+11)+',.5)';
    g.fillRect(x,y,1.6,1.6);
  }
  
  g.fillStyle='#4a535c'; g.fillRect(0,0,256,13); g.fillRect(0,243,256,13);
  g.fillStyle='rgba(12,16,20,.55)'; g.fillRect(0,13,256,2.5); g.fillRect(0,240.5,256,2.5);
  
  const ao=g.createLinearGradient(0,0,0,256);
  ao.addColorStop(0,'rgba(8,11,14,.34)'); ao.addColorStop(.10,'rgba(8,11,14,0)');
  ao.addColorStop(.90,'rgba(8,11,14,0)'); ao.addColorStop(1,'rgba(8,11,14,.34)');
  g.fillStyle=ao; g.fillRect(0,0,256,256);
  
  g.strokeStyle='rgba(212,218,224,.75)'; g.lineWidth=3.5; g.setLineDash([30,26]);
  g.beginPath(); g.moveTo(0,128); g.lineTo(256,128); g.stroke();
  g.setLineDash([]);
  const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  M.deckTex=t;
  M.deck=new THREE.MeshStandardMaterial({map:t,metalness:.30,roughness:.68});
})();


function box(w,h,d,x,y,z,ry=0,rx=0){ const g=new THREE.BoxGeometry(w,h,d);
  if(rx)g.rotateX(rx); if(ry)g.rotateY(ry); g.translate(x,y,z); return g; }
function cyl(rt,rb,h,seg,x,y,z,ry=0,rx=0,rz=0){ const g=new THREE.CylinderGeometry(rt,rb,h,seg);
  if(rx)g.rotateX(rx); if(rz)g.rotateZ(rz); if(ry)g.rotateY(ry); g.translate(x,y,z); return g; }

function prism(rTop,rBot,h,x,y,z,ry=Math.PI/4){ const g=new THREE.CylinderGeometry(rTop,rBot,h,4,1);
  g.rotateY(ry); g.translate(x,y,z); return g; }
function cone(r,h,seg,x,y,z,ry=0){ const g=new THREE.ConeGeometry(r,h,seg);
  if(ry)g.rotateY(ry); g.translate(x,y,z); return g; }
function sph(r,x,y,z){ const g=new THREE.SphereGeometry(r,12,8); g.translate(x,y,z); return g; }

function uvRep(g,su,sv){ const u=g.attributes.uv;
  for(let i=0;i<u.count;i++) u.setXY(i,u.getX(i)*su,u.getY(i)*sv); return g; }
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};




function hullGeo(L,B,D,opt={}){
  const N=36, flare=opt.flare==null?0.10:opt.flare;
  const pos=[], idx=[], uv=[];
  const halfW=t=>{
    if(t<0.42) return B*0.5*(0.90+0.10*Math.sin(t/0.42*Math.PI/2));       
    if(t<0.78) return B*0.5*(1.00-0.10*Math.pow((t-0.42)/0.36,1.8));       
    return Math.max(B*0.010, B*0.5*0.90*Math.pow(1-(t-0.78)/0.22,1.7));    
  };
  const yDeck=t=> D*(0.32*smooth(0.42,1.0,t)-0.035*smooth(0.0,0.28,1-t));  
  const yKeel=t=> -D*(1.0-0.45*smooth(0.74,1.0,t));                        
  const PX=[],PY=[],PZ=[];
  for(let i=0;i<=N;i++){
    const t=i/N, w=halfW(t), yd=yDeck(t), yk=yKeel(t);
    const fl=1+flare*smooth(0.5,1,t);                                       
    const yS=yd-D*0.42;                                                     
    const yB=yk+D*0.18;                                                     
    const xL=t*L-L/2;
    const ring=[[ w*fl,yd],[ w,yS],[ w*0.82,yB],[0,yk],[-w*0.82,yB],[-w,yS],[-w*fl,yd]];
    for(const [lat,y] of ring){ PX.push(xL); PY.push(y); PZ.push(lat); }   
  }
  const CV=7;                                                               
  
  for(let i=0;i<=N;i++){
    for(let k=0;k<CV;k++){
      pos.push(PX[i*CV+k], PY[i*CV+k], PZ[i*CV+k]);
      uv.push(k/(CV-1), i/N);
    }
  }
  
  for(let i=0;i<N;i++){
    const a=i*CV, b=a+CV;
    for(let k=0;k<6;k++){
      idx.push(a+k, b+k+1, a+k+1,  a+k, b+k, b+k+1);
    }
  }
  
  const base=pos.length/3;
  for(let i=0;i<=N;i++){
    pos.push(PX[i*CV], PY[i*CV], PZ[i*CV]);       uv.push(0, i/N);
    pos.push(PX[i*CV+6], PY[i*CV+6], PZ[i*CV+6]); uv.push(1, i/N);
  }
  for(let i=0;i<N;i++){
    const a=base+i*2, b=a+2;
    idx.push(a,b+1,b, a,a+1,b+1);
  }
  
  for(let k=1;k<6;k++) idx.push(0,k,k+1);
  
  const s1=N*CV;
  for(let k=1;k<6;k++) idx.push(s1,s1+k+1,s1+k);

  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals();
  tintHull(g,D);
  return g;
}


function tintHull(geo,D){
  const p=geo.attributes.position, n=p.count, c=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const rel=p.getY(i)+D*0.5;                        
    const k=Math.min(1,Math.max(0,(rel+D*.02)/(D*.55)));
    c[i*3]=.30+.70*k; c[i*3+1]=.35+.65*k; c[i*3+2]=.42+.58*k;
  }
  geo.setAttribute('color',new THREE.BufferAttribute(c,3));
}


function padMat(){
  if(M.pad)return M.pad;
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const g=cv.getContext('2d');
  g.fillStyle='#3a434b'; g.fillRect(0,0,128,128);
  g.strokeStyle='#d8dde2'; g.lineWidth=3;
  g.beginPath(); g.arc(64,64,34,0,7); g.stroke();
  g.beginPath(); g.moveTo(64,12); g.lineTo(64,42); g.stroke();
  g.fillStyle='#e8b23c'; g.font='bold 30px Consolas'; g.fillText('+',50,74);
  const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace;
  M.pad=new THREE.MeshStandardMaterial({map:t,metalness:.3,roughness:.65});
  return M.pad;
}


function buckets(){ return {hull:[],hull2:[],deck:[],super:[],dark:[],mast:[],pad:[]}; }
const put=(B,k,g)=>B[k].push(g);




function island(Bk,B,x,base,z,w,h,d,s,panels=true){
  w=Math.min(w,B*0.72); d=Math.min(d,B*0.62);
  put(Bk,'super',box(w*.95,h*.36,d,     x,base+h*.18,z));            
  put(Bk,'dark', box(w*.62,h*.085,d*.88, x,base+h*.40,z));           
  put(Bk,'super',prism(w*.36,w*.50,h*.34, x,base+h*.62,z));          
  put(Bk,'super',box(w*.70,h*.05,d*.92, x,base+h*.82,z));            
  const my=base+h*.84;
  put(Bk,'mast',prism(w*.10,w*.17,h*.55, x-w*.16,my+h*.26,z));       
  put(Bk,'mast',box(w*.40,h*.026,h*.026, x-w*.16,my+h*.40,z));       
  put(Bk,'mast',sph(w*.09, x-w*.16,my+h*.56,z));                     
  if(panels){                                                         
    const py=base+h*.62, ph=h*.22, pw=w*.34;
    put(Bk,'dark',box(pw,ph,.02*s, x,py,z+d*.31));
    put(Bk,'dark',box(pw,ph,.02*s, x,py,z-d*.31));
    put(Bk,'dark',box(.02*s,ph,pw, x+w*.31,py,z));
    put(Bk,'dark',box(.02*s,ph,pw, x-w*.31,py,z));
  }
}


function turret(Bk,s,x,y,z,rx=0){
  put(Bk,'hull2',cyl(.55*s,.62*s,.16*s,12, x,y+.08*s,z));
  put(Bk,'super',prism(.30*s,.44*s,.34*s, x,y+.30*s,z));
  put(Bk,'dark', cyl(.045*s,.055*s,1.05*s,8, x+.5*s,y+.34*s,z,0,0,Math.PI/2));  
}


function buildDDG(L,B,D){                       
  const Bk=buckets(), s=L/18;
  put(Bk,'hull',hullGeo(L,B,D,{flare:.11}));
  
  put(Bk,'deck',uvRep(box(L*.88,.05,B*.94, 0,.02,0), L*.30,B*.32));                       
  put(Bk,'deck',uvRep(box(L*.16,.06,B*.80,  L*.345,.05,0), L*.06,B*.28));                 
  
  for(const zz of [-1,1]){
    put(Bk,'hull2',box(L*.30,.09*s,.04*s, L*.18,.05*s,zz*B*.47));
    put(Bk,'hull2',box(L*.26,.09*s,.04*s, -L*.30,.05*s,zz*B*.44));
  }
  
  turret(Bk,s*.9, L*.36, .03, 0);
  
  for(const [vx,vw] of [[L*.27,1.0],[ -L*.22,0.85]]){
    put(Bk,'dark',box(vw*1.5*s,.10*s,1.5*s, vx,.03,0));
    for(let i=0;i<3;i++)for(let j=0;j<2;j++)
      put(Bk,'dark',box(.28*s,.06*s,.34*s, vx+(i-1)*.42*s,.08, (j-.5)*.62*s));
  }
  
  island(Bk,B, -L*.03, .04, 0, 1.45*s, 1.55*s, 1.30*s, s);
  
  for(const cx of [-L*.19,-L*.30]){
    put(Bk,'super',prism(.20*s,.27*s,1.0*s, cx,.54*s,0));
    put(Bk,'dark', box(.30*s,.09*s,.30*s, cx,1.05*s,0));
  }
  
  put(Bk,'super',box(2.0*s,1.0*s,1.5*s, -L*.40,.52*s,0));
  put(Bk,'pad',  box(L*.18,.04,B*.66, -L*.455,.035,0));
  
  for(const [nx,ny,nz] of [[L*.15,.62*s,0],[-L*.34,1.06*s,0]]){
    put(Bk,'hull2',cyl(.22*s,.26*s,.16*s,10, nx,ny,nz));
    put(Bk,'dark', sph(.20*s, nx,ny+.22*s,nz));
    put(Bk,'dark', box(.55*s,.05*s,.05*s, nx+.30*s,ny+.24*s,nz));
  }
  
  for(const zz of [-1,1]) put(Bk,'hull2',box(1.0*s,.34*s,.30*s, -L*.10,.42*s,zz*(B*.44)));
  return Bk;
}
function buildCruiser(L,B,D){                   
  const Bk=buckets(), s=L/17.3;
  put(Bk,'hull',hullGeo(L,B,D,{flare:.09}));
  put(Bk,'deck',uvRep(box(L*.90,.05,B*.94, 0,.02,0), L*.30,B*.32));
  
  turret(Bk,s*.85, L*.36,.03,0);
  turret(Bk,s*.85, -L*.40,.03,0);
  
  for(const vx of [L*.26,-L*.20]){
    put(Bk,'dark',box(1.5*s,.10*s,1.5*s, vx,.03,0));
    for(let i=0;i<3;i++)for(let j=0;j<2;j++)
      put(Bk,'dark',box(.28*s,.06*s,.34*s, vx+(i-1)*.42*s,.08,(j-.5)*.62*s));
  }
  
  put(Bk,'super',box(4.8*s,1.45*s,1.48*s, L*.02,.80*s,0));
  put(Bk,'super',box(2.9*s,1.15*s,1.30*s, L*.09,1.55*s,0));
  put(Bk,'dark', box(3.0*s,.15*s,1.32*s, L*.09,1.88*s,0));     
  
  for(const mx of [L*.06,-L*.12]){
    put(Bk,'hull2',box(.16*s,2.3*s,.16*s, mx,2.55*s,0));
    put(Bk,'hull2',box(1.3*s,.10*s,.10*s, mx,3.15*s,0));
    put(Bk,'hull2',box(.9*s,.08*s,.08*s, mx,2.75*s,0));
  }
  
  for(const cx of [-L*.17,-L*.25]){
    put(Bk,'super',box(.62*s,.92*s,.92*s, cx,1.55*s,0));
    put(Bk,'dark', box(.42*s,.15*s,.42*s, cx,2.08*s,0));
  }
  
  put(Bk,'pad', box(L*.15,.04,B*.60, -L*.425,.035,0));
  
  for(const zz of [-1,1]) put(Bk,'hull2',box(.9*s,.32*s,.28*s, -L*.02,.42*s,zz*(B*.44)));
  return Bk;
}
function buildFlat(L,B,D){                      
  const Bk=buckets(), s=L/22;
  put(Bk,'hull',hullGeo(L,B,D,{flare:.06}));
  put(Bk,'deck',uvRep(box(L*.80,.06,B*.96, -L*.08,.03,0), L*.28,B*.32));                 
  const ix=L*.14, pz=B*.20;
  island(Bk,B, ix, .05, pz, 1.55*s, 2.05*s, 1.35*s, s, false);       
  
  for(let i=0;i<6;i++) put(Bk,'dark',box(.05*s,.02,B*.82, -L*.30+i*L*.085,.075,0));
  put(Bk,'pad', box(L*.26,.03,B*.62, -L*.40,.07,0));
  
  for(const ex of [-L*.10,-L*.30]) put(Bk,'dark',box(L*.055,.02,B*.24, ex,.075,B*.33));
  
  for(const zz of [-1,1]) put(Bk,'hull2',cyl(.24*s,.28*s,.16*s,10, ix-L*.02,.62*s,zz*B*.40));
  return Bk;
}
function buildCarrier(L,B,D){                   
  const Bk=buckets(), s=L/30;
  put(Bk,'hull',hullGeo(L,B,D,{flare:.08}));
  put(Bk,'deck',uvRep(box(L*.60,.07,B*1.55, -L*.13,.035,-B*.16), L*.20,B*.52));         
  put(Bk,'deck',uvRep(box(L*.30,.07,B*.95,    L*.30,.035, B*.06), L*.10,B*.32));        
  const ix=L*.24, pz=B*.62;
  island(Bk,B, ix, .06, pz, 2.0*s, 1.85*s, 1.3*s, s, false);        
  put(Bk,'mast',sph(.22*s, ix+L*.035,2.25*s,pz));
  put(Bk,'mast',sph(.18*s, ix-L*.045,2.4*s,pz));
  
  put(Bk,'hull2',box(1.9*s,.35*s,B*.85, L*.455,.16*s,B*.02,0,-.26));
  
  for(let i=0;i<7;i++) put(Bk,'dark',box(.045*s,.02,B*.16, -L*.34+i*L*.07,.075,-B*.55));
  
  for(const [hx,hz] of [[-L*.28,-B*.5],[-L*.22,-B*.5]]){
    put(Bk,'dark',box(.9*s,.16*s,.32*s, hx,.15*s,hz));
    put(Bk,'dark',box(.26*s,.06*s,1.1*s, hx,.20*s,hz));
  }
  return Bk;
}
function buildFujian(L,B,D){                    
  const Bk=buckets(), s=L/32;
  put(Bk,'hull',hullGeo(L,B,D,{flare:.06}));
  
  put(Bk,'deck',uvRep(box(L*.98,.07,B*1.66, 0,.035,0), L*.33,B*.56));
  put(Bk,'deck',uvRep(box(L*.50,.075,B*.74, -L*.16,.078,-B*.08, .09), L*.17,B*.25));
  const ix=L*.15, pz=B*.60;
  island(Bk,B, ix, .06, pz, 2.2*s, 2.05*s, 1.45*s, s, false);       
  put(Bk,'mast',sph(.24*s, ix,2.75*s,pz));                          
  put(Bk,'mast',sph(.16*s, ix-L*.05,2.35*s,pz));
  
  put(Bk,'dark',box(L*.34,.02,.06, L*.31,.118,-B*.40));
  put(Bk,'dark',box(L*.34,.02,.06, L*.31,.118,-B*.16));
  put(Bk,'dark',box(.06,.02,L*.44, -L*.15,.138,-B*.26));
  
  for(let i=0;i<4;i++) put(Bk,'dark',box(.8*s,.014,.05, -L*.30+i*.5*s,.140,-B*.08));
  
  for(let i=0;i<9;i++) put(Bk,'dark',box(.045*s,.02,B*.14, -L*.42+i*L*.075,.083,-B*.58));
  
  for(const [hx,hz] of [[-L*.38,-B*.55],[-L*.31,-B*.55],[-L*.24,-B*.55]]){
    put(Bk,'dark',box(.62*s,.13*s,.26*s, hx,.16*s,hz));
    put(Bk,'dark',box(.08*s,.018,.78*s, hx,.205*s,hz));
    put(Bk,'dark',box(.10*s,.10*s,.12*s, hx-.32*s,.205*s,hz));       
  }
  put(Bk,'dark',box(.72*s,.15*s,.24*s, -L*.15,.165*s,-B*.56));
  put(Bk,'dark',cyl(.22*s,.22*s,.045*s,10, -L*.15,.29*s,-B*.56,0,Math.PI/2));  
  return Bk;
}
function buildAux(L,B,D){                       
  const Bk=buckets(), s=L/24;
  put(Bk,'hull',hullGeo(L,B,D,{flare:.05}));
  put(Bk,'deck',uvRep(box(L*.74,.06,B*.90, -L*.10,.03,0), L*.25,B*.30));
  const ix=L*.24;
  put(Bk,'super',prism(1.5*s,1.9*s,1.1*s, ix,.60*s,0));             
  put(Bk,'super',box(2.4*s,.55*s,1.6*s, ix,1.42*s,0));
  put(Bk,'dark', box(2.0*s,.20*s,1.5*s, ix,1.75*s,0));              
  put(Bk,'mast',prism(.10*s,.22*s,1.0*s, ix,2.30*s,0));
  put(Bk,'mast',box(.06*s,.06*s,3.0*s, ix-L*.06,2.60*s,0));         
  for(const zz of [-1,1]) put(Bk,'mast',cyl(.05*s,.05*s,1.9*s,6, ix-L*.10,2.55*s,zz*B*.30));
  
  for(let i=0;i<4;i++) put(Bk,'dark',box(1.5*s,.10*s,1.4*s, -L*.36+i*2.0*s,.10*s,0));
  for(const zz of [-1,1]) put(Bk,'hull2',box(L*.40,.06*s,.08*s, -L*.05,.16*s,zz*B*.28));
  return Bk;
}
function buildSub(L,B,D){                       
  const Bk=buckets();
  put(Bk,'hull',cyl(B/2,B/2,L*.80,18, 0,0,0,0,0,Math.PI/2));
  put(Bk,'hull',cyl(B/2*.42,B/2*.90,L*.11,18, -L*.45,0,0,0,0,Math.PI/2));  
  


  { const g=new THREE.SphereGeometry(B/2,18,12); g.scale(1.9,1,1); g.translate(L*.40,0,0); put(Bk,'hull',g); }
  
  put(Bk,'super',box(L*.16,.42,B*.62, L*.02,.30,0,0,-.05));
  put(Bk,'super',prism(.40,.52,L*.10, L*.10,.34,0));                    
  for(const zz of [-1,1]) put(Bk,'dark',box(L*.05,.30,.03, -L*.03,.32,zz*B*.30)); 
  put(Bk,'mast',box(.05,.62,.05, L*.02,.80,0));                         
  put(Bk,'mast',box(.05,.50,.05, L*.05,.72,0));
  
  put(Bk,'hull2',box(.10,.06,L*.14, -L*.38,0,0));
  put(Bk,'hull2',box(.06,L*.15,.10, -L*.38,0,0));
  put(Bk,'hull2',cyl(.05,.05,L*.16,6, -L*.42,.20,0,0,0,Math.PI/2));     
  return Bk;
}
function buildFac(L,B,D){                       
  const Bk=buckets(), s=L/8;
  put(Bk,'hull',hullGeo(L,B,D,{flare:.14}));
  put(Bk,'deck',uvRep(box(L*.52,.04,B*.80, -L*.16,.02,0), L*.18,B*.28));
  
  put(Bk,'super',prism(.55*s,.80*s,.85*s, -L*.02,.45*s,0));
  put(Bk,'dark', box(.70*s,.20*s,.62*s, -L*.02,.92*s,0));
  put(Bk,'mast',prism(.07*s,.12*s,.55*s, -L*.02,1.28*s,0));
  put(Bk,'mast',sph(.07*s, -L*.02,1.58*s,0));
  
  for(const zz of [-1,1]){
    put(Bk,'hull2',box(1.1*s,.34*s,.42*s, L*.10,.34*s,zz*B*.30, zz*.12));
    put(Bk,'dark', box(.16*s,.24*s,.42*s, L*.10+.55*s,.34*s,zz*B*.30));
  }
  
  put(Bk,'hull2',cyl(.16*s,.20*s,.14*s,8, L*.34,.20*s,0));
  put(Bk,'dark', box(.55*s,.035*s,.035*s, L*.34+.28*s,.26*s,0));
  return Bk;
}
function buildHover(L,B,D){                     
  const Bk=buckets(), s=L/6;
  put(Bk,'dark',box(L*.92,D*.50,B*.90, 0,-D*.08,0));                
  put(Bk,'hull',hullGeo(L*.80,B*.78,D*.55,{flare:.02}));            
  
  put(Bk,'super',box(L*.20,D*.85,B*.60, -L*.02,D*.92,0));
  put(Bk,'dark', box(L*.16,D*.18,B*.54, -L*.02,D*1.38,0));
  put(Bk,'mast',box(.06*s,.55*s,.06*s, -L*.04,D*1.75,0));
  
  put(Bk,'dark',box(L*.22,.05,B*.55, L*.42,D*.22,0,0,.35));
  
  for(const zz of [-1,1]) for(const xx of [-1,1])
    put(Bk,'super',cyl(.13*s,.13*s,D*.80,10, xx*L*.32,D*.52,zz*B*.34));
  return Bk;
}


function mergeGeos(geos,needColor){
  let vc=0, ic=0;
  for(const g of geos){ vc+=g.attributes.position.count; ic+=g.index?g.index.count:g.attributes.position.count; }
  const pos=new Float32Array(vc*3), nor=new Float32Array(vc*3), uv=new Float32Array(vc*2), col=new Float32Array(vc*3);
  const idx = vc>65535? new Uint32Array(ic) : new Uint16Array(ic);
  let vo=0, io=0;
  for(const g of geos){
    const p=g.attributes.position, n=g.attributes.normal, u=g.attributes.uv, c=g.attributes.color;
    for(let i=0;i<p.count;i++){
      pos[(vo+i)*3]=p.getX(i); pos[(vo+i)*3+1]=p.getY(i); pos[(vo+i)*3+2]=p.getZ(i);
      if(n){ nor[(vo+i)*3]=n.getX(i); nor[(vo+i)*3+1]=n.getY(i); nor[(vo+i)*3+2]=n.getZ(i); }
      else { nor[(vo+i)*3+1]=1; }
      if(u){ uv[(vo+i)*2]=u.getX(i); uv[(vo+i)*2+1]=u.getY(i); }
      if(c){ col[(vo+i)*3]=c.getX(i); col[(vo+i)*3+1]=c.getY(i); col[(vo+i)*3+2]=c.getZ(i); }
      else { col[(vo+i)*3]=1; col[(vo+i)*3+1]=1; col[(vo+i)*3+2]=1; }
    }
    if(g.index){ for(let i=0;i<g.index.count;i++) idx[io++]=g.index.getX(i)+vo; }
    else { for(let i=0;i<p.count;i++) idx[io++]=i+vo; }
    vo+=p.count;
  }
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.BufferAttribute(pos,3));
  out.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  out.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  if(needColor) out.setAttribute('color',new THREE.BufferAttribute(col,3));
  out.setIndex(new THREE.BufferAttribute(idx,1));
  out.computeBoundingSphere();
  return out;
}


const KINDS={
  cv     :{L:31.5,B:3.8,D:1.35,build:buildCarrier},
  fujian :{L:31.6,B:3.9,D:1.38,build:buildFujian},   
  lha    :{L:23.7,B:3.6,D:1.20,build:buildFlat},
  lpd    :{L:21.0,B:2.8,D:1.08,build:buildFlat},
  ddg055 :{L:18.0,B:2.0,D:1.02,build:buildDDG},
  


  ddg    :{L:15.7,B:1.72,D:0.92,build:buildDDG},
  ffg    :{L:13.4,B:1.60,D:0.80,build:buildDDG},
  tajiang:{L:6.5 ,B:0.90,D:0.55,build:buildFac},
  gh6    :{L:4.7 ,B:0.78,D:0.42,build:buildFac},   
  hailung:{L:6.6 ,B:0.84,D:0.66,build:buildSub},   
  
  cvn73  :{L:33.3,B:3.8 ,D:1.35,build:buildCarrier},
  cg47   :{L:17.3,B:1.90,D:1.00,build:buildCruiser},
  ddg51  :{L:15.5,B:1.72,D:0.92,build:buildDDG},    
  ssnla  :{L:11.0,B:1.10,D:0.90,build:buildSub},    
  lha6   :{L:25.7,B:3.6 ,D:1.20,build:buildFlat},   
  lpd22  :{L:20.8,B:2.8 ,D:1.08,build:buildFlat},   
  
  kidd   :{L:17.2,B:1.90,D:1.02,build:buildCruiser},
  cheng  :{L:13.8,B:1.60,D:0.80,build:buildDDG},    
  kangding:{L:12.5,B:1.55,D:0.74,build:buildDDG},   
  

  chiyang:{L:13.4,B:1.60,D:0.80,build:buildDDG},    
  chengkung:{L:13.8,B:1.60,D:0.80,build:buildDDG},  
  keel   :{L:17.2,B:1.90,D:1.02,build:buildCruiser},
  anping :{L:6.7 ,B:0.95,D:0.55,build:buildFac},    
  yushan :{L:20.9,B:2.80,D:1.08,build:buildFlat},   
  panshih:{L:19.6,B:2.60,D:1.05,build:buildAux},    
  fpb    :{L:4.26,B:1.22,D:0.42,build:buildFac},
  aoe    :{L:24.1,B:3.20,D:1.22,build:buildAux},
  aor    :{L:17.8,B:2.44,D:1.00,build:buildAux},
  sub    :{L:11.0,B:1.10,D:0.90,build:buildSub},
  zubr   :{L:5.73,B:2.56,D:0.70,build:buildHover},
  lcac   :{L:3.00,B:1.40,D:0.46,build:buildHover},
};
const CACHE={};                                  


export function makeShip(kind,targetLen){
  const K=KINDS[kind]; if(!K)return null;
  const tl=targetLen||K.L;
  if(!CACHE[kind]){
    const Bk=K.build(K.L,K.B,K.D), meshes=[];
    for(const k in Bk){
      const arr=Bk[k]; if(!arr.length)continue;
      const mat=k==='pad'?padMat():M[k];
      const geo=arr.length===1?arr[0]:mergeGeos(arr,k==='hull');
      geo.rotateY(-Math.PI/2);            
      meshes.push(new THREE.Mesh(geo,mat));
    }
    CACHE[kind]=meshes;
  }
  const grp=new THREE.Group(), inner=new THREE.Group();
  const s=tl/K.L;
  inner.scale.setScalar(s);
  
  inner.position.y=K.D*0.5*s;
  for(const src of CACHE[kind]) inner.add(src.clone());   
  grp.add(inner); grp.userData.Lw=tl;
  return grp;
}
export const SHIP_KINDS=Object.keys(KINDS);







export function fitLen(obj,lenWu){
  try{
    obj.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(obj);
    const al=Math.max(0.01,bb.max.z-bb.min.z);
    const s=lenWu/al;
    if(Math.abs(s-1)>0.002){ obj.scale.multiplyScalar(s); obj.updateMatrixWorld(true); }
    obj.userData.realM=lenWu*10;
  }catch(e){}
  return obj;
}
