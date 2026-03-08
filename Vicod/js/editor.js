// =====================================================================
// EDITOR MODULE
// Editor helpers: gutter, line/col, file upload, tab handling
// =====================================================================

function onInput() {
  updateGutter();
  updateLC();
  updateInfo();
  if (window.hmapOn) toggleHmap();
}

function updateGutter() {
  const n = document.getElementById('editor').value.split('\n').length;
  document.getElementById('gutter').innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>');
}

function updateLC() {
  const el = document.getElementById('editor');
  const v  = el.value.substr(0, el.selectionStart);
  const ls = v.split('\n');
  document.getElementById('lc').textContent = `Ln ${ls.length}, Col ${ls[ls.length - 1].length + 1}`;
}

function updateInfo() {
  const v = document.getElementById('editor').value;
  document.getElementById('linfo').textContent = `${v.length} chars · ${v.split('\n').length} lines`;
}

function handleTab(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const el = e.target, s = el.selectionStart, en = el.selectionEnd;
    el.value = el.value.substring(0, s) + '  ' + el.value.substring(en);
    el.selectionStart = el.selectionEnd = s + 2;
    updateGutter();
  }
}

function setLang(l, el) {
  window.currentLang = l;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function onFile(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    document.getElementById('editor').value = ev.target.result;
    updateGutter();
    updateInfo();
    const ext = f.name.split('.').pop().toLowerCase();
    const em = { py: 'python', js: 'javascript', ts: 'typescript', java: 'java', cpp: 'cpp', go: 'go', rs: 'rust', php: 'php', rb: 'ruby', cs: 'cs', jsx: 'javascript', tsx: 'typescript' };
    if (em[ext]) window.currentLang = em[ext];
  };
  r.readAsText(f);
}

function showOverlay(on) {
  document.getElementById('overlay').className = on ? 'overlay on' : 'overlay';
}

function clearAll() {
  document.getElementById('editor').value = '';
  document.getElementById('hmap').innerHTML = '';
  document.getElementById('hmap').classList.remove('on');
  document.getElementById('hleg').style.display = 'none';
  document.getElementById('hmap-btn').style.display = 'none';
  document.getElementById('ast-card').style.display = 'none';
  document.getElementById('ent-card').style.display = 'none';
  document.getElementById('attr-card').style.display = 'none';
  document.getElementById('ai-card').style.display = 'none';
  document.getElementById('editor').style.opacity = '1';
  window.hmapOn = false;
  updateGutter();
  updateInfo();
  resetVerdict();
}

// ===== EDITOR SCROLL SYNC =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('editor').addEventListener('scroll', function () {
    document.getElementById('gutter').scrollTop = this.scrollTop;
    document.getElementById('hmap').scrollTop   = this.scrollTop;
  });
  updateGutter();
});
