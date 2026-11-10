














export const SIDES = {
  red: {
    key: 'red', cn: '红方', short: '红',
    full: '苍澜联合特混舰队', sub: '渡海突击',
    
    color: '#ff7a4d', deep: '#a8442a', soft: '#ffc3a8', dim: 'rgba(255,122,77,.16)',
    enemy: 'blue', glyph: '◆',
    hull: '红方舰艇 · 标记橙红'
  },
  blue: {
    key: 'blue', cn: '蓝方', short: '蓝',
    full: '岛内防卫力量', sub: '岛内拒止',
    color: '#4fc3d9', deep: '#1d7f96', soft: '#9fe3f2', dim: 'rgba(79,195,217,.16)',
    enemy: 'red', glyph: '▲',
    hull: '蓝方阵地 · 标记青蓝'
  },
  

  green: {
    key: 'green', cn: '绿方', short: '绿',
    full: '美军西太前沿兵力', sub: '前沿部署',
    color: '#57c46a', deep: '#2a7a3c', soft: '#b4eec0', dim: 'rgba(87,196,106,.16)',
    enemy: null, glyph: '●',
    hull: '绿方基地 · 标记草绿'
  }
};

export const S = k => SIDES[k] || SIDES.red;
export const foeOf = k => SIDES[k === 'red' ? 'blue' : 'red'];
export const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const pct = v => Math.round((v || 0) * 100) + '%';







export function nav(active, side) {
  const sd = S(side || 'red');
  const items = [
    ['battle', 'index.html', '◆▲● 战场', '战场（顶栏「我方」：全部=三方全知沙盘，红/蓝/绿=该方视角+迷雾）'],
    ['strategy', 'strategy.html?side=' + sd.key, '◬ 战略层', ''],
    ['agent', 'agent.html?side=' + sd.key, '🤖 三方 agent', '三方 agent 配置：persona / 自定义 agent / 与手动战略互斥'],
    ['preset', 'preset.html?side=' + sd.key, '⚙ 战前配置', '三方战略树战前配置（选战略+定分支，存本地/写 URL）'],
    ['tactical', 'tactical.html?side=' + sd.key, '⊖ 战术层', ''],
    ['plan', 'plan.html?side=' + sd.key, '◧ 方案台', ''],
    ['fleet', 'fleet.html?side=' + sd.key, '⛵ 舰队编成', ''],
    ['unit', 'unit.html?side=' + sd.key, '◈ 装备图鉴', ''],
    ['combat', 'combat.html?side=' + sd.key, '◉ 交战规则', '']
  ];
  return `<nav class="site-nav" style="--ac:${sd.color}">
    <a class="sn-brand" href="index.html"><i>苍澜</i>群岛 · 战役推演</a>
    <div class="sn-links">${items.map(([k, href, label, blank]) =>
      k === active
        ? `<span class="sn-cur on" aria-current="page">${label}</span>`
        : blank
          ? `<a class="sn-blank" href="${href}" target="_blank" rel="noopener" title="在新标签页打开${blank}（当前页面保留）">${label}<i>↗</i></a>`
          : `<a href="${href}">${label}</a>`
    ).join('')}</div>
    <div class="sn-side"><span class="sn-chip">${sd.glyph} ${esc(sd.cn)}视角</span></div>
  </nav>`;
}


export function badge(side, phaseLabel) {
  const sd = S(side);
  return `<div class="side-badge" style="--ac:${sd.color}">
    <i class="sb-glyph">${sd.glyph}</i>
    <div class="sb-txt"><b>${esc(sd.cn)}</b><span>${esc(sd.full)}</span></div>
    <em class="sb-phase">${esc(phaseLabel || sd.sub)}</em>
  </div>`;
}


export function initTips() {
  let el = document.getElementById('gtip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gtip';
    document.body.appendChild(el);
  }
  const show = (t, x, y) => {
    el.innerHTML = t; el.classList.add('on');
    const r = el.getBoundingClientRect();
    let L = x + 14, T = y + 16;
    if (L + r.width > innerWidth - 8) L = x - r.width - 14;
    if (T + r.height > innerHeight - 8) T = y - r.height - 12;
    el.style.left = Math.max(8, L) + 'px'; el.style.top = Math.max(8, T) + 'px';
  };
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-tip]');
    if (t) show(t.dataset.tip, e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', e => {
    const t = e.target.closest('[data-tip]');
    if (t && el.classList.contains('on')) show(t.dataset.tip, e.clientX, e.clientY);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-tip]')) el.classList.remove('on');
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-tip]');
    if (t) show(t.dataset.tip, e.clientX, e.clientY);
    else el.classList.remove('on');
  });
}
