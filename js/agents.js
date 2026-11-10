




















export const KEY = 'canglan_agent_v1';      
export const SELKEY = 'canglan_agent_sel'; 
export const SIDE_ORDER = ['red', 'blue', 'green'];
export const SIDE_CN = { red: '红方·PLA', blue: '蓝方·台军', green: '绿方·美军' };
export const SIDE_SHORT = { red: '红', blue: '蓝', green: '绿' };












export const DEFAULTS = {
  red:   { id: 'd_red',   name: '红·速决派',   def: 1, persona: { aggression: 0.8,  caution: 0.25 }, seedPlan: 'auto',
           note: '速决窗口优先：抢在绿方决策周期内造成既成事实，先压后看' },
  blue:  { id: 'd_blue',  name: '蓝·持久派',   def: 1, persona: { aggression: 0.3,  caution: 0.8  }, seedPlan: 'auto',
           note: '以空间换时间：保存机动火力，拖住等介入，火力节制' },
  green: { id: 'd_green', name: '绿·风险规避', def: 1, persona: { aggression: 0.35, caution: 0.7  }, seedPlan: 'auto',
           note: '前沿存在但不越线：升级掂量直接冲突代价，谨慎优先' },
};


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

export function list(side) {
  return [DEFAULTS[side]].concat(loadAll()[side] || []);
}
export function get(side, id) {
  if (DEFAULTS[side] && DEFAULTS[side].id === id) return DEFAULTS[side];
  return (loadAll()[side] || []).find(x => x.id === id) || null;
}
export function newId() { return 'ag_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
export function suggestName(side) {
  return SIDE_SHORT[side] + '·agent' + (loadAll()[side].length + 1);
}
export function save(side, rec) {
  const all = loadAll();
  const persona = {};
  for (const k of ['aggression', 'caution']) {
    const v = parseFloat(rec.persona && rec.persona[k]);
    persona[k] = isNaN(v) ? 0.5 : Math.max(0, Math.min(1, +v.toFixed(2)));
  }
  const r = {
    id: rec.id || newId(),
    name: String(rec.name || '').trim() || suggestName(side),
    persona, note: rec.note || '', ts: Date.now(),
    
    seedPlan: /^(auto|pa|pb|pc|ms:[A-Za-z0-9_]{1,24})$/.test(rec.seedPlan || '') ? rec.seedPlan : 'auto',
  };
  if (DEFAULTS[side] && r.id === DEFAULTS[side].id) return DEFAULTS[side];   
  const arr = all[side];
  const i = arr.findIndex(x => x.id === r.id);
  if (i >= 0) arr[i] = Object.assign({}, arr[i], r);
  else arr.push(r);
  saveAll(all);
  return get(side, r.id);
}
export function remove(side, id) {
  if (DEFAULTS[side] && DEFAULTS[side].id === id) return false;   
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


export function summary(rec) {
  if (!rec) return '';
  const p = rec.persona || {};
  const lv = v => v == null ? '—' : Math.round(v * 100);
  return (rec.name || '') + '（进攻 ' + lv(p.aggression) + ' / 谨慎 ' + lv(p.caution) + '）'
    + (rec.note ? ' · ' + rec.note : '');
}
