










export const SIDE_HEX = { red: 0xff7a4d, blue: 0x4fc3d9, green: 0x48d98a };
export const SIDE_CSS = { red: '#ff7a4d', blue: '#4fc3d9', green: '#48d98a' };

function rr(x, a, b, w, h, r) {
  x.beginPath();
  x.moveTo(a + r, b);
  x.arcTo(a + w, b, a + w, b + h, r);
  x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r);
  x.arcTo(a, b, a + w, b, r);
  x.closePath();
}
function diamond(x, cx, cy, r) {
  x.beginPath(); x.moveTo(cx, cy - r); x.lineTo(cx + r, cy);
  x.lineTo(cx, cy + r); x.lineTo(cx - r, cy); x.closePath(); x.fill();
}
function tri(x, cx, cy, r) {
  x.beginPath(); x.moveTo(cx, cy - r); x.lineTo(cx + r * .92, cy + r * .78);
  x.lineTo(cx - r * .92, cy + r * .78); x.closePath(); x.fill();
}











export const LBL_FG = { red: '#ffc3a8', blue: '#9fe3f2', green: '#b4eec0' };
export const LBL_H = 128, LBL_FONT = 88;
function lblFont(x, px) {
  x.font = 'bold ' + px + 'px "Microsoft YaHei","PingFang SC",sans-serif';
}
export function tagTexture(THREE, text, side) {
  const H = LBL_H;
  const t = String(text == null ? '' : text);
  const c = document.createElement('canvas');
  const x0 = c.getContext('2d');
  lblFont(x0, LBL_FONT);
  const tw = Math.max(8, Math.ceil(x0.measureText(t).width));
  c.width = Math.min(2048, tw + 40);        
  c.height = H;
  const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, H);
  lblFont(x, LBL_FONT);
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineJoin = 'round'; x.miterLimit = 2;
  x.shadowColor = side === 'green' ? 'rgba(72,217,138,.55)'
    : side === 'blue' ? 'rgba(79,195,217,.55)' : 'rgba(255,122,77,.55)';
  x.shadowBlur = 12;
  x.lineWidth = 14; x.strokeStyle = 'rgba(2,9,17,.95)';
  x.strokeText(t, c.width / 2, H / 2);
  x.shadowBlur = 0;
  x.fillStyle = LBL_FG[side] || LBL_FG.red;
  x.fillText(t, c.width / 2, H / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.aspect = c.width / H;                 
  return tex;
}







export const LBL_HPX = 28;                 
const ASPECTC = new Map(), MATC = new Map();
export function labelSprite(THREE, text, side, opts = {}) {
  const key = text + '|' + side;
  if (!MATC.has(key)) {
    const tex = tagTexture(THREE, text, side);
    ASPECTC.set(key, tex.aspect || 4);
    MATC.set(key, new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false,
      depthTest: opts.depthTest !== false, sizeAttenuation: true
    }));
  }
  const aspect = ASPECTC.get(key) || 4;
  const s = new THREE.Sprite(MATC.get(key));
  s.renderOrder = 10;        
  
  s.center.set(.5, 0);
  const hpx = opts.hpx || (opts.px ? opts.px / aspect : LBL_HPX);
  s.userData.hpx = hpx;
  s.userData.aspect = aspect;
  s.scale.set(aspect, 1, 1);               
  return s;
}







const _tacTex = new Map();
const _TAC_SHAPES = { ship: 1, air: 1, gnd: 1, site: 1, sub: 1, dot: 1 };



function _tacPath(x, sh) {
  x.beginPath();
  if (sh === 'ship') { x.moveTo(32, 6); x.lineTo(58, 32); x.lineTo(32, 58); x.lineTo(6, 32); }
  else if (sh === 'air') { x.moveTo(32, 5); x.lineTo(57, 50); x.lineTo(32, 41); x.lineTo(7, 50); }
  else if (sh === 'gnd') { x.rect(8, 8, 48, 48); }
  else if (sh === 'site') { x.moveTo(32, 6); x.lineTo(57, 56); x.lineTo(7, 56); }
  else if (sh === 'sub') { x.ellipse(32, 32, 26, 14, 0, 0, 7); }
  else { x.arc(32, 32, 16, 0, 7); }
  x.closePath();
}
export function makeTacDot(THREE, side, shape) {
  const key = side === 'blue' ? 'blue' : side === 'green' ? 'green' : 'red';
  const sh = _TAC_SHAPES[shape] ? shape : 'dot';
  const tk = key + '|' + sh;
  if (!_tacTex.has(tk)) {
    const col = SIDE_CSS[key];
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const x = cv.getContext('2d');
    const rg = x.createRadialGradient(32, 32, 2, 32, 32, 32);
    rg.addColorStop(0, col + '66'); rg.addColorStop(.55, col + '26'); rg.addColorStop(1, col + '00');
    x.fillStyle = rg; x.fillRect(0, 0, 64, 64);
    _tacPath(x, sh);
    x.lineWidth = 5; x.strokeStyle = 'rgba(2,10,18,.9)'; x.stroke();
    x.fillStyle = col; x.fill();
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    _tacTex.set(tk, tex);
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: _tacTex.get(tk), transparent: true, depthWrite: false, depthTest: false, sizeAttenuation: true }));
  s.renderOrder = 9;        
  s.visible = false;
  s.userData.px = 16;       
  s.userData.shape = sh;
  return s;
}





const _ringMat = new Map();
function ringMat(THREE, col) {
  let m = _ringMat.get(col);
  if (!m) {
    m = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: .42,
      side: THREE.DoubleSide, depthWrite: false
    });
    _ringMat.set(col, m);
  }
  return m;
}

export function sideRing(THREE, side, r) {
  const g = new THREE.Group();
  const col = SIDE_HEX[side] || SIDE_HEX.red;
  const mat = ringMat(THREE, col);          
  const mk = (r0, r1) => new THREE.Mesh(new THREE.RingGeometry(r0, r1, 32), mat);
  if (side === 'blue') {
    g.add(mk(r, r * 1.20));
    
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 + Math.PI / 8;
      const s = new THREE.Mesh(new THREE.PlaneGeometry(r * .52, r * .13), mat);
      s.position.set(Math.cos(a) * r * 1.34, 0, Math.sin(a) * r * 1.34);
      s.rotation.z = -a;
      g.add(s);
    }
  } else if (side === 'green') {
    
    g.add(mk(r, r * 1.14));
    g.add(mk(r * 1.30, r * 1.34));
  } else {
    g.add(mk(r, r * 1.07));
    g.add(mk(r * 1.46, r * 1.51));
  }
  g.rotation.x = -Math.PI / 2;
  return g;
}






const _v = { x: 0, y: 0, z: 0 };
export function fitLabels(camera, list) {
  const H = camera.userData.vh || (typeof innerHeight === 'number' ? innerHeight : 900);
  const f = 2 * Math.tan((camera.fov || 50) * Math.PI / 360);
  for (const it of list) {
    const sp = it.sprite; if (!sp || !sp.visible) continue;
    const d = camera.position.distanceTo(it.pos);
    
    const h = d * f * ((sp.userData.hpx || LBL_HPX) / H) / 2;   
    sp.scale.set(h * (sp.userData.aspect || 4), h, 1);
    sp.position.set(it.pos.x, it.pos.y, it.pos.z);
  }
}



export function legendHTML(self = 'red') {
  if (self === 'both') {
    return `<div class="side-legend">
    <div class="sl-row sl-blue"><i>▲</i><span>红方（可指挥）</span><b data-n="blue">0</b></div>
    <div class="sl-row sl-red"><i>◆</i><span>蓝方（可指挥）</span><b data-n="red">0</b></div>
  </div>`;
  }
  const me = self === 'blue' ? { g: '▲', c: 'blue' } : { g: '◆', c: 'red' };
  const foe = self === 'blue' ? { g: '◆', c: 'red' } : { g: '▲', c: 'blue' };
  return `<div class="side-legend">
    <div class="sl-row sl-${me.c}"><i>${me.g}</i><span>我方</span><b data-n="self">0</b></div>
    <div class="sl-row sl-${foe.c}"><i>${foe.g}</i><span>敌方</span><b data-n="foe">0</b></div>
  </div>`;
}
