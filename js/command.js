




















import * as VIEW from './view.js';




const VERBS = {
  advance:  { side: ['red'], args: { stopKm: 'number?' } },
  amphib:   { side: ['red'], args: { beach: 'string?' } },
  heli:     { side: ['red'], args: {} },
  strike:   { side: ['red'], args: { tgt: 'string?' } },
  launchAir:{ side: ['red'], args: {} },
  posture:  { side: ['green'], args: { p: 'string' } },
  beach:    { side: ['red'], args: { b: 'string' } },
  

  ambit:    { side: ['blue'], args: { km: 'number' } },
  


  commit:      { side: ['red', 'blue', 'green'], args: { org: 'string', cont: 'string?' } },
  contingency: { side: ['red', 'blue', 'green'], args: { cont: 'string', branch: 'number' } },
  claim:    { side: ['red', 'blue', 'green'], args: { text: 'string' } },
};;

const BEAT_MIN = 5;          
const BEAT_REAL_MS = 4000;   
const THINK_TIMEOUT = 9000;  


const ctrls = {};            
const queue = [];            
const handled = [];          
const HISTORY_MAX = 400;
let handlers = {};           
let W = null;
let _seq = 0;
let stats = { issued: 0, exec: 0, rejected: 0, timeout: 0, dropped: 0 };

export function attach(world) { W = world; }
export function bindHandlers(h) { handlers = h || {}; }
export function ready() { return !!W; }


export function register(side, ctrl) {
  ctrls[side] = Object.assign({
    kind: 'preset', name: side + '·默认', enabled: true,
    nextT: 0, nextReal: 0, busy: false, lastOrders: [], lastWhy: '', thinkN: 0,
  }, ctrl || {});
  return ctrls[side];
}
export function controller(side) { return ctrls[side] || null; }
export function controllers() { return { ...ctrls }; }
export function setKind(side, kind, opt = {}) {
  const c = ctrls[side] || register(side, {});
  c.kind = kind;
  if (opt.name) c.name = opt.name;
  if (opt.decide) c.decide = opt.decide;
  c.nextT = 0; c.nextReal = 0; c.busy = false;
  return c;
}


function legal(o) {
  if (!o || !o.side || !o.verb) return '缺少 side/verb';
  const v = VERBS[o.verb];
  if (!v) return '动词未登记：' + o.verb;
  if (!v.side.includes(o.side)) return o.side + ' 无权执行 ' + o.verb;
  for (const [k, t] of Object.entries(v.args || {})) {
    const optional = t.endsWith('?'), ty = t.replace('?', '');
    const has = o.args && o.args[k] != null;
    if (!has && !optional) return '缺少参数 ' + k;
    if (has && typeof o.args[k] !== ty) return '参数类型错 ' + k + ' 应为 ' + ty;
  }
  return null;
}


function make(o) {
  return {
    id: ++_seq, side: o.side, verb: o.verb, args: o.args || {},
    t: o.t != null ? o.t : (W && W.time ? W.time() : 0),
    src: o.src || (ctrls[o.side] && ctrls[o.side].kind) || 'preset',
    why: o.why || '', ts: Date.now(),
  };
}


export function exec(order) {
  const o = make(order);
  const bad = legal(o);
  if (bad) { stats.rejected++; note('REJECT ' + bad + ' ' + o.verb, o.side); return false; }
  const fn = handlers[o.verb];
  if (!fn) { stats.rejected++; note('NO HANDLER ' + o.verb, o.side); return false; }
  try { fn(o); } catch (e) { note('EXEC ERR ' + o.verb + ' ' + e.message, o.side); return false; }
  stats.exec++;
  push(o);
  return true;
}


export function issue(order) {
  const o = make(order);
  const bad = legal(o);
  if (bad) { stats.rejected++; note('REJECT ' + bad + ' ' + o.verb, o.side); return false; }
  const dup = queue.some(q => q.side === o.side && q.verb === o.verb
    && JSON.stringify(q.args) === JSON.stringify(o.args) && Math.abs(q.ts - o.ts) < 200);
  if (dup) { stats.dropped++; return false; }
  queue.push(o);
  stats.issued++;
  return true;
}


export function drain(side, gt) {
  const out = [];
  for (let i = queue.length - 1; i >= 0; i--) {
    const q = queue[i];
    if (side && q.side !== side) continue;
    if (q.t > gt + 1e-6) continue;
    queue.splice(i, 1);
    if (execStrict(q)) out.push(q);
  }
  return out;
}
function execStrict(o) {
  const fn = handlers[o.verb];
  if (!fn) return false;
  try { fn(o); stats.exec++; push(o); return true; }
  catch (e) { note('EXEC ERR ' + o.verb + ' ' + e.message, o.side); return false; }
}

function push(o) {
  handled.push(o);
  if (handled.length > HISTORY_MAX) handled.splice(0, handled.length - HISTORY_MAX);
}
function note(msg, side) {
  try { if (W && W.note) W.note(msg, side); } catch (e) {}
}




export function tick(gt) {
  if (!(gt > 0.005)) return;          
  for (const side of VIEW.SIDE_KEYS) {
    const c = ctrls[side];
    if (!c || c.kind !== 'agent' || !c.enabled || c.busy) continue;
    const tMin = gt * 60;
    const now = Date.now();
    if (tMin < c.nextT || now < c.nextReal) continue;
    c.nextT = tMin + BEAT_MIN;
    c.nextReal = now + BEAT_REAL_MS;
    think(side, c, gt);
  }
}





export function poke(side) {
  const c = ctrls[side];
  if (!c || c.kind !== 'agent' || !c.enabled) return false;
  c.nextT = 0; c.nextReal = 0;
  if (c.busy) return false;
  think(side, c, W && W.time ? W.time() : 0);
  return true;
}

function think(side, c, gt) {
  c.busy = true;
  let view;
  try { view = VIEW.build(side); }
  catch (e) { c.busy = false; note('VIEW ERR ' + e.message, side); return; }

  const ctx = {
    query: (k, a) => VIEW.query(side, k, a),
    now: gt, side,
  };
  let result;
  try { result = c.decide ? c.decide(view, ctx) : null; }
  catch (e) { c.busy = false; note('DECIDE ERR ' + e.message, side); return; }

  
  if (result && typeof result.then === 'function') {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true; c.busy = false; stats.timeout++;
      note('THINK TIMEOUT ' + side + ' → 用上一版意图', side);
      replay(side, c, view);            
    }, THINK_TIMEOUT);
    result.then(r => {
      if (done) return;
      done = true; clearTimeout(timer); c.busy = false;
      accept(side, c, r, view);
    }).catch(e => {
      if (done) return;
      done = true; clearTimeout(timer); c.busy = false;
      note('THINK FAIL ' + side + ' ' + (e && e.message), side);
      replay(side, c, view);
    });
  } else {
    c.busy = false;
    accept(side, c, result, view);
  }
}


function accept(side, c, r, view) {
  if (!r) { return; }
  const orders = Array.isArray(r) ? r : (r.orders || []);
  const why = (r && r.why) || '';
  const intent = (r && r.intent) || '';
  c.thinkN++;
  c.lastWhy = why;
  c.lastIntent = intent;
  let ok = 0;
  for (const o of orders) {
    const oo = Object.assign({}, o, { side, src: 'agent:' + (c.name || side), why: o.why || why });
    if (issue(oo)) ok++;
  }
  c.lastOrders = orders;
  
  try { if (W && W.tell && orders.length) W.tell(side, { name: c.name, think: c.thinkN, intent, why, ok, total: orders.length }); } catch (e) {}
  
  try {
    if (W && W.record) W.record({
      side, at: (view && view.t) || 0, src: 'agent', name: c.name, think: c.thinkN,
      belief: view && view.belief, intent, why, orders, ok,
    });
  } catch (e) {}
  note('AGENT ' + side + ' think#' + c.thinkN + ' 命令' + ok + '/' + orders.length
    + (intent ? ' · ' + intent : ''), side);
}

function replay(side, c, view) {
  if (!c.lastOrders || !c.lastOrders.length) return;
  for (const o of c.lastOrders) {
    issue(Object.assign({}, o, { side, src: 'agent:' + (c.name || side) + '(沿用)', why: '思考超时，沿用上一版意图' }));
  }
}


export function history(side, n = 40) {
  const a = side ? handled.filter(o => o.side === side) : handled;
  return a.slice(-n);
}
export function statsNow() { return { ...stats, queued: queue.length, handlers: Object.keys(handlers).length }; }
export function reset() {
  queue.length = 0; handled.length = 0; _seq = 0;
  stats = { issued: 0, exec: 0, rejected: 0, timeout: 0, dropped: 0 };
}




export function makeRuleAgent(side, persona = {}) {
  const P = Object.assign({ aggression: 0.5, caution: 0.5, name: side + '·规则agent' }, persona);
  
  let askedAir = false;
  
  let lastMisT = -9;
  

  let lastSig = '';
  return {
    kind: 'agent',
    name: P.name,
    decide(view) {
      const orders = [];
      const b = view.belief.p || {};
      const conf = view.belief.conf || 0;
      const pick = k => {
        if (!b[k]) return null;
        const arr = Object.entries(b[k]).sort((x, y) => y[1] - x[1]);
        return { id: arr[0][0], p: arr[0][1] };
      };
      const why = [];

      



      const plan = view.plan;
      const openInc = (plan && plan.openIncidents) || [];
      if (openInc.length) {
        const inc = openInc[0];
        const s = (P.aggression || 0.5) - (P.caution || 0.5);
        let br = 0;
        if (inc.contId === 'x2') {                 
          br = s > 0.2 ? 0 : (s < -0.05 ? 2 : 1);
        } else if (inc.contId === 'y3') {          
          br = (P.caution || 0.5) > 0.5 ? 0 : 1;
        } else if (inc.contId === 'z3') {          
          br = (P.caution || 0.5) > 0.5 ? 0 : 1;
        }                                          
        const brn = (inc.branches[br] || inc.branches[0] || {}).n || ('分支' + (br + 1));
        const why1 = '⚡' + inc.n + '（' + inc.note + '）→ 选「' + brn + '」（进攻'
          + Math.round((P.aggression || 0.5) * 100) + '/谨慎' + Math.round((P.caution || 0.5) * 100) + '）';
        const o = { verb: 'contingency', args: { cont: inc.contId, branch: br }, why: why1 };
        const sig1 = 'C' + inc.id + ':' + br;
        if (sig1 !== lastSig) {
          lastSig = sig1;
          return { orders: [o], intent: why1, why: why1 };
        }
        
      }

      if (side === 'red') {
        const am = view.obs.amphib;
        const enemy = pick('blue'), gr = pick('green');
        


        const gs = { littoral: 0, indepth: 0 };
        for (const [id, p] of Object.entries(b.blue || {})) {
          gs[(id === 'r_littoral' || id === 'r_beach') ? 'littoral' : 'indepth'] += p;
        }
        const gTop = gs.littoral >= gs.indepth ? 'littoral' : 'indepth';
        const gConf = Math.max(gs.littoral, gs.indepth);
        const sure = !!enemy && gConf > 0.58 && conf > 0.12;
        
        if (sure && gTop === 'littoral') {
          orders.push({ verb: 'strike', args: {}, why: '判蓝方贴岸死守，先压制岸防火力' });
          orders.push({ verb: 'beach', args: { b: 'b3' }, why: '绕开北段预设歼灭区，走南翼' });
          why.push('蓝方贴岸，先压岸防再走南翼');
        }
        
        if (sure && gTop === 'indepth') {
          orders.push({ verb: 'advance', args: { stopKm: 92 }, why: '判蓝方纵深防御，抢时间窗' });
          why.push('蓝方向后缩，加速逼近');
        }
        
        if (view.obs.armyTrend === 'back' && !orders.some(o => o.verb === 'advance')) {
          orders.push({ verb: 'advance', args: { stopKm: 92 }, why: '航迹判读：蓝军主力后撤，抢时间窗' });
          why.push('蓝军后撤（航迹），加速');
        }
        
        if (gr && gr.p > 0.45 && gr.id === 'pc') {
          orders.push({ verb: 'advance', args: { stopKm: 100 }, why: '判绿方远距威慑，抢窗口' });
          why.push('绿方还在远端，加速');
        }
        
        if (gr && gr.p > 0.45 && gr.id === 'pa') {
          orders.push({ verb: 'strike', args: {}, why: '判绿方分布式，压制其岛链节点' });
          why.push('绿方分布式部署，先压节点');
        }
        
        if (!askedAir && (conf < 0.28 || !am)) {
          orders.push({ verb: 'launchAir', args: {}, why: '情报不足，加强空中侦察与掩护' });
          askedAir = true;
          why.push('看不清对手，先加侦察');
        }
      }
      if (side === 'blue') {
        



        const gs = { fast: 0, slow: 0 };
        for (const [id, p] of Object.entries(b.red || {})) {
          gs[(id === 'b_stom' || id === 'b_deception') ? 'fast' : 'slow'] += p;
        }
        const gTop = gs.fast >= gs.slow ? 'fast' : 'slow';
        const gConf = Math.max(gs.fast, gs.slow);
        const sure = gConf > 0.55 && conf > 0.1;
        if (sure && gTop === 'fast') {
          const km = P.aggression > 0.55 ? 40 : 30;
          orders.push({ verb: 'ambit', args: { km }, why: '判红方速决，伏击圈前推 ' + km + 'km 远界先打' });
          why.push('红方像快刀/斩首，伏击圈前推');
        }
        if (sure && gTop === 'slow') {
          orders.push({ verb: 'ambit', args: { km: 15 }, why: '判红方绞杀/分散，收圈保存机动火力' });
          why.push('红方磨时间，收圈节弹');
        }
        if (!askedAir && conf < 0.2) {
          orders.push({ verb: 'claim', args: { text: '情报不足：要求加强观通，争取美情共享升级' }, why: '看不清红方动向' });
          askedAir = true;
          why.push('看不清红方，要求加强侦察');
        }
      }
      if (side === 'green') {
        

        const gs = { fast: 0, slow: 0 };
        for (const [id, p] of Object.entries(b.red || {})) {
          gs[(id === 'b_stom' || id === 'b_deception') ? 'fast' : 'slow'] += p;
        }
        const gTop = gs.fast >= gs.slow ? 'fast' : 'slow';
        const gConf = Math.max(gs.fast, gs.slow);
        const sure = gConf > 0.55 && conf > 0.1;
        if (sure && gTop === 'fast') {
          if (P.aggression > 0.55) {
            orders.push({ verb: 'posture', args: { p: 'full' }, why: '判红方速决强袭，升级全面介入' });
            why.push('红方强袭，升级介入');
          } else if (P.caution > 0.55) {
            orders.push({ verb: 'posture', args: { p: 'limited' }, why: '红方速决但冲突代价高，有限介入阻遏' });
            why.push('红方强袭，有限介入阻遏');
          }
        }
        if (sure && gTop === 'slow' && P.caution > 0.5) {
          orders.push({ verb: 'posture', args: { p: 'isr' }, why: '判红方围困消耗，先 ISR 观势不升级' });
          why.push('红方磨时间，先观势');
        }
      }
      






      const inb = view.inbound;
      if (Array.isArray(inb)) {
        const sea = inb.filter(m => m.prof === 'low' || m.prof === 'sub');
        const t = view.t || 0;
        if (sea.length >= 3 && t - lastMisT >= 0.25) {
          lastMisT = t;
          const near = sea.reduce((a, m) => (a === null || m.d < a.d ? m : a), null);
          const tag = '来袭 ' + sea.length + ' 发（最近约 ' + (near ? near.d : '?') + 'km · '
            + (near ? (near.by || '来源未判明') : '—') + '）';
          if (side === 'red') {
            if (P.caution > 0.5) {
              orders.push({ verb: 'launchAir', args: {}, why: tag + '：放出掩护机，压缩末段突防窗口' });
              why.push(tag + '，加掩护');
            } else {
              orders.push({ verb: 'claim', args: { text: tag + '：承受拦截损耗，换乘窗口不因此顺延' }, why: tag + '：不减速' });
              why.push(tag + '，速决优先不减速');
            }
          } else if (side === 'blue') {
            if (P.caution > 0.5) {
              orders.push({ verb: 'ambit', args: { km: 10 }, why: tag + '：收伏击圈至 10km，保存机动反舰火力' });
              why.push(tag + '，收圈节弹');
            } else {
              orders.push({ verb: 'claim', args: { text: tag + '：岸导继续远界齐射，用火力换其拦截弹' }, why: tag + '：继续远界打' });
              why.push(tag + '，远界继续压');
            }
          } else {
            orders.push({ verb: 'claim', args: { text: tag + '：转 standoff，舰艇疏散减少甲板暴露' }, why: tag + '：不升级、先保存' });
            why.push(tag + '，standoff 保存');
          }
        }
      }
      const sig = JSON.stringify(orders.map(o => o.verb + JSON.stringify(o.args || {})).sort());
      if (sig === lastSig) {
        return { orders: [], intent: '维持：' + (why.join('；') || '继续观察'), why: '' };
      }
      lastSig = sig;
      return { orders, intent: why.join('；') || '保持既定方案，继续观察', why: why.join('；') };
    },
  };
}
