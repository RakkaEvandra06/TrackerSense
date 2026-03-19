// =====================================================================
// PATTERNS ENGINE
// AI and Human detection patterns per language
// =====================================================================

const AI_P = {
  universal: [
    { re: /\b(comprehensive|straightforward|implementation|functionality|demonstrates?|approach|ensure|utilize)\b/gi, w: 1.2, label: 'AI vocabulary', desc: 'Descriptive terms common in AI output' },
    { re: /"""[\s\S]{50,}?"""/g, w: 2.0, label: 'Verbose docstring', desc: 'Exhaustive docstrings typical of AI' },
    { re: /\/\*\*[\s\S]{80,}?\*\//g, w: 1.8, label: 'JSDoc block', desc: 'Detailed JSDoc comment blocks' },
    { re: /\b(Args|Returns|Raises|Example|Note):\s*\n/gi, w: 1.5, label: 'Docblock sections', desc: 'Formal docblock section headers' },
    { re: /\b(step \d+|first,? |second,? |third,? |finally,? )/gi, w: 1.3, label: 'Enumerated logic', desc: 'Numbered comments / explanations' },
    { re: /# (This function|This method|This class|Here we|We (use|define|create|check|handle))/gi, w: 1.6, label: 'Explanatory comments', desc: 'Self-explaining narrative comments' },
    { re: /(?:result|output|response|value|data)_(?:dict|list|array|map|set)\b/gi, w: 1.1, label: 'Verbose naming', desc: 'Compound descriptive variable names' },
  ],
  python: [
    { re: /def \w+\([^)]*\)\s*->\s*\w+[\[\w, ]*\]?:/g, w: 1.4, label: 'Typed function', desc: 'Full return type annotations' },
    { re: /:\s*\n\s+"""/g, w: 1.5, label: 'Function docstring', desc: 'Immediately documented functions' },
    { re: /raise \w+Error\(['"]/gi, w: 1.0, label: 'Explicit error raise', desc: 'Descriptive error messages' },
  ],
  javascript: [
    { re: /\/\*\*\s*\n[\s\S]*?@param[\s\S]*?\*\//g, w: 1.8, label: 'JSDoc @param', desc: 'Formal parameter documentation' },
    { re: /async\s+function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{0,30}try\s*\{/g, w: 1.3, label: 'Async + try/catch', desc: 'AI wraps async in try-catch' },
  ],
  java: [
    { re: /\/\*\*[\s\S]*?@param[\s\S]*?@return[\s\S]*?\*\//g, w: 1.9, label: 'Full Javadoc', desc: 'Complete Javadoc' },
  ],
};

const HUMAN_P = {
  universal: [
    { re: /\b(TODO|FIXME|HACK|XXX|BUG|TEMP|WTF|wtf)\b/gi, w: 2.5, label: 'TODO/HACK', desc: 'Developers leave TODO markers, AI rarely does' },
    { re: /\b(tmp|temp|x|y|z|i|j|k|n|m|s|t|p|q|v|a|b|c|d)\s*[=+\-*/]/g, w: 1.3, label: 'Single-letter var', desc: 'Abbreviations typical of human code' },
    { re: /\/\/.*commented.*out|#.*old.*code|#.*remove|\/\/.*delete/gi, w: 2.2, label: 'Commented-out note', desc: 'Humans note removed code explicitly' },
    { re: /print\s*\(\s*["']debug|console\.log\s*\(\s*["']debug/gi, w: 1.8, label: 'Debug print', desc: 'Debugging artifacts' },
    { re: /\n{3,}/g, w: 1.0, label: 'Extra blank lines', desc: 'Inconsistent whitespace' },
    { re: /lol|wtf|omg|yolo|idk|dunno|ugh|argh/gi, w: 2.0, label: 'Informal language', desc: 'Casual language in comments' },
  ],
  python: [
    { re: /except\s*:/g, w: 1.8, label: 'Bare except', desc: 'Lazy except — human shortcut' },
    { re: /import \*$/gm, w: 1.5, label: 'Star import', desc: 'Wildcard imports are human shortcuts' },
  ],
  javascript: [
    { re: /var\s+\w+/g, w: 1.3, label: 'var declaration', desc: 'var usage = older/human code' },
    { re: /callback\s*\(/gi, w: 1.0, label: 'Callback pattern', desc: 'Pre-async callback style' },
  ],
};
