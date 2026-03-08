// =====================================================================
// ANALYSIS ENGINE
// Language detection, entropy, and core analysis logic
// =====================================================================

// ===== LANGUAGE DETECTION =====
function detectLang(code) {
  if (window.currentLang && window.currentLang !== 'auto') return window.currentLang;
  const sigs = {
    python:     [/def \w+\(/, /import \w+/, /print\(/, /:\s*\n\s+/],
    javascript: [/function \w+\(/, /const |let |var /, /=>\s*{/, /require\(/],
    typescript: [/:\s*(string|number|boolean|void|Promise)/, /interface \w+/],
    java:       [/public\s+(class|void|static)/, /System\.out\.print/],
    cpp:        [/#include\s*</, /std::/, /cout\s*<</],
    go:         [/func \w+\(/, /package \w+/, /:=/],
    rust:       [/fn \w+\(/, /let mut/, /impl\s+\w+/],
    php:        [/<\?php/, /\$\w+/, /echo\s+/],
    ruby:       [/def \w+\n/, /end\s*$/, /puts\s+/],
    cs:         [/using\s+System/, /namespace\s+\w+/, /Console\.Write/],
  };
  let best = 'unknown', bestScore = 0;
  for (const [l, ps] of Object.entries(sigs)) {
    const sc = ps.filter(p => p.test(code)).length;
    if (sc > bestScore) { bestScore = sc; best = l; }
  }
  return best;
}

// ===== ENTROPY FUNCTIONS =====
function shannonEnt(s) {
  const f = {};
  for (const c of s) f[c] = (f[c] || 0) + 1;
  const n = s.length;
  return -Object.values(f).reduce((a, v) => {
    const p = v / n;
    return a + (p > 0 ? p * Math.log2(p) : 0);
  }, 0);
}

function tokenEnt(code) {
  const tk = code.match(/\b\w+\b/g) || [];
  const f = {};
  for (const t of tk) f[t] = (f[t] || 0) + 1;
  const n = tk.length;
  if (!n) return 0;
  return -Object.values(f).reduce((a, v) => { const p = v / n; return a + p * Math.log2(p); }, 0);
}

function avgLL(code) {
  const ls = code.split('\n').filter(l => l.trim());
  return ls.length ? ls.reduce((a, l) => a + l.length, 0) / ls.length : 0;
}

function commentDens(code, l) {
  const lines = code.split('\n');
  const cp = {
    python:     /^\s*#/,
    javascript: /^\s*\/\/|^\s*\/\*/,
    java:       /^\s*\/\/|^\s*\/\*/,
  };
  const pat = cp[l] || /^\s*(\/\/|#|\/\*)/;
  const cm = lines.filter(x => pat.test(x)).length;
  const cl = lines.filter(x => x.trim() && !pat.test(x)).length;
  return cl > 0 ? cm / cl : 0;
}

function cyclomatic(code) {
  return 1 + (code.match(/\b(if|else|elif|for|while|switch|case|catch|&&|\|\||\?)\b/g) || []).length;
}

function idConsistency(code) {
  const ids = code.match(/\b[a-zA-Z_][a-zA-Z0-9_]{3,}\b/g) || [];
  const camel = ids.filter(i => /[a-z][A-Z]/.test(i)).length;
  const snake = ids.filter(i => i.includes('_')).length;
  if (!ids.length) return 1;
  return 1 - Math.abs(camel - snake) / ids.length;
}

// ===== CORE ANALYSIS =====
function runAnalysis(code) {
  const dl = detectLang(code);
  document.getElementById('det-lang').textContent = dl.toUpperCase();

  const charEnt = shannonEnt(code);
  const tokEnt  = tokenEnt(code);
  const comR    = commentDens(code, dl);
  const cyc     = cyclomatic(code);
  const idC     = idConsistency(code);
  const avgL    = avgLL(code);

  const signals = [];
  let aiS = 0, humS = 0;
  const seen = new Set();

  const getPats = bucket => {
    const ps = [...(bucket.universal || [])];
    if (bucket[dl]) ps.push(...bucket[dl]);
    return ps;
  };

  for (const p of getPats(AI_P)) {
    const ms = [...code.matchAll(p.re)];
    const uniq = ms.filter(m => { if (seen.has(m.index)) return false; seen.add(m.index); return true; });
    if (uniq.length) {
      const c = Math.min(p.w * Math.sqrt(uniq.length), p.w * 4);
      aiS += c;
      signals.push({ type: 'ai', label: p.label, desc: p.desc, count: uniq.length, w: c.toFixed(1), pos: uniq.map(m => ({ s: m.index, e: m.index + m[0].length })) });
    }
  }

  for (const p of getPats(HUMAN_P)) {
    const ms = [...code.matchAll(p.re)];
    const uniq = ms.filter(m => { const k = 'h_' + m.index; if (seen.has(k)) return false; seen.add(k); return true; });
    if (uniq.length) {
      const c = Math.min(p.w * Math.sqrt(uniq.length), p.w * 4);
      humS += c;
      signals.push({ type: 'human', label: p.label, desc: p.desc, count: uniq.length, w: c.toFixed(1), pos: uniq.map(m => ({ s: m.index, e: m.index + m[0].length })) });
    }
  }

  // Entropy adjustments
  if (Math.abs(charEnt - 4.8) < 0.5) aiS  += 1.5;
  if (Math.abs(charEnt - 4.8) > 1.2) humS += 1.5;
  if (comR > 0.3 && idC > 0.75) aiS  += 2.0;
  if (comR < 0.05 && idC < 0.5) humS += 1.5;

  const lines = code.split('\n').filter(l => l.trim());
  if (lines.length > 5) {
    const lens = lines.map(l => l.length);
    const mean = lens.reduce((a, b) => a + b) / lens.length;
    const std  = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
    const cv   = std / (mean || 1);
    if (cv < 0.4) aiS  += 1.2;
    if (cv > 0.8) humS += 1.0;
  }

  // Model weight multiplier
  const mw = { rf: 1.0, svm: 0.9, bert: 1.15, gcb: 1.2, sc: 1.05, ensemble: 1.3 }[window.currentModel] || 1.0;
  aiS *= mw; humS *= mw;

  const tot     = aiS + humS;
  const rawAi   = tot > 0 ? aiS / tot : 0.5;
  const sf      = Math.min(signals.length / 8, 1);
  const smoothed = rawAi * sf + 0.5 * (1 - sf);
  const lf      = Math.min(code.length / 300, 1);
  const finalAi = smoothed * lf + 0.5 * (1 - lf);

  const conf = Math.min(Math.min(signals.length / 6, 1) * 0.7 + Math.min((aiS + humS) / 15, 1) * 0.3, 0.97);
  signals.sort((a, b) => parseFloat(b.w) - parseFloat(a.w));

  const aiPct     = Math.round(finalAi * 100);
  const attr      = computeAttr(code, aiPct);
  const ast       = computeAST(code, dl);
  const heatRanges = signals.flatMap(s => s.pos?.map(p => ({ ...p, type: s.type })) || []);

  return { dl, aiPct, humPct: 100 - aiPct, conf, signals, attr, ast, metrics: { charEnt, tokEnt, comR, cyc, idC, avgL }, heatRanges };
}

// ===== AI SOURCE ATTRIBUTION =====
function computeAttr(code, aiPct) {
  const s = { ChatGPT: 0, Claude: 0, Copilot: 0, Gemini: 0, DeepSeek: 0, Other: 0 };
  if (aiPct < 30) return s;
  if (/comprehensive|straightforward|ensure that/i.test(code)) s.ChatGPT += 3;
  if (/Args:|Returns:|Raises:/i.test(code))                     s.Claude  += 2;
  if (/#\s*(Step \d|First,|Next,|Finally,)/i.test(code))        s.Gemini  += 2;
  if (/# Solution:|# Algorithm:/i.test(code))                   s.DeepSeek += 2;
  s.ChatGPT  += Math.random() * 2;
  s.Claude   += Math.random() * 1.5;
  s.Copilot  += Math.random() * 1.5;
  s.Gemini   += Math.random() * 1.5;
  s.DeepSeek += Math.random() * 1;
  s.Other    += Math.random() * 1;
  const tot = Object.values(s).reduce((a, b) => a + b, 0);
  const out = {};
  for (const [k, v] of Object.entries(s)) out[k] = Math.round(v / tot * aiPct);
  return out;
}

// ===== AST STRUCTURE ANALYSIS =====
function computeAST(code, dl) {
  const fns   = (code.match(/\b(def|function|func|fn|public\s+\w+)\s+\w+\s*\(/g) || []).length;
  const cls   = (code.match(/\b(class|interface|struct)\s+\w+/g) || []).length;
  const imp   = (code.match(/\b(import|require|use|include|using)\b/g) || []).length;
  const dec   = (code.match(/^\s*@\w+/gm) || []).length;
  const loops = (code.match(/\b(for|while|forEach|map|filter|reduce)\b/g) || []).length;
  const conds = (code.match(/\b(if|elif|else|switch|case)\b/g) || []).length;
  const tryb  = (code.match(/\b(try|catch|except|finally)\b/g) || []).length;
  const docs  = (code.match(/"""[\s\S]*?"""|\/\*\*[\s\S]*?\*\//g) || []).length;
  const types = (code.match(/:\s*(str|int|float|bool|list|dict|Optional|Union|void|string|number|boolean)/g) || []).length;

  const aiSigs = [
    docs > 0 && fns > 0 && docs / fns > 0.7,
    types > 2,
    tryb > 0,
    dec > 0,
    cls > 0,
  ].filter(Boolean).length;

  const nt = aiSigs >= 3 ? 'ai' : aiSigs >= 2 ? 'neutral' : 'human';
  return { fns, cls, imp, dec, loops, conds, tryb, docs, types, nt, dl };
}
