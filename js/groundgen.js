














import * as THREE from 'three';


const MATS = {};
function mat(c) {
  if (!MATS[c]) MATS[c] = new THREE.MeshStandardMaterial({ color: c, metalness: .42, roughness: .52 });
  return MATS[c];
}
function bx(p, w, h, d, x, y, z, c, ry = 0, rx = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz); p.add(m); return m;
}
function cy(p, r, h, x, y, z, c, rx = 0, rz = 0, seg = 12) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat(c));
  m.position.set(x, y, z); m.rotation.set(rx, 0, rz); p.add(m); return m;
}
function cn(p, r, h, x, y, z, c, rx = 0, rz = 0, seg = 12) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(c));
  m.position.set(x, y, z); m.rotation.set(rx, 0, rz); p.add(m); return m;
}
const OLIVE = 0x4c5240, DARK = 0x2c3128, TIRE = 0x1a1a18, STEEL = 0x5a6258, MISS = 0xd9d6c8;


function mkWheels(g, zs, y, halfW, r = .55) {
  for (const z of zs) for (const s of [-1, 1]) {
    cy(g, r, .40, s * halfW, y, z, TIRE, 0, Math.PI / 2);
    cy(g, r * .5, .46, s * halfW, y, z, 0x39412f, 0, Math.PI / 2);   
  }
}













function mkTruck(L = 9.2, W = 2.5) {
  const g = new THREE.Group();
  const light = L <= 6.6, axles = light ? 2 : (L <= 8.7 ? 3 : 4);
  const FR = 0x4a5040, FR2 = 0x39412f, GL = 0x1b2833, RU = 0x23281e;
  const WR = light ? .5 : .61;                       
  const AX = WR * .97;                               
  const DK = AX + WR * .74;                          
  const zs = (axles === 2 ? [.28, -.27] : axles === 3 ? [.30, -.01, -.30] : [.33, .11, -.23, -.41]).map(f => f * L);
  const HW = W / 2 - (light ? .1 : .14);             
  
  bx(g, W * .84, .42, L * .95, 0, DK, 0, OLIVE);
  bx(g, W * .9, .14, L * .9, 0, DK + .27, 0, FR2);
  for (const z of zs) bx(g, W * .8, .3, .32, 0, DK - .05, z, FR2);
  
  const hx = L * (light ? .34 : .30), hl = L * (light ? .2 : .14);
  bx(g, W * .92, .62, hl, 0, DK + .58, hx, FR);
  bx(g, W * .74, .5, .14, 0, DK + .62, hx + hl / 2, RU);                 
  bx(g, W * .98, .26, .3, 0, DK + .2, hx + hl / 2 + .1, FR2);            
  for (const s of [-1, 1]) {
    bx(g, .26, .18, .12, s * W * .3, DK + .5, hx + hl / 2 + .06, 0xd8d2ae);   
    bx(g, .12, .12, .1, s * W * .45, DK + .48, hx + hl / 2 + .06, 0xa08a3c);  
  }
  
  const cx = L * (light ? .1 : .16), cl = L * (light ? .24 : .16);
  bx(g, W * .96, 1.1, cl, 0, DK + .95, cx, FR);
  bx(g, W * .99, .12, cl * 1.04, 0, DK + 1.56, cx, FR2);                 
  bx(g, W * .78, .5, .12, 0, DK + 1.24, cx + cl / 2, GL);                
  for (const s of [-1, 1]) {
    bx(g, .08, .44, cl * .6, s * W * .48, DK + 1.2, cx - cl * .06, GL);   
    bx(g, .06, .06, cl * .82, s * W * .49, DK + .62, cx, RU);             
    bx(g, .05, .3, .22, s * (W / 2 + .1), DK + 1.35, cx + cl / 2, 0x2a2f28);   
    bx(g, .16, .05, .05, s * (W / 2 + .04), DK + 1.35, cx + cl / 2 - .08, FR2);
  }
  if (!light) {
    cy(g, .07, 1.5, W * .36, DK + 1.5, cx - cl / 2 - .1, 0x30362c);        
    bx(g, W * .5, .62, L * .16, -W * .2, DK + .5, cx - cl / 2 - L * .12, FR2);   
    bx(g, W * .44, .5, L * .1, W * .22, DK + .48, cx - cl / 2 - L * .13, 0x545b48); 
  }
  
  for (let i = 0; i < zs.length; i++) for (const s of [-1, 1])
    bx(g, .1, .1, WR * 2.3, s * (HW + .06), AX + WR * 1.06, zs[i], FR2);
  
  bx(g, W * .9, .1, L * .1, 0, DK + .36, zs[zs.length - 1] - L * .06, FR2);
  for (const s of [-1, 1]) bx(g, .16, .14, .08, s * W * .38, DK + .55, -L * .47, 0x8a2f26);
  bx(g, W * .96, .16, .2, 0, DK + .1, -L * .475, FR2);
  
  if (!light) {
    bx(g, W * .9, .22, L * .26, 0, DK + .16, -L * .38, STEEL);            
    bx(g, .34, .5, .34, 0, DK + .5, -L * .38 + L * .12, FR2);
    for (const s of [-1, 1]) {
      bx(g, .34, .9, .34, s * (W / 2 - .12), DK + .3, zs[1] ?? L * .05, 0x545b48);
      cy(g, .12, .55, s * (W / 2 - .12), DK - .28, zs[1] ?? L * .05, STEEL);
    }
  }
  mkWheels(g, zs, AX, HW, WR);
  return g;
}








function trackRun(g, s, zF, zR, rw, nRoad, nRet, halfW, body = 0x333a2c) {
  const L = zF - zR, cz = (zF + zR) / 2;
  for (let i = 0; i < nRoad; i++) cy(g, rw, .3, s * halfW, rw, zF - i * L / (nRoad - 1), body, 0, Math.PI / 2);
  cy(g, rw * .78, .34, s * halfW, rw * .95, zR, 0x3f4735, 0, Math.PI / 2);      
  cy(g, rw * .62, .34, s * halfW, rw * .8, zF, 0x3f4735, 0, Math.PI / 2);       
  
  bx(g, .36, .12, L, s * halfW, rw * .1, cz, body);
  bx(g, .36, .1, L * .96, s * halfW, rw * 1.86, cz * .98, body);
  
  for (let i = 0; i < nRet; i++) cy(g, rw * .3, .16, s * halfW, rw * 1.72, zF - L * (.16 + i * .3), body, 0, Math.PI / 2);
  
  const nl = Math.round(L / .52);
  for (let i = 0; i < nl; i++) bx(g, .4, .19, .2, s * halfW, rw * .04, zR + (i + .5) * L / nl, 0x262b22);
}

function tracks(g, zF, zR, rw, nRoad, nRet, halfW, body) {
  for (const s of [-1, 1]) trackRun(g, s, zF, zR, rw, nRoad, nRet, halfW, body);
}



function launcherFrame(g, x, y, z, w, len, ang, tilt = -.2) {
  const rg = new THREE.Group(); rg.position.set(x, y, z); rg.rotation.x = ang;
  bx(rg, w, .24, len, 0, -.34, 0, STEEL);                          
  bx(rg, w * 1.06, .3, .42, 0, -.34, len * .46, 0x4a5240);         
  for (const s of [-1, 1]) bx(rg, .16, .8, .16, s * w * .46, .05, -len * .18, 0x545b48);   
  g.add(rg);
  
  const a = new THREE.Vector3(x + w * .34, y - .3, z - len * .28);
  const b = new THREE.Vector3(x - w * .2, y - .12, z);
  const d = b.clone().sub(a), mid = a.clone().add(b).multiplyScalar(.5);
  const rod = cy(g, .09, d.length(), mid.x, mid.y, mid.z, 0x8a9298);
  rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return rg;
}

function mkHf2() {
  const g = mkTruck();
  const rg = launcherFrame(g, 0, 2.35, -.8, 1.5, 6.2, -.22);
  for (const dx of [-.62, .62]) for (const dy of [0, .72]) {
    bx(rg, 1.15, .72, 6.2, dx, dy, 0, 0x5a6248);
    bx(rg, 1.2, .76, .16, dx, dy, 3.12, 0x6f7760);                 
  }
  bx(g, 1.3, .9, 1.1, 0, 1.9, 2.9, 0x39412f);                      
  cy(g, .05, 1.6, .5, 2.6, 2.9, 0x2c332c);                         
  return g;
}

function mkHf3() {
  const g = mkTruck();
  const rg = launcherFrame(g, 0, 2.5, -.6, 1.9, 7.2, -.18);
  for (const dx of [-.78, .78]) {
    cy(rg, .52, 7.2, dx, 0, 0, 0x59614a, Math.PI / 2);
    cy(rg, .56, .5, dx, 0, -3.4, 0x4a5240, Math.PI / 2);           
    cn(rg, .52, 1.1, dx, 0, 4.1, 0xb03028, Math.PI / 2);           
  }
  bx(g, 1.3, .9, 1.1, 0, 2.0, 3.2, 0x39412f);
  return g;
}


function mkNmesis() {
  const g = mkTruck(5.9, 2.2);
  bx(g, 2.0, .18, 2.6, 0, 1.62, -1.0, 0x3f4638);                   
  const rg = new THREE.Group(); rg.position.set(0, 2.15, -.35); rg.rotation.x = -.30;
  for (const dx of [-.52, .52]) {
    cy(rg, .38, 4.0, dx, 0, 0, 0x6d7562, Math.PI / 2);
    cn(rg, .38, .7, dx, 0, 2.35, 0x9aa08c, Math.PI / 2);
    bx(rg, .92, .1, .5, dx, -.36, 1.3, 0x545b48);                  
  }
  bx(rg, 2.2, .2, 4.5, 0, -.42, 0, STEEL);
  g.add(rg);
  return g;
}

function mkHarpoon() {
  const g = mkTruck(9.6, 2.5);
  const rg = launcherFrame(g, 0, 2.4, -.4, 1.4, 5.4, -.24);
  for (const dx of [-.58, .58]) for (const dy of [0, .62]) {
    cy(rg, .42, 5.4, dx, dy, 0, 0x6a6f5e, Math.PI / 2);
    cn(rg, .42, .8, dx, dy, 3.05, 0x8a8f7e, Math.PI / 2);
  }
  bx(g, 1.4, 1.0, 1.2, 0, 2.0, 3.0, 0x39412f);                     
  for (const s of [-1, 1]) cy(g, .04, 2.0, s * .6, 2.8, 3.0, 0x2c332c);
  return g;
}

function mkTk3() {
  const g = new THREE.Group();
  const lv = mkTruck(); lv.position.set(-2.6, 0, 0); g.add(lv);
  const rg = launcherFrame(lv, 0, 2.3, -.3, 1.5, 5.6, -.85);
  for (const dx of [-.62, .62]) for (const dy of [-.34, .34]) {
    bx(rg, .72, .72, 5.6, dx, dy, 0, MISS);
    bx(rg, .76, .76, .14, dx, dy, 2.83, 0xa8a898);                 
  }
  
  const rv = mkTruck(8.6, 2.5); rv.position.set(2.8, 0, .4); g.add(rv);
  const pn = new THREE.Group(); pn.position.set(2.8, 3.1, -.4); pn.rotation.y = .5;
  bx(pn, 5.0, 3.4, .3, 0, 1.2, 0, 0x3d4a44);
  for (let i = 0; i < 7; i++) bx(pn, 4.6, .1, .06, 0, -.05 + i * .42, .2, 0x8fa4b8);
  bx(pn, .5, .8, .5, 0, -.8, -.3, DARK);                           
  g.add(pn);
  bx(rv, 1.1, .5, 1.1, 0, 2.6, 2.6, 0x4a5040);                     
  return g;
}


function mkLt2000() {
  const g = mkTruck(9.4, 2.55);
  const rg = new THREE.Group(); rg.position.set(0, 2.35, -.5); rg.rotation.x = -.5;
  bx(rg, 2.6, 1.9, 4.4, 0, 0, 0, 0x3f463a);
  bx(rg, 2.7, 1.95, .16, 0, 0, 2.26, 0x20231c);                    
  for (const dx of [-.86, -.29, .29, .86]) for (const dy of [-.42, .42]) {
    cy(rg, .2, .3, dx, dy, 2.3, 0x14170f, Math.PI / 2);            
    cy(rg, .19, 4.0, dx, dy, .1, 0x2a2f24, Math.PI / 2);
  }
  bx(rg, 2.2, .5, 1.0, 0, 1.2, -2.4, 0x4a5240);                    
  g.add(rg);
  return g;
}

function mkRadar() {
  const g = mkTruck(8.4, 2.5);
  cy(g, .22, 1.6, 0, 2.3, -.4, 0x4a5256);                          
  bx(g, 1.6, .3, 1.6, 0, 3.25, -.4, 0x4a5240);                      
  const pn = new THREE.Group(); pn.position.set(0, 4.5, -.4); pn.rotation.y = .5; pn.rotation.x = -.18;
  for (const s of [-1, 1]) bx(pn, .14, 2.7, .16, s * 2.15, 0, 0, 0x59636a);   
  for (const s of [-1, 1]) bx(pn, 4.45, .14, .16, 0, s * 1.3, 0, 0x59636a);    
  for (let i = 0; i < 9; i++) bx(pn, .05, 2.5, .05, -2.0 + i * .5, 0, .05, 0x8fa4b8);   
  for (let i = 0; i < 5; i++) bx(pn, 4.2, .05, .05, 0, -.95 + i * .48, .07, 0x8fa4b8);  
  bx(pn, .12, .12, 1.2, 0, 0, .65, 0x59636a);                        
  cy(pn, .24, .32, 0, 0, 1.25, 0xa8b4bc, Math.PI / 2);               
  bx(pn, 1.0, .8, .4, 0, -1.65, -.3, DARK);                          
  g.add(pn);
  bx(g, 1.2, .55, 1.2, 0, 1.85, 2.7, 0x39412f);                    
  return g;
}










function mkPavepaws() {
  const g = new THREE.Group();
  const CN = 0x8d8d85, CN2 = 0x7b7c74, CN3 = 0x666a64, AR = 0xb6bec2;
  bx(g, 24, 1.2, 24, 0, .6, 0, CN3);                             
  
  bx(g, 17, 12, 15, 0, 7.2, 0, CN);
  bx(g, 15, 10, 13, 0, 18.2, 0, CN);
  bx(g, 13, 9, 11, 0, 27.7, 0, CN2);
  for (const s of [-1, 1]) bx(g, 1.1, 20, 8, s * 8.4, 16, -2.5, CN2);      
  bx(g, 13.4, 1.6, 11.4, 0, 33, 0, CN3);                        
  for (let i = 0; i < 4; i++) bx(g, 15.2, .5, .5, 0, 4 + i * 8, 7.6, CN3); 
  
  for (const s of [-1, 1]) {
    const az = new THREE.Group(); az.position.set(0, 22.4, 0); az.rotation.y = s * 1.0472;
    const fc = new THREE.Group(); fc.position.set(0, 0, 6.6); fc.rotation.x = -.3491;
    cy(fc, 11.05, 1.2, 0, 0, 0, AR, Math.PI / 2, 0, 24);         
    cy(fc, 10.5, .3, 0, 0, .78, 0x93a0a8, Math.PI / 2, 0, 24);   
    for (let i = 0; i < 4; i++) {                                
      const w = 20.4 - i * 5.1;
      bx(fc, w, .16, .16, 0, -(5.1 - i * 1.7), .9, 0x7f8b91);
      bx(fc, w, .16, .16, 0, (5.1 - i * 1.7), .9, 0x7f8b91);
      bx(fc, .16, w, .16, -(5.1 - i * 1.7), 0, .9, 0x7f8b91);
      bx(fc, .16, w, .16, (5.1 - i * 1.7), 0, .9, 0x7f8b91);
    }
    bx(fc, 22.4, .55, .7, 0, -10.8, .3, CN2);                    
    for (const k of [-1, 1]) bx(fc, .35, 4.2, .35, k * 9.8, -13.2, .3, CN3);  
    az.add(fc); g.add(az);
  }
  
  cy(g, .3, 12, -4, 38, -6, 0x4a5256);
  bx(g, 7, 3, 5, 0, 21.5, -9.5, CN2);                            
  for (const s of [-1, 1]) bx(g, 3.4, 2.2, 3.4, s * 7.5, 2.9, -8, 0x57624e);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    bx(g, .16, 2.2, .16, Math.cos(a) * 12.4, 1.1, Math.sin(a) * 12.4, 0x4a5344);
  }
  return g;
}


function mkGun() {
  const g = new THREE.Group();
  const cc = 0x8a8474, cc2 = 0x736e5f, GL = 0x3a4149;
  cy(g, 3.4, .5, 0, .25, 0, cc);                            
  cy(g, .95, .4, 0, .8, 0, cc);                             
  for (let i = 0; i < 9; i++) {                             
    const a = -1.9 + i * .48;
    bx(g, 1.05, .75, .62, Math.cos(a) * 2.9, .65, Math.sin(a) * 2.9, cc2).rotation.y = -a;
    bx(g, 1.0, .6, .58, Math.cos(a) * 3.25, 1.28, Math.sin(a) * 3.25, 0x7d7768).rotation.y = -a;
  }
  bx(g, 1.5, .8, 1.4, 0, 1.35, 0, 0x4c543f);                
  bx(g, 1.9, 1.15, .22, 0, 1.9, 1.1, 0x454d3a);             
  bx(g, .5, .35, .45, .85, 2.2, .95, 0x2c332c);             
  const rec = cy(g, .16, 1.6, 0, 1.75, 1.5, GL); rec.rotation.x = 1.35;      
  const bar = cy(g, .13, 5.6, 0, 2.35, 2.4, GL); bar.rotation.x = 1.35;      
  cy(g, .19, .62, 0, 3.65, 5.1, 0x33392e).rotation.x = 1.35;                 
  for (const s of [-1, 1]) cy(g, .11, 3.4, s * .3, 2.75, 1.5, 0x39413a).rotation.x = 1.35;  
  for (const s of [-1, 1]) bx(g, .34, .3, 3.4, s * .9, .75, -2.4, 0x454d3a).rotation.set(0, s * .3, 0);  
  bx(g, .8, .5, .8, 0, .6, -3.9, 0x39413a);                                  
  const bun = cy(g, 1.5, 1.9, 2.2, .7, -4.0, cc2); bun.rotation.x = Math.PI / 2;   
  bx(g, .6, 1.1, 1.7, 2.2, .6, -4.0, 0x39413a);                              
  for (let i = 0; i < 3; i++) bx(g, .6, .5, .4, -2.9 - i * .1, .5 + (i > 1 ? .5 : 0), 1.2 + i * .42, 0x5a5344);
  bx(g, 1.2, .9, 1.0, -2.2, .45, -3.2, 0x4a5240);                            
  return g;
}



function mkCoastRadar() {
  const g = new THREE.Group();
  const steel2 = 0x6d7885, st3 = 0x59626d;
  cy(g, 5.6, .14, 0, .07, 0, 0x565e48);                     
  const leg = (lx, lz, y0, y1, w0, w1) => {
    const m = bx(g, .1, y1 - y0, .1, lx * (w0 + w1) / 2, (y0 + y1) / 2, lz * (w0 + w1) / 2, steel2);
    const t = Math.atan2((w0 - w1) / 2, y1 - y0);          
    m.rotation.z = lx * t; m.rotation.x = lz * -t;
    return m;
  };
  const HW = [2.1, 1.85, 1.6, 1.4, 1.3, 1.3];
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
    for (let i = 0; i < 5; i++) leg(lx, lz, i * 2.2, i * 2.2 + 2.2, HW[i], HW[i + 1]);
  const frame = (yy, w) => {
    for (const s of [-1, 1]) {
      bx(g, w, .08, .08, 0, yy, s * w / 2, steel2); bx(g, .08, .08, w, s * w / 2, yy, 0, steel2);
    }
  };
  for (let i = 0; i < 5; i++) frame(i * 2.2, HW[i] * 2);
  frame(11.0, 2.6);
  
  for (let i = 0; i < 5; i++) {
    const y0 = i * 2.2, h = 2.2, wc = (HW[i] + HW[i + 1]) / 2, len = Math.hypot(2 * wc, h);
    const ang = Math.atan2(h, 2 * wc);
    for (let f = 0; f < 4; f++) {
      const gr = new THREE.Group(); gr.position.set(0, y0 + h / 2, 0); gr.rotation.y = f * Math.PI / 2;
      for (const dir of [-1, 1]) bx(gr, len, .055, .055, 0, 0, wc, st3, 0, 0, dir * ang);
      g.add(gr);
    }
  }
  for (let i = 0; i < 5; i++) bx(g, 3.3, .12, 3.3, 0, 2.2 * i + 2.2, 0, st3);   
  bx(g, .06, 11.2, .06, 1.15, 5.6, 1.15, st3);                                  
  for (let i = 0; i < 11; i++) bx(g, .5, .04, .04, 1.15, .6 + i, 1.15, st3);
  bx(g, 3.4, .14, 3.4, 0, 11.2, 0, steel2);                  
  cy(g, .5, .7, 0, 11.6, 0, 0x3f4740);                       
  const pg = new THREE.Group(); pg.position.set(0, 13.1, 0); pg.rotation.y = .4;
  bx(pg, 4.8, 2.3, .14, 0, 0, 0, 0x5f7386);
  for (let i = 0; i < 6; i++) bx(pg, 4.3, .08, .05, 0, -.84 + i * .34, .1, 0x8fa4b8);
  bx(pg, .08, .08, 1.0, 0, 0, .56, steel2);                  
  for (const s of [-1, 1]) bx(pg, .08, .08, 1.1, s * 1.6, -.2, .5, steel2);
  for (let i = 0; i < 5; i++) bx(pg, .07, 2.2, .07, -2.0 + i * 1.0, 0, -.7, st3);   
  g.add(pg);
  bx(g, 5.2, 2.2, 3.4, 7.0, 1.1, 2.0, 0x57624e);             
  bx(g, 1.6, 1.0, 1.8, 7.0, 2.7, 2.0, DARK);
  bx(g, 1.2, 1.4, .9, -6.6, .8, 2.6, 0x4a5040);              
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    bx(g, .12, 1.9, .12, Math.cos(a) * 10.0, .95, Math.sin(a) * 10.0, 0x4a5344);   
    if (i) bx(g, .05, .05, 10.0 * 2 * Math.sin(Math.PI / 14), Math.cos(a - Math.PI / 14) * 10.0, 1.7,
      Math.sin(a - Math.PI / 14) * 10.0, 0x4a5344).rotation.y = -(a - Math.PI / 14);  
  }
  return g;
}





function mkF16() {
  const g = new THREE.Group();
  
  cy(g, .84, 6.2, 0, 0, .3, LG, Math.PI / 2);                          
  cy(g, .74, 2.4, 0, 0, 4.9, LG, Math.PI / 2);                          
  cn(g, .74, 1.6, 0, 0, 6.7, LG2, Math.PI / 2);                         
  cy(g, .68, 3.2, 0, 0, -4.4, LG, Math.PI / 2);                         
  cy(g, .5, 1.3, 0, 0, -6.6, DG, Math.PI / 2);                          
  cy(g, .54, .28, 0, 0, -7.2, 0x1d2226, Math.PI / 2);                   
  
  const cp = new THREE.Mesh(new THREE.SphereGeometry(.72, 14, 10), mat(GLAZ));
  cp.scale.set(.82, .66, 2.1); cp.position.set(0, .92, 4.2); g.add(cp);
  bx(g, 1.0, .12, .3, 0, .72, 5.55, DG);                                
  bx(g, .34, .26, 1.5, 0, .92, 2.3, LG2);                               
  
  bx(g, 1.2, .92, 3.2, 0, -.78, 4.4, LG2);
  bx(g, 1.32, 1.02, .3, 0, -.78, 6.1, DG);                              
  bx(g, 1.05, .2, 2.4, 0, -1.28, 4.3, 0x4a5158);                        
  
  for (const s of [-1, 1]) bx(g, 1.45, .16, 4.8, s * 1.02, .12, .7, LG, s * .3, 0, s * .05);
  
  for (const s of [-1, 1]) {
    wing(g, 4.3, 3.4, s * .62, .0, 1.5, s * .7, 0, LG, .14);
    const mid = stn(s, .62, 1.5, .7, 2.4), tp = stn(s, .62, 1.5, .7, 4.3);
    bx(g, .1, .26, 1.5, mid[0], -.06, mid[1], 0x4a5158);                
    bx(g, .12, .3, .5, tp[0] - s * .2, .12, tp[1] + .3, LG2);           
    const rail = cy(g, .12, 3.4, tp[0] + s * .18, .22, tp[1] - .4, 0x7a836e, Math.PI / 2);
    cn(g, .12, .55, tp[0] + s * .18, .22, tp[1] + 1.35, 0x5a6355, Math.PI / 2);   
  }
  
  cy(g, .4, 3.8, 0, -1.15, 1.2, 0x6d7864, Math.PI / 2);
  bx(g, .2, .6, 1.2, 0, -.72, 1.2, 0x4a5158);                           
  for (const s of [-1, 1]) missile(g, s * 1.35, -.62, .4, 3.4);
  



  bx(g, .18, 2.3, 2.5, 0, 1.72, -4.9, LG, 0, -.38);
  bx(g, .2, 1.1, 2.7, 0, 1.35, -4.35, LG2, 0, -.1);                   
  bx(g, .22, .32, 1.4, -.02, 2.9, -5.75, LG2);                        
  bx(g, .22, .55, .12, .02, 1.75, -6.15, 0x4a5158);                   
  
  for (const s of [-1, 1]) {
    wing(g, 2.3, 2.0, s * .5, .12, -5.5, s * .85, 0, LG2, .11);
    bx(g, .1, .75, 1.7, s * .45, -1.15, -4.6, LG2, 0, -.22);            
  }
  
  gearLeg(g, 0, -.55, 5.1, 1.05, .3);
  for (const s of [-1, 1]) gearLeg(g, s * 1.05, -.3, 1.0, 1.15, .36);
  return g;
}



















function pattonHull(g) {
  const HB = 0x4a5340, HB2 = 0x3d4536;
  bx(g, 3.1, .7, 6.4, 0, .78, 0, HB2);                          
  bx(g, 3.06, .5, 6.2, 0, 1.32, .1, HB);                        
  bx(g, 3.0, .2, 1.6, 0, 1.16, 3.3, HB, 0, -.5);                 
  bx(g, 2.9, .9, .34, 0, .62, 3.5, HB2, 0, .25);                 
  bx(g, 3.1, .5, .8, 0, 1.2, -3.3, HB);                          
  for (const s of [-1, 1]) {
    bx(g, .18, .8, 6.6, s * 1.7, 1.02, 0, HB);                   
    bx(g, .52, .06, 6.5, s * 1.58, 1.46, 0, HB2);                
    bx(g, .5, .3, .9, s * 1.58, 1.34, 3.05, HB2, 0, -.2);        
    bx(g, .34, .5, .34, s * 1.5, 1.2, -3.15, 0x3f4735);          
  }
  tracks(g, 2.55, -2.55, .45, 6, 3, 1.42);
  
  bx(g, .85, .12, .95, -.3, 1.62, 2.35, HB2);
  for (const s of [-1, 1]) bx(g, .18, .1, .45, -.3 + s * .2, 1.72, 2.7, 0x1c2a30);
  cy(g, .09, 1.2, .8, 1.45, 3.2, 0x39413a, Math.PI / 2);         
  
  bx(g, 2.8, .14, 2.1, 0, 1.56, -2.2, 0x39413a);
  for (let i = 0; i < 3; i++) bx(g, 2.4, .16, .3, 0, 1.62, -1.45 - i * .48, 0x2a3028);
  cy(g, .38, .24, 0, 1.68, -1.25, 0x4a5240);
  for (const s of [-1, 1]) bx(g, .5, .45, .6, s * 1.45, 1.72, -2.85, 0x3f4735);
  return HB;
}

function gun105(p, y, z, mrs = true) {
  cy(p, .13, 4.3, 0, y, z + 2.15, 0x39413a, Math.PI / 2);
  cy(p, .16, 2.4, 0, y, z + 1.4, 0x454d3a, Math.PI / 2);         
  cy(p, .2, .62, 0, y, z + 2.6, 0x2f3630, Math.PI / 2);          
  if (mrs) { bx(p, .26, .26, .3, .18, y + .1, z + 4.2, 0x2c332c); cy(p, .1, .3, .18, y - .12, z + 4.25, 0x23272c, Math.PI / 2); }
}

function smokeCluster(p, y, z) {
  for (const s of [-1, 1]) {
    bx(p, .46, .34, .34, s * 1.05, y, z, 0x39412f);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++)
      cy(p, .055, .3, s * 1.05 - .15 + i * .15, y - .08 + j * .16, z + .2, 0x30362e, Math.PI / 2);
  }
}
function mkTank(variant) {
  const g = new THREE.Group();
  const HB = pattonHull(g);
  const tur = new THREE.Group(); tur.position.set(0, 2.05, -.25);
  if (variant === 'cm11') {
    
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.42, 14, 10), mat(HB));
    shell.scale.set(1.02, .5, 1.28); tur.add(shell);
    bx(tur, 2.5, .8, 1.5, 0, -.1, -1.5, HB, 0, .3);               
    bx(tur, 2.9, .3, 2.6, 0, -.42, -.2, 0x3d4536);                
    bx(tur, 1.15, .95, .5, 0, .1, 1.62, 0x454d3a);                
    gun105(tur, .18, 1.7, false);
    


    cy(tur, .42, .34, .78, .72, -.75, 0x454d3a);                   
    cy(tur, .07, .42, .78, .95, -.75, 0x2f3630);                   
    cy(tur, .05, .55, .78, 1.06, -.30, 0x33392e, Math.PI / 2);      
    cy(tur, .04, .95, .78, 1.06, .45, 0x2f3630, Math.PI / 2);       
    bx(tur, .34, .3, .42, -.72, .68, .1, 0x1c2a30);               
    smokeCluster(tur, .3, 1.0);
  } else {
    
    bx(tur, 2.6, .92, 3.3, 0, 0, 0, HB);
    bx(tur, 2.5, .8, 1.1, 0, -.05, 1.9, HB);                     
    for (const s of [-1, 1]) bx(tur, .9, .85, 1.2, s * .95, -.02, 2.0, HB, 0, s * .28);   
    bx(tur, 2.7, 1.0, 1.3, 0, .05, -2.0, 0x454d3a);                
    bx(tur, 2.5, .12, 1.4, 0, .52, -2.0, 0x39412f);                
    bx(tur, .9, .45, .55, .95, .55, 1.1, 0x2c332c);                
    cy(tur, .06, .8, -1.0, .62, .3, 0x2c332c);                     
    bx(tur, 2.34, .3, 2.3, 0, .58, .3, 0x454d3a);                  
    cy(tur, .5, .4, -.72, .85, -.9, 0x454d3a);                     
    cy(tur, .06, .45, -.72, .9, -.35, 0x33392e);
    cy(tur, .05, .8, -.72, 1.28, -.1, 0x2f3630, Math.PI / 2);      
    gun105(tur, .12, 2.0, true);
    smokeCluster(tur, .18, 1.35);
  }
  for (const s of [-1, 1]) cy(tur, .05, 1.0, s * .5, .5, -1.8, 0x2c332c);   
  g.add(tur);
  return g;
}









function mkIfv(variant) {
  const g = new THREE.Group();
  const SB = 0x555e48, SB2 = 0x454d3a, GL = 0x1c2a30;
  




  bx(g, 2.5, 1.45, 6.2, 0, 1.50, -.2, SB);                           
  bx(g, 2.4, .5, 6.0, 0, .62, -.2, SB2);                             
  bx(g, 2.45, .2, 1.9, 0, 1.45, 2.85, SB, 0, -.42);                  
  bx(g, 2.5, .55, .8, 0, 2.10, 2.70, SB2);                           
  bx(g, 2.3, .52, 1.0, 0, 2.02, 2.60, GL);                           
  bx(g, 2.4, .12, 1.5, 0, 2.26, 1.95, SB2);                          
  
  bx(g, 1.25, .3, 1.9, .72, 2.36, 1.55, 0x39412f);                   
  for (let i = 0; i < 4; i++) bx(g, 1.1, .12, .22, .72, 2.48, .95 + i * .42, 0x2a3028);
  
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = 2.0 - i * 1.38;
      cy(g, .52, .4, s * 1.05, .52, z, TIRE, 0, Math.PI / 2);
      cy(g, .28, .44, s * 1.05, .52, z, 0x4a5040, 0, Math.PI / 2);    
      bx(g, .1, .1, 1.2, s * 1.18, 1.15, z, SB2);                     
    }
    bx(g, .3, .12, 5.6, s * 1.24, 1.35, -.2, SB2);                    
    bx(g, .1, .34, 1.1, s * 1.26, 1.75, 2.2, GL);                     
    bx(g, .26, .3, .5, s * 1.28, 1.95, .6, 0x3f4735);                 
    for (let i = 0; i < 2; i++) bx(g, .3, .28, .3, s * 1.26, 1.85, -2.2 - i * .5, 0x3f4735);   
  }
  
  bx(g, 2.3, 1.4, .2, 0, 1.5, -3.3, SB2);
  bx(g, 1.3, .12, 1.5, 0, .7, -2.8, 0x39412f);                        
  for (const s of [-1, 1]) bx(g, .2, .16, .1, s * 1.0, 1.7, -3.4, 0x8a2f26);
  
  for (let i = 0; i < 4; i++) bx(g, .62, .12, .62, (i % 2 ? .72 : -.72), 2.28, -.2 - Math.floor(i / 2) * .9, SB2);
  if (variant === 'cm34') {
    
    const tur = new THREE.Group(); tur.position.set(0, 2.28, .3);
    bx(tur, 1.9, .68, 2.3, 0, 0, 0, SB2);
    for (const s of [-1, 1]) bx(tur, .2, .5, 1.3, s * .95, .12, .5, 0x4d5540);   
    bx(tur, 1.7, .5, .8, 0, .05, 1.35, SB2, 0, -.25);              
    bx(tur, 1.5, .1, 1.6, 0, .36, -.2, 0x4d5540);                  
    bx(tur, 1.9, .7, .3, 0, -.05, -1.2, SB2);                      
    bx(tur, 1.95, .72, .16, 0, -.05, -1.4, 0x39412f);
    
    cy(tur, .085, 2.5, 0, .12, 1.9, 0x2c332c, Math.PI / 2);
    cy(tur, .11, 1.0, 0, .12, 1.5, 0x3a4132, Math.PI / 2);
    cy(tur, .13, .34, 0, .12, 3.1, 0x23272c, Math.PI / 2);         
    cy(tur, .055, 1.5, .18, .02, 1.4, 0x33392e, Math.PI / 2);      
    bx(tur, .42, .34, .5, -.72, .5, 1.0, 0x1c2a30);                
    bx(tur, .4, .3, .45, .72, .62, .2, 0x1c2a30);                  
    cy(tur, .05, .34, .72, .68, -.4, 0x2c332c);                    
    cy(tur, .04, .85, .72, .78, .05, 0x2f3630, Math.PI / 2);       
    
    for (const s of [-1, 1]) {
      bx(tur, .3, .26, 1.1, s * 1.0, .3, .1, 0x39412f);
      for (let i = 0; i < 4; i++) cy(tur, .05, .26, s * 1.0, .3, -.35 + i * .26, 0x30362e, Math.PI / 2);
    }
    g.add(tur);
  } else {
    
    const tur = new THREE.Group(); tur.position.set(0, 2.28, .3);
    bx(tur, 1.05, .34, 1.35, 0, 0, 0, 0x4d5540);                   
    bx(tur, .9, .62, 1.0, 0, .42, .1, SB2);                        
    bx(tur, .34, .34, .3, .5, .55, .5, 0x1c2a30);                  
    cy(tur, .055, 1.7, -.12, .42, .9, 0x2c332c, Math.PI / 2);      
    cy(tur, .085, 1.25, .12, .3, 1.0, 0x33392e, Math.PI / 2);      
    cy(tur, .16, .34, .12, .34, 1.62, 0x3f4735, Math.PI / 2);      
    bx(tur, 1.0, .12, .5, 0, .12, -.6, 0x39412f);                  
    for (const s of [-1, 1]) cy(tur, .05, .3, s * .48, .55, -.3, 0x30362e);
    g.add(tur);
  }
  
  for (const s of [-1, 1]) {
    bx(g, .26, .2, .16, s * 1.0, 1.45, 3.6, 0xd8d2ae);             
    cy(g, .04, 1.0, s * 1.26, 2.5, 2.3, 0x2c332c);                 
  }
  return g;
}















function mkM1A2T() {
  const g = new THREE.Group();
  const HB = 0x4d5343, TUR = 0x474d3d;
  bx(g, 3.5, .9, 7.3, 0, 1.2, .1, HB);                          
  bx(g, 3.4, .6, 7.0, 0, .5, .1, DARK);                         
  bx(g, 3.45, .3, 1.7, 0, 1.0, 3.7, HB, 0, -.62);                
  bx(g, 3.4, .8, .4, 0, .72, 3.85, DARK, 0, .2);                 
  for (const s of [-1, 1]) {
    bx(g, .26, 1.05, 7.0, s * 1.72, 1.1, 0, 0x3a4132);           
    bx(g, .55, .07, 6.9, s * 1.62, 1.6, 0, TUR);                 
  }
  tracks(g, 2.9, -2.9, .44, 7, 3, 1.46);
  
  bx(g, .8, .12, .9, 1.0, 1.66, 3.0, 0x39412f);
  for (let i = 0; i < 3; i++) bx(g, .6, .1, .16, 1.0, 1.74, 2.6 + i * .3, 0x1c2a30);
  
  bx(g, 3.0, .16, 2.2, 0, 1.72, -2.3, 0x2c332c);
  for (let i = 0; i < 4; i++) bx(g, 2.6, .1, .18, 0, 1.8, -1.5 - i * .35, 0x23272c);
  bx(g, 3.1, .9, .3, 0, 1.1, -3.7, 0x2c332c);                   
  for (let i = 0; i < 6; i++) bx(g, .16, .8, .2, -1.2 + i * .48, 1.1, -3.8, 0x23272c);
  




  const tur = new THREE.Group(); tur.position.set(0, 1.95, -.15);
  bx(tur, 2.9, 1.0, 3.4, 0, 0, 0, TUR);                         
  for (const s of [-1, 1]) bx(tur, .55, .95, 1.6, s * 1.5, -.05, 1.5, TUR, 0, 0, s * .3);  
  bx(tur, 2.6, .5, 1.0, 0, -.05, 2.2, TUR, 0, -.5);              
  bx(tur, 3.0, .95, 1.5, 0, -.15, -2.1, 0x3f4636);               
  bx(tur, 2.8, .12, 1.4, 0, .42, -2.1, 0x333a2c);               
  bx(tur, 2.95, .14, 3.2, 0, .52, .1, 0x4a5040);                 
  bx(tur, .8, .42, .9, -.9, .62, .9, 0x39413a);                  
  bx(tur, .28, .18, .3, -.9, .78, .9, 0x1c2a30);
  bx(tur, 1.0, .55, .95, .95, .55, 1.15, 0x39413a);              
  bx(tur, .3, .22, .35, .95, .78, 1.6, 0x1c2a30);
  
  bx(tur, .95, .5, .95, .55, .62, -1.0, 0x454d3a);               
  cy(tur, .07, 1.3, .55, .78, -.35, 0x2f3630, Math.PI / 2);
  bx(tur, .7, .1, .7, -.5, .62, -1.2, 0x39412f);                 
  
  for (const s of [-1, 1]) {
    bx(tur, .38, .38, .34, s * 1.45, .12, -1.75, 0x39412f);
    for (let i = 0; i < 5; i++)
      cy(tur, .055, .36, s * 1.45 - .13 + (i % 3) * .13, .12 - .07 + (i > 2 ? .14 : 0), -1.9, 0x30362e, -.52);
  }
  
  cy(tur, .15, 5.2, 0, .05, 3.6, 0x39413a, Math.PI / 2);
  cy(tur, .19, 3.6, 0, .05, 3.0, 0x454d3a, Math.PI / 2);         
  for (let i = 0; i < 5; i++) cy(tur, .21, .12, 0, .05, 1.6 + i * .75, 0x3a4132, Math.PI / 2);
  cy(tur, .24, .75, 0, .05, 4.9, 0x2f3630, Math.PI / 2);         
  bx(tur, 1.15, .8, .45, 0, .05, 1.25, 0x454d3a);                
  for (const s of [-1, 1]) cy(tur, .05, 1.1, s * .9, .35, -1.9, 0x2c332c);   
  g.add(tur);
  return g;
}




function mkTow() {
  const g = mkTruck(4.9, 2.2);
  
  bx(g, 2.0, .5, 2.1, 0, 1.4, -1.25, 0x3a4132);
  for (const s of [-1, 1]) bx(g, .1, .8, 2.0, s * .95, 1.9, -1.25, 0x30362e);
  bx(g, 1.9, .1, .1, 0, 2.3, -1.25, 0x30362e);
  
  const rg = new THREE.Group(); rg.position.set(0, 2.15, -1.35); rg.rotation.x = -0.12;
  for (const [lx, lz] of [[0, -1], [-.8, .6], [.8, .6]]) {
    const m = cy(rg, .06, .95, lx * .5, -.45, lz * .5, 0x4a5256);
    m.rotation.set(Math.atan2(lz, 1) * .5, 0, Math.atan2(-lx, 1) * .5);
  }
  cy(rg, .1, .7, 0, -.05, 0, 0x3f4735);                          
  for (const dy of [-.19, .19]) {                                
    cy(rg, .16, 2.5, 0, dy, 0, 0x6a6f5e, Math.PI / 2);
    cn(rg, .16, .35, 0, dy, 1.42, 0x9aa08c, Math.PI / 2);
    cy(rg, .19, .3, 0, dy, -1.3, 0x545b48, Math.PI / 2);         
  }
  bx(rg, .5, .8, 1.3, .42, .0, -.1, 0x39412f);                  
  bx(rg, .2, .2, .3, .42, .3, .7, 0x1c2a30);                     
  g.add(rg);
  bx(g, .3, .3, .3, 1.15, 1.7, .5, 0x30362e);                     
  return g;
}




function mkPac3() {
  const g = new THREE.Group();
  const TR = 0x5a5f52, DK = 0x3a4132;
  
  bx(g, 2.7, .34, 6.2, 0, 1.14, -.3, TR);                       
  bx(g, 1.5, .5, 1.5, 0, 1.4, 3.2, TR);                          
  cy(g, .14, .5, 0, 1.85, 3.6, DK);                             
  bx(g, 2.8, .12, 5.6, 0, .95, -.3, 0x4a5040);                  
  mkWheels(g, [-1.5, -2.5], .55, 1.3, .55);                     
  for (const s of [-1, 1]) {
    bx(g, .3, .9, .3, s * 1.35, .8, 2.6, 0x4a5040);             
    cy(g, .12, .8, s * 1.35, .3, 2.6, STEEL);
    bx(g, .3, .9, .3, s * 1.35, .8, -3.0, 0x4a5040);
    cy(g, .12, .8, s * 1.35, .3, -3.0, STEEL);
    bx(g, .16, .5, 1.0, s * 1.42, 1.35, -.3, DK);               
  }
  bx(g, 1.4, 1.0, 1.6, .0, 1.85, -3.4, 0x4d5540);               
  for (let i = 0; i < 3; i++) bx(g, 1.2, .14, .18, 0, 2.0 - i * .2, -4.15, DK);
  
  bx(g, 2.5, .5, 2.2, 0, 1.55, -.4, 0x4a5040);
  cy(g, .55, .6, 0, 1.95, -.4, DK);                             
  const rg = new THREE.Group(); rg.position.set(0, 2.05, -.6); rg.rotation.x = -0.6632;   
  for (const dx of [-.62, .62]) for (const dy of [-.48, .48]) {
    bx(rg, .86, .86, 5.4, dx, dy, 0, 0x6f7466);
    bx(rg, .9, .9, .16, dx, dy, 2.72, 0x8a8f7e);                
    bx(rg, .9, .1, .3, dx, dy + .48, -1.2, 0x545b48);           
    
    for (const ox of [-.21, .21]) for (const oy of [-.21, .21])
      cy(rg, .17, .14, dx + ox, dy + oy, 2.86, 0x2a3028, Math.PI / 2, 0, 8);
  }
  bx(rg, 2.4, .3, 5.8, 0, -1.0, 0, STEEL);                     
  for (const s of [-1, 1]) bx(rg, .2, 1.1, .2, s * 1.0, -.45, -2.2, 0x4a5256);   
  g.add(rg);
  bx(g, 1.0, .5, .8, 0, 2.2, 1.8, DK);                          
  return g;
}



function mkTk1() {
  const g = mkTruck(9.8, 2.5);
  


  const rg = launcherFrame(g, 0, 2.0, -.4, 1.45, 5.2, -0.70);
  for (const dx of [-.6, .6]) for (const dy of [-.32, .32]) {
    bx(rg, .68, .68, 5.2, dx, dy, 0, 0xd6d2c0);
    bx(rg, .72, .72, .14, dx, dy, 2.65, 0xb8b4a2);
  }
  bx(g, 1.3, .95, 1.2, 0, 2.0, 3.1, 0x39412f);                   
  return g;
}

function mkHf3ER() {
  const g = mkTruck(10.4, 2.55);
  const rg = launcherFrame(g, 0, 2.55, -.7, 1.9, 8.9, -.16);
  for (const dx of [-0.8, 0.8]) {
    cy(rg, 0.56, 8.9, dx, 0, 0, 0x59614a, Math.PI / 2);
    cn(rg, 0.56, 1.2, dx, 0, 5.05, 0xb03028, Math.PI / 2);
    cy(rg, .6, .9, dx, 0, -3.4, 0x4a5240, Math.PI / 2);           
    for (let i = 0; i < 4; i++) bx(rg, .06, .5, .5, dx + .4 * Math.cos(i * 1.57), .4 * Math.sin(i * 1.57), -4.0, 0x39412f);
  }
  bx(g, 1.3, .9, 1.1, 0, 2.05, 3.6, 0x39412f);
  return g;
}














function mkAh64() {
  const g = new THREE.Group();
  const AH = 0x3f4638, AH2 = 0x333a2e, GL = 0x16222f;
  
  bx(g, 1.05, 1.0, 4.2, 0, 1.42, .3, AH);
  bx(g, .95, .7, 1.9, 0, 1.28, 2.5, AH2);                        
  bx(g, .98, .8, 1.6, 0, 1.85, 1.0, AH2);                        
  bx(g, .82, .1, 1.5, 0, 1.95, 2.3, GL);                         
  bx(g, .8, .12, 1.2, 0, 2.35, .8, GL);                          
  for (const s of [-1, 1]) bx(g, .06, .5, 1.3, s * .5, 1.5, 2.5, GL);   
  
  bx(g, .95, .42, .9, 0, .95, 3.05, 0x2c332c);                   
  cy(g, .1, 1.6, 0, .82, 3.6, 0x24291f, Math.PI / 2);            
  cy(g, .08, 1.2, .17, .82, 3.5, 0x24291f, Math.PI / 2);
  bx(g, .46, .42, .5, -.42, 1.15, 3.35, 0x1c2a30);               
  bx(g, .3, .3, .34, .42, 1.2, 3.3, 0x30362e);                   
  
  for (const s of [-1, 1]) {
    bx(g, 2.2, .14, 1.0, s * 1.6, 1.5, .3, AH2);
    bx(g, .38, .26, 1.7, s * 2.5, 1.15, .35, 0x5a5f52);          
    for (const k of [-1, 1]) {
      cy(g, .12, 1.9, s * 2.5 + k * .2, .82, .4, 0x6f7466, Math.PI / 2);
      cn(g, .12, .3, s * 2.5 + k * .2, .82, 1.45, 0x8a8f7e, Math.PI / 2);
    }
    bx(g, .5, .34, 1.5, s * 1.75, 1.12, .35, 0x4a5240);         
    for (let i = 0; i < 7; i++) cy(g, .09, .2, s * 1.75 - .18 + (i % 3) * .18, 1.12 + (i > 2 ? .1 : -.1), 1.1, 0x20231c, Math.PI / 2);
  }
  
  for (const s of [-1, 1]) {
    bx(g, .78, .72, 2.4, s * .62, 2.35, -.6, AH);
    cy(g, .34, .5, s * .62, 2.5, .7, 0x2a3028, Math.PI / 2);     
    bx(g, .6, .3, .8, s * .62, 2.75, -1.6, 0x2c332c, 0, -.4);    
  }
  
  bx(g, 1.0, .7, 1.3, 0, 2.7, -.6, AH2);
  cy(g, .22, .9, 0, 3.25, -.6, 0x333a2e);
  cy(g, .95, .34, 0, 3.95, -.6, 0x5f6b62);                        
  bx(g, 1.9, .08, .18, 0, 4.15, -.6, 0x4a5248);
  

  for (let i = 0; i < 4; i++) {
    const bg = new THREE.Group(); bg.position.set(0, 3.62, -.6); bg.rotation.y = i * Math.PI / 2;
    bx(bg, 3.7, .1, .58, 1.9, .12, 0, 0x24291f);
    bx(bg, 3.5, .07, .34, 5.5, .2, 0, 0x24291f);                  
    bx(bg, .5, .12, .3, 7.1, .16, 0, 0x1d2219);                   
    bx(bg, 1.0, .07, .1, .8, -.18, .28, 0x3a4132);                
    g.add(bg);
  }
  


  bx(g, .5, .46, 5.6, 0, 1.70, -3.7, AH);
  bx(g, .32, .32, 4.2, 0, 1.78, -8.6, AH2);                        
  cy(g, .3, .6, 0, 1.72, -1.1, AH2, Math.PI / 2);
  bx(g, 1.9, .1, .8, -.95, 1.95, -7.0, AH2);                      
  for (const s of [-1, 1]) bx(g, .08, .5, .7, -.95 + s * .9, 2.15, -7.05, AH2);   
  bx(g, .2, 1.25, 1.0, 0, 2.35, -9.3, AH, 0, .18);                 
  bx(g, .16, .5, .55, -.3, 2.75, -9.9, AH2);                       
  cy(g, .16, .4, -.55, 2.75, -9.9, 0x333a2e, Math.PI / 2);         
  blades(g, 4, .9, -.62, 2.75, -9.9, 'v', 0x24291f);               
  
  for (const s of [-1, 1]) {
    cy(g, .09, 1.1, s * .8, .62, 1.0, 0x30362e).rotation.z = s * .22;
    cy(g, .36, .22, s * .82, .16, 1.0, TIRE, 0, Math.PI / 2);
  }
  cy(g, .08, .7, 0, .95, -8.6, 0x30362e);                         
  cy(g, .2, .14, 0, .55, -8.6, TIRE, 0, Math.PI / 2);
  return g;
}











function amphHull(g, HB, HB2) {
  bx(g, 3.19, .78, 7.4, 0, .95, .1, HB2);                            
  bx(g, 3.0, .5, 1.4, 0, .92, 3.7, HB2).rotation.x = -.34;           
  bx(g, 3.0, .46, 1.2, 0, .95, -3.8, HB2).rotation.x = .3;           
  bx(g, 3.05, .95, 6.4, 0, 1.8, .25, HB);                             
  bx(g, 2.95, .2, 1.9, 0, 2.12, 3.5, HB).rotation.x = -.42;          
  for (const s of [-1, 1]) {                                          
    bx(g, .4, .68, 5.6, s * 1.62, 1.32, .1, 0x39412f);
    bx(g, .1, .18, 5.4, s * 1.62, 1.7, .1, 0x2f3628);
  }
  bx(g, 1.35, .18, 2.1, .78, 2.26, 2.45, 0x414a38);                   
  for (let i = 0; i < 4; i++) bx(g, 1.2, .08, .13, .78, 2.38, 3.2 - i * .44, DARK);   
  bx(g, .5, .28, .85, .98, 2.34, 1.35, 0x33392e);                     
  bx(g, 1.0, .12, 1.15, -.85, 2.2, 2.6, HB2);                         
  for (let i = 0; i < 3; i++) bx(g, .16, .13, .1, -.85, 2.32, 3.05 - i * .3, 0x16222f);   
  bx(g, 1.95, 1.05, .18, 0, 1.45, -3.95, HB2);                        
  bx(g, .12, .9, .1, .72, 1.45, -4.06, 0x2b3128);                     
  bx(g, 1.9, .1, .75, 0, .6, -4.2, 0x3a4132);                         
  tracks(g, 2.6, -2.6, .44, 6, 3, 1.4, 0x333a2c);                     
}

function amphSeaKit(g, HB, HB2) {
  const bv = new THREE.Group(); bv.position.set(0, 1.0, 3.95); bv.rotation.x = -1.257;
  bx(bv, 3.05, .13, 2.0, 0, 0, 1.0, HB);                              
  for (const s of [-1, 1]) bx(bv, .1, .3, 1.9, s * 1.4, .16, 1.0, HB2);
  bx(bv, 1.1, .3, .36, 0, -.18, .06, 0x3a4132);                       
  g.add(bv);
  const sv = new THREE.Group(); sv.position.set(0, 1.05, -4.1); sv.rotation.x = 1.31;
  bx(sv, 2.7, .12, 1.5, 0, 0, -.75, HB);                               
  for (const s of [-1, 1]) bx(sv, .1, .24, 1.4, s * 1.2, .13, -.75, HB2);
  g.add(sv);
  for (const s of [-1, 1]) {
    bx(g, 1.0, .9, 1.1, s * .85, 1.02, -3.45, HB2);                    
    cy(g, .4, .95, s * .85, .6, -4.3, 0x2a3028, Math.PI / 2);           
  }
  bx(g, .12, .7, .9, 0, .6, -4.55, 0x3a4132);                          
}

function mkZtd05() {
  const g = new THREE.Group();
  const HB = 0x49523e, HB2 = 0x3d4536;
  amphHull(g, HB, HB2); amphSeaKit(g, HB, HB2);
  const tur = new THREE.Group(); tur.position.set(0, 2.3, -1.15); g.add(tur);
  bx(tur, 2.42, .62, 2.9, 0, 0, .05, HB);                              
  bx(tur, 2.2, .5, 1.0, 0, .04, -1.85, HB2);                           
  bx(tur, 2.5, .12, 3.1, 0, .35, .05, 0x414a38);                       
  for (const s of [-1, 1]) bx(tur, .13, .5, 2.6, s * 1.24, .02, .1, 0x39412f);   
  bx(tur, 1.05, .58, .8, 0, .08, 1.66, 0x3f4735);                      
  cy(tur, .15, 4.5, 0, .12, 4.2, 0x333a2c, Math.PI / 2);                
  cy(tur, .2, 4.1, 0, .12, 4.15, 0x4a4f42, Math.PI / 2);                
  for (const dz of [2.6, 4.3, 5.9]) cy(tur, .23, .16, 0, .12, dz, 0x39412f, Math.PI / 2);   
  cy(tur, .27, .78, 0, .12, 3.55, 0x39412f, Math.PI / 2);               
  bx(tur, .36, .36, .52, 0, .12, 6.35, 0x2a3028);                       
  for (const s of [-1, 1]) bx(tur, .1, .32, .44, s * .21, .12, 6.33, 0x1c2a30);   
  cy(tur, .08, 1.4, .48, .04, 4.0, 0x2c332c, Math.PI / 2);              
  bx(tur, .44, .36, .52, -.8, .42, .9, 0x1c2a30);                       
  const cu = new THREE.Group(); cu.position.set(.62, .48, -.95); tur.add(cu);   
  cy(cu, .5, .32, 0, 0, 0, HB2);
  bx(cu, .32, .34, .34, 0, .3, .16, 0x1c2a30);
  cy(cu, .06, 1.5, 0, .3, .95, 0x2c332c, 1.257);                        
  const rail = new THREE.Group(); rail.position.set(1.15, .18, -.2); rail.rotation.x = -.35; tur.add(rail);   
  bx(rail, .34, .22, 1.7, 0, 0, 0, 0x39412f);
  cy(rail, .09, 1.5, 0, .18, .1, 0x5a5344, Math.PI / 2);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++)
    cy(tur, .06, .26, s * 1.2, .3, 1.05 - i * .3, 0x30362e, .6);         
  cy(tur, .05, 1.0, -1.05, .75, -1.6, 0x2c332c);                        
  return g;
}

function mkZbd05() {
  const g = new THREE.Group();
  const HB = 0x4b5442, HB2 = 0x3e4636;
  amphHull(g, HB, HB2); amphSeaKit(g, HB, HB2);
  bx(g, 2.85, .16, 4.3, 0, 2.24, -1.3, 0x414a38);                      
  for (let i = 0; i < 3; i++) for (const s of [-1, 1])
    bx(g, .52, .12, .72, s * .74, 2.38, -.35 - i * 1.12, HB2);         
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    bx(g, .1, .34, .5, s * 1.53, 1.72, -.4 - i * 1.12, 0x33392e);       
    bx(g, .1, .2, .3, s * 1.53, 2.02, -.4 - i * 1.12, 0x16222f);        
  }
  





  const tur = new THREE.Group(); tur.position.set(-.32, 2.42, .3); g.add(tur);
  bx(tur, 1.95, .90, 2.3, 0, .20, .1, HB);
  bx(tur, 1.75, .60, .8, 0, .18, -1.35, HB2);                           
  bx(tur, 2.0, .12, 2.4, 0, .68, .1, 0x414a38);                         
  bx(tur, .95, .5, .6, 0, .26, 1.32, 0x3f4735);                         
  cy(tur, .075, 2.9, 0, .30, 3.0, 0x2c332c, Math.PI / 2);               
  bx(tur, .2, .2, .42, 0, .30, 4.5, 0x2a3028);                          
  cy(tur, .13, 1.5, 0, .30, 2.3, 0x4a4f42, Math.PI / 2);                
  cy(tur, .07, 1.3, .36, .22, 2.6, 0x33392e, Math.PI / 2);              
  bx(tur, .36, .32, .46, -.66, .55, .62, 0x1c2a30);                     
  cy(tur, .4, .3, .5, .62, -.5, HB2);                                   
  bx(tur, .30, .34, .34, .50, .92, -.36, 0x1c2a30);                     
  cy(tur, .06, .45, .55, .95, -.95, 0x2c332c);                          
  cy(tur, .045, 1.30, .55, 1.02, -.45, 0x2f3630, 1.3);                  
  for (const s of [-1, 1]) {                                            
    const rail = new THREE.Group(); rail.position.set(s * .98, .3, -.35); rail.rotation.x = -.38; tur.add(rail);
    bx(rail, .3, .2, 1.5, 0, 0, 0, 0x39412f);
    cy(rail, .085, 1.35, 0, .16, .08, 0x5a5344, Math.PI / 2);
  }
  const cage = new THREE.Group(); cage.position.set(0, .1, -1.78); tur.add(cage);   
  for (const s of [-1, 1]) {
    bx(cage, .06, .78, .06, s * .9, 0, 0, 0x555c4c);
    bx(cage, .06, .78, .06, s * .45, 0, 0, 0x555c4c);
  }
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++)
    bx(cage, .05, .7, .05, -.9 + i * .3, 0, s * .1, 0x5a6150);
  for (const s of [-1, 1]) bx(cage, 1.95, .05, .05, 0, s * .3, 0, 0x555c4c);
  return g;
}



function mkHq9() {
  const g = new THREE.Group();
  const tv = mkTruck(11.4, 3.0); tv.position.set(-3.1, 0, 0); g.add(tv);
  const rg = new THREE.Group(); rg.position.set(-3.1, 2.5, -1.1); rg.rotation.x = -.157;   
  bx(rg, 3.3, .34, 1.2, 0, -.3, 0, STEEL);                            
  bx(rg, 3.1, .5, .6, 0, -.1, -.7, 0x4a5240);                         
  for (const s of [-1, 1]) bx(rg, .2, 1.1, 1.0, s * 1.58, .3, .05, 0x545b48);   
  for (let i = 0; i < 4; i++) {
    const tx = -1.2 + i * .8;
    cy(rg, .35, 7.4, tx, 3.7, .05, 0x767a68);                          
    cy(rg, .39, .55, tx, .35, .05, 0x5a6150);                           
    cy(rg, .35, .2, tx, 7.32, .05, 0x8b8f7c);                           
    for (const dy of [2.2, 5.4]) bx(rg, .74, .3, .7, tx, dy, .48, 0x4a5240);   
  }
  bx(rg, 1.1, .5, .7, 0, .5, -1.15, 0x2c3128);                        
  g.add(rg);
  for (const s of [-1, 1]) bx(tv, .55, .55, .95, s * 1.72, .95, -4.5, 0x3a4132);   
  bx(tv, 2.8, .22, 2.6, 0, 1.5, 4.5, STEEL);                          
  
  const rv = mkTruck(8.6, 2.9); rv.position.set(3.2, 0, .5); g.add(rv);
  for (const s of [-1, 1]) bx(rv, .16, 2.6, .16, s * .5, 2.7, -.4, 0x4a5256);    
  bx(rv, 1.5, .5, 1.5, 0, 3.3, -.4, 0x4a5256);                         
  cy(rv, .22, 3.4, 0, 4.7, -.4, 0x565f66);                             
  const pg = new THREE.Group(); pg.position.set(0, 6.9, -.4); pg.rotation.y = .55; rv.add(pg);
  bx(pg, 3.5, 2.9, .3, 0, 0, 0, 0x2f3d3a);                             
  for (const s of [-1, 1]) bx(pg, .14, 2.9, .14, s * 1.68, 0, .1, 0x4a5040);   
  for (const s of [-1, 1]) bx(pg, 3.5, .14, .14, 0, s * 1.4, .1, 0x4a5040);     
  for (let i = 0; i < 6; i++) bx(pg, 3.2, .04, .05, 0, -1.2 + i * .48, .17, 0x44544c);   
  bx(pg, .8, .8, .22, 0, 0, .2, 0x5a6b62);                             
  bx(pg, 3.7, 3.1, .16, 0, 0, -.24, 0x4a5040);                         
  for (const s of [-1, 1]) bx(pg, .14, 1.9, .5, s * 1.5, -.4, -.5, 0x3d4a44);   
  cy(pg, .06, 1.4, 0, 1.9, 0, 0x4a5256);                               
  bx(rv, 2.7, 1.3, 2.6, 0, 2.05, 1.7, 0x4a5040);                       
  bx(rv, 1.3, .5, .12, 0, 2.5, 3.02, 0x1c2a30);                        
  for (const s of [-1, 1]) bx(rv, .5, .45, .8, s * 1.6, .85, 3.2, 0x3a4132);    
  return g;
}


function mkYj62() {
  const g = new THREE.Group();
  const tv = mkTruck(11.5, 3.0); g.add(tv);                           
  bx(g, 2.7, .5, 3.4, 0, 1.72, -2.5, 0x4a5240);                       
  bx(g, 1.5, .7, 1.2, 0, 2.25, -3.4, 0x3f4735);                        
  const rg = new THREE.Group(); rg.position.set(0, 2.35, -2.9); rg.rotation.x = -.785;   
  g.add(rg);                                                       
  bx(rg, 2.6, .34, 1.4, 0, -.25, .3, STEEL);                        
  for (const s of [-1, 1]) bx(rg, .16, .55, 7.2, s * 1.3, .05, 3.9, 0x545b48);   
  for (let i = 0; i < 3; i++) {
    const tx = -0.8 + i * .8;
    cy(rg, .4, 7.0, tx, .1, 3.5, 0x6f7466, Math.PI / 2);              
    cn(rg, .4, .95, tx, .1, 7.45, 0x8a8f7e, Math.PI / 2);             
    cy(rg, .45, .55, tx, .1, .35, 0x5a6150, Math.PI / 2);             
    for (const dz of [2.0, 5.0]) bx(rg, .84, .16, .42, tx, -.12, dz, 0x3f4735);   
    bx(rg, .8, .34, .5, tx, .58, 1.2, 0x4a5240);                      
  }
  for (const s of [-1, 1]) {                                  
    const a = new THREE.Vector3(s * 1.1, 1.5, -4.2), b = new THREE.Vector3(s * .85, 4.2, -.4);
    const d = b.clone().sub(a);
    const rod = cy(g, .1, d.length(), (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, 0x8a9298);
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  }
  for (const sz of [-4.2, 4.2]) for (const s of [-1, 1]) {   
    bx(tv, .5, .5, .8, s * 1.55, .78, sz, 0x3a4132);
    bx(tv, .9, .26, 1.1, s * 1.55, .3, sz, 0x2f3628);
  }
  const cr = new THREE.Group(); cr.position.set(-1.3, 1.78, -4.3); cr.rotation.x = -.05; g.add(cr);
  bx(cr, .5, .34, .6, 0, -.16, .1, 0x4a5240);                          
  bx(cr, .34, .34, 3.2, 0, 0, 1.6, 0x6a5f3e);                          
  bx(cr, .2, .2, 2.6, 0, .28, 1.5, 0x59532f);                          
  return g;
}











const LG = 0x79838d, LG2 = 0x5d6873, DG = 0x2b3138, GLAZ = 0x16222f, JT = 0xd7d4c6;




function wing(p, span, chord, x, y, z, sweep, dih, c, th = .14) {
  const dir = span < 0 ? -1 : (x < 0 ? -1 : 1);
  const s = Math.abs(span);
  const geo = new THREE.BoxGeometry(s, th, chord);
  geo.translate(dir * s / 2, 0, 0);
  const m = new THREE.Mesh(geo, mat(c));
  m.position.set(x, y, z); m.rotation.set(0, sweep, dih); p.add(m); return m;
}


function stn(s, x0, z0, sweep, d) { return [s * (x0 + d * Math.cos(Math.abs(sweep))), z0 - d * Math.sin(Math.abs(sweep))]; }

function missile(p, x, y, z, len, c = JT) {
  bx(p, .1, .62, .5, x, y + .34, z, 0x4a5158);
  const b = cy(p, .12, len, x, y, z, c, Math.PI / 2);
  const t = cn(p, .12, len * .18, x, y, z + len * .59, 0x9aa0a4, Math.PI / 2);
  for (const s of [-1, 1]) bx(p, .02, .3, .5, x + s * .28, y, z - len * .42, c);
  return b;
}

function blades(p, n, R, x, y, z, plane, c, coning = .045) {
  for (let i = 0; i < n; i++) {
    const bg = new THREE.Group(); bg.position.set(x, y, z);
    if (plane === 'h') {
      bg.rotation.y = i * Math.PI * 2 / n;
      bx(bg, R, .08, .46, R / 2, R * coning, 0, c);
    } else {
      
      
      bg.rotation.z = i * Math.PI * 2 / n;
      bx(bg, .09, R, .42, 0, R / 2, 0, c);
    }
    p.add(bg);
  }
}
function gearLeg(p, x, y, z, h = 1.0, r = .34, twin = false) {
  cy(p, .1, h, x, y - h / 2, z, DG);
  for (const s of (twin ? [-1, 1] : [0])) {
    const w = cy(p, r, .26, x + s * .3, y - h, z, TIRE); w.rotation.z = Math.PI / 2;
  }
}


function mkJ15() {
  const g = new THREE.Group();
  






  
  const body = cy(g, 1.02, 15.0, 0, 0, -2.4, LG, Math.PI / 2);
  cn(g, 1.02, 3.6, 0, 0, 6.9, LG2, Math.PI / 2);                       
  cy(g, .62, 2.6, 0, 0, -11.2, LG2, Math.PI / 2);                      
  bx(g, .5, .5, 3.4, 0, .1, -10.2, DG);                                
  
  const cp = new THREE.Mesh(new THREE.SphereGeometry(.86, 12, 9), mat(GLAZ));
  cp.scale.set(.86, .74, 2.2); cp.position.set(0, .92, 3.4); g.add(cp);
  bx(g, 1.5, .1, .3, 0, .74, 5.1, DG);                                 
  
  for (const s of [-1, 1]) {
    bx(g, 1.05, 1.15, 4.2, s * 1.12, -.62, 2.4, LG2, s * .06);
    bx(g, 1.12, 1.2, .22, s * 1.12, -.62, 4.52, DG, s * .06);          
    bx(g, .95, .16, 3.0, s * 1.35, .18, 1.9, LG);                      
  }
  
  for (const s of [-1, 1]) bx(g, 1.5, .16, 5.2, s * 1.55, .12, -.2, LG, s * .3, 0, s * .04);
  
  for (const s of [-1, 1]) wing(g, 2.6, 1.5, s * 1.15, .58, 2.6, s * .9, s * .1, LG2, .1);
  
  for (const s of [-1, 1]) {
    wing(g, 5.6, 3.2, s * 1.6, .02, -2.0, s * .78, s * .03, LG);
    const fp = stn(s, 1.6, -2.0, .78, 3.6), tp = stn(s, 1.6, -2.0, .78, 5.6);
    bx(g, .12, .5, 2.4, fp[0], .22, fp[1], DG);                        
    wing(g, 1.74, 1.3, tp[0], .04, tp[1], s * .78, s * .03, LG2, .09);  
    const rail = cy(g, .12, 3.0, tp[0] + s * .55, .3, tp[1] - .2, 0x7a836e, Math.PI / 2);
    cn(g, .12, .5, tp[0] + s * .55, .3, tp[1] + 1.3, 0x5a6355, Math.PI / 2);
  }
  
  for (const s of [-1, 1]) {
    const t1 = stn(s, 1.6, -2.0, .78, 2.0), t2 = stn(s, 1.6, -2.0, .78, 4.6);
    cy(g, .38, 3.2, t1[0], -.72, t1[1], 0x6d7864, Math.PI / 2);        
    bx(g, .16, .7, .5, t1[0], -.25, t1[1], 0x4a5158);                  
    missile(g, t2[0], -.68, t2[1], 4.0);                               
  }
  
  for (const s of [-1, 1]) { cy(g, .58, 2.6, s * .95, -.12, -9.1, DG, Math.PI / 2); cy(g, .5, .5, s * .95, -.12, -10.5, 0x1d2226, Math.PI / 2); }
  
  for (const s of [-1, 1]) {
    bx(g, .16, 3.9, 2.9, s * 1.5, 1.95, -8.2, LG, .42, 0, s * .09);
    bx(g, .2, 1.2, 2.4, s * 1.5, .5, -8.5, LG2, .3);
    bx(g, .5, .35, 2.2, s * 1.5, 3.7, -8.7, LG2, .42);                 
    wing(g, 2.6, 1.9, s * 1.1, .28, -9.7, s * 1.15, 0, LG2, .11);
  }
  
  for (const s of [-1, 1]) bx(g, .18, .6, .6, s * 1.62, 3.0, -7.6, 0xa8202a, .42);
  
  gearLeg(g, 0, .35, 4.6, 1.2, .3);
  for (const s of [-1, 1]) gearLeg(g, s * 1.5, .3, -1.5, 1.8, .38, true);
  bx(g, .35, .2, 2.4, 0, -.95, -9.8, DG);                              
  cy(g, .3, .3, 0, -1.05, -11.0, 0x3a4148, Math.PI / 2);               
  return g;
}


function mkJ10() {
  const g = new THREE.Group();
  



  const body = cy(g, .82, 11.8, 0, 0, -1.8, LG, Math.PI / 2);
  cn(g, .82, 3.0, 0, 0, 5.6, LG2, Math.PI / 2);
  cy(g, .5, 1.8, 0, -.1, -8.4, DG, Math.PI / 2);                        
  const cp = new THREE.Mesh(new THREE.SphereGeometry(.72, 12, 9), mat(GLAZ));
  cp.scale.set(.82, .7, 1.9); cp.position.set(0, .78, 2.8); g.add(cp);
  bx(g, .8, .72, 2.4, 0, -.68, 1.4, LG2);                               
  bx(g, .9, .8, .2, 0, -.68, 2.62, DG);
  for (const s of [-1, 1]) wing(g, 2.1, 1.3, s * .8, .5, 1.9, s * 1.0, s * .08, LG2, .1);  
  for (const s of [-1, 1]) {                                           
    wing(g, 4.45, 3.6, s * 1.1, -.05, -2.6, s * 1.02, s * .02, LG);
    const a = stn(s, 1.1, -2.6, 1.02, 2.0), b = stn(s, 1.1, -2.6, 1.02, 3.5);
    missile(g, a[0], -.55, a[1], 3.0);                                 
    missile(g, b[0], -.5, b[1], 3.6);                                  
  }
  bx(g, .15, 3.8, 2.8, 0, 2.0, -6.9, LG, .4);                          
  bx(g, .45, .3, 1.8, 0, 3.65, -7.3, LG2, .4);
  for (const s of [-1, 1]) wing(g, 1.9, 1.5, s * .9, .3, -7.3, s * 1.2, 0, LG2, .1);
  cy(g, .28, 2.6, 0, -.62, -2.6, 0x6d7864, Math.PI / 2);               
  gearLeg(g, 0, .3, 2.4, 1.15, .28);
  for (const s of [-1, 1]) gearLeg(g, s * 1.2, .25, -2.2, 1.5, .32);
  return g;
}


function mkAew600() {
  const g = new THREE.Group();
  const WB = 0x99a2aa, WD = 0x6f7880;
  cy(g, 1.16, 12.6, 0, 0, -.6, WB, Math.PI / 2);                       
  cn(g, 1.16, 3.0, 0, 0, 6.9, WB, Math.PI / 2);                        
  cy(g, .8, 2.6, 0, .1, -7.9, WB, Math.PI / 2);                        
  cn(g, .8, 1.6, 0, .1, -9.6, WD, Math.PI / 2);
  const cp = new THREE.Mesh(new THREE.SphereGeometry(.9, 12, 9), mat(GLAZ));
  cp.scale.set(.9, .62, 1.5); cp.position.set(0, .5, 5.0); g.add(cp);
  
  bx(g, 9.6, .34, 2.3, 0, 1.5, -.4, WB, 0, 0, 0);
  bx(g, 4.6, .8, 2.9, 0, 1.1, -.3, WD);
  for (const s of [-1, 1]) {
    bx(g, 2.4, .3, 2.1, s * 5.6, 1.34, -.5, WB, 0, 0, -s * .07);       
    bx(g, .5, .8, 1.8, s * 6.7, 1.5, -.5, WD);                         
    
    cy(g, .78, 4.2, s * 2.9, 1.05, .9, WD, Math.PI / 2);
    cn(g, .78, 1.0, s * 2.9, 1.05, 3.4, DG, Math.PI / 2);
    cy(g, .34, .8, s * 2.9, 1.05, 3.9, 0x40474d, Math.PI / 2);          
    blades(g, 6, 2.1, s * 2.9, 1.05, 4.2, 'v', 0x2f363b);
  }
  
  const dm = cy(g, 2.9, .82, 0, 3.3, -1.0, 0xc3c9cd);
  bx(g, 5.8, .12, .9, 0, 3.74, -1.0, 0x8f979c);                         
  for (const s of [-1, 1]) bx(g, .28, 1.7, .5, s * 1.1, 2.3, -.4, WD);  
  bx(g, .8, 1.4, 3.4, 0, 2.5, -2.4, WD);                               
  
  bx(g, .2, 3.4, 2.6, 0, 1.9, -8.4, WB, .3);
  bx(g, 5.6, .26, 1.6, 0, 3.3, -8.6, WB);                              
  bx(g, .16, 1.3, 1.4, 0, -.9, -8.0, WD);                              
  
  gearLeg(g, 0, .4, 4.2, 1.3, .34);
  for (const s of [-1, 1]) gearLeg(g, s * 1.15, .3, -1.2, 1.5, .42, true);
  bx(g, 2.4, 1.9, .16, 0, .2, -8.9, WD);                               
  return g;
}


function mkZ20() {
  const g = new THREE.Group();
  const GB = 0x5c6a63, GD = 0x3f4a45;
  
  bx(g, 2.3, 2.1, 4.6, 0, 1.15, 1.9, GB);
  bx(g, 2.2, 1.9, 3.2, 0, 1.05, -1.6, GB);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1.15, 12, 9), mat(GB));
  nose.scale.set(1.0, .9, 1.5); nose.position.set(0, 1.35, 4.1); g.add(nose);
  
  bx(g, 2.0, .12, 1.6, 0, 2.18, 3.5, GLAZ, .18);
  bx(g, .12, 1.0, 3.4, -1.16, 1.55, 2.0, GLAZ);
  bx(g, .12, 1.0, 3.4, 1.16, 1.55, 2.0, GLAZ);
  
  const t = new THREE.Mesh(new THREE.SphereGeometry(.42, 10, 8), mat(DG)); t.position.set(0, .55, 4.6); g.add(t);
  
  for (const s of [-1, 1]) {
    bx(g, 1.05, 1.0, 3.0, s * .78, 2.6, -.4, GD);
    cy(g, .42, .3, s * .78, 2.6, 1.05, 0x24292b, Math.PI / 2);         
    bx(g, .5, .2, 2.4, s * 1.25, 2.5, -.5, GB);                        
  }
  
  bx(g, 1.5, .8, 1.6, 0, 2.55, .6, GD);
  cy(g, .34, .9, 0, 3.35, .4, DG);
  blades(g, 5, 8.0, 0, 3.75, .4, 'h', 0x31383c);
  for (let i = 0; i < 5; i++) {                                        
    const a = i * Math.PI * 2 / 5, bg = new THREE.Group(); bg.position.set(0, 3.6, .4); bg.rotation.y = a;
    bx(bg, 1.5, .16, .3, .9, 0, 0, GD); g.add(bg);
  }
  


  bx(g, .95, .95, 6.8, 0, 2.0, -5.2, GB, 0, -.06);
  bx(g, 4.2, .16, 1.2, 0, 2.35, -4.4, GD);                             
  

  bx(g, .2, 2.0, 1.9, 0, 2.9, -8.3, GB, 0, .1);                        
  for (const s of [-1, 1]) bx(g, .3, 1.1, 1.0, s * .5, 3.0, -8.8, GD); 
  blades(g, 4, 1.3, .45, 2.75, -8.9, 'v', 0x31383c);
  
  for (const s of [-1, 1]) {
    bx(g, .7, .7, 3.4, s * 1.5, .75, .4, GD);
    cy(g, .12, 1.3, s * 1.6, .1, .9, DG);
    for (const k of [-1, 1]) { const w = cy(g, .42, .3, s * 1.6, -.55, .9 + k * .62, TIRE); w.rotation.z = Math.PI / 2; }
  }
  gearLeg(g, 0, .5, 3.4, 1.1, .3);                                     
  
  bx(g, .1, 1.5, 1.6, 1.16, 1.0, -.6, GD);
  bx(g, 2.2, .2, 1.4, 0, .55, -3.0, GD);
  return g;
}


function mkZ8() {
  const g = new THREE.Group();
  const GB = 0x66736c, GD = 0x47524b, FL = 0x5a6560;
  
  bx(g, 2.7, 2.5, 10.4, 0, 1.6, -.4, GB);
  const hull = cy(g, 1.35, 10.0, 0, .55, -.4, GB, Math.PI / 2);       
  bx(g, 2.5, .5, 1.8, 0, -.15, 3.9, GD);                               
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 9), mat(GB));
  nose.scale.set(.95, .95, 1.5); nose.position.set(0, 2.0, 4.9); g.add(nose);
  
  bx(g, 2.3, 1.3, .16, 0, 2.5, 6.0, GLAZ, .1);
  for (const s of [-1, 1]) bx(g, .14, 1.2, 2.4, s * 1.2, 2.45, 4.7, GLAZ, 0, 0, -s * .12);
  bx(g, .14, 1.1, 4.6, -1.42, 1.9, 1.2, GLAZ);                         
  bx(g, .14, 1.1, 4.6, 1.42, 1.9, 1.2, GLAZ);
  
  bx(g, 2.6, .2, 2.2, 0, .5, -5.9, GD);
  bx(g, .12, 2.0, 2.0, 1.42, 1.6, -4.2, GD);
  
  for (const s of [-1, 1]) {
    bx(g, 1.0, .95, 3.2, s * .7, 3.2, 1.3, GD);
    cy(g, .38, .3, s * .7, 3.2, 2.85, 0x24292b, Math.PI / 2);
  }
  

  bx(g, 1.7, .9, 1.7, 0, 3.35, .2, 0x39423d);
  cy(g, .4, .95, 0, 4.15, .2, DG);
  blades(g, 6, 9.45, 0, 4.55, .2, 'h', 0x333a3c);
  


  bx(g, .9, .9, 7.6, 0, 3.0, -6.2, GB, 0, -.04);
  bx(g, .55, .55, 3.4, 0, 3.15, -11.6, GB);                            
  bx(g, .22, 2.4, 2.2, 0, 3.7, -12.0, GB, 0, .12);                     
  bx(g, 3.6, .16, 1.1, 0, 3.3, -10.6, GD);                              
  blades(g, 5, 2.0, -.35, 3.64, -12.4, 'v', 0x333a3c);
  
  for (const s of [-1, 1]) {
    bx(g, 1.6, .3, 1.4, s * 1.8, .95, .4, GD);                          
    cy(g, .62, 4.8, s * 2.0, .15, -.2, FL, Math.PI / 2);
    cn(g, .62, 1.3, s * 2.0, .15, 2.8, FL, Math.PI / 2);                
    for (const k of [-1, 1]) bx(g, .18, .9, .5, s * 1.6, .6, -.2 + k * 1.5, GD);
  }
  
  gearLeg(g, 0, .4, 4.6, 1.1, .32);
  return g;
}


















const AB = 0x818b95, AB2 = 0x646e78, AD = 0x262c32;   
const SG = 0xb2babf, SG2 = 0x8c949a;                    


function flankerWing(g, s, rootZ, sweep, half) {
  wing(g, half, 4.2, s * 1.7, .02, rootZ, s * sweep, s * .02, AB);
  const tp = stn(s, 1.7, rootZ, sweep, half);
  wing(g, 1.5, 1.9, tp[0], .04, tp[1], s * sweep, s * .02, AB2, .1);
  return stn(s, 1.7, rootZ, sweep, half * .58);
}


function mkJ16() {
  const g = new THREE.Group();
  



  cy(g, 1.0, 15.4, 0, 0, -1.6, AB, Math.PI / 2);                       
  cn(g, 1.0, 3.4, 0, 0, 7.7, AB2, Math.PI / 2);                        
  bx(g, .55, .52, 3.2, 0, .06, -10.6, AD);                             
  cy(g, .5, 1.6, 0, 0, -11.7, AB2, Math.PI / 2);                       
  for (const z of [3.9, 1.9]) {                                       
    const cp = new THREE.Mesh(new THREE.SphereGeometry(.8, 12, 8), mat(GLAZ));
    cp.scale.set(.8, .56, 1.55); cp.position.set(0, .84, z); g.add(cp);
  }
  for (const s of [-1, 1]) {                                          
    bx(g, 1.25, 1.35, 5.6, s * 1.4, -.78, 1.0, AB2, s * .05);
    bx(g, 1.32, 1.4, .26, s * 1.4, -.78, 3.88, AD, s * .05);           
    bx(g, .32, 1.15, 5.0, s * 2.1, -.1, 1.2, AB);                       
  }
  for (const s of [-1, 1]) bx(g, 1.6, .16, 6.4, s * 1.75, .18, -1.0, AB, s * .34);   
  for (const s of [-1, 1]) {
    const mid = flankerWing(g, s, -3.2, .74, 5.2);                      
    bx(g, .2, .7, .55, mid[0], -.5, mid[1], AD);                       
    cy(g, .23, 5.4, mid[0], -1.15, mid[1] - .3, 0x6d7278, Math.PI / 2); 
    cn(g, .23, 1.0, mid[0], -1.15, mid[1] + 2.4, 0x9aa0a4, Math.PI / 2);
    bx(g, .16, .5, .8, mid[0] + .34, -1.15, mid[1] - 2.6, 0x6d7278);
    const out = stn(s, 1.7, -3.2, .74, 5.2);
    missile(g, out[0], -.62, out[1], 3.9);                             
  }
  for (const s of [-1, 1]) {                                          
    wing(g, 3.0, 2.3, s * 1.05, .26, -9.4, s * 1.05, 0, AB2, .12);
    bx(g, .16, 4.6, 3.0, s * 1.45, 2.15, -8.4, AB, .4, 0, s * .05);
    bx(g, .5, .34, 2.2, s * 1.45, 4.2, -8.9, AB2, .4);                 
    for (const k of [-1, 1]) cy(g, .52, .34, s * 1.0, -.1, -10.6 + k * .1, AD, Math.PI / 2);
  }
  bx(g, .5, .6, 2.6, 0, 3.2, -11.4, AB2, .5);                          
  gearLeg(g, 0, .34, 5.2, 1.3, .32, true);                             
  for (const s of [-1, 1]) gearLeg(g, s * 1.55, .28, -2.2, 1.75, .42, true);
  return g;
}


function mkJ20() {
  const g = new THREE.Group();
  





  cy(g, 1.06, 14.2, 0, 0, -2.6, AB, Math.PI / 2);
  cn(g, 1.06, 3.2, 0, 0, 6.6, AB2, Math.PI / 2);                       
  bx(g, 2.0, .5, 2.8, 0, -.1, -10.6, AB2);                             
  for (const s of [-1, 1]) cy(g, .5, 1.5, s * .74, -.05, -11.2, AD, Math.PI / 2);   
  const cp = new THREE.Mesh(new THREE.SphereGeometry(.82, 12, 9), mat(GLAZ));      
  cp.scale.set(.82, .62, 1.9); cp.position.set(0, .86, 3.4); g.add(cp);
  bx(g, 1.4, .12, .28, 0, .72, 4.9, AD);                               
  for (const s of [-1, 1]) {                                          
    bx(g, 1.05, 1.0, 3.4, s * 1.5, -.42, 1.2, AB2, s * .12, 0, s * -.06);
    bx(g, .34, .9, 3.0, s * 2.05, .1, .9, AB);                         
  }
  for (const s of [-1, 1]) wing(g, 2.3, 1.7, s * 1.15, .52, 1.6, s * 1.0, s * .07, AB2, .1);  
  for (const s of [-1, 1]) {                                          
    wing(g, 5.15, 4.8, s * 1.5, -.02, -2.6, s * .95, s * .02, AB, .13);
    const le = stn(s, 1.5, -2.6, .95, 5.15);
    bx(g, .12, .18, 3.2, le[0] * .86, .06, le[1] + .9, AD);            
  }
  for (const s of [-1, 1]) bx(g, .14, 3.3, 2.6, s * 1.2, 1.6, -7.6, AB, .45, 0, s * .5);   
  bx(g, .22, .9, 4.6, 0, -1.02, -.4, AD);                              
  bx(g, 2.4, .1, 4.4, 0, -1.02, -1.0, AD);                             
  gearLeg(g, 0, .3, 4.6, 1.2, .3);
  for (const s of [-1, 1]) gearLeg(g, s * 1.35, .25, -1.6, 1.3, .4);
  return g;
}


function mkJ35() {
  const g = new THREE.Group();
  



  cy(g, .96, 12.4, 0, 0, -2.2, AB, Math.PI / 2);
  cn(g, .96, 3.0, 0, 0, 5.5, AB2, Math.PI / 2);
  bx(g, 1.6, .46, 2.4, 0, -.02, -8.8, AB2);                            
  for (const s of [-1, 1]) cy(g, .44, 1.3, s * .66, -.02, -9.4, AD, Math.PI / 2);   
  const cp = new THREE.Mesh(new THREE.SphereGeometry(.74, 12, 9), mat(GLAZ));
  cp.scale.set(.78, .58, 1.7); cp.position.set(0, .78, 3.0); g.add(cp);
  for (const s of [-1, 1]) {
    bx(g, .95, .95, 3.0, s * 1.4, -.4, .8, AB2, s * .1);               
    bx(g, 1.25, .12, 4.2, s * 1.45, .1, -1.2, AB);                     
  }
  for (const s of [-1, 1]) {
    wing(g, 4.25, 3.6, s * 1.5, .0, -2.4, s * .84, s * .02, AB, .12);   
    const fp = stn(s, 1.5, -2.4, .84, 3.0), tp = stn(s, 1.5, -2.4, .84, 4.25);
    bx(g, .12, .48, .5, fp[0], .18, fp[1], AD);                         
    wing(g, 1.2, 1.6, tp[0], .06, tp[1], s * .84, s * .02, AB2, .1);     
  }
  for (const s of [-1, 1]) {
    wing(g, 2.2, 1.6, s * .95, .2, -8.1, s * 1.1, 0, AB2, .1);          
    bx(g, .13, 3.1, 2.2, s * 1.05, 1.65, -7.0, AB, .42, 0, s * .35);     
  }
  bx(g, .34, .2, 2.2, 0, -.86, -8.4, AD);                              
  cy(g, .28, .28, 0, -.95, -9.4, 0x3a4148, Math.PI / 2);
  gearLeg(g, 0, .3, 3.8, 1.2, .3, true);                                
  for (const s of [-1, 1]) gearLeg(g, s * 1.3, .25, -1.6, 1.45, .4, true);
  return g;
}


function mkH6K() {
  const g = new THREE.Group();
  





  cy(g, 1.5, 24.0, 0, 0, -2.0, SG, Math.PI / 2);                        
  cn(g, 1.5, 4.0, 0, 0, 12.0, SG2, Math.PI / 2);                          
  cy(g, .95, 5.0, 0, .2, -16.5, SG, Math.PI / 2);                        
  cn(g, .95, 2.0, 0, .2, -20.0, SG2, -Math.PI / 2);
  bx(g, 2.2, .55, 1.7, 0, 1.15, 8.6, GLAZ);                             
  bx(g, 1.0, .5, .9, 0, .2, 10.4, GLAZ);                                
  bx(g, 4.8, .9, 3.4, 0, 1.35, -1.6, SG2);                               
  for (const s of [-1, 1]) {
    wing(g, 9.3, 5.2, s * 1.9, 1.6, -2.2, s * .62, s * .02, SG, .34);    
    const m1 = stn(s, 1.9, -2.2, .62, 9.3);
    wing(g, 7.4, 3.0, m1[0], 1.9, m1[1], s * .62, s * .05, SG, .24);      
    
    cy(g, 1.02, 6.0, s * 3.2, .55, .6, SG2, Math.PI / 2);
    cy(g, 1.12, .5, s * 3.2, .55, 3.7, AD, Math.PI / 2);
    cy(g, .86, .5, s * 3.2, .55, -2.6, AD, Math.PI / 2);
    
    for (const d of [4.5, 8.2, 11.8]) {
      const t = stn(s, 1.9, -2.2, .62, d), yb = (d < 6 ? .35 : 1.35);
      bx(g, .2, .8, .6, t[0], yb - .1, t[1], AD);                        
      cy(g, .26, 5.2, t[0], yb - .95, t[1], 0x6d7278, Math.PI / 2);       
      cn(g, .26, 1.1, t[0], yb - .95, t[1] + 2.7, 0x9aa0a4, Math.PI / 2);
      for (const k of [-1, 1]) bx(g, .05, .5, .9, t[0] + k * .3, yb - .95, t[1] - 2.0, 0x6d7278);
    }
  }
  bx(g, .26, 6.4, 4.0, 0, 4.2, -15.5, SG, .4);                          
  bx(g, .5, .4, 1.6, 0, 7.1, -16.6, SG2);
  for (const s of [-1, 1]) wing(g, 3.2, 2.4, s * .9, .25, -16.5, s * 1.1, 0, SG, .16);   
  gearLeg(g, 0, .5, 6.4, 1.6, .4);
  for (const s of [-1, 1]) {                                            
    bx(g, 1.0, 1.3, 3.4, s * 2.0, -.9, -3.6, SG2);
    for (const k of [-1, 1]) for (const q of [-1, 1]) {
      const w = cy(g, .44, .3, s * 2.0 + k * .3, -2.0, -3.6 + q * .8, TIRE); w.rotation.z = Math.PI / 2;
    }
  }
  for (const s of [-1, 1]) gearLeg(g, s * 1.2, .1, -17.6, .9, .3);       
  return g;
}







function y8Family(g, B, B2, tailCut = 0) {
  cy(g, 1.6, 21.0, 0, 0, -1.0, B, Math.PI / 2);
  cn(g, 1.6, 3.6, 0, 0, 8.8, B, Math.PI / 2);
  cy(g, 1.0, 5.0 - tailCut, 0, .1, -12.0 + tailCut / 2, B2, Math.PI / 2);
  cn(g, 1.0, 2.0, 0, .1, -15.0 + tailCut, B2, -Math.PI / 2);
  bx(g, 2.5, .7, 1.9, 0, 1.05, 5.9, GLAZ);                              
  for (let i = 0; i < 7; i++) for (const s of [-1, 1])
    bx(g, .1, .72, .72, s * 1.56, .8, 3.4 - i * 1.6, GLAZ);              
  bx(g, 5.0, 1.2, 3.6, 0, 1.7, -1.6, B2);                               
  for (const s of [-1, 1]) {
    wing(g, 13.0, 4.2, s * 1.9, 2.0, -1.8, s * .1, s * .02, B, .34);      
    const tip = stn(s, 1.9, -1.8, .1, 13.0);
    bx(g, .12, .8, 2.2, tip[0], 2.1, tip[1], B2);                        
  }
  for (const s of [-1, 1]) for (const d of [3.6, 7.4]) {                 
    const t = stn(s, 1.9, -1.8, .1, d);
    cy(g, .84, 3.8, t[0], 1.6, t[1] + .6, B2, Math.PI / 2);
    cn(g, .84, 1.0, t[0], 1.6, t[1] + 3.0, B2, Math.PI / 2);
    cy(g, .34, .7, t[0], 1.6, t[1] + 3.9, AD, Math.PI / 2);
    blades(g, 6, 1.5, t[0], 1.6, t[1] + 4.1, 'v', 0x2f363b);
  }
  bx(g, .26, 4.6, 3.4, 0, 3.1, -11.0, B, .34);                          
  for (const s of [-1, 1]) wing(g, 3.4, 2.6, s * .9, .3, -12.4, s * .95, 0, B, .16);   
  gearLeg(g, 0, .5, 6.0, 1.6, .4);
  for (const s of [-1, 1]) {                                            
    bx(g, 1.1, 1.2, 3.0, s * 2.2, -1.0, -3.0, B2);
    for (const q of [-1, 1]) { const w = cy(g, .42, .34, s * 2.2, -2.0, -3.0 + q * .8, TIRE); w.rotation.z = Math.PI / 2; }
  }
}


function mkKj500() {
  const g = new THREE.Group();
  y8Family(g, SG2, 0x767f88);
  const dm = cy(g, 2.2, .95, 0, 4.6, -1.2, 0xc3c9cd);                   
  bx(g, .12, .6, 4.4, 0, 4.6, -1.2, 0x8f979c);                           
  


  for (const a of [0, 2.094, -2.094])
    bx(g, .16, .8, 3.0, .85 * Math.sin(a), 4.6, -1.2 + .85 * Math.cos(a), 0x9aa4ac, a);
  for (const s of [-1, 1]) for (const z of [.8, -3.2])
    bx(g, .3, 2.2, .5, s * 1.0, 3.3, z, 0x767f88);                        
  bx(g, .7, 1.5, 3.0, 0, 3.4, -3.6, 0x767f88);                            
  for (const s of [-1, 1]) bx(g, .18, 1.5, 1.9, s * 4.2, 1.1, -12.4, SG2); 
  bx(g, .12, 1.1, 4.6, 0, 2.6, -6.0, 0x6f7880);                           
  return g;
}


function mkY8Q() {
  const g = new THREE.Group();
  y8Family(g, SG2, 0x767f88, 3);                     
  const bd = cy(g, 1.55, .7, 0, -1.85, 2.6, 0xb9c0c6, Math.PI / 2);       
  bd.rotation.z = 0;
  bx(g, 2.0, .5, 2.6, 0, -1.5, 2.6, 0x767f88);                            
  bx(g, 1.2, .8, 1.4, 0, -1.6, 6.4, 0x8f979c);                            
  cy(g, .12, 3.0, 0, .3, -14.5, 0x9aa4ac, Math.PI / 2);                    
  cn(g, .12, .8, 0, .3, -15.6, 0x9aa4ac, Math.PI / 2);                     
  bx(g, .5, .5, .8, 0, .3, -12.9, 0x767f88);                              
  for (let i = 0; i < 4; i++) bx(g, 1.9, .12, .5, 0, -1.62, -6.2 - i * 1.1, AD);  
  for (const s of [-1, 1]) bx(g, .14, .9, 3.4, s * 1.1, -1.35, -8.6, 0x767f88);   
  for (const s of [-1, 1]) bx(g, .5, .18, 2.4, s * 4.6, 1.1, 1.4, 0x6f7880);      
  return g;
}












const GROUND = {
  hf2:      { L: 9.2,  W: 2.6,  H: 3.8,  build: mkHf2 },      
  hf3:      { L: 9.2,  W: 2.6,  H: 3.8,  build: mkHf3 },      
  harpoon:  { L: 9.6,  W: 2.6,  H: 3.5,  build: mkHarpoon },   
  nmesis:   { L: 5.9,  W: 2.4,  H: 2.9,  build: mkNmesis },    
  tk3:      { L: 9.8,  W: 3.4,  H: 5.5,  build: mkTk3 },       
  lt2000:   { L: 9.4,  W: 2.44, H: 3.5,  build: mkLt2000 },    
  f16v:     { L: 15.1, W: 9.96, H: 5.13, build: mkF16 },       
  radar:    { L: 8.4,  W: 4.0,  H: 6.0,  build: mkRadar },     
  pavepaws: { L: 19.6, W: 22.1, H: 32.0, build: mkPavepaws },  
  gun:      { L: 10.0, W: 6.0,  H: 3.0,  build: mkGun },       
  coastradar:{ L: 21.0, W: 9.0, H: 20.0, build: mkCoastRadar },
  cm11:     { L: 9.31, W: 3.63, H: 3.26, build: () => mkTank('cm11') },   
  cm32:     { L: 7.0,  W: 2.7,  H: 3.0,  build: () => mkIfv('cm32') },    
  
  m1a2t:    { L: 9.83, W: 3.66, H: 2.885, build: mkM1A2T },   
  m60a3:    { L: 9.44, W: 3.631, H: 3.27, build: () => mkTank('m60a3') }, 
  cm34:     { L: 7.0,  W: 2.7,  H: 3.0,  build: () => mkIfv('cm34') },    
  tow:      { L: 4.72, W: 2.18, H: 2.5,  build: mkTow },       
  pac3:     { L: 7.6,  W: 2.44, H: 4.5,  build: mkPac3 },      
  tk1:      { L: 9.0,  W: 2.5,  H: 4.0,  build: mkTk1 },       
  hf3er:    { L: 10.4, W: 2.6,  H: 3.8,  build: mkHf3ER },     
  ah64:     { L: 15.06,W: 14.63, H: 3.87, lenRef: 'body', build: mkAh64 },   
  
  ztd:      { L: 10.0, W: 3.36, H: 3.6,  build: mkZtd05 },     
  zbd:      { L: 9.5,  W: 3.36, H: 3.6,  build: mkZbd05 },     
  hq9:      { L: 11.0, W: 3.0,  H: 6.5,  build: mkHq9 },       
  yj62:     { L: 11.5, W: 3.05, H: 7.0,  build: mkYj62 },      
};
export const GROUND_KINDS = new Set(Object.keys(GROUND));



const AIR = {
  j15:  { L: 21.2, W: 14.7,  H: 5.92,  build: mkJ15 },     
  j10c: { L: 16.4, W: 9.75,  H: 5.43,  build: mkJ10 },     
  aew:  { L: 18.1, W: 24.4,  H: null,  build: mkAew600 },  
  heli: { L: 15.2, W: 16.0,  H: 5.2, lenRef: 'body', build: mkZ20 },  
  z8:   { L: 20.27,W: 18.9,  H: 6.66, lenRef: 'body', build: mkZ8 },   
  


  j35:   { L: 17.4, W: 11.5,  H: 4.8,   build: mkJ35 },    
  j16:   { L: 21.9, W: 14.7,  H: 6.36,  build: mkJ16 },    
  j20:   { L: 20.3, W: 12.9,  H: 4.6,   build: mkJ20 },    
  h6k:   { L: 34.8, W: 33.0,  H: 9.85,  build: mkH6K },    
  kj500: { L: 34.0, W: 38.0,  H: 11.16, build: mkKj500 },  
  y8q:   { L: 34.02,W: 38.0,  H: 11.16, build: mkY8Q },    
};
export const AIR_KINDS = new Set(Object.keys(AIR));






const VC_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: .2, roughness: .74, emissive: 0x0d1216, emissiveIntensity: .08, envMapIntensity: .8 });
function bake(root) {
  const ms = [];
  root.traverse(o => { if (o.isMesh && o.geometry && o.material) ms.push(o); });
  if (ms.length < 3) return root;
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  

  let vn = 0, inN = 0;
  for (const m of ms) {
    vn += m.geometry.attributes.position.count;
    inN += m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count;
  }
  const pos = new Float32Array(vn * 3), nor = new Float32Array(vn * 3), col = new Float32Array(vn * 3);
  const idx = new Uint32Array(inN); let io = 0, vo = 0;
  const _c = new THREE.Color();
  for (const m of ms) {
    const g = m.geometry.clone();
    const rel = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
    g.applyMatrix4(rel);
    const p = g.attributes.position, n = g.attributes.normal;
    const c = (m.material && m.material.color) ? m.material.color : _c.set(0x888888);
    const cnt = p.count;
    for (let i = 0; i < cnt; i++) {
      pos[(vo + i) * 3] = p.getX(i); pos[(vo + i) * 3 + 1] = p.getY(i); pos[(vo + i) * 3 + 2] = p.getZ(i);
      if (n) { nor[(vo + i) * 3] = n.getX(i); nor[(vo + i) * 3 + 1] = n.getY(i); nor[(vo + i) * 3 + 2] = n.getZ(i); }
      else nor[(vo + i) * 3 + 1] = 1;
      col[(vo + i) * 3] = c.r; col[(vo + i) * 3 + 1] = c.g; col[(vo + i) * 3 + 2] = c.b;
    }
    if (g.index) { for (let i = 0; i < g.index.count; i++) idx[io++] = g.index.getX(i) + vo; }
    else { for (let i = 0; i < cnt; i++) idx[io++] = i + vo; }
    vo += cnt;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setIndex(new THREE.BufferAttribute(idx.subarray(0, io), 1));
  out.computeBoundingSphere();
  const mesh = new THREE.Mesh(out, VC_MAT);
  mesh.frustumCulled = true;
  return mesh;
}










export function makeGround(kind, targetLen) {
  const K = GROUND[kind] || AIR[kind]; if (!K) return null;
  const grp = new THREE.Group();
  





  const built = K.build();
  let bodyZ = 0;
  if (K.lenRef === 'body') {
    const mb = new THREE.Box3();
    for (const c of built.children) if (!c.isGroup) mb.expandByObject(c);
    bodyZ = mb.isEmpty() ? 0 : mb.max.z - mb.min.z;
  }
  const baked = bake(built);
  baked.geometry.computeBoundingBox();
  const bb = baked.geometry.boundingBox;
  const fullZ = Math.max(0.01, bb.max.z - bb.min.z);     
  const al = Math.max(0.01, bodyZ || fullZ);             
  const aw = Math.max(0.01, bb.max.x - bb.min.x);      
  const ah = Math.max(0.01, bb.max.y - bb.min.y);      
  const wu = targetLen || K.L / 10;                    
  baked.scale.setScalar(wu / al);                      
  grp.add(baked);
  grp.userData.ground = true;
  grp.userData.realM = K.L;
  



  if (!AUDIT.some((a) => a.k === kind)) {
    const awRatio = aw / al * K.L;                       
    AUDIT.push({ k: kind, real: K.L, w: K.W ?? null, h: K.H ?? null,
      drawn: [+al.toFixed(2), +aw.toFixed(2), +ah.toFixed(2)],
      fullZ: +fullZ.toFixed(2), body: K.lenRef === 'body',
      axisWarn: K.W ? (awRatio > K.W * 1.02 ? `实测全宽 ${awRatio.toFixed(1)}m > 注册表 W ${K.W}m` : '')
                    : (aw > al * 1.02 ? '宽>长且注册表未声明 W' : '') });
  }
  return grp;
}


export const REG = { ...GROUND, ...AIR };
export function realLen(kind) { const K = REG[kind]; return K ? K.L : null; }




export function lenNote(kind) {
  const K = REG[kind]; if (!K) return null;
  return { m: K.L, label: K.lenRef === 'body' ? '机身长' : '全长' };
}
export const AUDIT = [];

