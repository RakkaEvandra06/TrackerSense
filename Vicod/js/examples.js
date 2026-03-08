// =====================================================================
// EXAMPLES MODULE
// Sample code snippets for AI and Human categories
// =====================================================================

const EX = {
  ai: `def merge_sort(arr: list[int]) -> list[int]:
    """
    Sorts a list of integers using the merge sort algorithm.

    This implementation uses a divide-and-conquer approach to
    recursively split the array and merge sorted halves.

    Args:
        arr: The list of integers to be sorted.

    Returns:
        A new sorted list of integers.

    Example:
        >>> merge_sort([5, 2, 8, 1, 9])
        [1, 2, 5, 8, 9]
    """
    if len(arr) <= 1:
        return arr

    # Step 1: Find the middle point to divide the array
    mid = len(arr) // 2

    # Step 2: Recursively sort both halves
    left_half = merge_sort(arr[:mid])
    right_half = merge_sort(arr[mid:])

    # Step 3: Merge the sorted halves
    return merge(left_half, right_half)

def merge(left: list[int], right: list[int]) -> list[int]:
    """Merges two sorted lists into a single sorted list."""
    result = []
    left_index, right_index = 0, 0
    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            result.append(left[left_index])
            left_index += 1
        else:
            result.append(right[right_index])
            right_index += 1
    result.extend(left[left_index:])
    result.extend(right[right_index:])
    return result`,

  human: `# TODO: clean this up later lol
def msort(a):
    if len(a) <= 1:
        return a
    m = len(a)//2
    l = msort(a[:m])
    r = msort(a[m:])
    return _mrg(l,r)

def _mrg(l,r):
    res = []
    i=j=0
    while i<len(l) and j<len(r):
        if l[i]<=r[j]:
            res.append(l[i]); i+=1
        else:
            res.append(r[j]); j+=1
    # FIXME: there's probably a cleaner way to do this
    return res + l[i:] + r[j:]

# quick test - remove before prod
print(msort([5,1,8,2,9]))
# print(msort([])) # edge case - check later`
};

const EX_EXTENDED = {
  'chatgpt-sort': `def merge_sort(arr: list[int]) -> list[int]:
    """
    Sorts a list of integers using the merge sort algorithm.
    This implementation uses a divide-and-conquer approach.

    Args:
        arr: The list of integers to be sorted.

    Returns:
        A new sorted list of integers.

    Example:
        >>> merge_sort([5, 2, 8, 1, 9])
        [1, 2, 5, 8, 9]
    """
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left_half = merge_sort(arr[:mid])
    right_half = merge_sort(arr[mid:])
    return _merge(left_half, right_half)

def _merge(left: list[int], right: list[int]) -> list[int]:
    """Merges two sorted lists into a single sorted list."""
    result = []
    left_index, right_index = 0, 0
    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            result.append(left[left_index])
            left_index += 1
        else:
            result.append(right[right_index])
            right_index += 1
    result.extend(left[left_index:])
    result.extend(right[right_index:])
    return result`,

  'claude-dp': `from typing import Optional

def longest_common_subsequence(text1: str, text2: str) -> int:
    """
    Computes the length of the longest common subsequence.

    Args:
        text1: The first string.
        text2: The second string.

    Returns:
        The length of the LCS.

    Note:
        Uses dynamic programming with O(m*n) time and space complexity.
    """
    m, n = len(text1), len(text2)
    dp: list[list[int]] = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,

  'copilot-api': `const axios = require('axios');

/**
 * Fetches user data from the API endpoint.
 * @param {string} userId - The unique identifier for the user.
 * @returns {Promise<Object>} The user data object.
 * @throws {Error} If the request fails or user is not found.
 */
async function fetchUserData(userId) {
  try {
    const response = await axios.get(\`https://api.example.com/users/\${userId}\`, {
      headers: {
        'Authorization': \`Bearer \${process.env.API_TOKEN}\`,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    if (!response.data) {
      throw new Error(\`User with ID \${userId} not found\`);
    }
    return response.data;
  } catch (error) {
    console.error(\`Failed to fetch user data: \${error.message}\`);
    throw error;
  }
}

module.exports = { fetchUserData };`,

  'gemini-ml': `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def train_classification_pipeline(X: np.ndarray, y: np.ndarray) -> dict:
    """
    Trains a complete classification pipeline with preprocessing.

    Args:
        X: Feature matrix of shape (n_samples, n_features).
        y: Target labels of shape (n_samples,).

    Returns:
        A dictionary containing the trained scaler and split data.
    """
    # Step 1: Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    # Step 2: Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    # Step 3: Return results
    return {
        "scaler": scaler,
        "X_train": X_train_scaled,
        "X_test": X_test_scaled,
        "y_train": y_train,
        "y_test": y_test,
    }`,

  'deepseek-graph': `from collections import defaultdict, deque

def bfs_shortest_path(graph: dict, start: int, end: int) -> list[int]:
    # BFS to find shortest path
    if start == end:
        return [start]
    visited = {start}
    queue = deque([(start, [start])])
    while queue:
        node, path = queue.popleft()
        for neighbor in graph.get(node, []):
            if neighbor == end:
                return path + [neighbor]
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return []

def build_graph(edges: list[tuple]) -> dict:
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    return dict(graph)`,

  'human-hack': `# WARNING: this is a complete mess, written at 2am
# TODO: refactor EVERYTHING

def parse_file(fname):
    data = []
    try:
        f = open(fname, 'r')
        for l in f:
            l = l.strip()
            if not l or l.startswith('#'): continue
            pts = l.split(',')
            if len(pts) < 3:
                print("WARN: skipping bad line:", l)
                continue
            try:
                data.append((pts[0], int(pts[1]), float(pts[2])))
            except:
                pass  # just ignore bad data for now
        f.close()
    except IOError as e:
        print("couldn't open file:", e)
        return None

    # HACK: sort by second field bc downstream code expects it
    data.sort(key=lambda x: x[1])

    #print(data)  # debug - remove later!!!!
    return data`,

  'human-legacy': `// Old parser - do NOT touch unless you know what you're doing
// Written by Dave, 2018. Last touched: "good luck"

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_LINE 1024
#define MAX_FIELDS 32

// XXX: this is not thread safe
static char _buf[MAX_LINE];

int parse_csv_line(char *line, char **fields, int max_fields) {
    int n = 0;
    char *p = line, *start = line;
    while (*p && n < max_fields - 1) {
        if (*p == ',') {
            *p = '\\0';
            fields[n++] = start;
            start = p + 1;
        }
        p++;
    }
    fields[n++] = start;
    int last = n - 1;
    int len = strlen(fields[last]);
    if (len > 0 && fields[last][len-1] == '\\n')
        fields[last][len-1] = '\\0';
    return n;
}`,

  'human-js': `// weekend project - stop judging me
// TODO: make this less terrible

var cache = {}

function fetchData(url, cb) {
  if (cache[url]) {
    setTimeout(() => cb(null, cache[url]), 0)
    return
  }
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.onload = function() {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText) // pray it's valid json lol
      cache[url] = data
      cb(null, data)
    } else {
      cb(new Error('Request failed: ' + xhr.status))
    }
  }
  xhr.onerror = function() { cb(new Error('network error')) }
  xhr.send()
}

// FIXME: this leaks memory
fetchData('https://jsonplaceholder.typicode.com/posts/1', function(err, d) {
  if (err) { console.log('welp:', err); return }
  console.log('got it:', d.title)
})`
};

function loadEx(t) {
  document.getElementById('editor').value = EX[t] || '';
  updateGutter();
  updateInfo();
  if (window.hmapOn) toggleHmap();
}

function runExample(key) {
  const code = EX_EXTENDED[key];
  if (!code) return;
  document.getElementById('editor').value = code;
  updateGutter();
  updateInfo();
  goTab('analyze', document.querySelector('.nav-tab'));
  setTimeout(doAnalyze, 100);
}

function switchEx(el, t) {
  document.querySelectorAll('.ex-tab').forEach(b => { b.classList.remove('ai-active', 'human-active'); });
  el.classList.add(t === 'ai' ? 'ai-active' : 'human-active');
  document.getElementById('ex-ai').style.display    = t === 'ai'    ? 'flex' : 'none';
  document.getElementById('ex-human').style.display = t === 'human' ? 'flex' : 'none';
}
