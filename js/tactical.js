



















export const TAC = {
  L6: null,                 
  CONT: { red: [], blue: [], green: [] },   
  H: null,                  
  stage: { red: 0, blue: 0, green: 0 },     
  stageLog: [],             
  gates: {},                
  incidents: [],            
  facts: null,              
  loaded: false,
  onIncident: null,         
};


const UNLOAD_WIN = 2.0;

const TH = { transitLoss: 0.30, greenLoss: 2 };

const SIDE_CN = { red: '红方', blue: '蓝方', green: '绿方' };


export async function load() {
  const j = async f => (await fetch('data/' + f + '?v=' + Date.now())).json();
  const [L6, L5] = await Promise.all([j('L6_tactical.json'), j('L5_strategy_ops.json')]);
  TAC.L6 = L6;
  const cs = (L5.v3 && L5.v3.contingencies) || {};
  for (const s of ['red', 'blue', 'green']) TAC.CONT[s] = cs[s] || [];
  TAC.loaded = true;
  return TAC;
}
const contOf = (side, id) => TAC.CONT[side].find(c => c.id === id) || null;
const phasesOf = side => ((TAC.L6 && TAC.L6.sides[side]) || {}).phases || [];






function stageOf(side, f) {
  if (side === 'green') {
    if (f.over) return 3;
    if (f.posture === 'full') return 2;
    if (f.posture === 'limited') return 1;
    return 0;
  }
  if (side === 'red') {
    if (f.cityIn) return 4;
    if (f.landed >= f.landedNeed) return 3;
    if (TAC.H != null) return 2;
    if (f.phase >= 3) return 1;
    return 0;
  }
  
  if (f.over) return f.win ? 2 : 3;          
  if (f.landed >= f.landedNeed) return 3;
  if (TAC.H != null) return 2;
  if (f.phase >= 2) return 1;
  return 0;
}

function factsBrief(f) {
  return { landed: f.landed, need: f.landedNeed, sunk: f.redSunk, posture: f.posture };
}


export function tick(f) {
  if (!TAC.loaded) return;
  TAC.facts = f;
  
  for (const side of ['red', 'blue', 'green']) {
    const st = stageOf(side, f);
    if (st !== TAC.stage[side]) {
      TAC.stageLog.push({
        t: f.t, side, from: TAC.stage[side], to: st,
        facts: factsBrief(f),
      });
      TAC.stage[side] = st;
    }
  }
  evalGates(f);
}

export function setH(gt) { if (TAC.H == null && gt != null) TAC.H = gt; }




export function setOnIncident(fn) { TAC.onIncident = typeof fn === 'function' ? fn : null; }
export function isLoaded() { return !!TAC.loaded; }
export function contCount() { return Object.values(TAC.CONT).reduce((a, c) => a + c.length, 0); }


function setGate(id, pass, f, note) {
  if (TAC.gates[id]) return null;
  TAC.gates[id] = { evaluated: true, pass, t: f.t, note };
  return pass;
}
function fire(side, contId, f, note) {
  const c = contOf(side, contId);
  if (!c) return null;
  const inc = {
    id: 'inc' + (TAC.incidents.length + 1),
    t: f.t, side, contId, n: c.n, note,
    branches: (c.then || []).map(b => ({ n: b.n, act: b.act, to: b.to })),
    why: c.why || '',
    triggerTxt: (c.trigger && c.trigger.txt) || '',
    responded: false, responseT: null, by: null, chosen: null,
  };
  TAC.incidents.push(inc);
  try { if (TAC.onIncident) TAC.onIncident(inc); } catch (e) {}
  return inc;
}

function evalGates(f) {
  const ratio = (sunk, tot) => tot > 0 ? sunk / tot : 0;
  
  
  if (f.phase >= 3) setGate('R_PREP', true, f, '进入渡海输送＝火力窗口已开');
  
  if (TAC.H != null && f.t >= TAC.H && !TAC.gates['R_TRANSIT']) {
    const r = ratio(f.redSunk, f.redSunk + f.redTot);
    const pass = setGate('R_TRANSIT', r < TH.transitLoss, f, '航渡沉船比 ' + Math.round(r * 100) + '%（阈值 ' + Math.round(TH.transitLoss * 100) + '%）');
    if (pass === false) fire('red', 'x1', f, '航渡损失超阈值（' + Math.round(r * 100) + '%）');
  }
  
  if (!TAC.gates['R_UNLOAD']) {
    const due = (TAC.H != null && f.t >= TAC.H + UNLOAD_WIN) || f.over;
    if (due) {
      const ok = f.landed >= f.landedNeed;
      const pass = setGate('R_UNLOAD', ok, f, 'H+' + ((f.t - (TAC.H != null ? TAC.H : 0)).toFixed(1)) + 'h 上陆 ' + f.landed + '/' + f.landedNeed);
      if (pass === false) fire('red', 'x2', f, 'H+' + UNLOAD_WIN + 'h 未建立稳定卸载点（' + f.landed + '/' + f.landedNeed + '）');
    }
  }
  
  
  if (f.heli && !TAC.gates['B_DECAP']) {
    setGate('B_DECAP', false, f, '空突旅机降＝斩首打击已发生');
    fire('blue', 'y1', f, '指挥链遭斩首打击（敌机降桃园）');
  }
  
  if (f.landed >= f.landedNeed && !TAC.gates['B_BEACH']) {
    setGate('B_BEACH', false, f, '敌稳定卸载点已建立（' + f.landed + '/' + f.landedNeed + '）');
    fire('blue', 'y1', f, '滩头失守，转入纵深防御');
  }
  
  if ((f.landed >= f.landedNeed || f.over) && !TAC.gates['B_AID']) {
    const ok = ['limited', 'full'].includes(f.posture);
    const pass = setGate('B_AID', ok, f, '绿方姿态＝' + f.posture);
    if (pass === false) fire('blue', 'y3', f, '预期介入未发生（绿方停在 ' + f.posture + '）');
  }
  
  
  if (['limited', 'full'].includes(f.posture) && !TAC.gates['G_LOSS']) {
    const ok = f.greenSunk < TH.greenLoss;
    const pass = setGate('G_LOSS', ok, f, '绿方大舰损失 ' + f.greenSunk + '（阈值 ' + TH.greenLoss + '）');
    if (pass === false) fire('green', 'z3', f, '损失超政治阈值（' + f.greenSunk + ' 艘大舰）');
  }
}



export function brief(side) {
  if (!TAC.loaded) return null;
  const ph = phasesOf(side);
  const st = TAC.stage[side];
  const cur = ph[st] || null;
  return {
    side, stage: st,
    stageName: cur ? (cur.t + ' ' + cur.n) : '',
    goal: cur ? (cur.goal || '') : '',
    gate: cur ? (cur.gate || '') : '',
    H: TAC.H,
    openIncidents: TAC.incidents
      .filter(i => i.side === side && !i.responded)
      .map(i => ({ contId: i.contId, n: i.n, note: i.note, branches: i.branches, why: i.why, id: i.id })),
  };
}

export function markResponded(contId, side, by, chosen) {
  
  const inc = TAC.incidents.find(i => i.contId === contId && i.side === side && !i.responded);
  if (!inc) return null;
  inc.responded = true;
  inc.responseT = TAC.facts ? TAC.facts.t : null;
  inc.by = by || 'agent';
  inc.chosen = chosen != null ? chosen : null;
  return inc;
}


export function review() {
  return {
    H: TAC.H,
    stage: { ...TAC.stage },
    stageLog: TAC.stageLog.slice(),
    gates: TAC.gates,
    incidents: TAC.incidents.slice(),
    phasesBySide: {
      red: phasesOf('red').map(p => ({ t: p.t, n: p.n, goal: p.goal || '', gate: p.gate || '', cards: (p.cards || []).map(c => c.t + ' ' + c.n) })),
      blue: phasesOf('blue').map(p => ({ t: p.t, n: p.n, goal: p.goal || '', gate: p.gate || '', cards: (p.cards || []).map(c => c.t + ' ' + c.n) })),
      green: phasesOf('green').map(p => ({ t: p.t, n: p.n, goal: p.goal || '', gate: p.gate || '', cards: (p.cards || []).map(c => c.t + ' ' + c.n) })),
    },
    facts: TAC.facts,
  };
}





export const ORG_INFO = {
  red: {
    t1: { n: '航母打击群', ok: true, how: '航空兵全压（launchAir 轮换加速）' },
    t2: { n: '两栖编队·主登陆', ok: true, how: '即主登陆群本体' },
    t3: { n: '第二梯队', ok: true, how: '剩余登陆艇全放行（补放机制）' },
    t4: { n: '先遣突击群（野牛）', ok: true, how: '即野牛群本体' },
    t8: { n: '潜艇伏击群', ok: true, how: '红方潜艇单位' },
    t9: { n: '联合航空兵', ok: true, how: 'strike 压制' },
    t11: { n: '民船第二梯队', ok: true, how: '与 t3 同路（补放全放行）' },
    t5: { n: '舰炮火力支援队', ok: false, how: '引擎无此编组（审计 A4）' },
    t6: { n: '北封锁群', ok: false, how: '引擎无此编组（审计 A4）' },
    t7: { n: '南封锁群', ok: false, how: '引擎无此编组（审计 A4）' },
    t10: { n: '火箭军与远火', ok: false, how: '已被抽象为先期火力系数（审计 A4）' },
    t12: { n: '战役预备队', ok: false, how: '引擎无此编组（审计 A4）' },
  },
  blue: {
    r9: { n: '地面守备', ok: true, how: '预备队前出 / 滩岸阻绝' },
    r8: { n: '岸基火力（海锋）', ok: true, how: '岸导齐射节奏' },
    r6: { n: '潜艇伏击群', ok: true, how: '蓝方潜艇单位' },
    r1: { n: '62旗舰群', ok: false, how: '引擎无独立旗舰（审计 A4）' },
    r2: { n: '北部截击群', ok: false, how: '引擎快艇群未分区（审计 B 级）' },
    r3: { n: '中部截击群', ok: false, how: '引擎快艇群未分区（审计 B 级）' },
    r4: { n: '南部截击群', ok: false, how: '引擎快艇群未分区（审计 B 级）' },
    r5: { n: '东部战力保存群', ok: false, how: '引擎蓝方海军全在峡内（审计 A4）' },
    r7: { n: '运补支队', ok: false, how: '引擎无布雷机制（审计 A4）' },
    r10: { n: '防空暨导弹指挥部', ok: false, how: 'sams/radars 仅被动存在，纵深反击未模拟（审计 A3）' },
  },
  green: {
    csg5: { n: '第5航母打击群', ok: true, how: '航母群前压/后撤' },
    arg31: { n: '两栖戒备群', ok: true, how: 'ARG 待命/前出' },
    subron15: { n: '关岛潜艇中队', ok: true, how: '潜艇单位' },
    csg3: { n: '第3航母打击群', ok: false, how: '引擎无第二航母（审计 A4）' },
    andersen: { n: '关岛轰炸机特遣队', ok: false, how: '引擎无轰炸机进场（审计 A4）' },
    kadena18: { n: '嘉手纳战斗机轮换', ok: false, how: '引擎无空军基地（审计 A4）' },
    mlr12: { n: '12滨海团 NMESIS', ok: false, how: '仅 pa 案有 NMESIS（审计 A5）' },
    edca: { n: '菲律宾堤丰', ok: false, how: '引擎无此阵地（审计 A5）' },
  },
};