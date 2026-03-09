// Helpers ──────────────────────────────────────────────────────────────────

async function loadComponent(slotId, filePath) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status} loading ${filePath}`);
    const html = await res.text();
    document.getElementById(slotId).innerHTML = html;
  } catch (err) {
    console.error(`[loader] Failed to load component "${filePath}":`, err);
    document.getElementById(slotId).innerHTML =
      `<p class="load-error" role="alert">⚠️ Could not load component: ${filePath}</p>`;
  }
}

// File Upload Validation ───────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = new Set([
  'py','js','ts','java','cpp','go','rs','php','rb','cs',
  'jsx','tsx','vue','swift','kt'
]);
const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500 KB

function validateFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return `File type ".${ext}" is not supported. Please upload a code file.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const kb = Math.round(file.size / 1024);
    return `File is too large (${kb} KB). Maximum allowed size is 500 KB.`;
  }
  return null; // valid
}

function showFileError(msg) {
  const el = document.getElementById('file-error');
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
}

// Tab Navigation ───────────────────────────────────────────────────────────

function initTabs() {
  const tabs  = document.querySelectorAll('[role="tab"]');
  const pages = document.querySelectorAll('.page');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('aria-controls');

      // Deactivate all
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      pages.forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });

      // Activate selected
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const page = document.getElementById(targetId);
      if (page) {
        page.classList.add('active');
        page.hidden = false;
      }
    });

    // Keyboard: arrow keys to move between tabs
    tab.addEventListener('keydown', e => {
      const all = [...tabs];
      const idx = all.indexOf(tab);
      if (e.key === 'ArrowRight') all[(idx + 1) % all.length].focus();
      if (e.key === 'ArrowLeft')  all[(idx - 1 + all.length) % all.length].focus();
    });
  });
}

// Footer Navigation ────────────────────────────────────────────────────────

function initFooterNav() {
  const footerLinks = document.querySelectorAll('.footer-link[data-tab]');

  footerLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault(); // cegah scroll ke atas akibat href="#"

      const targetTab = link.getAttribute('data-tab');

      // Cari tab button yang sesuai dan klik secara programatik
      const tabBtn = document.querySelector(`[role="tab"][data-tab="${targetTab}"]`);
      if (tabBtn) {
        tabBtn.click();         // trigger tab switching
        tabBtn.scrollIntoView({ behavior: 'smooth', block: 'start' }); // scroll ke nav
      }
    });
  });
}

// Dataset Tab Switcher ─────────────────────────────────────────────────────

function initDatasetTabs() {
  const tabs = document.querySelectorAll('[data-ex-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('ex-tab--active');
        t.setAttribute('aria-selected', 'false');
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = true;
      });
      tab.classList.add('ex-tab--active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = false;
    });
  });
}

// Language Selector ────────────────────────────────────────────────────────

function initLangBar() {
  const btns = document.querySelectorAll('.lang-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      if (typeof setLang === 'function') {
        setLang(btn.dataset.lang, btn);
      }
    });
  });
}

// Model Selector ───────────────────────────────────────────────────────────

function initModelGrid() {
  const cards = document.querySelectorAll('[data-model]');
  cards.forEach(card => {
    const activate = () => {
      cards.forEach(c => {
        c.classList.remove('model-card--active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('model-card--active');
      card.setAttribute('aria-checked', 'true');
      if (typeof pickModel === 'function') pickModel(card, card.dataset.model);
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

// Editor Buttons ───────────────────────────────────────────────────────────

function initEditorButtons() {
  const analyzeBtn   = document.getElementById('analyzeBtn');
  const clearBtn     = document.getElementById('clearBtn');
  const hmapBtn      = document.getElementById('hmap-btn');
  const loadAiBtn    = document.getElementById('loadAiExBtn');
  const loadHumanBtn = document.getElementById('loadHumanExBtn');
  const fileInput    = document.getElementById('file-upload');
  const editorEl     = document.getElementById('editor');

  if (analyzeBtn)   analyzeBtn.addEventListener('click', () => typeof doAnalyze  === 'function' && doAnalyze());
  if (clearBtn)     clearBtn.addEventListener('click',   () => typeof clearAll   === 'function' && clearAll());
  if (hmapBtn)      hmapBtn.addEventListener('click',    () => typeof toggleHmap === 'function' && toggleHmap());
  if (loadAiBtn)    loadAiBtn.addEventListener('click',  () => typeof loadEx     === 'function' && loadEx('ai'));
  if (loadHumanBtn) loadHumanBtn.addEventListener('click',() => typeof loadEx    === 'function' && loadEx('human'));

  if (editorEl) {
    editorEl.addEventListener('input',   () => typeof onInput   === 'function' && onInput());
    editorEl.addEventListener('keydown', e  => typeof handleTab === 'function' && handleTab(e));
    editorEl.addEventListener('keyup',   () => typeof updateLC  === 'function' && updateLC());
    editorEl.addEventListener('click',   () => typeof updateLC  === 'function' && updateLC());
  }

  if (fileInput) {
    fileInput.addEventListener('change', e => {
      showFileError('');
      const file = e.target.files[0];
      if (!file) return;
      const err = validateFile(file);
      if (err) {
        showFileError(err);
        fileInput.value = '';
        return;
      }
      if (typeof onFile === 'function') onFile(e);
    });
  }
}

// GitHub Scanner ───────────────────────────────────────────────────────────

function initGitHub() {
  const scanBtn = document.getElementById('ghScanBtn');
  if (scanBtn) {
    scanBtn.addEventListener('click', () => typeof ghScanReal === 'function' && ghScanReal());
  }
}

// Dataset Examples ────────────────────────────────────────────────────────

function initDatasetExamples() {
  const items = document.querySelectorAll('[data-example]');
  items.forEach(item => {
    item.addEventListener('click', () => {
      if (typeof runExample === 'function') runExample(item.dataset.example);
    });
  });
}

// Bootstrap ───────────────────────────────────────────────────────────────

async function bootstrap() {
  await Promise.all([
    loadComponent('slot-header',  'components/header.html'),
    loadComponent('slot-analyze', 'components/editor.html'),
    loadComponent('slot-github',  'components/github.html'),
    loadComponent('slot-models',  'components/models.html'),
    loadComponent('slot-dataset', 'components/dataset.html'),
    loadComponent('slot-about',   'components/about.html'),
    loadComponent('slot-footer',  'components/footer.html'),
  ]);

  // Wire up semua interaksi setelah DOM terisi
  initTabs();
  initLangBar();
  initModelGrid();
  initEditorButtons();
  initGitHub();
  initDatasetTabs();
  initDatasetExamples();
  initFooterNav(); // ← navigasi footer
}

document.addEventListener('DOMContentLoaded', bootstrap);