




const FILES = {
  L1: './data/L1_static.json',
  L2: './data/L2_params.json',
  L3: './data/L3_combat.json',
  L4: './data/L4_strategy.json',
};

async function fetchLayer(key, url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${key} HTTP ${r.status}`);
  return await r.json();
}


export async function loadDB() {
  const out = { ok: true, L1: null, L2: null, L3: null, L4: null, errors: [] };
  await Promise.all(Object.entries(FILES).map(async ([k, url]) => {
    try {
      out[k] = await fetchLayer(k, url);
    } catch (e) {
      out.ok = false;
      out.errors.push(`${k}: ${e.message}`);
    }
  }));
  
  if (out.L1 && (!out.L1.version || !out.L1.units)) out.errors.push('L1 结构不完整');
  if (out.L2 && (!out.L2.version || !out.L2.units)) out.errors.push('L2 结构不完整');
  if (out.L3 && (!out.L3.version || !out.L3.combat_model)) out.errors.push('L3 结构不完整');
  if (out.L4 && (!out.L4.version || !out.L4.schemes)) out.errors.push('L4 结构不完整');
  if (out.L2 && out.L2.units) {
    for (const [k, v] of Object.entries(out.L2.units)) {
      if (!v.src || !v.src.length) out.errors.push(`L2.${k} 缺来源`);
      if (!v.conf) out.errors.push(`L2.${k} 缺置信度`);
    }
  }
  if (out.L3 && out.L3.combat_model && out.L3.combat_model.candidates) {
    for (const c of out.L3.combat_model.candidates) {
      if (!c.score || !c.total) out.errors.push(`L3 候选 ${c.id} 缺评分`);
    }
  }
  if (out.errors.length) out.ok = false;
  return out;
}

const LEN_DIV = 10; 






export function patchGame(db, G) {
  const sum = { patched: 0, skipped: [], ooa: null };
  if (!db || !db.ok) return sum;

  
  if (db.L1 && db.L1.units && G.GLB_SPEC) {
    for (const [k, u] of Object.entries(db.L1.units)) {
      if (!G.TYPES[k]) { sum.skipped.push('L1.' + k); continue; }
      if (u.n) G.TYPES[k].n = u.n;
      if (u.t) G.TYPES[k].t = u.t;
      



      if (u.glb && u.len_m && Object.prototype.hasOwnProperty.call(G.GLB_SPEC, k)) {
        G.GLB_SPEC[k] = [u.glb, u.len_m / LEN_DIV];
      }
      sum.patched++;
    }
  }
  
  if (db.L2 && db.L2.units) {
    for (const [k, u] of Object.entries(db.L2.units)) {
      const t = G.TYPES[k];
      if (!t) { sum.skipped.push('L2.' + k); continue; }
      ['maxs', 'cruise', 'range', 'aaw', 'spec'].forEach(f => { if (u[f] !== undefined) t[f] = u[f]; });
      sum.patched++;
    }
  }
  
  if (db.L2 && db.L2.loadouts && G.TYPES) {
    for (const [k, v] of Object.entries(db.L2.loadouts)) {
      if (k.charAt(0) === '$' || k.charAt(0) === '_') continue;
      const t = G.TYPES[k];
      if (!t) { sum.skipped.push('L2.loadout.' + k); continue; }
      t.ld = Object.assign({}, v);
      sum.patched++;
    }
    sum.loadout = true;
  }
  
  const cm = db.L3 && db.L3.combat_model;
  if (cm) {
    if (cm.params && cm.params.unit_params) {
      for (const [k, p] of Object.entries(cm.params.unit_params)) {
        const t = G.TYPES[k];
        if (!t) { sum.skipped.push('L3.' + k); continue; }
        ['sp', 'dp', 'psam'].forEach(f => { if (p[f] !== undefined) t[f] = p[f]; });
        sum.patched++;
      }
    }
    if (cm.params && cm.params.warhead && G.WARHEAD) {
      Object.entries(cm.params.warhead).forEach(([k, v]) => {
        if (typeof v === 'number') G.WARHEAD[k] = v;
      });
    }
    if (typeof cm.params.OOA_pct === 'number' && G.setOOA) {
      G.setOOA(cm.params.OOA_pct);
      sum.ooa = cm.params.OOA_pct;
    }
    
    const de = cm.params.damage_effects;
    if (de && de.thresholds && G.DMG_EFF) {
      de.thresholds.forEach(x => {
        const row = { rof: x.rof, psam: x.psam, label: x.label || '' };
        if (x.min_hull >= 70) G.DMG_EFF.base = row;
        else if (x.min_hull >= 50) G.DMG_EFF.light = row;
        else G.DMG_EFF.heavy = row;
      });
      G.DMG_EFF.OOA = cm.params.OOA_pct;
      sum.damage = true;
    }
  }
  
  const st = db.L4 && db.L4.tactics;
  if (st && G.DOCTRINE) {
    

    const ssm = st.blue_ssm_battery || st.red_ssm_battery || st.red_yj62_battalion;
    if (ssm) {
      G.DOCTRINE.blueSsm = { interval: ssm.interval_s };
    }
    const boat = st.blue_boat_pair || st.red_boat_pair || st.red_fpb_pair;
    if (boat) {
      G.DOCTRINE.blueBoat = { interval: boat.interval_s };
    }
    sum.doctrine = true;
  }
  const adopted = db.L4 && db.L4.schemes && db.L4.schemes.find(s => s.status === 'adopted');
  if (adopted && adopted.composition && G.DOCTRINE) {
    
    const bad = [];
    const checkKind = e => { if (e && e.kind && !G.TYPES[e.kind]) bad.push(e.kind); };
    

    const c = adopted.composition;
    const redGroups = c.red_groups || c.blue_groups || [];
    const redExtra = c.red_extra || c.blue_extra || [];
    const redStations = c.red_stations || [];   
    redGroups.forEach(g => g.units.forEach(checkKind));
    redExtra.forEach(checkKind);
    redStations.forEach(s => (s.units || []).forEach(checkKind));
    const blue = c.blue || c.red || {};
    ['shore', 'boats', 'subs', 'ftrs'].forEach(k => (blue[k] || []).forEach(checkKind));
    if (bad.length) {
      sum.skipped.push('composition(未知kind:' + bad.join(',') + ')');
    } else {
      G.DOCTRINE.composition = adopted.composition;
      sum.composition = true;
    }
  }
  return sum;
}


export function dbSummary(db) {
  if (!db) return 'db:未加载';
  if (!db.ok) return 'db:兜底(' + db.errors.join(';') + ')';
  return `db v${db.L1.version}/${db.L2.version}/${db.L3.version}/${db.L4.version}` +
    ` · 拟合:${db.L3.combat_model && db.L3.combat_model.adopted}` +
    ` · 策略:${(db.L4.schemes.find(s => s.status === 'adopted') || {}).id || '-'}` +
    ` · conf ${confCount(db, 'A')}/A ${confCount(db, 'B')}/B ${confCount(db, 'C')}/C`;
}
function confCount(db, c) {
  let n = 0;
  if (db.L2 && db.L2.units) for (const v of Object.values(db.L2.units)) if (v.conf === c) n++;
  return n;
}
