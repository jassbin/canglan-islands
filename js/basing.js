



const LON0 = 121.15686, LAT0 = 23.9996, KX = 96.82, KZ = 110.56;   

export const geo2world = (lon, lat) => [(lon - LON0) * KX * 10, (LAT0 - lat) * KZ * 10];
export const geo2km = (lon, lat) => [(lon - LON0) * KX + 320, (LAT0 - lat) * KZ + 276.3];

let _p = null, _doc = null, _byId = null;

export function loadBasing() {
  if (!_p) {
    _p = fetch('data/L4_basing.json?v=' + (window.CACHEBUST || Date.now()))
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => {
        _doc = d;
        _byId = {}; (d.places || []).forEach(p => { _byId[p.id] = p; });
        window.__BASING = { places: d.places.length, in_block: (d.places || []).filter(p => p.in_block).length,
                           exercises: (d.exercises || []).length, version: d.version };
        return d;
      })
      .catch(e => {
        window.__BASING = { error: String((e && e.message) || e) };
        console.warn('[basing] 注册表加载失败，部署标记层为空：', e);
        return null;
      });
  }
  return _p;
}

export function basingDoc() { return _doc; }
export function place(id) { return _byId && _byId[id] || null; }

export function kmOf(id) { const p = place(id); return p ? p.km : null; }
export function worldOf(id) { const p = place(id); return p ? p.world : null; }
export function hintIds(section) { return (_doc && _doc.engine_hints && _doc.engine_hints[section]) || []; }

export function sites(side, types) {
  if (!_doc) return [];
  return _doc.places.filter(p => (!side || p.side === side) && p.in_block &&
    (!types || types.some(t => p.type.indexOf(t) === 0)));
}
export function boxesFor(exId) {
  const e = _doc && _doc.exercises && _doc.exercises.find(x => x.id === exId);
  return e ? e.boxes : [];
}
