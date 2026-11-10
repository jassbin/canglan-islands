









const SCHEME_URL = 'data/L4_schemes.json';


const K = {
  KM: 10,                 
  KN: 0.0514444,          
  LCAC_KN: 50,            
  CRAFT_NEED: 3,          
  ASM_PK: 0.56,           
  EV_LCAC: 0.34,          
  ESCORT_ABSORB: 0.28,    
  RELOAD_AVG: 100,        
  SALVO_AVG: 3,           
  LAUNCHERS: 28,          
  INVENTORY: 150,         
  HIT_DMG: 1              
};


function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rnd, mu, sd) {
  const u = Math.max(1e-9, rnd()), v = rnd();
  return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }

export async function loadSchemes() {
  const r = await fetch(SCHEME_URL + '?v=' + Date.now());
  const d = await r.json();
  if (d.kind !== 'L4_schemes') throw new Error('L4_schemes kind mismatch');
  return d;
}


function runOnce(red, blue, rnd) {
  const p = red.params, q = blue.params;
  const spd = K.LCAC_KN * K.KN * (p.lcacSpd || 1);          
  const beach = 287, x0 = (p.x0[0] + p.x0[1]) / 2 + gauss(rnd, 0, 3);
  const transit = Math.max(60, (beach - x0) * K.KM / spd);  

  
  const preHit = Math.min(0.6, Math.max(0, (q.preHit ?? 0.22) + gauss(rnd, 0, 0.03)));
  let shooters = K.LAUNCHERS * (1 - preHit);                 
  let ammo = K.INVENTORY * (0.9 + rnd() * 0.2);

  let landed = 0, sunk = 0, fired = 0, air = 0;
  const jamCurve = p.jam || [0.8, 0.4, 300, 2200];
  const hold = q.holdKm || 0;
  const timeline = [];

  for (const w of p.waves || []) {
    const craft = (w.ships || []).filter(s => s.k === 'lcac').reduce((a, s) => a + s.n, 0);
    const escorts = Math.round((w.ships || []).filter(s => s.k !== 'lcac').reduce((a, s) => a + s.n, 0) * (p.escortMul || 1));
    if (!craft) continue;
    
    const win = hold > 0 ? Math.min(transit, Math.max(40, hold * K.KM / spd)) : transit;
    const tMid = (w.t || 0) + win / 2;
    const kJamRaw = tMid < jamCurve[2] ? jamCurve[0]
      : Math.max(jamCurve[1], jamCurve[0] - (tMid - jamCurve[2]) / (jamCurve[3] - jamCurve[2]) * (jamCurve[0] - jamCurve[1]));
    
    const kJam = Math.min(1, kJamRaw + (1 - kJamRaw) * (q.jamResist || 0));

    
    const spread = 1 - Math.max(0, ((q.need || 3) - 2)) * 0.05;
    const pk = K.ASM_PK * (1 - K.EV_LCAC) * kJam * (q.pkMul || 1) * (1 + (q.evBonus || 0)) * (hold > 0 ? 1.08 : 0.98) * spread;
    const absorb = escorts ? K.ESCORT_ABSORB : 0.12;
    const needPer = q.need || 3;

    
    const rounds = Math.max(1, Math.min(8, Math.round(win / K.RELOAD_AVG)));
    const salvoPerRound = Math.round(K.SALVO_AVG * 0.7);       
    let remain = craft, kill = 0;
    for (let r = 0; r < rounds && remain > 0.05 && ammo > 0; r++) {
      const shots = Math.min(ammo, shooters * salvoPerRound, remain * needPer);
      if (shots < 1) break;
      ammo -= shots; fired += shots;
      let hits = 0;
      const n = Math.round(shots);
      for (let i = 0; i < n; i++) if (rnd() < pk) hits++;
      const k = Math.min(remain, hits * (1 - absorb) * K.HIT_DMG);
      kill += k; remain -= k;
    }
    sunk += kill; landed += remain;
    timeline.push({ t: w.t, craft, kill: +kill.toFixed(1), win: Math.round(win), rounds });

    
    const sorties = p.airEvery ? Math.floor(transit / p.airEvery) : 0;
    for (let i = 0; i < sorties; i++) if (rnd() < 0.35) { shooters = Math.max(2, shooters - 0.5); air++; }
    shooters = Math.max(2, shooters * (1 - 0.10 * (q.expose ?? 0.6)));
  }
  if (q.indepth) landed = Math.max(0, landed * (1 - Math.min(0.45, 0.18 + (q.reserve || 0) * 0.25)));
  return { landed, sunk, fired: Math.round(fired), ammoLeft: Math.round(ammo), timeline };
}


export function estimate(redScheme, blueScheme, N = 600) {
  const rnd = mulberry(hash(redScheme.id + '|' + blueScheme.id));
  const arr = [], sunkArr = [], fireArr = [];
  for (let i = 0; i < N; i++) {
    const r = runOnce(redScheme, blueScheme, rnd);
    arr.push(r.landed); sunkArr.push(r.sunk); fireArr.push(r.fired);
  }
  arr.sort((a, b) => a - b); sunkArr.sort((a, b) => a - b);
  const q = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))];
  const landNeed = blueScheme.params.landNeed || 8;
  const redWin = arr.filter(v => v >= landNeed).length / N;
  const blueWin = arr.filter(v => v <= 2).length / N;
  return {
    landed: { p10: Math.round(q(arr, .1)), p50: Math.round(q(arr, .5)), p90: Math.round(q(arr, .9)) },
    sunk: { p10: Math.round(q(sunkArr, .1)), p50: Math.round(q(sunkArr, .5)), p90: Math.round(q(sunkArr, .9)) },
    fired: Math.round(fireArr.reduce((a, b) => a + b, 0) / N),
    redWin: +redWin.toFixed(2), blueWin: +blueWin.toFixed(2),
    draw: +(1 - redWin - blueWin).toFixed(2),
    landNeed
  };
}

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export function buildMatrix(schemesSelf, schemesFoe, side = 'red') {
  
  const m = {};
  for (const a of schemesSelf) {
    m[a.id] = {};
    for (const b of schemesFoe) m[a.id][b.id] = side === 'red' ? estimate(a, b) : estimate(b, a);
  }
  return m;
}


const LKEY = 'canglan.lobby.v2';
const DEFAULT = {
  red: { scheme: null, mode: 'auto', ready: false, paused: false },
  blue: { scheme: null, mode: 'auto', ready: false, paused: false },
  started: false, startedAt: null
};
export function readLobby() {
  try { const v = JSON.parse(localStorage.getItem(LKEY) || 'null'); return v ? { ...DEFAULT, ...v } : structuredClone(DEFAULT); }
  catch (e) { return structuredClone(DEFAULT); }
}
export function writeLobby(patch) {
  const cur = readLobby();
  const next = { ...cur, ...patch };
  for (const s of ['red', 'blue']) if (patch[s]) next[s] = { ...cur[s], ...patch[s] };
  localStorage.setItem(LKEY, JSON.stringify(next));
  window.dispatchEvent(new StorageEvent('storage', { key: LKEY, newValue: JSON.stringify(next) }));
  return next;
}
export function watchLobby(cb) {
  const h = e => { if (!e.key || e.key === LKEY) cb(readLobby()); };
  window.addEventListener('storage', h);
  return () => window.removeEventListener('storage', h);
}
export function resetLobby() { localStorage.removeItem(LKEY); return structuredClone(DEFAULT); }
