











export const LAUNCH_REL = 0.9;   
export const OOA = 35;           
export const WAVE_SEC = 30;      


export const DMG_STATES = [
  { min: 70, key: 'ok',    label: '',    rof: 1.00, psam: 1.00, note: '战斗力完整' },
  { min: 50, key: 'light', label: '轻损', rof: 1.35, psam: 0.90, note: '射击间隔 ×1.35，拦截率 ×0.90' },
  { min: 0,  key: 'heavy', label: '重伤', rof: 1.80, psam: 0.78, note: '射击间隔 ×1.80，拦截率 ×0.78' }
];


export function dmgState(hull) {
  const h = Number(hull);
  if (!(h >= 0)) return DMG_STATES[0];
  if (h >= 70) return DMG_STATES[0];
  if (h >= 50) return DMG_STATES[1];
  return DMG_STATES[2];
}



export const WARHEAD = {
  yj62:  1.00,   
  yj83:  0.85,   
  torp:  2.50,   
  hq9:   1.00,   
  sam40: 1.00,
  sam:   1.00,
  asm:   1.00,   
  bomb:  1.20,   
  pl15:  1.00,
  mlrs:  0.75,   
  arty:  0.50,   
  gun:   0.50,   
  atgm:  0.80,
  jet:   1.00,
  helo:  1.00
};



export const SP = {
  cv: 6, ddg055: 4, ddg: 3, ffg: 2, lha: 5, lpd: 4, aoe: 5, aor: 4,
  sub: 1, fpb: 1, zubr: 2, lcac: 1,
  j15: 1, j10c: 1, aew: 1, heli: 1, z8: 1,
  ztd: 2, zbd: 2,          
  hq9: 1, yj62: 1, radar: 3, gun: 3,
  
  hf2: 1, hf3: 1, hf3er: 1, tk3: 1, lt2000: 1.4,
  m1a2t: 3, cm34: 2, m60a3: 2, ah64: 1, f16v: 1,
  tajiang: 2, gh6: 1, tow: 1
};



export const DEF = {
  cv:     { dp: 4, psam: 0.72 },   
  ddg055: { dp: 5, psam: 0.75 },   
  ddg:    { dp: 4, psam: 0.68 },   
  ffg:    { dp: 3, psam: 0.55 },   
  lha:    { dp: 2, psam: 0.45 },   
  lpd:    { dp: 1, psam: 0.35 },
  aoe:    { dp: 1, psam: 0.30 },
  aor:    { dp: 1, psam: 0.30 },
  sub:    { dp: 0, psam: 0 },
  fpb:    { dp: 0, psam: 0 },
  zubr:   { dp: 0, psam: 0 },
  lcac:   { dp: 0, psam: 0 },
  j15:    { dp: 0, psam: 0 }, j10c: { dp: 0, psam: 0 }, aew: { dp: 0, psam: 0 },
  heli:   { dp: 0, psam: 0 }, z8: { dp: 0, psam: 0 },
  ztd:    { dp: 0, psam: 0 }, zbd: { dp: 0, psam: 0 },
  hq9:    { dp: 0, psam: 0 }, yj62: { dp: 0, psam: 0 },
  radar:  { dp: 0, psam: 0 }, gun: { dp: 0, psam: 0 },
  
  hf2: { dp: 0, psam: 0 }, hf3: { dp: 0, psam: 0 }, hf3er: { dp: 0, psam: 0 },
  tk3: { dp: 3, psam: 0.70 },      
  lt2000: { dp: 0, psam: 0 },
  m1a2t: { dp: 0, psam: 0 }, cm34: { dp: 0, psam: 0 }, m60a3: { dp: 0, psam: 0 },
  ah64: { dp: 0, psam: 0 }, f16v: { dp: 0, psam: 0 },
  tajiang: { dp: 2, psam: 0.50 }, gh6: { dp: 0, psam: 0 },
  tow: { dp: 0, psam: 0 }
};


export function profileOf(kind, fallback) {
  const f = fallback || {};
  return {
    sp:   SP[kind]  != null ? SP[kind]  : (f.sp  != null ? f.sp  : 1),
    dp:   DEF[kind] ? DEF[kind].dp     : (f.dp  != null ? f.dp  : 0),
    psam: DEF[kind] ? DEF[kind].psam   : (f.psam != null ? f.psam : 0)
  };
}



export function hullPerHit(sp, wf) {
  return 100 / Math.max(0.5, Number(sp) || 1) * (Number(wf) || 1);
}

export function hitsToOOA(sp, wf) {
  return Math.max(1, Math.ceil((100 - OOA) / hullPerHit(sp, wf)));
}

export function hitsToSink(sp, wf) {
  return Math.max(1, Math.ceil(100 / hullPerHit(sp, wf)));
}



export function expected(n, p) {
  const rounds = Math.max(0, Number(n) || 0);
  const dp = Math.max(0, Number(p.dp) || 0);
  const psam = Math.max(0, Math.min(1, Number(p.psam) || 0));
  const pk = Math.max(0, Math.min(1, p.pk != null ? Number(p.pk) : 0.62));
  const attempts = Math.min(rounds, dp);           
  const intercepted = attempts * psam;
  const leakers = Math.max(0, rounds - intercepted);
  return {
    attempts,
    intercepted,
    leakers,
    hits: leakers * pk,
    saturated: rounds > attempts,
    leakRate: rounds ? leakers / rounds : 0
  };
}









export function resolveSalvo(n, p, rand) {
  const rnd = rand || Math.random;
  const rounds = Math.max(0, Math.floor(Number(n) || 0));
  const dp = Math.max(0, Number(p.dp) || 0);
  const psam = Math.max(0, Math.min(1, Number(p.psam) || 0));
  const pk = Math.max(0, Math.min(1, p.pk != null ? Number(p.pk) : 0.62));
  const wf = Number(p.wf) || 1;
  const sp = Math.max(0.5, Number(p.sp) || 1);
  let hull = p.hull != null ? Number(p.hull) : 100;

  
  let flying = 0;
  for (let i = 0; i < rounds; i++) if (rnd() < LAUNCH_REL) flying++;

  
  let attempts = 0, leakers = 0;
  for (let i = 0; i < flying; i++) {
    if (attempts < dp) {
      attempts++;
      if (rnd() < psam) continue;      
    }
    leakers++;                          
  }

  
  let hits = 0;
  for (let i = 0; i < leakers; i++) if (rnd() < pk) hits++;

  
  hull -= hits * hullPerHit(sp, wf);
  const sunk = hull <= 0;
  return { hull: Math.max(0, hull), leakers, hits, ooa: hull <= OOA, sunk, launched: flying };
}





export function monteCarlo(n, p, trials) {
  const T = Math.max(200, trials || 12000);
  let ooa = 0, sink = 0, sumHull = 0, sumHits = 0;
  for (let i = 0; i < T; i++) {
    const r = resolveSalvo(n, p);
    if (r.ooa) ooa++;
    if (r.sunk) sink++;
    sumHull += r.hull;
    sumHits += r.hits;
  }
  return {
    pOOA: ooa / T, pSink: sink / T,
    meanHull: sumHull / T, meanHits: sumHits / T, trials: T
  };
}


export function roundsFor(target, p, cap) {
  const max = cap || 40;
  for (let n = 1; n <= max; n++) {
    if (monteCarlo(n, p, 3000).pOOA >= target) return n;
  }
  return null;
}


export function seeded(seed) {
  let s = (seed || 1) >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}


export function pct(v, digits) {
  const d = digits || 0;
  return (Number(v) * 100).toFixed(d) + '%';
}
