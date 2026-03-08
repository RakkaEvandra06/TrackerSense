document.addEventListener("DOMContentLoaded", () => {

const analyzeBtn = document.querySelector("#analyzeBtn")

if(analyzeBtn){

analyzeBtn.addEventListener("click", doAnalyze)

}

const clearBtn = document.querySelector("#clearBtn")

if(clearBtn){

clearBtn.addEventListener("click", clearAll)

}

})

const fileInput = document.querySelector("#fileInput")

fileInput.addEventListener("change", handleFile)

function handleFile(e){

const file = e.target.files[0]

if(!file) return

const maxSize = 2 * 1024 * 1024

if(file.size > maxSize){

alert("File terlalu besar (max 2MB)")
return

}

const allowed = [
"py","js","ts","java","cpp","go","rs"
]

const ext = file.name.split(".").pop()

if(!allowed.includes(ext)){

alert("File type tidak didukung")
return

}

const reader = new FileReader()

reader.onload = function(ev){

document.querySelector("#editor").value = ev.target.result

}

reader.readAsText(file)

}