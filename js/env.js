








import * as THREE from 'three';
import { loadBasing, hintIds, sites } from './basing.js';   

const KM = 10;                      


export function buildContext(scene, cam) {
  const grp = new THREE.Group(); grp.name = 'context';

  




  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(160000, 120000),
    new THREE.MeshBasicMaterial({ color: 0x060f1c, fog: false, depthWrite: false }));
  base.rotation.x = -Math.PI / 2; base.position.y = -2.4;
  base.renderOrder = -20; grp.add(base);

  
  




  const LON0 = 121.15686, LAT0 = 23.9996;   
  const KX = 96.82, KZ = 110.56;            
  const R = { w: 96, e: 150, n: 46, s: 4 }; 
  const x0 = (R.w - LON0) * KX * KM, x1 = (R.e - LON0) * KX * KM;
  const z0 = (LAT0 - R.n) * KZ * KM, z1 = (LAT0 - R.s) * KZ * KM;
  const tex = new THREE.TextureLoader().load('assets/region.jpg');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  geo.rotateX(-Math.PI / 2);
  



  const mat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: tex }, uCam: { value: cam ? cam.position : null } },
    vertexShader: `varying vec2 vUv;varying vec3 vW;
      void main(){vUv=uv;vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;
      gl_Position=projectionMatrix*viewMatrix*wp;}`,
    fragmentShader: `uniform sampler2D uMap;uniform vec3 uCam;varying vec2 vUv;varying vec3 vW;
      void main(){
        vec3 c=texture2D(uMap,vUv).rgb;
        float dc=length(vW-uCam);
        float haze=smoothstep(6000.0,16000.0,dc);
        

        c=mix(c,vec3(0.055,0.105,0.165),haze*0.30);
        c=pow(clamp(c,0.0,1.0),vec3(1.0/2.2));
        gl_FragColor=vec4(c,1.0);
      }`,
    fog: false, depthWrite: false });
  const map = new THREE.Mesh(geo, mat);
  map.position.set((x0 + x1) / 2, -2.2, (z0 + z1) / 2);
  map.renderOrder = -10;   
  grp.add(map);

  




  if(!new URLSearchParams(location.search).has('noisl'))
  fetch('assets/islands/islands.json').then(r => r.json()).then(man => {
    man.blocks.forEach(b => {
      fetch('assets/islands/' + b.name + '.bin').then(r => r.arrayBuffer()).then(buf => {
        const n = b.w * b.h;
        const hh = new Uint16Array(buf, 0, n * 2);
        const cols = new Uint8Array(buf, n * 2, n * 3);
        const TP = (1 << b.z) * 256;                       
        const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
        for (let j = 0; j < b.h; j++) {
          const py = b.py0 + (j + 0.5) * b.stride;
          const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * py / TP))) * 180 / Math.PI;
          const wz = (man.lat0 - lat) * man.kz;
          for (let i = 0; i < b.w; i++) {
            const px = b.px0 + (i + 0.5) * b.stride;
            const lon = px / TP * 360 - 180;
            const o = j * b.w + i;
            pos[o * 3]     = (lon - man.lon0) * man.kx;
            pos[o * 3 + 1] = THREE.DataUtils.fromHalfFloat(hh[o]) * man.ys;
            pos[o * 3 + 2] = wz;
            col[o * 3] = cols[o * 3] / 255; col[o * 3 + 1] = cols[o * 3 + 1] / 255; col[o * 3 + 2] = cols[o * 3 + 2] / 255;
          }
        }
        const idx = [];
        for (let j = 0; j < b.h - 1; j++) for (let i = 0; i < b.w - 1; i++) {
          const a = j * b.w + i, bb = a + 1, c = a + b.w, d = c + 1;
          idx.push(a, c, bb, bb, c, d);                    
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        g.setIndex(idx);
        const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true }));
        grp.add(mesh);
      }).catch(e => console.warn('island', b.name, e));
    });
  }).catch(e => console.warn('islands manifest', e));

  



  {
    const lonW = LON0 - (640 / 2) / KX, lonE = LON0 + (640 / 2) / KX;
    const latN = LAT0 + (552.6 / 2) / KZ, latS = LAT0 - (552.6 / 2) / KZ;
    const bx0 = (lonW - LON0) * KX * KM, bx1 = (lonE - LON0) * KX * KM;
    const bz0 = (LAT0 - latN) * KZ * KM, bz1 = (LAT0 - latS) * KZ * KM;
    const fpts = [
      new THREE.Vector3(bx0, 0.5, bz0), new THREE.Vector3(bx1, 0.5, bz0),
      new THREE.Vector3(bx1, 0.5, bz1), new THREE.Vector3(bx0, 0.5, bz1)];
    const frame = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(fpts),
      new THREE.LineBasicMaterial({ color: 0xffb070, transparent: true, opacity: .8, fog: false }));
    grp.add(frame);
  }

  




  {
    const W2 = (lo, la) => new THREE.Vector3((lo - LON0) * 968.2, 0, (LAT0 - la) * 1105.6);
    


    const GEO_REG = [];
    

    const MARK_BY_ID = {};
    


    const DEDUPE = { pre: 0, post: 0 };
    window.__BASING_DEDUPE = DEDUPE;
    window.__BASING_HIDE = (id) => { const r = MARK_BY_ID[id]; if (!r) return false;
                                     if (!r.off) { r.off = true; DEDUPE.post++; } return true; };
    

    window.__BASING_MARK_LIVE = (id) => { const r = MARK_BY_ID[id];
                                          return r ? (r.off ? 'off' : 'on') : 'none'; };
    





    const dotTex = (name, c0, c1, edge, txt, sz) => {
      


      const mm = document.createElement('canvas').getContext('2d');
      mm.font = 'bold ' + sz + 'px sans-serif';
      const tw = Math.max(60, Math.ceil(mm.measureText(name).width));
      const W = 56 + tw + 16, H = 56;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const c = cv.getContext('2d');
      const g0 = c.createRadialGradient(28, 28, 2, 28, 28, 26);
      g0.addColorStop(0, c0); g0.addColorStop(.35, c1);
      g0.addColorStop(1, c1.replace('rgb', 'rgba').replace(')', ',0)'));
      c.fillStyle = g0; c.beginPath(); c.arc(28, 28, 26, 0, 7); c.fill();
      c.fillStyle = 'rgba(8,16,26,.82)'; c.fillRect(56, 14, tw + 16, 28);
      c.strokeStyle = edge; c.strokeRect(56, 14, tw + 16, 28);
      c.fillStyle = txt; c.font = 'bold ' + sz + 'px sans-serif';
      c.fillText(name, 64, 34);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      return { t, a: W / H };
    };
    const STYLE = {
      base: { c0: '#ffe2b0', c1: 'rgb(255,171,82)', edge: 'rgba(255,171,82,.75)', txt: '#ffd9a0', sz: 17, y: 9, visHi: 3200, kmin: 400, kmax: 4500, sx: .22, sy: .048 },
      gfix: { c0: '#d8ffd9', c1: 'rgb(87,196,106)', edge: 'rgba(87,196,106,.75)', txt: '#c2f0c9', sz: 15, y: 7, visHi: 2200, kmin: 400, kmax: 3200, sx: .16, sy: .035 },
      red:  { c0: '#ffd0c0', c1: 'rgb(255,122,77)', edge: 'rgba(255,122,77,.72)', txt: '#ffcdb8', sz: 14, y: 6, visHi: 1900, kmin: 340, kmax: 2600, sx: .14, sy: .030 },
      blue: { c0: '#c8f0fa', c1: 'rgb(79,195,217)', edge: 'rgba(79,195,217,.72)', txt: '#c2eef8', sz: 14, y: 6, visHi: 1900, kmin: 340, kmax: 2600, sx: .14, sy: .030 },
    };
    const addMark = (sec, style, p) => {
      

      if (window.__ENGINE_BIDS && window.__ENGINE_BIDS.has(p.id)) { DEDUPE.pre++; return null; }
      const st = STYLE[style];
      const D = dotTex(p.nm || p.name, st.c0, st.c1, st.edge, st.txt, st.sz);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: D.t,
        transparent: true, opacity: p.conf === 'C' ? .62 : .92,
        depthWrite: false, depthTest: false, fog: false }));
      const w = W2(p.geo[0], p.geo[1]);
      sp.position.set(w.x, st.y, w.z);
      sp.renderOrder = 12;
      sp.center.set(28 / (D.a * 56), .5);       
      sp.scale.set(40 * D.a, 40, 1);
      GEO_REG.push({ sp, n: sec + ':' + p.id, visHi: p.conf === 'C' ? st.visHi * 0.7 : st.visHi,
                     visLo: 0, kmin: st.kmin, kmax: st.kmax, sx: st.sy * D.a, sy: st.sy });
      MARK_BY_ID[p.id] = GEO_REG[GEO_REG.length - 1];
      grp.add(sp);
      return sp;
    };
    loadBasing().then(doc => {
      if (!doc) return;
      const byId = {}; doc.places.forEach(p => { byId[p.id] = p; });
      const put = (sec, style) => hintIds(sec).forEach(id => { const p = byId[id]; if (p) addMark(sec, style, p); });
      put('js/env.js:bases', 'base');
      put('js/env.js:gfix', 'gfix');
      


      const staticSites = s => sites(s).filter(p => p.type !== 'unit_group');
      staticSites('red').forEach(p => addMark('basing:red', 'red', p));
      staticSites('blue').forEach(p => addMark('basing:blue', 'blue', p));
      

      (doc.exercises || []).forEach(e => (e.boxes || []).forEach(b => {
        if (!b.poly_world) return;
        const v = b.poly_world.map(([x, z]) => new THREE.Vector3(x, 1.2, z));
        const ln = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(v),
          new THREE.LineBasicMaterial({ color: e.side === 'red' ? 0xff7a4d : 0x57c46a,
                                        transparent: true, opacity: .34, fog: false }));
        ln.renderOrder = 2; grp.add(ln);
      }));
      
      const cnt = re => GEO_REG.filter(r => re.test(r.n || '')).length;
      window.__BASING_MARKS = {
        get base() { return cnt(/^js\/env\.js:bases/); },
        get gfix() { return cnt(/^js\/env\.js:gfix/); },
        get red() { return cnt(/^basing:red/); },
        get blue() { return cnt(/^basing:blue/); },
        get hidden() { return GEO_REG.filter(r => r.off).length; },
        get total() { return GEO_REG.filter(r => /^basing:|env\.js:/.test(r.n || '')).length; },
        boxes: (doc.exercises || []).reduce((a, e) => a + (e.boxes || []).length, 0) };
    });
    


    {
      const mkGeoTex = (name, big) => {
        const cv = document.createElement('canvas');
        cv.width = big ? 512 : 192; cv.height = big ? 96 : 44;
        const c = cv.getContext('2d');
        c.font = big ? 'italic 600 42px "Microsoft YaHei",system-ui,sans-serif'
                     : '600 25px "Microsoft YaHei",system-ui,sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineJoin = 'round';
        c.strokeStyle = big ? 'rgba(5,16,26,.60)' : 'rgba(4,10,16,.85)';
        c.lineWidth = big ? 7 : 5;
        c.strokeText(name, cv.width / 2, cv.height / 2 + 1);
        c.fillStyle = big ? 'rgba(150,222,242,.90)' : 'rgba(230,242,250,.96)';
        c.fillText(name, cv.width / 2, cv.height / 2 + 1);
        const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
        return t;
      };
      const addGeo = (list, big, visHi, visLo, s0, s1, y) => list.forEach(([n, lo, la]) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({
          map: mkGeoTex(n, big), transparent: true, opacity: big ? .55 : .92,
          depthWrite: false, depthTest: false, fog: false }));
        const p = W2(lo, la); sp.position.set(p.x, y, p.z);
        (window.__GEOSP = window.__GEOSP || {})[n] = sp;          
        sp.renderOrder = 3;                                  
        GEO_REG.push({ sp, n, visHi, visLo, kmin: 300, kmax: 9000, sx: s0, sy: s1 });
        grp.add(sp);
      });
      
      addGeo([
        ['台北', 121.55, 25.05], ['桃园', 121.30, 25.00], ['新竹', 120.97, 24.80],
        ['台中', 120.67, 24.15], ['嘉义', 120.45, 23.48], ['台南', 120.20, 23.00],
        ['高雄', 120.31, 22.62], ['屏东', 120.49, 22.67], ['宜兰', 121.75, 24.75],
        ['花莲', 121.60, 23.98], ['台东', 121.15, 22.76], ['澎湖', 119.58, 23.57],
        ['厦门', 118.10, 24.48], ['福州', 119.30, 26.07], ['泉州', 118.68, 24.87],
        ['莆田', 119.08, 25.44], ['汕头', 116.68, 23.35], ['温州', 120.70, 28.00],
        ['宁波', 121.55, 29.87], ['那霸', 127.68, 26.21], ['马尼拉', 120.98, 14.60],
      ], false, 3000, 60, 0.075, 0.017, 6);
      
      addGeo([
        ['台湾海峡', 119.55, 24.15], ['巴士海峡', 120.85, 21.25],
        ['宫古海峡', 125.25, 24.75], ['吕宋海峡', 121.05, 19.55],
        ['东海', 124.6, 29.2], ['南海', 114.8, 16.8], ['太平洋', 128.5, 18.5],
        ['冲绳岛', 127.95, 26.45], ['吕宋岛', 121.0, 16.5],
      ], true, 12000, 620, 0.16, 0.034, 8);
    }
    
    const chains = [
      { pts: [[140.2, 35.5], [134.5, 33.8], [130.2, 31.8], [128.3, 27.5], [125.5, 25.0], [122.2, 25.0], [120.9, 21.9], [119.2, 18.0], [117.0, 12.0], [112.5, 6.5]],
        col: 0xffab52, op: .55 },
      { pts: [[141.5, 35.5], [141.5, 30.0], [139.5, 24.0], [138.5, 18.0], [141.5, 13.2], [145.8, 11.0], [149.0, 8.0]],
        col: 0x59e0ff, op: .40 },
    ];
    chains.forEach(ch => {
      const v = ch.pts.map(([lo, la]) => { const p = W2(lo, la); return new THREE.Vector3(p.x, 2.0, p.z); });
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(v),
        new THREE.LineDashedMaterial({ color: ch.col, transparent: true, opacity: ch.op, dashSize: 18, gapSize: 12, fog: false }));
      line.computeLineDistances();
      grp.add(line);
    });
    
    for (const rkm of [500, 1000, 1500, 2000]) {
      const R = rkm * 10, pts = [];
      for (let a = 0; a <= 180; a++) {
        const th = a / 180 * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(th) * R, 1.5, Math.sin(th) * R));
      }
      const ring = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineDashedMaterial({ color: 0x7fb8d8, transparent: true, opacity: .16, dashSize: 26, gapSize: 20, fog: false }));
      ring.computeLineDistances();
      grp.add(ring);
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 40;
      const c = cv.getContext('2d');
      c.fillStyle = 'rgba(10,18,30,.7)'; c.fillRect(20, 4, 88, 32);
      c.fillStyle = '#9ecbe8'; c.font = 'bold 20px sans-serif'; c.textAlign = 'center';
      c.fillText(rkm + 'km', 64, 28);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const lb = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false, opacity: .8 }));
      lb.position.set(0, 1.5, -R); lb.scale.set(150, 47, 1); lb.renderOrder = 11;
      GEO_REG.push({ sp: lb, visHi: 1e9, visLo: 0, kmin: 1, kmax: 1, sx: 150, sy: 47, camY: 3000 });  
      grp.add(lb);
    }

    

    window.__GEO_SYNC = (camera) => {
      const cp = camera.position;
      for (const r of GEO_REG) {
        if (r.off) { r.sp.scale.set(0, 0, 1); continue; }   
        if (r.camY !== undefined) {                              
          r.sp.scale.set(cp.y > r.camY ? r.sx : 0, cp.y > r.camY ? r.sy : 0, 1);
          continue;
        }
        const dist = cp.distanceTo(r.sp.position);
        if (r.n)(window.__GEO = window.__GEO || {})[r.n] = Math.round(dist) + '/' + Math.round(Math.max(r.kmin, Math.min(dist, r.kmax)) * r.sx);
        if (dist >= r.visHi || dist <= r.visLo) { r.sp.scale.set(0, 0, 1); continue; }
        const k = Math.max(r.kmin, Math.min(dist, r.kmax));
        r.sp.scale.set(k * r.sx, k * r.sy, 1);
      }
    };
  }

  scene.add(grp);
  return grp;
}















export function makeTerrainMaterial(THREE_, tex, sunDir, camPos) {
  return new THREE_.ShaderMaterial({
    uniforms: {
      uMap: { value: tex },
      uSun: { value: sunDir },
      uCam: { value: camPos },
      uLit: { value: 1.0 },      
    },
    vertexShader: `
      attribute float aH;                       
      varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vH;
      void main(){
        vUv = uv; vH = aH;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform sampler2D uMap; uniform vec3 uSun; uniform vec3 uCam; uniform float uLit;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vH;
      void main(){
        vec3 alb = texture2D(uMap, vUv).rgb;
        vec3 N = normalize(vN);
        float dry = smoothstep(-2.0, 5.0, vH);        
        

        float lum = dot(alb, vec3(.299, .587, .114));
        alb = mix(vec3(lum), alb, 1.0 + 0.35 * dry);
        float ndl = max(dot(N, uSun), 0.0);           
        float sky = 0.5 + 0.5 * N.y;                  
        float lit = 0.14 + 0.44 * sky + 0.60 * ndl;
        


        float k = 0.60 + 0.50 * lit;
        vec3 c = alb * mix(1.0, k, dry * uLit);
        float dc = length(vW - uCam);
        float haze = smoothstep(6000.0, 16000.0, dc); 
        
        c = mix(c, vec3(0.055, 0.105, 0.165), haze * 0.30);
        


        c = pow(clamp(c, 0.0, 1.0), vec3(1.0/2.2));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
}


export function initAdaptiveDPR(renderer, opts = {}) {
  const dprCap = window.devicePixelRatio || 1;
  const max = Math.min(opts.max || dprCap, 2.0);
  let cur = Math.min(max, opts.start || max);
  let last = performance.now(), acc = 0, n = 0, timer = 0, cool = 1.5;  
  renderer.setPixelRatio(cur);
  return {
    get value() { return cur; },
    tick(active = true) {          
      const now = performance.now(); const dt = (now - last) / 1000; last = now;
      if (!active) return;
      if (cool > 0) { cool -= dt; return; }
      if (dt > 0.15) return;       
      acc += dt; n++; timer += dt;
      if (timer >= 1) {
        const avg = acc / n;
        const want = avg > 0.040 ? Math.max(1.0, cur - 0.25)   
                   : (avg < 0.024 && cur < max) ? Math.min(max, cur + 0.1) : cur;
        if (want !== cur) { cur = want; renderer.setPixelRatio(cur); cool = 1.5; }
        acc = 0; n = 0; timer = 0;
      }
    }
  };
}


if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
}







export const VITALS_W = 74, VITALS_H = 14;
export function makeVitals(THREE_, side, wUnits) {
  const W = VITALS_W, H = VITALS_H;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const tex = new THREE_.CanvasTexture(cv); tex.colorSpace = THREE_.SRGBColorSpace;
  tex.minFilter = THREE_.LinearFilter; tex.generateMipmaps = false;
  const RGB = side === 2 ? [72, 217, 138] : side ? [96, 210, 255] : [255, 116, 84];   


  const mat = new THREE_.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false });
  const spr = new THREE_.Sprite(mat); spr.center.set(.5, 0);
  spr.renderOrder = 10;   
  let lastQ = -1;
  function set(frac) {
    frac = Math.max(0, Math.min(1, frac || 0));
    const q = Math.round(frac * 100); if (q === lastQ) return; lastQ = q;
    const tier = frac > 0.55 ? 0 : (frac > 0.25 ? 1 : 2);
    const c = tier === 1 ? [255, 178, 80] : tier === 2 ? [255, 84, 72] : RGB;
    const g = cv.getContext('2d');
    g.clearRect(0, 0, W, H);

    

    g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
    if (side === 2) {   
      g.beginPath(); g.arc(5.5, 6.5, 5.5, 0, 7); g.fill();
    } else if (side) {   
      g.beginPath(); g.moveTo(5.5, 1.5); g.lineTo(10.5, 12); g.lineTo(0.5, 12); g.closePath(); g.fill();
    } else {      
      g.beginPath(); g.moveTo(5.5, 0.8); g.lineTo(10.2, 7); g.lineTo(5.5, 13.2); g.lineTo(0.8, 7); g.closePath(); g.fill();
    }

    
    g.beginPath(); g.roundRect(12.7, 2.4, W - 14.4, 9.2, 3.2);
    g.fillStyle = 'rgba(5,12,20,.74)'; g.fill();
    g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.5)'; g.stroke();

    
    if (frac > 0.02) {
      const w = Math.max(4, (W - 16) * frac);
      g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      g.beginPath(); g.roundRect(13.5, 3.8, w, 6.4, 2.4); g.fill();
      
      g.fillStyle = 'rgba(255,255,255,.26)';
      g.beginPath(); g.roundRect(14.5, 4.5, Math.max(1, w - 2), 1.3, .65); g.fill();
    }

    
    g.fillStyle = 'rgba(3,9,15,.55)';
    for (const p of [0.25, 0.5, 0.75]) {
      const x = 13.5 + (W - 16) * p;
      g.fillRect(Math.round(x), 3.2, 1.1, 7.6);
    }
    tex.needsUpdate = true;
  }
  set(1);
  

  function size(w) { spr.scale.set(w, w * H / W, 1); }
  size(wUnits);
  return { spr, set, size };
}
