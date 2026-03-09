<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=4e7bff&height=200&section=header&text=VibeDetect&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=AI%20vs%20Human%20Code%20Analyzer&descAlignY=58&descSize=20&animation=fadeIn" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/version-2.0.0-4e7bff?style=for-the-badge&logo=semver&logoColor=white"/>
  <img src="https://img.shields.io/badge/license-MIT-2dd67a?style=for-the-badge&logo=opensourceinitiative&logoColor=white"/>
  <img src="https://img.shields.io/badge/Claude_AI-Sonnet_4-cc785c?style=for-the-badge&logo=anthropic&logoColor=white"/>
  <img src="https://img.shields.io/badge/vanilla_JS-no_framework-ffb020?style=for-the-badge&logo=javascript&logoColor=black"/>
</p>

<p>
  <img src="https://img.shields.io/badge/AST_Analysis-✓-4e7bff?style=flat-square"/>
  <img src="https://img.shields.io/badge/Shannon_Entropy-✓-4e7bff?style=flat-square"/>
  <img src="https://img.shields.io/badge/Pattern_Engine-✓-4e7bff?style=flat-square"/>
  <img src="https://img.shields.io/badge/Heatmap-✓-4e7bff?style=flat-square"/>
  <img src="https://img.shields.io/badge/GitHub_Scanner-✓-4e7bff?style=flat-square"/>
  <img src="https://img.shields.io/badge/Claude_AI-✓-a78bfa?style=flat-square"/>
</p>
<br/><br/>

<img src="https://user-images.githubusercontent.com/placeholder/demo.gif" alt="VibeDetect Demo" width="85%" style="border-radius:12px; border: 1px solid #1a2038;"/>
<br/><br/>
</div>

---

## 🏗️ Architecture

```bash
vibedetect/
├── index.html              
├── styles.css              
│
├── components/             
│   ├── header.html
│   ├── editor.html         
│   ├── github.html
│   ├── models.html
│   ├── dataset.html
│   ├── about.html
│   └── footer.html
│
└── js/                     
    ├── patterns.js         
    ├── analysis.js         
    ├── render.js           
    ├── editor.js           
    ├── examples.js         
    ├── github.js           
    ├── app.js              
    └── loader.js           
```

---

## 🚀 Quick Start
Option 1 — Just open it (no build needed)
```bash
bashgit clone https://github.com/RakkaEvandra06/TrackerSense.git
cd Vicod
```

---

## ✨ Features
<table>
<tr>
<td width="50%">
🔍 Core Analysis

Multi-layer pipeline — 5 independent signals fused into one score
Language-aware patterns — Python, JS, TS, Java, C++, Go, Rust, PHP, Ruby, C#
Shannon entropy curve — visualized across 30 code segments
AST structural proxy — counts functions, classes, docstrings, type annotations
Identifier consistency — camelCase vs snake_case ratio analysis

</td>
<td width="50%">
🎨 UI / UX

Live heatmap overlay — highlights AI vs Human patterns inline in the editor
Typing animation — Claude AI streams its analysis character-by-character
Scan line visual — animated sweep during analysis
Confidence bar + split bar — dual visual for AI/Human breakdown
Dark terminal aesthetic — JetBrains Mono + Syne typography

</td>
</tr>
<tr>
<td width="50%">
🐙 GitHub Integration

Live repo scanning — fetches real files via GitHub REST API
Parallel file processing — 5-thread concurrency pool
Per-file AI scoring — lightweight heuristic optimized for speed
Language breakdown — auto-detects language from file extension

</td>
<td width="50%">
🛡️ Accuracy & Honesty

False-positive mitigation — Bayesian smoothing on low-signal inputs
Code length factor — short snippets get conservative scores
Deterministic attribution — no random noise in AI source estimates
Clear simulation labels — ML model UI is labeled SIMULATED honestly

</td>
</tr>
</table>

---

## ⚠️ Known Limitations
<details>
<summary><b>Read before relying on scores</b></summary>

Not a real ML classifier. The "ML models" are multipliers on a rule-based heuristic engine, not trained neural networks.
Short code gets conservative scores. Snippets under ~100 chars are smoothed toward 50%.
AI attribution is heuristic-only. The ChatGPT/Claude/Copilot percentages are pattern-based estimates, not cryptographic fingerprints.
AST parsing is fake. computeAST() uses regex counting, not a real syntax tree parser. It's labeled correctly in the UI.
No adversarial robustness. Adding a few # TODO comments to AI-generated code will lower the AI score.
Claude API key is browser-exposed. Move to a backend proxy before deploying publicly.
GitHub API rate limits. Unauthenticated scans are limited to 60 requests/hour.

</details>