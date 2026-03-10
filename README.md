<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=4e7bff&height=200&section=header&text=VibeDetect&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=AI%20vs%20Human%20Code%20Analyzer&descAlignY=58&descSize=20&animation=fadeIn" width="100%"/>

<p>
  <img src="https://img.shields.io/badge/version-2.0-4e7bff?style=for-the-badge&logo=semver&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-ES6-yellow.svg">
  <img src="https://img.shields.io/badge/license-MIT-2dd67a?style=for-the-badge&logo=opensourceinitiative&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/AST_Analysis-✓-4e7bff?style=flat-square"/>
  <img src="https://img.shields.io/badge/Shannon_Entropy-✓-4e7bff?style=flat-square"/>
  <img src="https://img.shields.io/badge/Pattern_Engine-✓-4e7bff?style=flat-square"/>
  <img src="https://img.shields.io/badge/Heatmap-✓-4e7bff?style=flat-square"/>
  <img src="https://img.shields.io/badge/GitHub_Scanner-✓-4e7bff?style=flat-square"/>
</p>

---

<p> <strong>Advanced code analysis tool that detects whether code is AI-generated or human-written using multi-layer detection pipeline</strong> </p>

---

## 🏗️ Architecture

```bash                            
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
├── css/             
│   ├── styles.css
│
├── js/                     
│    ├── patterns.js
│    ├── analysis.js
│    ├── render.js
│    ├── editor.js
│    ├── examples.js
│    ├── github.js
│    ├── app.js
│    └── loader.js
│
├── index.html   
└── README.md    
```

---

## 🚀 Quick Start
```bash
git clone https://github.com/RakkaEvandra06/TrackerSense.git
```

---

## ✨ Features
<table>
<tr>
<td width="50%">
🔍 Core Analysis

Multi-layer pipeline, 5 independent signals fused into one score
Language-aware patterns, Python, JS, TS, Java, C++, Go, Rust, PHP, Ruby, C#
Shannon entropy curve, visualized across 30 code segments
AST structural proxy, counts functions, classes, docstrings, type annotations
Identifier consistency, camelCase vs snake_case ratio analysis

</td>
<td width="50%">🎨 UI / UX

Live heatmap overlay, highlights AI vs Human patterns inline in the editor
Typing animation, Claude AI streams its analysis character-by-character
Scan line visual, animated sweep during analysis
Confidence bar + split bar, dual visual for AI/Human breakdown
Dark terminal aesthetic, JetBrains Mono + Syne typography

</td>
</tr>
<tr>
<td width="50%">
🐙 GitHub Integration

Live repo scanning, fetches real files via GitHub REST API
Parallel file processing, 5-thread concurrency pool
Per-file AI scoring, lightweight heuristic optimized for speed
Language breakdown, auto-detects language from file extension

</td>
<td width="50%">
🛡️ Accuracy & Honesty

False-positive mitigation, Bayesian smoothing on low-signal inputs
Code length factor, short snippets get conservative scores
Deterministic attribution, no random noise in AI source estimates
Clear simulation labels, ML model UI is labeled SIMULATED honestly

</td>
</tr>
</table>

---

## 📊 Understanding Results
Verdict Colors
🔴 Red	70-100%	Likely AI-Generated
🟢 Green	0-35%	Likely Human-Written
🟡 Yellow	35-70%	Mixed / Uncertain

Confidence Indicators
High Confidence (>70%): Multiple strong signals, clear patterns
Medium Confidence (40-70%): Some signals present, moderate certainty
Low Confidence (<30%): Few signals, ambiguous patterns

---

<p align="center"> Made with ❤️ by the VibeDetect Team </p><p align="center"> </p>