// ────────────────────────────────────────────────────────────────
// CONFIG & CONSTANTS
// ────────────────────────────────────────────────────────────────
const CONFIG = {
  MAX_FILE_SIZE_KB: 500,
  ALLOWED_EXTENSIONS: new Set([
    'py','js','ts','java','cpp','go','rs','php','rb','cs',
    'jsx','tsx','vue','swift','kt'
  ])
};
CONFIG.MAX_FILE_SIZE_BYTES = CONFIG.MAX_FILE_SIZE_KB * 1024;

const COMPONENTS_WHITELIST = new Set([
  "components/header.html",
  "components/editor.html",
  "components/github.html",
  "components/models.html",
  "components/dataset.html",
  "components/about.html",
  "components/footer.html"
]);

const ALLOWED_MIME = {
  py: "text/x-python",
  js: "application/javascript",
  ts: "application/typescript",
  java: "text/x-java-source",
  cpp: "text/x-c",
  go: "text/x-go",
  rs: "text/rust",
  php: "application/x-php",
  rb: "application/x-ruby",
  cs: "text/plain",
  jsx: "text/jsx",
  tsx: "text/tsx",
  vue: "text/html",
  swift: "text/x-swift",
  kt: "text/x-kotlin"
};

// ────────────────────────────────────────────────────────────────
// DOM UTILS
// ────────────────────────────────────────────────────────────────
const DOM = {
  get: id => document.getElementById(id),
  qs: sel => document.querySelector(sel),
  qsa: sel => document.querySelectorAll(sel)
};

function clearActive(elements, className, ariaAttr) {
  elements.forEach(el => {
    el.classList.remove(className);
    if (ariaAttr) el.setAttribute(ariaAttr, "false");
  });
}

// ────────────────────────────────────────────────────────────────
// GENERAL UTILS
// ────────────────────────────────────────────────────────────────
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function safeCall(fn, ...args) {
  if (typeof fn === "function") fn(...args);
}

// ────────────────────────────────────────────────────────────────
// SECURE COMPONENT LOADER
// ────────────────────────────────────────────────────────────────
async function loadComponent(slotId, filePath) {
  const slot = DOM.get(slotId);
  if (!slot) return;

  if (!COMPONENTS_WHITELIST.has(filePath)) {
    slot.textContent = `⚠️ Invalid component path: ${filePath}`;
    return;
  }

  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // ────── SANITIZE HTML ──────
    doc.querySelectorAll("script").forEach(s => s.remove());
    ["iframe","object","embed"].forEach(tag =>
      doc.querySelectorAll(tag).forEach(e => e.remove())
    );
    doc.querySelectorAll("*").forEach(el => {
      [...el.attributes].forEach(attr => {
        if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
      });
    });

    slot.replaceChildren(...doc.body.children);

  } catch (err) {
    console.error(`[loader] Failed to load "${filePath}"`, err);
    slot.textContent = `⚠️ Could not load component: ${filePath}`;
  }
}

// ────────────────────────────────────────────────────────────────
// SECURE FILE VALIDATION
// ────────────────────────────────────────────────────────────────
function validateFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (!CONFIG.ALLOWED_EXTENSIONS.has(ext)) {
    return `File type ".${ext}" is not supported.`;
  }

  if (file.size > CONFIG.MAX_FILE_SIZE_BYTES) {
    const kb = Math.round(file.size / 1024);
    return `File too large (${kb} KB). Max ${CONFIG.MAX_FILE_SIZE_KB} KB.`;
  }

  if (file.type && ALLOWED_MIME[ext] && file.type !== ALLOWED_MIME[ext]) {
    return `File MIME type mismatch for ".${ext}".`;
  }

  return null;
}

function showFileError(msg) {
  const el = DOM.get("file-error");
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
}

// ────────────────────────────────────────────────────────────────
// TAB NAVIGATION
// ────────────────────────────────────────────────────────────────
function initTabs() {
  document.addEventListener("click", e => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;

    const tabs = DOM.qsa('[role="tab"]');
    const pages = DOM.qsa(".page");
    const targetId = tab.getAttribute("aria-controls");

    clearActive(tabs, "active", "aria-selected");

    pages.forEach(p => {
      p.classList.remove("active");
      p.hidden = true;
    });

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    const page = DOM.get(targetId);
    if (page) {
      page.classList.add("active");
      page.hidden = false;
    }
  });
}

// ────────────────────────────────────────────────────────────────
// FOOTER NAVIGATION
// ────────────────────────────────────────────────────────────────
function initFooterNav() {
  document.addEventListener("click", e => {
    const link = e.target.closest(".footer-link[data-tab]");
    if (!link) return;

    e.preventDefault();
    const targetTab = link.dataset.tab;
    const tabBtn = DOM.qs(`[role="tab"][data-tab="${targetTab}"]`);

    if (tabBtn) {
      tabBtn.click();
      tabBtn.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

// ────────────────────────────────────────────────────────────────
// DATASET TABS
// ────────────────────────────────────────────────────────────────
function initDatasetTabs() {
  document.addEventListener("click", e => {
    const tab = e.target.closest("[data-ex-tab]");
    if (!tab) return;

    const tabs = DOM.qsa("[data-ex-tab]");
    tabs.forEach(t => {
      t.classList.remove("ex-tab--active");
      t.setAttribute("aria-selected", "false");
      const panel = DOM.get(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = true;
    });

    tab.classList.add("ex-tab--active");
    tab.setAttribute("aria-selected", "true");
    const panel = DOM.get(tab.getAttribute("aria-controls"));
    if (panel) panel.hidden = false;
  });
}

// ────────────────────────────────────────────────────────────────
// LANGUAGE SELECTOR
// ────────────────────────────────────────────────────────────────
function initLangBar() {
  document.addEventListener("click", e => {
    const btn = e.target.closest(".lang-btn");
    if (!btn) return;

    const btns = DOM.qsa(".lang-btn");
    btns.forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });

    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    safeCall(window.setLang, btn.dataset.lang, btn);
  });
}

// ────────────────────────────────────────────────────────────────
// MODEL SELECTOR
// ────────────────────────────────────────────────────────────────
function initModelGrid() {
  document.addEventListener("click", e => {
    const card = e.target.closest("[data-model]");
    if (!card) return;

    const cards = DOM.qsa("[data-model]");
    cards.forEach(c => {
      c.classList.remove("model-card--active");
      c.setAttribute("aria-checked", "false");
    });

    card.classList.add("model-card--active");
    card.setAttribute("aria-checked", "true");
    safeCall(window.pickModel, card, card.dataset.model);
  });
}

// ────────────────────────────────────────────────────────────────
// EDITOR CONTROLS
// ────────────────────────────────────────────────────────────────
function initEditorButtons() {
  const editor = DOM.get("editor");

  DOM.get("analyzeBtn")?.addEventListener("click", () => safeCall(window.doAnalyze));
  DOM.get("clearBtn")?.addEventListener("click", () => safeCall(window.clearAll));
  DOM.get("hmap-btn")?.addEventListener("click", () => safeCall(window.toggleHmap));
  DOM.get("loadAiExBtn")?.addEventListener("click", () => safeCall(window.loadEx, "ai"));
  DOM.get("loadHumanExBtn")?.addEventListener("click", () => safeCall(window.loadEx, "human"));

  if (editor) {
    editor.addEventListener("input", debounce(() => safeCall(window.onInput), 250));
    editor.addEventListener("keydown", e => safeCall(window.handleTab, e));
    editor.addEventListener("keyup", () => safeCall(window.updateLC));
    editor.addEventListener("click", () => safeCall(window.updateLC));
  }

  const fileInput = DOM.get("file-upload");
  if (fileInput) {
    fileInput.addEventListener("change", e => {
      showFileError("");
      const file = e.target.files[0];
      if (!file) return;

      const err = validateFile(file);
      if (err) {
        showFileError(err);
        fileInput.value = "";
        return;
      }

      safeCall(window.onFile, e);
    });
  }
}

// ────────────────────────────────────────────────────────────────
// GITHUB SCANNER
// ────────────────────────────────────────────────────────────────
function initGitHub() {
  DOM.get("ghScanBtn")?.addEventListener("click", () => safeCall(window.ghScanReal));
}

// ────────────────────────────────────────────────────────────────
// DATASET EXAMPLES
// ────────────────────────────────────────────────────────────────
function initDatasetExamples() {
  document.addEventListener("click", e => {
    const item = e.target.closest("[data-example]");
    if (!item) return;

    safeCall(window.runExample, item.dataset.example);
  });
}

// ────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ────────────────────────────────────────────────────────────────
async function bootstrap() {
  await Promise.all([
    loadComponent("slot-header", "components/header.html"),
    loadComponent("slot-analyze", "components/editor.html"),
    loadComponent("slot-github", "components/github.html"),
    loadComponent("slot-models", "components/models.html"),
    loadComponent("slot-dataset", "components/dataset.html"),
    loadComponent("slot-about", "components/about.html"),
    loadComponent("slot-footer", "components/footer.html")
  ]);

  initTabs();
  initLangBar();
  initModelGrid();
  initEditorButtons();
  initGitHub();
  initDatasetTabs();
  initDatasetExamples();
  initFooterNav();
}

document.addEventListener("DOMContentLoaded", bootstrap);