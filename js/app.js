// =====================================================================
// APP MODULE
// Main controller: state, tab navigation, model selection, doAnalyze
// =====================================================================

// ===== GLOBAL STATE =====
window.currentLang  = 'auto';
window.currentModel = 'rf';
window.hmapOn       = false;
window.lastResult   = null;

// ===== TAB SWITCHING =====
function goTab(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (el) {
    el.classList.add('active');
  } else {
    document.querySelectorAll('.nav-tab').forEach(b => {
      if (b.getAttribute('onclick')?.includes(`'${id}'`)) b.classList.add('active');
    });
  }
}

// ===== ML MODEL SELECTION =====
function pickModel(el, m) {
  document.querySelectorAll('.model-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  window.currentModel = m;

  const info = {
    rf:       ['🌲', 'Random Forest',       'Ensemble of decision trees on AST features'],
    svm:      ['⚙️', 'Support Vector Machine','TF-IDF token feature vectors'],
    bert:     ['🧠', 'CodeBERT',              'Fine-tuned for AI authorship detection'],
    gcb:      ['🕸️', 'GraphCodeBERT',        'Graph structural + semantic embeddings'],
    sc:       ['⭐', 'StarCoder',             'Token-level embedding analysis'],
    ensemble: ['🎯', 'Ensemble (All Models)', 'Weighted vote — best accuracy'],
  };
  const [ic, nm, ds] = info[m] || ['🤖', m, ''];
  document.getElementById('m-icon').textContent = ic;
  document.getElementById('m-name').textContent = nm;
  document.getElementById('m-desc').textContent = ds;
}

// ===== MAIN ANALYZE =====
async function doAnalyze() {
  const code = document.getElementById('editor').value.trim();
  if (!code || code.length < 20) {
    alert('Please enter at least some code to analyze.');
    return;
  }

  showOverlay(true);

  const steps = [
    'Detecting language...',
    'Running AST analysis...',
    'Computing Shannon entropy...',
    'Pattern matching...',
    'Applying ML weights...',
    'Normalizing scores...',
    'Querying Claude AI...',
    'Finalizing verdict...',
  ];

  let step = 0;
  const iv = setInterval(() => {
    document.getElementById('spinner-text').textContent = steps[step % steps.length];
    step++;
    if (step >= steps.length) {
      clearInterval(iv);
      const result = runAnalysis(code);
      window.lastResult = result;
      renderResult(result);
      showOverlay(false);
      // Claude AI analysis in background
      getClaudeAnalysis(code, result.aiPct);
    }
  }, 240);

  // Scan line animation
  const sl = document.getElementById('scan');
  sl.className = 'scan-line on';
  setTimeout(() => sl.className = 'scan-line', 2000);
}
