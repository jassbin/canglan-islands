





import { loadSchemes, estimate, buildMatrix, readLobby, writeLobby, watchLobby } from './schemes.js';
import { initTips } from './theme.js';

const STYLE_CN = { aggressive: '激进', conservative: '保守', unorthodox: '另类', balanced: '均衡' };

const pct = v => Math.round((v || 0) * 100) + '%';
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

export async function mountPlanBoard(opt) {
  const side = opt.side;                       
  const PAGE = !!opt.pageMode;                 
  const foe = side === 'red' ? 'blue' : 'red';
  const accent = opt.accent || '#4fc3d9';      
  const accent2 = opt.accent2 || '#8fd6a8';
  const selfName = side === 'red' ? '红方 · 两栖突击群' : '蓝方 · 岛内拒止';
  const foeName = side === 'red' ? '蓝方 · 岛内拒止' : '红方 · 两栖突击群';

  const DB = await loadSchemes();
  const selfSchemes = DB[side].schemes;
  const foeSchemes = DB[foe].schemes;

  let matrix = buildMatrix(selfSchemes, foeSchemes, side);
  let sel = selfSchemes[0].id;
  let selFoe = foeSchemes[0].id;
  let opened = sel;                 
  let mode = 'auto';
  let lobby = readLobby();

  
  const root = document.createElement('div');
  root.id = 'planboard';
  root.style.setProperty('--pb-ac', accent);        
  if (accent2) root.style.setProperty('--pb-ac2', accent2);
  root.innerHTML = `
  <div class="pb-wrap">
    <header class="pb-head">
      <div class="pb-title"><b>作战方案台</b><span class="pb-side">${esc(selfName)}</span>
        ${PAGE ? '<a class="pb-back" href="index.html">← 返回战场</a>' : ''}</div>
      <div class="pb-status" id="pbStatus"></div>
      <button class="pb-x" id="pbClose" title="关闭（不改变已锁定方案）">✕</button>
    </header>
    <div class="pb-body">
      <section class="pb-left" id="pbCards"></section>
      <section class="pb-right">
        <div class="pb-mtx-head">
          <div class="pb-mtx-t">
            <b>预估矩阵 · 期望上陆兵力</b>
            <small><i class="ax-self">行 = 我方方案</i><i class="ax-foe">列 = 敌方打法</i>每格 = 这两套对上时推演 600 次的期望上陆兵力（P50，括号 P10~P90）。对手会用哪套事先未知，所以全组合都算一遍。</small>
          </div>
          <span class="pb-legend"><i class="lg0"></i>挡住<i class="lg1"></i><i class="lg2"></i><i class="lg3"></i>突防 12+</span>
        </div>
        <div class="pb-mtx-axis" id="pbAxis"></div>
        <div class="pb-mtx" id="pbMatrix"></div>
        <div class="pb-mtx-sum" id="pbMtxSum"></div>
        <div class="pb-detail" id="pbDetail"></div>
        <p class="pb-note">预估由 L3 交战模型（Hughes 齐射 + 逐发 Bernoulli 命中）跑 600 次蒙特卡洛得出，系数已用推演实测校准；区间代表不确定性，不是承诺。判定阈值取自蓝方方案（上陆 ≥ 阈值即失守）。</p>
      </section>
    </div>
    <footer class="pb-foot">
      <div class="pb-modes">
        <span class="pb-lb">执行模式</span>
        <button class="pb-mode" data-mode="auto">自动执行</button>
        <button class="pb-mode" data-mode="manual">人工托管</button>
        <span class="pb-hint" id="pbModeHint"></span>
      </div>
      <div class="pb-actions">
        <button class="pb-btn ghost" id="pbSolo">单席演练</button>
        <button class="pb-btn" id="pbLock">锁定方案 · 待战</button>
        <button class="pb-btn primary" id="pbStart" disabled>开始推演</button>
        <button class="pb-btn warn" id="pbPause" style="display:none">暂停</button>
      </div>
    </footer>
  </div>`;
  document.body.appendChild(root);

  

  let btn = null;
  if (!PAGE && !document.getElementById('cmdbar')) {
    btn = document.createElement('button');
    btn.id = 'pbOpen'; btn.textContent = '◧ 方案台';
    btn.onclick = () => open();
    document.body.appendChild(btn);
  }

  const $ = id => root.querySelector('#' + id);

  
  
  function tipOf(s) {
    if (!s.codeNote) return '';
    return `<b>${esc(s.codename)}</b> ＝ ${esc(s.codeNote.en)}<br><em>${esc(s.codeNote.cn)}</em>`;
  }
  function codeCell(s) {
    return s.codeNote
      ? `<code class="code-note" data-tip="${tipOf(s)}">${esc(s.codename)}</code>`
      : `<code>${esc(s.codename)}</code>`;
  }
  function schemeCard(s, i) {
    const est = matrix[s.id][selFoe];
    const on = s.id === sel;
    const open = on && opened === s.id;
    const pros = (s.pros || []).map(t => `<li>${esc(t)}</li>`).join('');
    const cons = (s.cons || []).map(t => `<li>${esc(t)}</li>`).join('');
    return `<button class="pb-card ${on ? 'on' : ''}" data-id="${s.id}">
      <div class="pb-card-h">
        <span class="pb-num">${'ABCD'[i] || i + 1}</span>
        <span class="pb-style st-${s.style}">${esc(s.styleCn || STYLE_CN[s.style] || '')}</span>
        <b>${esc(s.name)}</b>
        ${codeCell(s)}
        <span class="pb-risk rk-${s.forecast.risk}">风险 ${esc(s.forecast.riskCn)}</span>
      </div>
      <div class="pb-tag">${esc(s.tagline)}</div>
      <div class="pb-est">
        <span>预计上陆 <b>${est.landed.p50}</b> <small>(${est.landed.p10}~${est.landed.p90})</small></span>
        <span class="pb-pw">${side === 'red' ? '达成概率' : '失守概率'} <b>${pct(est.redWin)}</b></span>
      </div>
      ${open ? `<div class="pb-more">
        <div class="pb-m-intro"><b class="pb-m-k">方案要点</b>${esc(s.summary)}</div>
        <div class="pb-m-grid">
          <div class="pm-col pm-pro"><b>▲ 优势</b><ul>${pros}</ul></div>
          <div class="pm-col pm-con"><b>▼ 劣势与风险</b><ul>${cons}</ul></div>
        </div>
        <div class="pb-m-risk"><b>最大风险</b>${esc(s.riskNote || s.forecast.downside)}</div>
        <div class="pb-m-when"><b>适用条件</b>${esc(s.bestWhen || '—')}</div>
        <div class="pb-m-doc"><b>战法出处</b>${esc(s.doctrineCn || s.doctrine)}</div>
      </div>` : `<div class="pb-m-hint">点击展开：方案要点 · 优势 · 劣势与风险 ▾</div>`}
    </button>`;
  }

  function renderCards() {
    $('pbCards').innerHTML = `<div class="pb-sec-t">己方候选方案 · ${selfSchemes.length} 套　<span class="pb-sec-h">点卡片展开说明</span></div>` +
      selfSchemes.map(schemeCard).join('');
    $('pbCards').querySelectorAll('.pb-card').forEach(el => {
      el.onclick = () => {
        const id = el.dataset.id;
        if (sel === id) opened = (opened === id ? null : id);   
        else { sel = id; opened = id; }
        renderCards(); renderMatrix(); renderDetail(); refresh();
      };
    });
  }

  function heat(v, landNeed) {
    
    const k = Math.min(1, v / Math.max(1, landNeed));
    if (side === 'red') return k < .25 ? 'c0' : k < .55 ? 'c1' : k < .85 ? 'c2' : 'c3';
    return k < .25 ? 'c3' : k < .55 ? 'c2' : k < .85 ? 'c1' : 'c0';
  }

  function renderMatrix() {
    const foeShort = foeName.split(' · ')[1] || foeName;
    
    let h = `<div class="pb-mtx-corner"><b>我方方案</b><span>↓ 纵向</span></div>`;
    for (const f of foeSchemes) h += `<div class="pb-mtx-col ${f.id === selFoe ? 'on' : ''}" data-f="${f.id}" data-tip="<b>${esc(f.name)}</b><br><em>${esc(f.codename)}</em> ${f.codeNote ? '＝ ' + esc(f.codeNote.en) + '<br>' + esc(f.codeNote.cn) : ''}">${esc(f.name)}</div>`;
    for (const s of selfSchemes) {
      
      const rowVals = foeSchemes.map(f => matrix[s.id][f.id].landed.p50);
      const rowTip = `全表 ${Math.min(...rowVals)}~${Math.max(...rowVals)} 人`;
      h += `<div class="pb-mtx-row ${s.id === sel ? 'on' : ''}" data-tip="<b>${esc(s.name)}</b><br><em>${esc(s.codename)}</em> ${s.codeNote ? '＝ ' + esc(s.codeNote.en) + '<br>' + esc(s.codeNote.cn) : ''}<br>对上不同打法：${rowTip}">${esc(s.name)}</div>`;
      for (const f of foeSchemes) {
        const e = matrix[s.id][f.id];
        
        const winLbl = side === 'red' ? '达成' : '失守';
        const tip = `<b>${esc(s.name)} × ${esc(f.name)}</b>`
          + `<em>该对位 · 600 次蒙特卡洛推演</em><hr>`
          + `<b>${e.landed.p50} 人</b> 期望上陆兵力（P50：一半推演结果比它低、一半比它高）<br>`
          + `<b>${e.landed.p10}~${e.landed.p90} 人</b> 八成结果区间（P10~P90，两头各 10% 的极端情况不在此内）<br>`
          + `<b>${pct(e.redWin)}</b> ${winLbl}概率（上陆 ≥ ${e.landNeed} 人即判定${side === 'red' ? '红方达成战役目标' : '守方失守'}）<br>`
          + `<span class="tp-dim">底色：深红 = 突防、深绿 = 被挡（深浅只表示相对多少，不是名次）</span>`;
        h += `<div class="pb-cell ${heat(e.landed.p50, e.landNeed)} ${s.id === sel && f.id === selFoe ? 'cur' : ''}"
                data-s="${s.id}" data-f="${f.id}" data-tip="${tip.replace(/"/g, '&quot;')}">
                <em class="pb-cell-pw">${side === 'red' ? '成' : '失'}${pct(e.redWin)}</em>
                <b>${e.landed.p50}</b><small>${e.landed.p10}~${e.landed.p90} 人</small></div>`;
      }
    }
    $('pbMatrix').innerHTML = h;
    const ax = $('pbAxis');
    if (ax) ax.innerHTML = `<b>敌方 →</b> ${esc(foeShort)} 的 ${foeSchemes.length} 套候选打法`
      + `<span>每列一种打法 · 点列头切换对手 · 点格子看该对位详情</span>`;
    
    const rows = selfSchemes.map(s => {
      const vs = foeSchemes.map(f => matrix[s.id][f.id].landed.p50);
      return { s, lo: Math.min(...vs), hi: Math.max(...vs), span: Math.max(...vs) - Math.min(...vs) };
    });
    const steady = rows.slice().sort((a, b) => a.span - b.span)[0];
    const swing = rows.slice().sort((a, b) => b.span - a.span)[0];
    
    const graded = [];
    for (const s of selfSchemes) for (const f of foeSchemes)
      graded.push({ s, f, v: matrix[s.id][f.id].landed.p50 });
    graded.sort((a, b) => side === 'red' ? a.v - b.v : b.v - a.v);
    const bad = graded[0];
    const sum = $('pbMtxSum');
    if (sum) sum.innerHTML =
      `<b>读表</b>` +
      `<span class="ms-item ms-good">最稳 ${esc(steady.s.name)}<i>${steady.lo}~${steady.hi}，波动 ${steady.span}</i></span>` +
      `<span class="ms-item">最赌 ${esc(swing.s.name)}<i>${swing.lo}~${swing.hi}，波动 ${swing.span}</i></span>` +
      `<span class="ms-item ms-bad">红线对位 ${esc(bad.s.name)} × ${esc(bad.f.name)}<i>${bad.v} 人</i></span>`;
    $('pbMatrix').querySelectorAll('.pb-cell').forEach(c => {
      c.onclick = () => { sel = c.dataset.s; selFoe = c.dataset.f; renderCards(); renderMatrix(); renderDetail(); refresh(); };
    });
    $('pbMatrix').querySelectorAll('.pb-mtx-col').forEach(c => {
      c.onclick = () => { selFoe = c.dataset.f; renderCards(); renderMatrix(); renderDetail(); refresh(); };
    });
  }

  function renderDetail() {
    const s = selfSchemes.find(x => x.id === sel), f = foeSchemes.find(x => x.id === selFoe);
    const e = matrix[sel][selFoe];
    $('pbDetail').innerHTML = `
      <div class="pb-det-h"><b>${esc(s.name)}</b> ${s.codeNote ? `<code class="code-note" data-tip="${tipOf(s)}">${esc(s.codename)}</code>` : ''}
        <span class="pb-vs">对</span> <b>${esc(f.name)}</b> ${f.codeNote ? `<code class="code-note" data-tip="${tipOf(f)}">${esc(f.codename)}</code>` : ''}
        <span class="pb-style st-${f.style}">${esc(f.styleCn)}</span></div>
      <div class="pb-det-g">
        <div><span>上陆兵力</span><b>${e.landed.p50}</b><small>P10 ${e.landed.p10} / P90 ${e.landed.p90}</small></div>
        <div><span>击沉</span><b>${e.sunk.p50}</b><small>${e.sunk.p10}~${e.sunk.p90} 艘</small></div>
        <div><span>消耗反舰弹</span><b>${e.fired}</b><small>库存 ${150}</small></div>
        <div><span>判定</span><b>${e.redWin >= .5 ? '红方达成' : e.blueWin >= .5 ? '蓝方拒止' : '僵持'}</b>
          <small>蓝 ${pct(e.redWin)} / 僵 ${pct(e.draw)} / 红 ${pct(e.blueWin)}</small></div>
      </div>
      <div class="pb-det-f">
        <div class="up"><i>▲ 优势</i>${esc(s.forecast.upside)}</div>
        <div class="dn"><i>▼ 劣势</i>${esc(s.forecast.downside)}</div>
      </div>
      <div class="pb-det-risk">⚠ <b>最大风险</b>${esc(s.riskNote || '—')}</div>
      <div class="pb-det-foe"><b>对手打法</b><span>${esc(f.tagline)}</span></div>`;
  }

  function refresh() {
    lobby = readLobby();
    const mine = lobby[side], theirs = lobby[foe];
    const bothReady = mine.ready && theirs.ready;
    $('pbStatus').innerHTML =
      `<span class="pill ${mine.ready ? 'ok' : ''}">我方 ${mine.ready ? '已锁定' : '未锁定'}</span>` +
      `<span class="pill ${theirs.ready ? 'ok' : 'dim'}">${foeName.split(' ')[0]} ${theirs.ready ? '已就绪' : '未就绪'}</span>` +
      (lobby.started ? `<span class="pill live">推演进行中</span>` : '');
    $('pbStart').disabled = !(bothReady || $('pbSolo').dataset.force === '1');
    $('pbLock').textContent = mine.ready ? '更改方案（解除锁定）' : '锁定方案 · 待战';
    $('pbStart').textContent = bothReady ? '开始推演（双方就绪）' : '开始推演';
    $('pbModeHint').textContent = mode === 'auto'
      ? 'AI 按方案自主交战，你只需观察与随时介入'
      : '你接管指挥：选择、编组、指定目标；AI 只提示建议';
    root.querySelectorAll('.pb-mode').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
    const running = opt.isRunning && opt.isRunning() && lobby.started;
    $('pbPause').style.display = running ? '' : 'none';
    $('pbPause').textContent = (mine.paused ? '继续' : '暂停');
    if (btn) btn.textContent = lobby.started ? '◧ 方案台 · 交战中' : '◧ 方案台';
  }

  
  root.querySelector('#pbClose').onclick = () => close();
  root.querySelectorAll('.pb-mode').forEach(b => {
    b.onclick = () => { mode = b.dataset.mode; refresh(); };
  });
  $('pbSolo').onclick = () => {
    
    const f = foeSchemes[0].id;
    writeLobby({ [side]: { scheme: sel, mode, ready: true }, [foe]: { scheme: f, mode: 'auto', ready: true }, started: true, startedAt: Date.now(), solo: side });
    opt.onStart && opt.onStart({ scheme: selfSchemes.find(s => s.id === sel), foeScheme: foeSchemes.find(s => s.id === f), mode, solo: true });
    close();
  };
  $('pbLock').onclick = () => {
    const mine = readLobby()[side];
    if (mine.ready) { writeLobby({ [side]: { ready: false, paused: false }, started: false, startedAt: null }); opt.onAbort && opt.onAbort(); }
    else writeLobby({ [side]: { scheme: sel, mode, ready: true } });
    refresh();
  };
  $('pbStart').onclick = () => {
    const L = readLobby();
    if (!(L[side].ready && L[foe].ready)) return;
    const f = foeSchemes.find(x => x.id === L[foe].scheme) || foeSchemes[0];
    writeLobby({ started: true, startedAt: Date.now(), solo: null });
    opt.onStart && opt.onStart({ scheme: selfSchemes.find(s => s.id === L[side].scheme), foeScheme: f, mode: L[side].mode || mode, solo: false });
    close();
  };
  $('pbPause').onclick = () => {
    const L = readLobby(); const p = !L[side].paused;
    writeLobby({ [side]: { paused: p } });
    p ? (opt.onPause && opt.onPause()) : (opt.onResume && opt.onResume());
    refresh();
  };

  watchLobby(() => { refresh(); });
  addEventListener('keydown', e => {
    if (root.classList.contains('show') && e.key === 'Escape') { e.stopPropagation(); close(); }
  }, true);

  function open() {
    root.classList.add('show');
    if (PAGE) { root.classList.add('pb-page'); document.body.classList.add('plan-mode'); }
    renderCards(); renderMatrix(); renderDetail(); refresh();
  }
  function close() { if (PAGE) return; root.classList.remove('show'); }

  
  const mine0 = readLobby()[side];
  if (mine0.mode) mode = mine0.mode;
  refresh();
  initTips();
  if (PAGE || opt.autoOpen) open();
  
  if (new URLSearchParams(location.search).get('pbauto') === '1') {
    setTimeout(() => { const b = root.querySelector('#pbSolo'); if (b) b.click(); }, 900);
  }
  
  if (new URLSearchParams(location.search).has('pbtest')) {
    const rows = selfSchemes.map(s => s.codename + '[' + foeSchemes.map(f => matrix[s.id][f.id].landed.p50).join('/') + ']').join(' ');
    document.title = 'PB|' + rows + '|foe=' + foeSchemes.map(f => f.codename).join('/') + '|sel=' + sel;
  }
  return { open, close, refresh, get selection() { return selfSchemes.find(s => s.id === sel); } };
}
