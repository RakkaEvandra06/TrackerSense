const EX = {
  ai: `from typing import List

def merge_sort(arr: List[int]) -> List[int]:
    """
    Sorts a list of integers using merge sort (divide-and-conquer).
    """
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left: List[int], right: List[int]) -> List[int]:
    """Merges two sorted lists into one sorted list."""
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
  
  human: `def msort(arr):
    """
    Simple merge sort (human-style)
    """
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = msort(arr[:mid])
    right = msort(arr[mid:])
    return _merge(left, right)

def _merge(left, right):
    """Helper merge function"""
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    # Combine remaining elements
    return result + left[i:] + right[j:]

# Quick test
print(msort([5,1,8,2,9]))`
};

const EX_EXTENDED = {

  'chatgpt-sort': `from typing import List

def merge_sort(arr: List[int]) -> List[int]:
    """Refactored merge sort"""
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return _merge(left, right)

def _merge(left: List[int], right: List[int]) -> List[int]:
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]: result.append(left[i]); i+=1
        else: result.append(right[j]); j+=1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,

  'claude-dp': `def longest_common_subsequence(text1: str, text2: str) -> int:
    """LCS using DP"""
    m, n = len(text1), len(text2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1,m+1):
        for j in range(1,n+1):
            if text1[i-1]==text2[j-1]: dp[i][j] = dp[i-1][j-1]+1
            else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]`,

  'gemini-ml': `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def train_classification_pipeline(X: np.ndarray, y: np.ndarray) -> dict:
    """Train ML pipeline with scaling"""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return {"scaler": scaler, "X_train": X_train_scaled, "X_test": X_test_scaled,
            "y_train": y_train, "y_test": y_test}`,

  'deepseek-graph': `from collections import defaultdict, deque
from typing import List, Dict, Tuple

def build_graph(edges: List[Tuple[int,int]]) -> Dict[int,List[int]]:
    g = defaultdict(list)
    for u,v in edges: g[u].append(v); g[v].append(u)
    return dict(g)

def bfs_shortest_path(graph: Dict[int,List[int]], start:int, end:int) -> List[int]:
    if start==end: return [start]
    visited = {start}
    queue = deque([(start,[start])])
    while queue:
        node,path = queue.popleft()
        for nbr in graph.get(node,[]):
            if nbr==end: return path+[nbr]
            if nbr not in visited:
                visited.add(nbr)
                queue.append((nbr,path+[nbr]))
    return []`,

  'human-hack': `def parse_file(fname):
    """Parse CSV-like file; skip bad lines"""
    data=[]
    try:
        with open(fname,'r') as f:
            for line in f:
                line=line.strip()
                if not line or line.startswith('#'): continue
                pts=line.split(',')
                if len(pts)<3: 
                    print("WARN: skipping bad line:", line)
                    continue
                try: data.append((pts[0],int(pts[1]),float(pts[2])))
                except: pass
    except IOError as e: print("Couldn't open file:", e); return None
    data.sort(key=lambda x:x[1])
    return data`,

  'human-js': `const cache = new Map();

async function fetchData(url){
    if(cache.has(url)) return cache.get(url);
    try{
        const res=await fetch(url);
        if(!res.ok) throw new Error('Request failed: '+res.status);
        const data = await res.json();
        cache.set(url,data);
        return data;
    }catch(err){
        console.error('Fetch error:', err);
        throw err;
    }
}

// Example
(async()=>{
    try{
        const post = await fetchData('https://jsonplaceholder.typicode.com/posts/1');
        console.log('Title:', post.title);
    }catch(err){ console.log('Error:',err); }
})();`
};

function loadEx(type){
    const editor = document.getElementById('editor');
    editor.value = EX[type] || '';
    updateGutter();
    updateInfo();
    if(window.hmapOn) toggleHmap();
}

function runExample(key){
    const code = EX_EXTENDED[key];
    if(!code) return;
    const editor = document.getElementById('editor');
    editor.value = code;
    updateGutter();
    updateInfo();
    goTab('analyze', document.querySelector('.nav-tab'));
    setTimeout(doAnalyze, 100);
}

function switchEx(el, type){
    document.querySelectorAll('.ex-tab').forEach(b=>b.classList.remove('ai-active','human-active'));
    el.classList.add(type==='ai'?'ai-active':'human-active');
    document.getElementById('ex-ai').style.display = type==='ai'?'flex':'none';
    document.getElementById('ex-human').style.display = type==='human'?'flex':'none';
}