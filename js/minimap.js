










export function createMinimap(opt) {
  const W = opt.width || 232;
  const H = Math.round(W * (opt.MAPH || 420) / (opt.MAPW || 640));
  const pal = Object.assign({
    sea: '#0a2236', land: '#2c4a3c', coast: 'rgba(140,200,230,.55)',
    view: '#ffd166', viewFill: 'rgba(255,209,102,.10)',
    red: '#ff7a4d', blue: '#4fc3d9', cam: '#ffffff',   
    


    green: '#57c46a'
  }, opt.palette || {});

  const cv = document.createElement('canvas');
  cv.width = W * 2; cv.height = H * 2;
  


  cv.style.width = '100%'; cv.style.height = 'auto';
  cv.style.display = 'block';
  const box = document.createElement('div');
  box.id = opt.id || 'miniMap';
  box.appendChild(cv);

  const c = cv.getContext('2d');

  
  let base = null;
  const w2p = (x, z) => [(x / opt.WU + 0.5) * W, (z / opt.DU + 0.5) * H];

  function buildFromGrid() {
    if (!opt.grid) return null;
    const b = document.createElement('canvas');
    b.width = W * 2; b.height = H * 2;
    const bc = b.getContext('2d');
    bc.scale(2, 2);
    bc.fillStyle = pal.sea; bc.fillRect(0, 0, W, H);
    const g = opt.grid, GW = opt.GW, GH = opt.GH;
    const img = bc.getImageData(0, 0, W * 2, H * 2);
    const land = [0x3a, 0x5c, 0x4a], sea = [0x0d, 0x26, 0x3c];
    for (let py = 0; py < H * 2; py++) {
      const j = Math.min(GH - 1, Math.floor(py / (H * 2) * GH));
      for (let px = 0; px < W * 2; px++) {
        const i = Math.min(GW - 1, Math.floor(px / (W * 2) * GW));
        const e = g[j * GW + i];
        const col = e > 0 ? land : sea;
        
        const k = e > 0 ? 1 + Math.min(.25, e / 2600) : 1;
        const o = (py * W * 2 + px) * 4;
        img.data[o] = col[0] * k; img.data[o + 1] = col[1] * k; img.data[o + 2] = col[2] * k; img.data[o + 3] = 255;
      }
    }
    bc.putImageData(img, 0, 0);
    return b;
  }

  if (opt.imgUrl) {
    const im = new Image();
    im.onload = () => {
      const b = document.createElement('canvas');
      b.width = W * 2; b.height = H * 2;
      const bc = b.getContext('2d');
      bc.scale(2, 2);
      bc.drawImage(im, 0, 0, W, H);
      base = b;
    };
    im.src = opt.imgUrl;
    setTimeout(() => { if (!base) base = buildFromGrid(); }, 9000);
  }
  if (opt.grid) setTimeout(() => { if (!base) base = buildFromGrid(); }, 100);

  
  const _v = opt.THREE ? new opt.THREE.Vector3() : null;
  let mark = null;                      
  function viewPoly() {
    if (!_v || !opt.cam) return [];
    const pts = [];
    for (const [nx, ny] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      _v.set(nx, ny, 0.5).unproject(opt.cam);
      const dx = _v.x - opt.cam.position.x, dy = _v.y - opt.cam.position.y, dz = _v.z - opt.cam.position.z;
      if (dy > -1e-4) continue;                       
      const t = -opt.cam.position.y / dy;
      pts.push(w2p(opt.cam.position.x + dx * t, opt.cam.position.z + dz * t));
    }
    return pts;
  }

  function draw() {
    if (!base) return;
    c.save(); c.scale(2, 2);
    c.clearRect(0, 0, W, H);
    c.drawImage(base, 0, 0, W, H);

    
    const us = (opt.getUnits ? opt.getUnits() : []);
    for (const u of us) {
      if (!u || u.alive === false) continue;
      const [px, py] = w2p(u.x, u.z);
    
      

      c.fillStyle = pal[u.side] || pal.blue;
      const r = u.big ? 3.4 : 2.1;
      c.beginPath(); c.arc(px, py, r, 0, 7); c.fill();
      c.lineWidth = Math.max(.9, r * .5);
      c.strokeStyle = 'rgba(255,255,255,.92)';
      c.stroke();
    }

    


    const gs = (opt.getGhosts ? opt.getGhosts() : []);
    if(gs.length){
      


      c.save(); c.setLineDash([2.2,1.7]);
      for (const g0 of gs) {
        if (!g0) continue;
        const [px, py] = w2p(g0.x, g0.z);
        c.beginPath(); c.arc(px, py, 3.6, 0, 7);
        c.strokeStyle = g0.col || pal.view; c.lineWidth = 1.4; c.stroke();
      }
      c.restore();
    }

    
    const poly = viewPoly();
    if (poly.length === 4) {
      c.beginPath();
      c.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < 4; i++) c.lineTo(poly[i][0], poly[i][1]);
      c.closePath();
      c.fillStyle = pal.viewFill; c.fill();
      c.strokeStyle = pal.view; c.lineWidth = 1.2; c.stroke();
      


      const gp = w2p(opt.cam.position.x, opt.cam.position.z);
      c.fillStyle = pal.cam;
      c.beginPath(); c.arc(gp[0], gp[1], 2, 0, 7); c.fill();
      c.strokeStyle = pal.cam; c.lineWidth = 1; c.stroke();
    }

    
    if (mark) {
      const age = (performance.now() - mark.t) / 1500;
      if (age >= 1) mark = null;
      else {
        c.save();
        c.strokeStyle = pal.cam; c.lineWidth = 1.6;
        c.globalAlpha = (1 - age) * .95;
        c.beginPath(); c.arc(mark.px, mark.py, 3 + 13 * age, 0, 7); c.stroke();
        c.globalAlpha = (1 - age) * .8;
        c.fillStyle = pal.cam;
        c.beginPath(); c.arc(mark.px, mark.py, 1.8, 0, 7); c.fill();
        c.restore();
      }
    }

    
    c.strokeStyle = 'rgba(140,200,230,.25)'; c.lineWidth = 1; c.strokeRect(.5, .5, W - 1, H - 1);
    c.restore();
  }

  







  const stop = e => { e.stopPropagation(); };
  cv.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault(); stop(e);
    const r = cv.getBoundingClientRect();
    const kx = (e.clientX - r.left) / r.width, kz = (e.clientY - r.top) / r.height;
    const wx = (kx - 0.5) * opt.WU;
    const wz = (kz - 0.5) * opt.DU;
    mark = { px: kx * W, py: kz * H, t: performance.now() };   
    if (opt.onJump) opt.onJump(wx, wz);
  });
  

  cv.addEventListener('mousedown', e => { e.preventDefault(); stop(e); }, true);
  cv.addEventListener('mouseup', e => { stop(e); }, true);
  cv.addEventListener('dblclick', e => stop(e), true);
  cv.addEventListener('contextmenu', e => { e.preventDefault(); stop(e); }, true);

  setInterval(draw, opt.ms || 260);
  setInterval(() => { if (mark) draw(); }, 100);   
  draw();
  

  if (opt.mount !== false && document.body) {
    const rc = document.getElementById('rightcol');
    if (rc) rc.appendChild(box); else document.body.appendChild(box);
  }
  return box;
}
