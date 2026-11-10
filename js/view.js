



























export const SIDE_KEYS = ['red', 'blue', 'green'];
export const SIDE_CN = { red: '红方(PLA)', blue: '蓝方(台军)', green: '绿方(美军)' };


export const NUM2KEY = ['red', 'blue', 'green'];
export const KEY2NUM = { red: 0, blue: 1, green: 2 };
export const keyOf = u => NUM2KEY[u && u.side] || 'red';
export const otherSides = s => SIDE_KEYS.filter(k => k !== s);












let W = null;
export function attach(world) { W = world; }



let _planProvider = null;
export function setPlanProvider(fn) { _planProvider = typeof fn === 'function' ? fn : null; }
export function ready() { return !!W; }






const KM_PER_WU = 0.1;                       
const distKm = (a, b) => Math.hypot(a.x - b.x, a.z - b.z) * KM_PER_WU;




function sensorRange(u) {
  const t = u.t || {};
  if (t.det) return t.det;
  if (t.aaw) return t.aaw;
  const d = u.domain;
  if (d === 1) return 450;                   
  if (d === 2) return 110;                   
  if (d === 3) return 35;                    
  const L = u.Lw || (u.len ? u.len / 10 : 0);
  if (L >= 25) return 400;                   
  if (L >= 15) return 300;                   
  if (L >= 8) return 200;
  return 45;                                 
}


function sensorDomains(u) {
  const d = u.domain;
  if (d === 2) return [0, 2];                
  if (d === 1) return [0, 1, 3];
  return [0, 1, 2, 3];
}






export function sensorsOf(side) {
  const out = [];
  const units = W.units() || [];
  for (const u of units) {
    if (!u || u.alive === false) continue;
    if (keyOf(u) !== side) continue;
    out.push({
      x: u.x, z: u.z, r: sensorRange(u), dom: sensorDomains(u),
      own: u.name || u.kind || '', kind: u.kind || '', sat: false,
      
      ant: antennaM(u),
      



      sdom: u.domain, ref: u,
    });
  }
  const post = W.posture ? W.posture() : {};
  
  if (side === 'red') out.push({ x: 0, z: 0, r: 900, dom: [0], sat: true, own: '天基侦察', kind: 'sat', sdom: -1, ref: null });
  if (side === 'green') out.push({ x: 0, z: 0, r: 1000, dom: [0, 1], sat: true, own: 'NRO/商业SAR', kind: 'sat', sdom: -1, ref: null });
  









  if (side === 'green' && post.green && post.green !== 'none') {
    out.push({ x: 0, z: 0, r: 520, dom: [0, 1], sat: false, own: 'P-8A/MQ-4C 抵近巡逻(嘉手纳·关岛)', kind: 'isr', sdom: 1, ref: null });
    if (units.some(u => u.alive !== false && keyOf(u) === 'blue'))
      out.push({ x: 0, z: 0, r: 760, dom: [0, 1], sat: true, own: '台军情报共享(乐山·岛基雷达网)', kind: 'isr', sdom: -1, ref: null });
  }
  

  if (side === 'blue' && (post.green === 'isr' || post.green === 'limited' || post.green === 'full')) {
    out.push({ x: 0, z: 0, r: 820, dom: [0, 3], sat: true, own: '美方情报共享(P-8A/卫星)', kind: 'isr', sdom: -1 });
  }
  return out;
}




function detectOne(sensors, tgt) {
  let best = null;
  for (const s of sensors) {
    if (!s.dom.includes(tgt.domain)) continue;
    const d = distKm(s, tgt);
    if (d > s.r) continue;
    
    let conf = 1 - d / s.r;
    if (s.sat) conf *= 0.55;
    if (tgt.domain === 2) conf *= 0.6;       
    if (tgt.domain === 3) conf *= 0.8;       
    if (!best || conf > best.conf)
      



      best = { d, conf: Math.max(0.12, Math.min(1, conf)), by: s.own || s.kind,
        sat: !!s.sat, sdom: s.sdom === undefined ? -1 : s.sdom, skind: s.kind || '',
        ref: s.ref || null };
  }
  return best;
}




function cluster(contacts) {
  const groups = [];
  const used = new Set();
  for (let i = 0; i < contacts.length; i++) {
    if (used.has(i)) continue;
    const seed = contacts[i];
    const g = { side: seed.side, domain: seed.domain, list: [seed] };
    used.add(i);
    for (let j = i + 1; j < contacts.length; j++) {
      if (used.has(j)) continue;
      const c = contacts[j];
      if (c.side !== seed.side || c.domain !== seed.domain) continue;
      if (distKm(c, seed) < 30) { g.list.push(c); used.add(j); }
    }
    const n = g.list.length;
    const cx = g.list.reduce((a, c) => a + c.x, 0) / n;
    const cz = g.list.reduce((a, c) => a + c.z, 0) / n;
    const conf = g.list.reduce((a, c) => a + c.conf, 0) / n;
    g.x = cx; g.z = cz; g.n = n; g.conf = +(conf.toFixed(2));
    g.domain = seed.domain;
    

    const mo = g.list.filter(c => c.kn != null);
    if (mo.length) {
      const ks = mo.map(c => c.kn).sort((a, b) => a - b);
      g.kn = +(ks.length % 2 ? ks[(ks.length - 1) / 2] : (ks[ks.length / 2 - 1] + ks[ks.length / 2]) / 2).toFixed(1);
      let vx = 0, vz = 0;
      for (const c of mo) if (c.course != null) {
        const rad = c.course * Math.PI / 180;
        vx += Math.sin(rad) * c.kn; vz += -Math.cos(rad) * c.kn;
      }
      if (Math.hypot(vx, vz) > 0.5) {
        g.course = Math.round((Math.atan2(vx, -vz) * 180 / Math.PI + 360) % 360);
        g.dir = dirCn(g.course);
      } else { g.course = null; g.dir = ''; }
    }
    
    g.guess = guessGroup(g);
    groups.push(g);
  }
  
  const w = g => (g.domain === 0 ? 3 : g.domain === 1 ? 2 : g.domain === 2 ? 1.5 : 1) * g.n * g.conf;
  groups.sort((a, b) => w(b) - w(a));
  return groups;
}

function guessGroup(g) {
  const big = g.list.filter(c => c.big).length;
  const mvt = (g.kn != null && g.kn > 2 && g.dir) ? ('以 ' + g.kn + ' 节向' + g.dir) : (g.kn != null && g.kn <= 2 ? '滞留' : '');
  if (g.domain === 0) {
    let s;
    if (big >= 2) s = '大型编队（可能含两栖/航母）';
    else if (big === 1) s = '水面编队（含大型舰）';
    else s = g.n >= 4 ? '小型编队/艇群' : '单舰或小群';
    return mvt ? s + '，' + mvt : s;
  }
  if (g.domain === 1) return '空中编队' + (mvt ? '，' + mvt : '');
  if (g.domain === 2) return '水下接触（疑似潜艇）';
  return '岸上目标群';
}





export function detectByUnit(side, extra) {
  if (!W) throw new Error('VIEW.attach(world) 未调用');
  const sensors = sensorsOf(side);
  const pool = (W.units() || []).concat(extra || []);
  const out = new Map();
  for (const u of pool) {
    if (!u || u.alive === false || keyOf(u) === side) continue;
    const r = detectOne(sensors, u);
    if (r) out.set(u, r);
  }
  return out;
}































export const HORIZ_K = 4.12;          
export const SKIM_H = 8;              
export const MIS_HZ = { sub: 40 };    
const MAST_M = [30, 22, 14, 7];       
const GND_MAST_M = 18;                
const AIR_M = 9000;                   





export const HI_FIRE_KM = 120;

export function antennaM(u) {
  if (u.domain === 1) return AIR_M;
  if (u.domain === 3) {
    const terr = (W && W.elev) ? Math.max(0, W.elev(u.x, u.z)) : 0;
    return GND_MAST_M + terr;
  }
  const L = u.Lw || (u.len ? u.len / 10 : 0);   
  if (L >= 25) return MAST_M[0];
  if (L >= 15) return MAST_M[1];
  if (L >= 8) return MAST_M[2];
  return MAST_M[3];
}
export const horizKm = ant => HORIZ_K * (Math.sqrt(Math.max(0, ant || 0)) + Math.sqrt(SKIM_H));
const MIS_PROFILE = {
  
  yj62: 'low', yj83: 'low', hf2: 'low', hf3: 'low', harpoon: 'low',
  nsm: 'low', cj10: 'low',
  

  mst: 'low',
  



  sm6: 'hi',
  
  torp: 'sub',
  
  df16: 'hi', hq9: 'hi', sam40: 'hi', tk3: 'hi', pl15: 'hi', aim120: 'hi',
};
export const misProfile = kind => MIS_PROFILE[kind] || 'hi';


export function missileCred(side, m, sensors) {
  if (!m) return null;
  const key = typeof side === 'number' ? NUM2KEY[side] : side;
  if (NUM2KEY[m.side] === key) return { prof: 'own', d: 0, by: '本方发射', hz: null, tc: 'fire' };
  const s = sensors || sensorsOf(key);
  const prof = misProfile(m.kind);
  if (prof === 'low' || prof === 'sub') {
    const dom = prof === 'low' ? 0 : 2;
    let best = null;
    for (const sn of s) {
      if (prof === 'low' && sn.sat) continue;      
      if (!sn.dom.includes(dom)) continue;
      const d = distKm(sn, m);
      

      const hz = +(prof === 'sub' ? Math.min(sn.r, MIS_HZ.sub) : Math.min(sn.r, horizKm(sn.ant))).toFixed(1);
      if (d <= hz && (!best || d < best.d)) best = { prof, d: +d.toFixed(1), by: sn.own || sn.kind, hz, tc: 'fire' };
    }
    return best;
  }
  




  const r = detectOne(s, { domain: 1, x: m.x, z: m.z });
  const dEnd = distKm({ x: m.tx, z: m.tz }, m);
  const tc = (r && dEnd <= HI_FIRE_KM) ? 'fire' : 'warn';
  return r ? { prof, d: +r.d.toFixed(1), by: r.by, hz: null, tc }
           : { prof, d: null, by: '高弹道预警接力（无本地传感器确认）', hz: null, tc };
}




export function misFireCred(side, m, sensors) {
  const c = missileCred(side, m, sensors);
  return c && c.tc === 'fire' ? c : null;
}











const toK = u => ({ kx: u.x * KM_PER_WU + 320, kz: u.z * KM_PER_WU + 276.3 });





const BEACH_K = [{ x: 296, z: 190 }, { x: 242, z: 280 }, { x: 220, z: 356 }];
const shoreDistKm = (u) => {
  const { kx, kz } = toK(u);
  return Math.min(...BEACH_K.map(b => Math.hypot(kx - b.x, kz - b.z)));
};



const MEM = { red: {}, blue: {}, green: {} };
export function resetMemory(side) {
  if (side) MEM[side] = {};
  else SIDE_KEYS.forEach(k => { MEM[k] = {}; });
}










const TRK_ID = new WeakMap();
let _trkSeq = 0;
const TRK_MAX = 12;
function trkOf(mem, u, tMin) {
  let id = TRK_ID.get(u);
  if (id == null) { id = ++_trkSeq; TRK_ID.set(u, id); }
  let tr = mem.trk && mem.trk[id];
  if (!tr) { tr = { samples: [] }; (mem.trk || (mem.trk = {}))[id] = tr; }
  const k = toK(u);
  const last = tr.samples[tr.samples.length - 1];
  
  if (!last || tMin - last.t >= 0.7) {
    tr.samples.push({ t: +tMin.toFixed(2), kx: k.kx, kz: k.kz });
    if (tr.samples.length > TRK_MAX) tr.samples.shift();
  }
  return tr;
}

function trkMotion(tr, tMin) {
  const s = tr.samples;
  if (!s || s.length < 2) return null;
  const b = s[s.length - 1];
  let a = null;
  for (let i = s.length - 2; i >= 0; i--) if (b.t - s[i].t >= 1) { a = s[i]; break; }
  if (!a) a = s[0];
  const dtH = (b.t - a.t) / 60;
  if (dtH <= 0.01) return null;
  const dx = b.kx - a.kx, dz = b.kz - a.kz;
  const dist = Math.hypot(dx, dz);
  const kmh = dist / dtH;
  if (kmh < 0.5) return { kmh: 0, kn: 0, course: null, seenMin: +(tMin - s[0].t).toFixed(1) };
  
  const course = (Math.atan2(dx, -dz) * 180 / Math.PI + 360) % 360;
  return { kmh: +kmh.toFixed(1), kn: +(kmh * 0.54).toFixed(1), course: Math.round(course),
           seenMin: +(tMin - s[0].t).toFixed(1) };
}
const DIR_CN = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
const dirCn = deg => deg == null ? '' : DIR_CN[Math.round(deg / 45) % 8];

export function observe(side) {
  const units = (W.units() || []).filter(u => u && u.alive !== false);
  const sensors = sensorsOf(side);
  const enemies = units.filter(u => keyOf(u) !== side);
  const mem = MEM[side] || (MEM[side] = {});
  const tMin = W.time ? W.time() * 60 : 0;   
  const seen = [];
  for (const e of enemies) {
    const r = detectOne(sensors, e);
    if (r) {
      
      const tr = trkOf(mem, e, tMin);
      seen.push({ ...e, conf: r.conf, by: r.by, _mo: trkMotion(tr, tMin) });
    }
  }
  const obs = {
    t: W.time ? +W.time().toFixed(3) : 0,
    nSeen: seen.length,
    
    amphib: null,
    lcacFirstT: null,          
    lcacBeaches: 0,            
    ssmFirstRange: null,       
    armyAtBeach: null,         
    greenCsgDist: null,        
    greenOnIsland: false,      
  };
  if (side !== 'red') {
    

    const am = seen.filter(u => u.domain === 0 && /^(lpd|lha|lst|lhd|lsd)/i.test(u.kind || ''));
    if (am.length) {
      const lead = am.reduce((a, c) => (shoreDistKm(c) < shoreDistKm(a) ? c : a), am[0]);
      obs.amphib = { n: am.length, dist: +shoreDistKm(lead).toFixed(1), x: +lead.x.toFixed(1), z: +lead.z.toFixed(1) };
      

      const mo = lead._mo;
      if (mo && mo.course != null && mo.kn > 2) {
        obs.amphib.course = mo.course; obs.amphib.kn = mo.kn;
        const k = toK(lead);
        let best = null;
        for (let i = 0; i < BEACH_K.length; i++) {
          const b = BEACH_K[i];
          const brg = (Math.atan2(b.x - k.kx, -(b.z - k.kz)) * 180 / Math.PI + 360) % 360;
          let dd = Math.abs(brg - mo.course); if (dd > 180) dd = 360 - dd;
          if (dd < 50 && (!best || dd < best.dd)) best = { i, dd };
        }
        if (best) obs.amphib.toward = 'b' + (best.i + 1);
      }
    }
    

    const lc = seen.filter(u => /lcac|lcu|zubr/i.test(u.kind || '') && shoreDistKm(u) < 45);
    if (lc.length) {
      if (mem.lcacFirstT == null) mem.lcacFirstT = +tMin.toFixed(1);
      const zs = lc.map(u => toK(u).kz);
      
      const north = zs.filter(z => z < 235).length, mid = zs.filter(z => z >= 235 && z < 318).length, south = zs.filter(z => z >= 318).length;
      obs.lcacBeaches = [north, mid, south].filter(x => x > 0).length;
    }
    obs.lcacFirstT = mem.lcacFirstT != null ? mem.lcacFirstT : null;
  } else {
    const beachArmy = seen.filter(u => keyOf(u) === 'blue' && u.domain === 3);
    if (beachArmy.length) {
      

      const ds = beachArmy.map(shoreDistKm).sort((a, b) => a - b);
      const med = ds[Math.floor(ds.length / 2)];
      obs.armyAtBeach = med < 18;
      obs.armyMedKm = +med.toFixed(1);
      

      const h = mem.armyMed || (mem.armyMed = []);
      if (!h.length || tMin - h[h.length - 1].t >= 2) {
        h.push({ t: +tMin.toFixed(1), med });
        if (h.length > 8) h.shift();
      }
      if (h.length >= 2 && tMin - h[0].t >= 3) {
        const dlt = med - h[0].med;
        obs.armyTrend = dlt < -3 ? 'back' : dlt > 3 ? 'forward' : 'steady';
      }
    }
    const csg = seen.find(u => keyOf(u) === 'green' && u.domain === 0 && (u.Lw || 0) >= 25);
    if (csg) { const k = toK(csg); obs.greenCsgDist = +Math.hypot(360 - k.kx, 162 - k.kz).toFixed(1); }
    

    obs.greenOnIsland = seen.some(u => keyOf(u) === 'green' && u.domain === 3) ? true : null;
  }
  obs.seen = seen.map(u => ({
    side: keyOf(u), kind: u.kind, domain: u.domain,
    x: +u.x.toFixed(1), z: +u.z.toFixed(1), conf: +u.conf.toFixed(2),
    big: (u.Lw || 0) >= 15, hdg: u.hdg || 0, alive: true,
    
    kn: u._mo ? u._mo.kn : null,                 
    course: u._mo ? u._mo.course : null,         
    dir: u._mo ? dirCn(u._mo.course) : '',       
    seenMin: u._mo ? u._mo.seenMin : null,       
  }));
  obs.groups = cluster(obs.seen.map(c => ({ ...c, side: c.side })));
  return obs;
}






const FEATURES = {
  
  red: {
    b_stom:      { stop: [90, 112], lcacT: 14, spread: 1 },
    b_phasal:    { stop: [32, 62],  lcacT: 45, spread: 1 },
    b_dispersed: { stop: [58, 88],  lcacT: 16, spread: 3 },
    b_deception: { stop: [68, 96],  lcacT: 40, spread: 2 },
  },
  
  blue: {
    r_littoral:  { ssmR: [0, 45],   armyBeach: 1 },
    r_beach:     { ssmR: [45, 95],  armyBeach: 1 },
    r_indepth:   { ssmR: [20, 55],  armyBeach: 0 },
    r_decentral: { ssmR: [30, 80],  armyBeach: 0 },
  },
  
  green: {
    pa: { csg: [250, 520], island: 1 },
    pb: { csg: [300, 620], island: 0 },
    pc: { csg: [420, 900], island: 0 },
  },
};
const gauss = (x, mu, sig) => Math.exp(-((x - mu) ** 2) / (2 * sig * sig));

function scoreRed(obs) {
  const out = {};
  for (const [id, f] of Object.entries(FEATURES.red)) {
    let s = 0.34;                                        
    if (obs.amphib) {
      

      const mu = (f.stop[0] + f.stop[1]) / 2, sig = Math.max(8, (f.stop[1] - f.stop[0]) / 2.2);
      s *= 0.85 + 0.15 * gauss(obs.amphib.dist, mu, sig);
    }
    if (obs.lcacFirstT != null) {
      
      s *= 0.15 + 0.85 * gauss(obs.lcacFirstT, f.lcacT, Math.max(9, f.lcacT * 0.5));
    }
    if (obs.lcacBeaches) {
      s *= 0.2 + 0.8 * gauss(obs.lcacBeaches, f.spread, 1.1);
    }
    out[id] = s;
  }
  return out;
}
function scoreBlue(obs) {
  const out = {};
  for (const [id, f] of Object.entries(FEATURES.blue)) {
    let s = 0.34;
    if (obs.ssmFirstRange != null) {
      const mu = (f.ssmR[0] + f.ssmR[1]) / 2, sig = Math.max(10, (f.ssmR[1] - f.ssmR[0]) / 2.2);
      s *= 0.3 + gauss(obs.ssmFirstRange, mu, sig);
    }
    


    if (obs.armyAtBeach != null) s *= (obs.armyAtBeach ? 1 : 0) === f.armyBeach ? 1.0 : 0.45;
    out[id] = s;
  }
  return out;
}
function scoreGreen(obs) {
  const out = {};
  for (const [id, f] of Object.entries(FEATURES.green)) {
    let s = 0.34;
    if (obs.greenCsgDist != null) {
      const mu = (f.csg[0] + f.csg[1]) / 2, sig = Math.max(40, (f.csg[1] - f.csg[0]) / 2.2);
      s *= 0.3 + gauss(obs.greenCsgDist, mu, sig);
    }
    if (obs.greenOnIsland != null) s *= obs.greenOnIsland === !!f.island ? 1.0 : 0.5;
    out[id] = s;
  }
  return out;
}
function normalize(score) {
  const tot = Object.values(score).reduce((a, b) => a + b, 0) || 1;
  const out = {};
  for (const [k, v] of Object.entries(score)) out[k] = +(v / tot).toFixed(3);
  return out;
}

export function belief(side, obs) {
  const o = obs || observe(side);
  const b = {};
  const tgt = otherSides(side);
  for (const s of tgt) {
    if (s === 'red') b.red = normalize(scoreRed(o));
    if (s === 'blue') b.blue = normalize(scoreBlue(o));
    if (s === 'green') b.green = normalize(scoreGreen(o));
  }
  


  const evid = [
    o.lcacFirstT != null ? 0.45 : 0,
    o.lcacBeaches ? 0.3 : 0,
    o.armyAtBeach != null ? 0.15 : 0,
    o.greenCsgDist != null ? 0.2 : 0,
    (o.amphib && o.amphib.toward) ? 0.15 : 0,   
  ].reduce((a, b) => a + b, 0);
  const top = k => (b[k] && Object.values(b[k]).length ? Math.max(...Object.values(b[k])) : 0);
  const peak = Math.max(top('red'), top('blue'), top('green'), 0);
  const conf = +Math.min(1, evid * 0.75 + Math.max(0, peak - 0.25) * 0.6).toFixed(2);
  return { p: b, conf: Math.max(0.05, conf), at: o.t };
}




export function build(side) {
  if (!W) throw new Error('VIEW.attach(world) 未调用');
  const obs = observe(side);
  const bl = belief(side, obs);
  const units = (W.units() || []).filter(u => u && u.alive !== false && keyOf(u) === side);
  const self = {
    n: units.length,
    byDomain: {
      surface: units.filter(u => u.domain === 0).length,
      air: units.filter(u => u.domain === 1).length,
      sub: units.filter(u => u.domain === 2).length,
      ground: units.filter(u => u.domain === 3).length,
    },
    ships: units.filter(u => u.domain === 0).map(u => ({
      kind: u.kind, name: u.name || u.kind,
      x: +u.x.toFixed(1), z: +u.z.toFixed(1),
      hull: Math.round((u.hull / (u.hullMax || 100)) * 100),
      ammo: typeof u.ammo === 'number' ? u.ammo
        : (u.ammo && typeof u.ammo === 'object' ? Object.values(u.ammo).reduce((a, b) => a + (b || 0), 0) : null),
      state: u.state || '', hdg: u.hdg || 0,
    })),
    
    ammo: units.reduce((a, u) => {
      const m = u.ammo;
      if (m && typeof m === 'object') for (const k in m) a[k] = (a[k] || 0) + (m[k] || 0);
      return a;
    }, {}),
  };
  const known = (W.known && W.known(side)) || {};
  const post = (W.posture && W.posture()) || {};
  


  const misList = W.missiles ? W.missiles() : null;
  let inbound = null;
  if (Array.isArray(misList)) {
    const sensors = sensorsOf(side);
    inbound = [];
    for (const m of misList) {
      if (!m || NUM2KEY[m.side] === side) continue;         
      const c = missileCred(side, m, sensors);
      if (!c) continue;                                     
      inbound.push({ kind: m.kind || '', prof: c.prof, d: c.d, by: c.by || '', tc: c.tc || 'fire',
        x: +m.x.toFixed(1), z: +m.z.toFixed(1), side: NUM2KEY[m.side] || '' });
    }
  }
  return {
    side, sideCn: SIDE_CN[side], t: obs.t,
    self,
    contacts: { n: obs.nSeen, groups: obs.groups, ammoUnknown: true },
    inbound,                                               
    known,
    belief: bl,
    posture: { own: post[side] || null, green: post.green || null, greenPreset: post.greenPreset || null },
    

    obs: { amphib: obs.amphib, lcacFirstT: obs.lcacFirstT, lcacBeaches: obs.lcacBeaches,
           armyAtBeach: obs.armyAtBeach, armyMedKm: obs.armyMedKm || null, armyTrend: obs.armyTrend || null,
           greenCsgDist: obs.greenCsgDist },
    
    plan: _planProvider ? (_planProvider(side) || null) : null,
  };
}





const QUERY_WHITELIST = new Set(['contacts', 'contact', 'self', 'ammo', 'known', 'belief', 'timeline', 'doctrine']);
export function query(side, kind, args = {}) {
  if (!QUERY_WHITELIST.has(kind)) return { ok: false, err: '拒绝：未授权的查询 ' + kind };
  const v = build(side);
  switch (kind) {
    case 'contacts': return { ok: true, data: v.contacts.groups };
    case 'contact': {
      const g = v.contacts.groups[args.i || 0];
      return g ? { ok: true, data: g } : { ok: false, err: '无该接触' };
    }
    case 'self': return { ok: true, data: v.self };
    case 'ammo': return { ok: true, data: v.self.ammo };
    case 'known': return { ok: true, data: v.known };
    case 'belief': return { ok: true, data: v.belief };
    case 'timeline': return { ok: true, data: (W.timeline && W.timeline(side)) || [] };
    case 'doctrine': return { ok: true, data: (W.doctrine && W.doctrine(side)) || null };
  }
  return { ok: false, err: '空查询' };
}




const FORBIDDEN = ['params', 'preset', 'holdKm', 'landNeed', 'schemeId', 'pid', 'sel', 'postureSel'];
export function audit(side) {
  const v = build(side);
  const s = JSON.stringify(v);
  const hits = [];
  for (const f of FORBIDDEN) if (s.includes('"' + f + '"')) hits.push(f);
  
  const opp = otherSides(side);
  for (const o of opp) if (s.includes('"' + o + '_plan"')) hits.push(o + '_plan');
  return { ok: hits.length === 0, leaks: hits, bytes: s.length };
}


export function brief(side) {
  const v = build(side);
  const b = v.belief.p;
  const top = k => {
    if (!b[k]) return '-';
    const [id, p] = Object.entries(b[k]).sort((a, c) => c[1] - a[1])[0];
    return id + ' ' + Math.round(p * 100) + '%';
  };
  return `[${SIDE_CN[side]}] T+${(v.t * 60).toFixed(0)}m 自兵${v.self.n} 接触${v.contacts.n}`
    + ` 判红=${top('red')} 判蓝=${top('blue')} 判绿=${top('green')} 置信${Math.round(v.belief.conf * 100)}%`;
}
