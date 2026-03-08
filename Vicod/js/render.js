// =====================================================================
// RENDER MODULE
// All DOM rendering / UI update functions
// =====================================================================

function renderResult(r) {
  // Verdict
  const box   = document.getElementById('verdict-box');
  const score = document.getElementById('v-score');
  const verd  = document.getElementById('v-verdict');
  const vsub  = document.getElementById('v-sub');
  score.textContent = r.aiPct + '%';
  box.className = 'verdict-box';

  if (r.aiPct >= 70) {
    box.classList.add('ai');
    score.className = 'v-score ai-col';
    verd.textContent = '🤖 Likely AI-Generated';
    vsub.textContent = `${(r.conf * 100).toFixed(0)}% confidence · ${r.signals.filter(s => s.type === 'ai').length} AI signals`;
  } else if (r.aiPct <= 35) {
    box.classList.add('human');
    score.className = 'v-score human-col';
    verd.textContent = '👤 Likely Human-Written';
    vsub.textContent = `${(r.conf * 100).toFixed(0)}% confidence · ${r.signals.filter(s => s.type === 'human').length} human signals`;
  } else {
    box.classList.add('mixed');
    score.className = 'v-score mixed-col';
    verd.textContent = '🔀 Mixed / Uncertain';
    vsub.textContent = `${(r.conf * 100).toFixed(0)}% confidence · Ambiguous patterns`;
  }

  // Confidence bar
  const cc = r.conf > 0.7 ? 'var(--human)' : r.conf > 0.4 ? 'var(--warn)' : 'var(--ai)';
  document.getElementById('conf-bar').style.cssText    = `width:${r.conf * 100}%;background:${cc};`;
  document.getElementById('conf-val').textContent      = `${(r.conf * 100).toFixed(0)}%`;
  document.getElementById('model-badge').textContent   = (window.currentModel || 'rf').toUpperCase();
  document.getElementById('split-ai').style.width      = r.aiPct + '%';
  document.getElementById('ai-lbl').textContent        = `🤖 ${r.aiPct}%`;
  document.getElementById('hu-lbl').textContent        = `${r.humPct}% 👤`;

  renderSignals(r.signals);
  renderAST(r.ast);
  renderEntropy(r.metrics);
  renderAttr(r.attr, r.aiPct);
  buildHmap(document.getElementById('editor').value, r.heatRanges);
  document.getElementById('hmap-btn').style.display = 'inline-flex';
}

// ===== SIGNALS =====
function renderSignals(sigs) {
  document.getElementById('sig-count').textContent = `${sigs.length} signals`;
  const body = document.getElementById('signals-body');
  if (!sigs.length) {
    body.innerHTML = `<div class="empty"><div class="empty-ico">📡</div><div class="empty-title">No signals detected</div><div class="empty-sub">Try a longer sample</div></div>`;
    return;
  }
  body.innerHTML = sigs.slice(0, 10).map((s, i) => `
    <div class="signal ${s.type}" style="animation-delay:${i * 0.04}s">
      <div class="sig-ico">${s.type === 'ai' ? '🤖' : '👤'}</div>
      <div style="flex:1;min-width:0;">
        <div class="sig-name" style="color:${s.type === 'ai' ? 'var(--ai)' : 'var(--human)'}">${s.label}</div>
        <div class="sig-desc">${s.desc} · ×${s.count}</div>
      </div>
      <div class="sig-wt">+${s.w}</div>
    </div>
  `).join('');
}

// ===== AST =====
function renderAST(f) {
  document.getElementById('ast-card').style.display = 'block';
  document.getElementById('ast-lang-badge').textContent = f.dl.toUpperCase();
  const col = f.nt === 'ai' ? 'ast-ai' : f.nt === 'human' ? 'ast-human' : 'ast-neutral';
  const vrd = f.nt === 'ai' ? '⚠ AI-likely structure' : f.nt === 'human' ? '✓ Human-likely structure' : '◈ Ambiguous structure';
  document.getElementById('ast-out').innerHTML = `
<span><span class="ast-key">ASTRoot</span> {</span>
<div class="ast-indent">
  <span class="ast-key">language</span>: <span class="ast-neutral">"${f.dl}"</span><br>
  <span class="ast-key">functions</span>: <span class="${col}">${f.fns}</span> <span class="ast-comment">// ${f.fns > 3 ? 'many→AI' : 'few→human'}</span><br>
  <span class="ast-key">classes</span>: <span class="${col}">${f.cls}</span><br>
  <span class="ast-key">imports</span>: <span class="${col}">${f.imp}</span><br>
  <span class="ast-key">decorators</span>: <span class="${col}">${f.dec}</span><br>
  <span class="ast-key">loops</span>: <span class="${col}">${f.loops}</span><br>
  <span class="ast-key">conditions</span>: <span class="${col}">${f.conds}</span><br>
  <span class="ast-key">try_blocks</span>: <span class="${col}">${f.tryb}</span> <span class="ast-comment">// ${f.tryb > 0 ? 'AI handles errors' : 'human skips try-catch'}</span><br>
  <span class="ast-key">docstrings</span>: <span class="${col}">${f.docs}</span> <span class="ast-comment">// ${f.docs > 0 ? 'AI documents thoroughly' : 'human rarely docs'}</span><br>
  <span class="ast-key">type_annotations</span>: <span class="${col}">${f.types}</span><br>
  <span class="ast-key">verdict</span>: <span class="${col}">"${vrd}"</span>
</div>
}`;
}

// ===== ENTROPY =====
function renderEntropy(m) {
  document.getElementById('ent-card').style.display = 'block';
  document.getElementById('metric-grid').innerHTML = `
    <div class="metric">
      <div class="metric-lbl">Char Entropy</div>
      <div class="metric-val" style="color:var(--accent);font-size:18px;">${m.charEnt.toFixed(2)}</div>
      <div class="metric-sub">${m.charEnt > 4.5 ? 'AI-like range' : 'Human-like range'}</div>
    </div>
    <div class="metric">
      <div class="metric-lbl">Token Entropy</div>
      <div class="metric-val" style="color:var(--accent);font-size:18px;">${m.tokEnt.toFixed(2)}</div>
      <div class="metric-sub">lexical diversity</div>
    </div>
    <div class="metric">
      <div class="metric-lbl">Comment Ratio</div>
      <div class="metric-val" style="color:var(--warn);font-size:18px;">${(m.comR * 100).toFixed(0)}%</div>
      <div class="metric-sub">${m.comR > 0.3 ? 'Heavy→AI' : 'Light→Human'}</div>
    </div>
    <div class="metric">
      <div class="metric-lbl">Cyclomatic</div>
      <div class="metric-val" style="color:var(--human);font-size:18px;">${m.cyc}</div>
      <div class="metric-sub">complexity score</div>
    </div>
    <div class="metric">
      <div class="metric-lbl">Avg Line</div>
      <div class="metric-val" style="color:var(--accent);font-size:18px;">${m.avgL.toFixed(0)}</div>
      <div class="metric-sub">chars per line</div>
    </div>
    <div class="metric">
      <div class="metric-lbl">ID Consistency</div>
      <div class="metric-val" style="color:${m.idC > 0.7 ? 'var(--ai)' : 'var(--human)'};font-size:18px;">${(m.idC * 100).toFixed(0)}%</div>
      <div class="metric-sub">${m.idC > 0.7 ? 'Uniform→AI' : 'Mixed→Human'}</div>
    </div>
  `;
  drawChart(m);
}

// ===== ENTROPY CHART =====
function drawChart(m) {
  const canvas = document.getElementById('ent-canvas');
  canvas.width  = canvas.offsetWidth || 600;
  canvas.height = 110;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a0d15';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = '#1c2236'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = (H * i) / 4;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  const code = document.getElementById('editor').value;
  const ss   = Math.max(Math.floor(code.length / 30), 10);
  const pts  = [];
  for (let i = 0; i < 30; i++) pts.push(shannonEnt(code.slice(i * ss, (i + 1) * ss) || ' '));
  const maxE = Math.max(...pts, 5);

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(92,124,250,0.35)');
  grad.addColorStop(1, 'rgba(92,124,250,0.02)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, H);
  pts.forEach((e, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - (e / maxE) * (H - 10) - 5;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(W, H);
  ctx.fill();

  // Line
  ctx.strokeStyle = '#5c7cfa'; ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((e, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - (e / maxE) * (H - 10) - 5;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // AI zone line
  const aiY = H - (4.8 / maxE) * (H - 10) - 5;
  ctx.strokeStyle = 'rgba(255,71,87,0.35)'; ctx.setLineDash([3, 4]);
  ctx.beginPath(); ctx.moveTo(0, aiY); ctx.lineTo(W, aiY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,71,87,0.6)';
  ctx.font = '9px Geist Mono,monospace';
  ctx.fillText('AI Zone', 4, aiY - 3);
}

// ===== ATTRIBUTION =====
function renderAttr(attr, aiPct) {
  if (aiPct < 30) { document.getElementById('attr-card').style.display = 'none'; return; }
  document.getElementById('attr-card').style.display = 'block';
  const colors = {
    ChatGPT: '#10a37f', Claude: '#cc785c', Copilot: '#8957e5',
    Gemini: '#4285f4', DeepSeek: '#1677ff', Other: '#5e6a8a',
  };
  document.getElementById('attr-body').innerHTML = Object.entries(attr)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, pct]) => `
      <div class="attr-row">
        <div class="attr-name">${name}</div>
        <div class="attr-bar-track"><div class="attr-bar" style="width:${Math.min(pct * 2, 100)}%;background:${colors[name] || '#5e6a8a'};"></div></div>
        <div class="attr-pct">${pct}%</div>
      </div>
    `).join('');
}

// ===== HEATMAP =====
function buildHmap(code, ranges) {
  const ov = document.getElementById('hmap');
  if (!ranges.length) { ov.innerHTML = ''; return; }
  ranges.sort((a, b) => a.s - b.s);
  let html = '', pos = 0;
  for (const r of ranges) {
    if (r.s > pos) html += esc(code.slice(pos, r.s));
    if (r.e > r.s && r.s >= pos) {
      const cls = r.type === 'ai' ? 'h-ai' : 'h-human';
      html += `<span class="${cls}">${esc(code.slice(r.s, r.e))}</span>`;
      pos = r.e;
    }
  }
  if (pos < code.length) html += esc(code.slice(pos));
  ov.innerHTML = html;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toggleHmap() {
  window.hmapOn = !window.hmapOn;
  const ov  = document.getElementById('hmap');
  const leg = document.getElementById('hleg');
  const ed  = document.getElementById('editor');
  const btn = document.getElementById('hmap-btn');
  if (window.hmapOn) {
    ov.classList.add('on'); leg.style.display = 'flex';
    ed.style.opacity = '0.12'; btn.textContent = '🌡️ Hide Heatmap';
  } else {
    ov.classList.remove('on'); leg.style.display = 'none';
    ed.style.opacity = '1'; btn.textContent = '🌡️ Heatmap';
  }
}

// ===== CLAUDE AI ANALYSIS =====
async function getClaudeAnalysis(code, aiPct) {
  const aiCard = document.getElementById('ai-card');
  const content = document.getElementById('ai-analysis-content');
  aiCard.style.display = 'block';
  content.className = 'ai-analysis-content streaming';
  content.innerHTML = '<span class="typing-cursor"></span>';

  const prompt = `You are an expert code analysis assistant. Analyze the following code and determine if it was written by AI or a human.

Code to analyze:
\`\`\`
${code.substring(0, 2000)}
\`\`\`

Our statistical analysis gives it an AI probability score of ${aiPct}%.

In 2-3 concise sentences, explain the key tell-tale signs you observe that support or challenge this score. Focus on: naming conventions, comment style, structural patterns, and overall "feel" of the code. Be specific and mention concrete observations from the actual code.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await resp.json();
    const text = data.content?.map(b => b.text || '').join('') || 'Analysis unavailable.';

    content.innerHTML = '';
    content.className = 'ai-analysis-content';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    content.appendChild(cursor);

    const type = () => {
      if (i < text.length) {
        cursor.before(document.createTextNode(text[i]));
        i++;
        setTimeout(type, 12);
      } else {
        cursor.remove();
      }
    };
    type();
  } catch (e) {
    content.className = 'ai-analysis-content';
    content.textContent = 'Claude analysis unavailable (API connection required). Statistical analysis complete above.';
  }
}

// ===== RESET VERDICT UI =====
function resetVerdict() {
  document.getElementById('v-score').textContent = '—';
  document.getElementById('v-score').className = 'v-score idle-col';
  document.getElementById('v-verdict').textContent = 'Awaiting Analysis';
  document.getElementById('v-sub').textContent = 'Paste code & click Analyze';
  document.getElementById('verdict-box').className = 'verdict-box';
  document.getElementById('conf-bar').style.width = '0%';
  document.getElementById('conf-val').textContent = '0%';
  document.getElementById('split-ai').style.width = '50%';
  document.getElementById('ai-lbl').textContent = '—';
  document.getElementById('hu-lbl').textContent = '—';
  document.getElementById('signals-body').innerHTML = `<div class="empty"><div class="empty-ico">📡</div><div class="empty-title">No signals yet</div><div class="empty-sub">Run analysis to detect patterns</div></div>`;
  document.getElementById('sig-count').textContent = '0 signals';
  document.getElementById('model-badge').textContent = 'IDLE';
  document.getElementById('det-lang').textContent = 'AUTO';
}
