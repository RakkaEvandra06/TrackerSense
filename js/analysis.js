// ==========================================================
// LANGUAGE DETECTION
// ==========================================================
function detectLang(code) {
  if (typeof code !== 'string' || !code.trim()) return 'unknown';
  if (window?.currentLang && window.currentLang !== 'auto') return window.currentLang;

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
  for (const [lang, patterns] of Object.entries(sigs)) {
    const score = patterns.filter(p => p.test(code)).length;
    if (score > bestScore) { bestScore = score; best = lang; }
  }

  return best;
}

// ==========================================================
// ENTROPY & METRICS FUNCTIONS
// ==========================================================
function shannonEnt(s) {
  if (!s) return 0;
  const freq = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  const n = s.length;
  return -Object.values(freq).reduce((acc, v) => {
    const p = v / n;
    return acc + (p > 0 ? p * Math.log2(p) : 0);
  }, 0);
}

function tokenEnt(code) {
  if (!code) return 0;
  const tokens = code.match(/\b\w+\b/g) || [];
  const n = tokens.length;
  if (!n) return 0;

  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;

  return -Object.values(freq).reduce((acc, v) => {
    const p = v / n;
    return acc + p * Math.log2(p);
  }, 0);
}

function avgLineLength(code) {
  const lines = code.split('\n').filter(l => l.trim());
  if (!lines.length) return 0;
  return lines.reduce((acc, l) => acc + l.length, 0) / lines.length;
}

function commentDensity(code, lang) {
  const lines = code.split('\n');
  const patterns = {
    python: /^\s*#/,
    javascript: /^\s*\/\/|^\s*\/\*/,
    java: /^\s*\/\/|^\s*\/\*/,
  };
  const pat = patterns[lang] || /^\s*(\/\/|#|\/\*)/;
  const commentLines = lines.filter(l => pat.test(l)).length;
  const codeLines = lines.filter(l => l.trim() && !pat.test(l)).length;
  return codeLines > 0 ? commentLines / codeLines : 0;
}

function cyclomaticComplexity(code) {
  if (!code) return 1;
  const matches = code.match(/\b(if|else|elif|for|while|switch|case|catch|&&|\|\||\?)\b/g) || [];
  return 1 + matches.length;
}

function identifierConsistency(code) {
  const ids = code.match(/\b[a-zA-Z_][a-zA-Z0-9_]{3,}\b/g) || [];
  if (!ids.length) return 1;
  const camel = ids.filter(i => /[a-z][A-Z]/.test(i)).length;
  const snake = ids.filter(i => i.includes('_')).length;
  return 1 - Math.abs(camel - snake) / ids.length;
}

// ==========================================================
// CORE ANALYSIS
// ==========================================================
function runAnalysis(code) {
  if (typeof code !== 'string' || !code.trim()) {
    return { dl: 'unknown', aiPct: 0, humPct: 0, conf: 0, signals: [], attr: {}, ast: {}, metrics: {} };
  }

  const dl = detectLang(code);
  const charEnt = shannonEnt(code);
  const tokEnt  = tokenEnt(code);
  const comR    = commentDensity(code, dl);
  const cyc     = cyclomaticComplexity(code);
  const idC     = identifierConsistency(code);
  const avgL    = avgLineLength(code);

  const signals = [];
  let aiS = 0, humS = 0;
  const seen = new Set();

  // Helper to fetch patterns
  const getPatterns = bucket => [...(bucket.universal || []), ...(bucket[dl] || [])];

  // Check AI patterns
  if (typeof AI_P !== 'undefined') {
    for (const p of getPatterns(AI_P)) {
      const matches = [...code.matchAll(p.re)];
      const uniq = matches.filter(m => !seen.has(m.index) && seen.add(m.index));
      if (uniq.length) {
        const w = Math.min(p.w * Math.sqrt(uniq.length), p.w * 4);
        aiS += w;
        signals.push({ type: 'ai', label: p.label, desc: p.desc, count: uniq.length, w: w.toFixed(1), pos: uniq.map(m => ({ s: m.index, e: m.index + m[0].length })) });
      }
    }
  }

  // Check Human patterns
  if (typeof HUMAN_P !== 'undefined') {
    for (const p of getPatterns(HUMAN_P)) {
      const matches = [...code.matchAll(p.re)];
      const uniq = matches.filter(m => {
        const k = 'h_' + m.index;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      if (uniq.length) {
        const w = Math.min(p.w * Math.sqrt(uniq.length), p.w * 4);
        humS += w;
        signals.push({ type: 'human', label: p.label, desc: p.desc, count: uniq.length, w: w.toFixed(1), pos: uniq.map(m => ({ s: m.index, e: m.index + m[0].length })) });
      }
    }
  }

  // Entropy adjustments
  if (Math.abs(charEnt - 4.8) < 0.5) aiS  += 1.5;
  if (Math.abs(charEnt - 4.8) > 1.2) humS += 1.5;
  if (comR > 0.3 && idC > 0.75) aiS  += 2.0;
  if (comR < 0.05 && idC < 0.5) humS += 1.5;

  // Line length variability
  const lines = code.split('\n').filter(l => l.trim());
  if (lines.length > 5) {
    const lens = lines.map(l => l.length);
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const std  = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
    const cv = std / (mean || 1);
    if (cv < 0.4) aiS += 1.2;
    if (cv > 0.8) humS += 1.0;
  }

  // Model weight
  const mw = { rf: 1.0, svm: 0.9, bert: 1.15, gcb: 1.2, sc: 1.05, ensemble: 1.3 }[window?.currentModel] || 1.0;
  aiS *= mw; humS *= mw;

  // AI probability calculations
  const tot = aiS + humS;
  const rawAi = tot > 0 ? aiS / tot : 0.5;
  const sf = Math.min(signals.length / 8, 1);
  const smoothed = rawAi * sf + 0.5 * (1 - sf);
  const lf = Math.min(code.length / 300, 1);
  const finalAi = smoothed * lf + 0.5 * (1 - lf);

  const conf = Math.min(Math.min(signals.length / 6, 1) * 0.7 + Math.min((aiS + humS) / 15, 1) * 0.3, 0.97);

  signals.sort((a, b) => parseFloat(b.w) - parseFloat(a.w));

  const aiPct = Math.round(finalAi * 100);
  const humPct = 100 - aiPct;
  const attr = computeAttr(code, aiPct);
  const ast = computeAST(code, dl);
  const heatRanges = signals.flatMap(s => s.pos?.map(p => ({ ...p, type: s.type })) || []);

  return {
    dl,
    aiPct,
    humPct,
    conf,
    signals,
    attr,
    ast,
    heatRanges,
    metrics: { charEnt, tokEnt, comR, cyc, idC, avgL }
  };
}

// ==========================================================
// AI SOURCE ATTRIBUTION
// ==========================================================
function computeAttr(code, aiPct) {
  const scores = { ChatGPT: 0, Claude: 0, Copilot: 0, Gemini: 0, DeepSeek: 0, Other: 0 };
  if (aiPct < 30) return scores;

  if (/comprehensive|straightforward|ensure that/i.test(code)) scores.ChatGPT += 3;
  if (/Args:|Returns:|Raises:/i.test(code)) scores.Claude += 2;
  if (/#\s*(Step \d|First,|Next,|Finally,)/i.test(code)) scores.Gemini += 2;
  if (/# Solution:|# Algorithm:/i.test(code)) scores.DeepSeek += 2;

  // Add small randomness
  scores.ChatGPT  += Math.random() * 2;
  scores.Claude   += Math.random() * 1.5;
  scores.Copilot  += Math.random() * 1.5;
  scores.Gemini   += Math.random() * 1.5;
  scores.DeepSeek += Math.random() * 1;
  scores.Other    += Math.random() * 1;

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const out = {};
  for (const [k, v] of Object.entries(scores)) out[k] = Math.round((v / total) * aiPct);
  return out;
}

// ==========================================================
// AST STRUCTURE ANALYSIS
// ==========================================================
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