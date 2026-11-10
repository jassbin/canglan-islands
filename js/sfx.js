











const KEY = 'canglan.sfx.on';
const MIN_GAP = { fire: .12, hit: .14, gun: .08, sink: .40, alarm: .60, jet: .35 };

class Sfx {
  constructor() {
    let saved = '1';
    try { saved = localStorage.getItem(KEY) ?? '1'; } catch (_) { }
    this.on = saved !== '0';
    this.ctx = null; this.master = null; this.wet = null; this.noise = null;
    this.last = Object.create(null); this.lastAny = 0; this.live = 0;
    this.vol = 0.15;
  }
  _ensure() {
    if (!this.on) return false;
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => { }); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      const c = this.ctx = new AC();
      
      this.master = c.createGain();
      this.master.gain.value = this.vol;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6500; lp.Q.value = .5;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 5;
      comp.attack.value = .004; comp.release.value = .22;
      this.master.connect(lp); lp.connect(comp); comp.connect(c.destination);
      
      try {
        const irLen = Math.floor(c.sampleRate * 1.4);
        const ir = c.createBuffer(2, irLen, c.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const d = ir.getChannelData(ch);
          for (let i = 0; i < irLen; i++) {
            const t = i / irLen;
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * (i < 200 ? i / 200 : 1);
          }
        }
        const conv = c.createConvolver(); conv.buffer = ir;
        this.wet = c.createGain(); this.wet.gain.value = .22;
        this.wet.connect(conv); conv.connect(this.master);
      } catch (_) { this.wet = null; }
      
      const n = c.sampleRate;
      const buf = c.createBuffer(1, n, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
    } catch (e) { this.ctx = null; return false; }
    return true;
  }
  unlock() { if (this.on) this._ensure(); }
  toggle() {
    this.on = !this.on;
    try { localStorage.setItem(KEY, this.on ? '1' : '0'); } catch (_) { }
    if (this.on) this._ensure();
    else if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => { });
    return this.on;
  }
  setVolume(v) { this.vol = Math.max(0, Math.min(1, v)); if (this.master) this.master.gain.value = this.vol; }

  
  _noise(t, dur, f0, f1, amp, opt = {}) {
    const c = this.ctx;
    const src = c.createBufferSource(); src.buffer = this.noise;
    const flt = c.createBiquadFilter(); flt.type = opt.type || 'lowpass'; flt.Q.value = opt.q || .8;
    flt.frequency.setValueAtTime(Math.max(40, f0), t);
    flt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    const g = c.createGain();
    const atk = opt.atk != null ? opt.atk : Math.min(.014, dur * .12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(flt); flt.connect(g); g.connect(this.master);
    if (opt.reverb && this.wet) g.connect(this.wet);
    src.start(t, Math.random() * .5); src.stop(t + dur + .02);
    src.onended = () => { try { src.disconnect(); flt.disconnect(); g.disconnect(); } catch (_) { } this.live--; };
    this.live++;
  }
  
  _tone(t, dur, f0, f1, amp, opt = {}) {
    const c = this.ctx;
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(Math.max(18, f0), t);
    o.frequency.exponentialRampToValueAtTime(Math.max(18, f1), t + dur);
    const g = c.createGain();
    const atk = opt.atk != null ? opt.atk : Math.min(.02, dur * .18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    if (opt.reverb && this.wet) g.connect(this.wet);
    o.start(t); o.stop(t + dur + .02);
    o.onended = () => { try { o.disconnect(); g.disconnect(); } catch (_) { } this.live--; };
    this.live++;
  }

  play(kind, gain = 1) {
    if (!this.on || !this._ensure()) return;
    const t = this.ctx.currentTime;
    const gap = MIN_GAP[kind] ?? .15;
    if (t - (this.last[kind] ?? -9) < gap) return;        
    if (t - this.lastAny < .05 || this.live > 12) return; 
    this.last[kind] = t; this.lastAny = t;
    const a = Math.max(.05, Math.min(1.5, gain)) * (0.9 + Math.random() * 0.2);
    const P = 0.92 + Math.random() * 0.16;                
    switch (kind) {
      case 'fire':   
        this._noise(t, .50, 350 * P, 1500 * P, .30 * a, { type: 'bandpass', q: 1.1, atk: .05 });
        this._tone(t, .55, 58 * P, 40, .22 * a, { atk: .04 });
        break;
      case 'gun':    
        this._noise(t, .11, 900 * P, 220, .34 * a, { atk: .004 });
        this._tone(t, .13, 115 * P, 55, .24 * a, { atk: .004 });
        break;
      case 'hit':    
        this._tone(t, .75, 82 * P, 27, .40 * a, { reverb: true, atk: .008 });
        this._noise(t, .62, 620 * P, 110, .40 * a, { reverb: true, q: 1.0 });
        this._noise(t, .06, 2400, 700, .13 * a, { atk: .002 });  
        break;
      case 'sink':   
        this._tone(t, 1.6, 55 * P, 21, .38 * a, { reverb: true, atk: .06 });
        this._noise(t, 1.35, 480 * P, 65, .27 * a, { reverb: true, atk: .05 });
        this._noise(t + .9, .5, 300, 120, .10 * a, { atk: .12 }); 
        break;
      case 'alarm':  
        this._tone(t, .10, 660 * P, 640, .09 * a, { atk: .012 });
        this._tone(t + .16, .10, 660 * P, 640, .09 * a, { atk: .012 });
        break;
      case 'jet':    
        this._noise(t, .85, 260 * P, 1700 * P, .20 * a, { type: 'bandpass', q: .7, atk: .18 });
        break;
      default:
        this._noise(t, .2, 1200, 260, .22 * a);
    }
  }
}

export const SFX = new Sfx();
export default SFX;
