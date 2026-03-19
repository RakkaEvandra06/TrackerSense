// ────────────────────────────────────────────────────────────────
// EVENT HANDLER MAIN
// ────────────────────────────────────────────────────────────────
function onInput() {
  updateGutter();
  updateLC();
  updateInfo();
  if (window.hmapOn) toggleHmap();
}
// ────────────────────────────────────────────────────────────────
// UPDATE GUTTER (LINE NUMBERS)
// ────────────────────────────────────────────────────────────────
function updateGutter() {
  const editor = document.getElementById('editor');
  const gutter = document.getElementById('gutter');
  const n = editor.value.split('\n').length;

// ────────────────────────────────────────────────────────────────
// SAFE FROM XSS
// ────────────────────────────────────────────────────────────────
  gutter.textContent = ''; // reset
  for (let i = 1; i <= n; i++) {
    const lineEl = document.createElement('div');
    lineEl.textContent = i;
    gutter.appendChild(lineEl);
  }
}

// ────────────────────────────────────────────────────────────────
// UPDATE LINE & COLUMN POSITION
// ────────────────────────────────────────────────────────────────
function updateLC() {
  const editor = document.getElementById('editor');
  const valueBeforeCursor = editor.value.substr(0, editor.selectionStart);
  const lines = valueBeforeCursor.split('\n');
  const lineNumber = lines.length;
  const colNumber = lines[lines.length - 1].length + 1;

  document.getElementById('lc').textContent = `Ln ${lineNumber}, Col ${colNumber}`;
}

// ────────────────────────────────────────────────────────────────
// UPDATE INFO TOTAL CHARACTER & LINE COUNT
// ────────────────────────────────────────────────────────────────
function updateInfo() {
  const editor = document.getElementById('editor');
  const value = editor.value;
  const lineCount = value.split('\n').length;
  document.getElementById('linfo').textContent = `${value.length} chars · ${lineCount} lines`;
}

// ────────────────────────────────────────────────────────────────
// HANDLER TAB FOR INLINE
// ────────────────────────────────────────────────────────────────
function handleTab(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    el.value = el.value.substring(0, start) + '  ' + el.value.substring(end);
    el.selectionStart = el.selectionEnd = start + 2;

    updateGutter();
  }
}

// ────────────────────────────────────────────────────────────────
// SET LANGUAGE
// ────────────────────────────────────────────────────────────────
function setLang(lang, el) {
  window.currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  el.classList.add('active');
}

// ────────────────────────────────────────────────────────────────
// HANDLE FILE UPLOAD
// ────────────────────────────────────────────────────────────────
function onFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const allowedExt = ['py','js','ts','java','cpp','go','rs','php','rb','cs','jsx','tsx'];
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedExt.includes(ext)) {
    alert('File type not supported!');
    return;
  }

  const reader = new FileReader();
  reader.onload = ev => {
    const editor = document.getElementById('editor');
    editor.value = ev.target.result;

    updateGutter();
    updateInfo();

// ────────────────────────────────────────────────────────────────
// SET LANGUAGE AUTOMATIC IF THERE IS MAPPING
// ────────────────────────────────────────────────────────────────
    const em = { py: 'python', js: 'javascript', ts: 'typescript', java: 'java', cpp: 'cpp', go: 'go', rs: 'rust', php: 'php', rb: 'ruby', cs: 'cs', jsx: 'javascript', tsx: 'typescript' };
    if (em[ext]) window.currentLang = em[ext];
  };
  reader.readAsText(file);
}

// ────────────────────────────────────────────────────────────────
// OVERLAY
// ────────────────────────────────────────────────────────────────
function showOverlay(on) {
  document.getElementById('overlay').className = on ? 'overlay on' : 'overlay';
}

// ────────────────────────────────────────────────────────────────
// CLEAR CODE
// ────────────────────────────────────────────────────────────────
function clearAll() {
  const editor = document.getElementById('editor');
  editor.value = '';

  const hmap = document.getElementById('hmap');
  hmap.textContent = '';
  hmap.classList.remove('on');

  document.getElementById('hleg').style.display = 'none';
  document.getElementById('ast-card').style.display = 'none';
  document.getElementById('ent-card').style.display = 'none';
  document.getElementById('attr-card').style.display = 'none';
  document.getElementById('ai-card').style.display = 'none';

  editor.style.opacity = '1';
  window.hmapOn = false;

  updateGutter();
  updateInfo();
  resetVerdict();
}

// ────────────────────────────────────────────────────────────────
// SYNC SCROLL EDITOR & GUTTER
// ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
  editor.addEventListener('scroll', () => {
    document.getElementById('gutter').scrollTop = editor.scrollTop;
    document.getElementById('hmap').scrollTop   = editor.scrollTop;
  });

  updateGutter();
});