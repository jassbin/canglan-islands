



















export const KEY = 'canglan_mystrat_v1';     
export const SELKEY = 'canglan_mystrat_sel'; 
export const SIDE_ORDER = ['red', 'blue', 'green'];
export const SIDE_CN = { red: '红方·PLA', blue: '蓝方·台军', green: '绿方·美军' };
export const SIDE_SHORT = { red: '红', blue: '蓝', green: '绿' };


export const VAR_N = {
  endst: '终局目标', axis: '登陆方向', tempo: '推进样式', deny: '拒止绿方', opening: '首战火力重心',
  def: '防卫构想', focus: '防御重心', gmode: '介入方式', gposture: '部署姿态',
};
export const VAL_N = {
  es_coerce: '有限惩戒·逼谈', es_force: '迫统·占西岸逼降', es_occupy: '全面控制',
  lp_taoyuan: '桃园', lp_taipei: '台北', lp_taichung: '台中', lp_chiayi: '嘉义', lp_kaohsiung: '高雄',
  tp_decap: '快速斩首', tp_lightning: '闪电推进', tp_siege: '围而不打', tp_multi: '分进合击',
  dn_a2ad: 'A2/AD 反介入', dn_firststrike: '先制打击前沿', dn_fait: '既成事实窗口', dn_punish: '有限惩戒',
  op_sead: '先瘫防空', op_navy: '先夺制海', op_sync: '同步打击',
  df_porcupine: '刺猬/不对称', df_beach: '滩岸歼敌', df_urban: '纵深城镇韧性',
  fc_north: '北台优先', fc_west: '西岸均摊', fc_port: '港口机场优先',
  gi_eabo: '远征前进基地', gi_mdtf: '多域特遣部队', gi_csg: '航母打击群压境',
  gp_forward: '前沿重兵', gp_dispersed: '分布式前沿', gp_standoff: '远距待机',
  none: '不介入', isr: '情报支援', limited: '有限介入', full: '全面介入',
};

export const SCHEME_N = {
  b_stom: '超地平线直取', b_deception: '佯动牵制+垂直包围', b_phasal: '分阶段滩头强袭', b_dispersed: '多点分散上陆',
  r_littoral: '滨海决胜', r_beach: '滩岸歼敌', r_indepth: '纵深防御·持久消耗', r_decentral: '分散机动·去中心化',
};


export const EXEC = {
  red: {
    
    tempoScheme: { tp_lightning: 'b_stom', tp_decap: 'b_deception', tp_siege: 'b_phasal', tp_multi: 'b_dispersed' },
    
    tempoPreset: { tp_lightning: 'pa', tp_decap: 'pb', tp_siege: 'pc', tp_multi: 'pa' },
    tempoCfg: {
      tp_lightning: { jfs: '1.2', vertical: 'auto' },   
      tp_decap:     { jfs: '1.1', vertical: 'on' },     
      tp_siege:     { jfs: '0.6', vertical: 'auto' },   
      tp_multi:     { jfs: '1',   vertical: 'auto' },
    },
    
    axisBeach: { lp_taoyuan: 'b1', lp_taipei: 'b1', lp_taichung: 'b2', lp_chiayi: 'b2', lp_kaohsiung: 'b3' },
    openingCfg: { op_sead: {}, op_navy: { jfs: '1.2' }, op_sync: { jfs: '1.4' } },
    endstNeed: { es_coerce: 0.6, es_force: 1.0, es_occupy: 1.35 },
    denyNote: {
      dn_a2ad: 'A2/AD 拒止：不开第一枪，靠反介入逼绿方退到 1500km 外',
      dn_firststrike: '先制打击前沿：开局火力更猛（+25% 弹量），政治代价高',
      dn_fait: '既成事实：抢在绿方决策周期内上陆（波次提前）',
      dn_punish: '有限惩戒：压制强度收着（−20% 弹量），留谈判窗口',
    },
  },
  blue: {
    
    defScheme: { df_porcupine: 'r_decentral', df_beach: 'r_littoral', df_urban: 'r_indepth' },
    defPreset: { df_porcupine: 'pa', df_beach: 'pb', df_urban: 'pc' },
    defCfg: {
      df_porcupine: { urban: '1',   reserve: '2' },      
      df_beach:     { urban: '1',   reserve: 'auto' },   
      df_urban:     { urban: '1.6', reserve: '2' },      
    },
    
    focusHold: { fc_port: '0', fc_north: '30', fc_west: '40' },
    focusNote: {
      fc_port: '港口机场优先：贴岸死守，反舰火力压在换乘区',
      fc_north: '北台优先：让开 30km 诱敌深入，重点保台北走廊',
      fc_west: '西岸均摊：远海 40km 伏击，换时间换纵深',
    },
  },
  green: {
    gmodePreset: { gi_eabo: 'pa', gi_mdtf: 'pb', gi_csg: 'pc' },   
    gposturePosture: { gp_forward: 'full', gp_dispersed: 'limited', gp_standoff: 'isr' },
  },
};

const clone = o => JSON.parse(JSON.stringify(o || {}));
const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };


export function loadAll() {
  let a = null;
  try { a = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { a = null; }
  a = a && typeof a === 'object' ? a : {};
  SIDE_ORDER.forEach(s => { a[s] = Array.isArray(a[s]) ? a[s].filter(x => x && x.id) : []; });
  return a;
}
export function saveAll(a) {
  try { localStorage.setItem(KEY, JSON.stringify(a)); return true; } catch (e) { return false; }
}
export function list(side) { return loadAll()[side] || []; }
export function get(side, id) { return list(side).find(x => x.id === id) || null; }
export function newId() { return 'ms_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
export function suggestName(side) { return '战略' + (list(side).length + 1); }


export function save(side, rec) {
  const all = loadAll();
  const sel = {};
  for (const [k, v] of Object.entries(rec.sel || {})) if (v != null && v !== '') sel[k] = v;
  const r = {
    id: rec.id || newId(),
    name: String(rec.name || '').trim() || suggestName(side),
    sel, posture: rec.posture || '', note: rec.note || '', ts: Date.now(),
  };
  const arr = all[side];
  const i = arr.findIndex(x => x.id === r.id);
  if (i >= 0) arr[i] = Object.assign({}, arr[i], r);
  else arr.push(r);
  saveAll(all);
  return get(side, r.id);
}
export function rename(side, id, name) {
  const all = loadAll();
  const it = (all[side] || []).find(x => x.id === id);
  if (!it) return null;
  it.name = String(name || '').trim() || it.name;
  saveAll(all);
  return it;
}
export function remove(side, id) {
  const all = loadAll();
  all[side] = (all[side] || []).filter(x => x.id !== id);
  saveAll(all);
  const s = getSel();
  if (s[side] === id) { delete s[side]; setSel(s); }
  return true;
}
export function getSel() {
  try { return JSON.parse(localStorage.getItem(SELKEY) || '{}') || {}; } catch (e) { return {}; }
}
export function setSel(o) { try { localStorage.setItem(SELKEY, JSON.stringify(o || {})); } catch (e) {} }
export function setSelSide(side, id) { const s = getSel(); if (id) s[side] = id; else delete s[side]; setSel(s); return s; }

export function clearSide(side) { const s = getSel(); if (s[side] != null) { delete s[side]; setSel(s); } return s; }

export function selected(side) { const id = getSel()[side]; return id ? get(side, id) : null; }


export function equivPreset(side, sel, presets) {
  sel = sel || {};
  for (const p of (presets && presets[side]) || []) {
    const keys = Object.keys(p.sel || {});
    if (!keys.length) continue;
    if (keys.every(k => sel[k] === p.sel[k])) return p;
  }
  return null;
}


export function deriveExec(side, rec) {
  const sel = (rec && rec.sel) || {};
  const out = { side, id: rec && rec.id, name: (rec && rec.name) || '自定义战略',
    schemeId: null, pid: '', cfg: {}, posture: '', greenPreset: '', sel, notes: [] };
  if (side === 'red') {
    const E = EXEC.red;
    out.schemeId = E.tempoScheme[sel.tempo] || null;
    out.pid = E.tempoPreset[sel.tempo] || '';
    Object.assign(out.cfg, E.tempoCfg[sel.tempo] || {});
    if (E.axisBeach[sel.axis]) out.cfg.beach = E.axisBeach[sel.axis];
    const op = E.openingCfg[sel.opening] || {};
    if (op.jfs) out.cfg.jfs = op.jfs;                      
    if (sel.deny) out.cfg.deny = sel.deny;                 
    if (sel.endst) out.cfg.endst = sel.endst;              
    if (sel.endst && E.endstNeed[sel.endst]) out.notes.push('胜利阈值 ×' + E.endstNeed[sel.endst]);
    if (sel.axis) out.notes.push('主登陆 ' + (VAL_N[sel.axis] || sel.axis) + '（' + out.cfg.beach + ' 滩头）');
    if (sel.tempo) out.notes.push('执行案 ' + (SCHEME_N[out.schemeId] || out.schemeId || '按预案'));
    if (sel.deny && E.denyNote[sel.deny]) out.notes.push(E.denyNote[sel.deny]);
  } else if (side === 'blue') {
    const E = EXEC.blue;
    let sc = E.defScheme[sel.def] || null;
    
    if (sel.def === 'df_beach' && sel.focus && sel.focus !== 'fc_north') sc = 'r_beach';
    out.schemeId = sc;
    out.pid = E.defPreset[sel.def] || '';
    Object.assign(out.cfg, E.defCfg[sel.def] || {});
    if (E.focusHold[sel.focus]) out.cfg.hold = E.focusHold[sel.focus];
    if (sel.def) out.notes.push('执行案 ' + (SCHEME_N[out.schemeId] || out.schemeId || '按预案'));
    if (sel.focus && E.focusNote[sel.focus]) out.notes.push(E.focusNote[sel.focus]);
  } else {
    const E = EXEC.green;
    out.greenPreset = E.gmodePreset[sel.gmode] || '';
    out.pid = out.greenPreset;
    out.posture = E.gposturePosture[sel.gposture] || '';
    if (out.posture) out.notes.push('介入姿态 ' + (VAL_N[out.posture] || out.posture));
    if (out.greenPreset) out.notes.push('出兵形态 ' + (VAL_N[sel.gmode] || out.greenPreset));
  }
  return out;
}










export function mountSwitcher(host, opt) {
  if (!host) return null;
  opt = opt || {};
  const sides = (opt.sides || SIDE_ORDER).filter(s => SIDE_ORDER.includes(s));
  const presetsOf = () => { try { return (typeof opt.presets === 'function' ? opt.presets() : opt.presets) || {}; } catch (e) { return {}; } };
  let lastPicked = '';                 
  const build = () => {
    const _cur = host.querySelector('select');
    if (_cur && _cur === document.activeElement) return _cur;   
    const all = loadAll();
    const PS = presetsOf();
    const cur = (typeof opt.getCur === 'function')
      ? (opt.getCur() || {})
      : Object.assign({}, getSel(), opt.cur || {});
    const isBuiltin = (s, id) => !!(PS[s] && PS[s].some(p => p.id === id));
    
    let display = '';
    if (lastPicked) { const a = lastPicked.split('|'); if (cur[a[0]] === a[1]) display = lastPicked; }
    if (!display) for (const s of sides) { if (cur[s]) { display = s + '|' + cur[s]; break; } }
    let any = false;
    let html = '<select id="bsMyStrat" class="bs-mystrat" title="战略切换：预案 A/B/C 与「我的战略」是同一方的互斥单选，选中即按它打。✓ ＝ 本场生效；战中切换换执行案、战果保留">';
    html += '<option value="">— 选择战略 —</option>';
    for (const s of sides) {
      const ps = PS[s] || [], arr = all[s] || [];
      if (!ps.length && !arr.length) continue;
      any = true;
      html += '<optgroup label="' + SIDE_CN[s] + '">';
      for (const p of ps) {
        const v = s + '|' + p.id, on = cur[s] === p.id;
        const nm = String(p.n || p.id).replace(/^预案\s*/, '');   
        html += '<option value="' + v + '"' + (display === v ? ' selected' : '') + '>'
          + SIDE_SHORT[s] + ' · ' + esc(nm) + (on ? ' ✓' : '') + '</option>';
      }
      for (const r of arr) {
        const v = s + '|' + r.id, on = cur[s] === r.id;
        html += '<option value="' + v + '"' + (display === v ? ' selected' : '') + '>'
          + SIDE_SHORT[s] + ' · 自定义 ' + esc(r.name) + (on ? ' ✓' : '') + '</option>';
      }
      html += '</optgroup>';
    }
    html += '</select>';
    if (!any) html = html.replace('<option value="">— 选择战略 —</option>',
      '<option value="">— 选择战略（内置预案加载中…）—</option>');
    host.innerHTML = html;
    const el = host.querySelector('select');
    if (el) {
      el.classList.toggle('my', !!display);
      el.onchange = () => {
        const v = el.value;
        if (!v) {                       
          setSel({}); lastPicked = '';
          if (typeof opt.onClear === 'function') opt.onClear();
          build(); return;
        }
        const [s, id] = v.split('|');
        lastPicked = v;
        if (isBuiltin(s, id)) {
          
          clearSide(s);
          if (typeof opt.onPreset === 'function') opt.onPreset(s, id);
        } else {
          const rec = get(s, id);
          if (!rec) { build(); return; }
          setSelSide(s, id);
          if (typeof opt.onApply === 'function') opt.onApply(s, id, rec);
        }
        build();
      };
    }
    return el;
  };
  
  try {
    window.addEventListener('storage', e => { if (e.key === KEY || e.key === SELKEY) build(); });
  } catch (e) {}
  const el = build();
  return { el, refresh: build, sides, opt };
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}


export function injectStyle() {
  if (document.getElementById('mystrat-css')) return;
  const st = document.createElement('style');
  st.id = 'mystrat-css';
  st.textContent = `
  #bsMyStrat{max-width:236px;background:rgba(10,24,38,.96);color:#ffc79a;border:1px solid rgba(120,180,220,.35);
    border-radius:6px;font:10.5px/1.5 "Microsoft YaHei",system-ui,sans-serif;padding:1px 4px;cursor:pointer;
    outline:none;pointer-events:auto;margin-top:1px}
  #bsMyStrat:hover{border-color:#7fdcff;color:#eaf6ff}
  #bsMyStrat option,#bsMyStrat optgroup{background:#0d2030;color:#dbeaf6}
  #bsMyStrat.my{color:#8fe0a2;border-color:rgba(87,196,106,.6)}
  `;
  document.head.appendChild(st);
}


export function summary(rec, order) {
  const sel = (rec && rec.sel) || {};
  const keys = (order && order.length ? order : Object.keys(sel));
  return keys.filter(k => sel[k]).map(k => (VAR_N[k] || k) + '=' + (VAL_N[sel[k]] || sel[k])).join(' · ');
}
