// ===== 初始化變數區 =====
const size = 20; // 條狀圖元素數量
let masterArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100)); // 產生初始隨機陣列
let originalArray = [...masterArray]; // 儲存排序前的原始陣列
let workingArray = [...originalArray]; // 模擬中操作的陣列
let bestRandomArray = [...originalArray]; // 全域搜尋中的最佳結果
let currentIndex = 0; // 當前選擇排序的指標位置
let interval; // 儲存 setInterval 的 ID
let algorithm = ''; // 目前選擇的演算法名稱
let actualSelectionCount = 0; // 已完成幾次完整選擇排序
let selectionPassCount = 0; // 選擇排序進行的次數（每步）
let randomStepLeft = 0; // 全域搜尋剩餘執行步數
let startTime; // 排序開始時間，用來計算耗時

// ===== 繪製條狀圖 =====
function drawBars(array, highlightIdx = []) {
    const container = document.getElementById('bars'); // 取得條狀圖容器
    container.innerHTML = ''; // 清空原本的內容
    array.forEach((val, idx) => {
        const bar = document.createElement('div'); // 建立每個 bar 元素
        bar.className = 'bar'; // 套用樣式
        bar.style.height = val * 2 + 'px'; // 設定高度，放大 2 倍讓視覺更明顯
        if (highlightIdx.includes(idx)) bar.classList.add('highlight'); // 如果需要強調就加上高亮樣式
        container.appendChild(bar); // 將 bar 加進容器
    });
}

// ===== 計算陣列有序程度 =====
function getSortednessScore(arr) {
    let score = 0;
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] <= arr[i + 1]) score++; // 若相鄰元素順序正確，分數 +1
    }
    return (score / (arr.length - 1)).toFixed(2); // 回傳 0~1 的有序度，小數點兩位
}

// ===== 單一步驟的選擇排序執行 =====
function stepSelectionSort() {
    if (currentIndex >= workingArray.length - 1) { // 排序已完成
        clearInterval(interval); // 停止模擬
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2); // 計算耗時（秒）
        actualSelectionCount++; // 完成次數 +1
        logRun(`選擇排序完成（第 ${actualSelectionCount} 次），共排序 ${selectionPassCount} 次，耗時 ${elapsed} 秒，有序度: ${getSortednessScore(workingArray)}`); // 紀錄執行資訊
        checkAvailability(); // 檢查是否開放全域搜尋
        return;
    }

    let minIdx = currentIndex; // 設定當前位置為最小值起點
    for (let j = currentIndex + 1; j < workingArray.length; j++) {
        if (workingArray[j] < workingArray[minIdx]) {
            minIdx = j; // 找到新的最小值位置
        }
    }

    if (minIdx !== currentIndex) {
        [workingArray[currentIndex], workingArray[minIdx]] = [workingArray[minIdx], workingArray[currentIndex]]; // 交換兩者位置
    }

    drawBars(workingArray, [currentIndex, minIdx]); // 繪製條狀圖並標示目前交換的元素
    document.getElementById('info').textContent = `排序次數：${selectionPassCount + 1} / 有序度：${getSortednessScore(workingArray)}`; // 顯示資訊
    currentIndex++; // 移動到下一個位置
    selectionPassCount++; // 次數加一
}

// ===== 全域搜尋執行步驟 =====
function runRandomSearch() {
    workingArray = [...originalArray].sort(() => Math.random() - 0.5); // 將原始陣列打亂
    if (getSortednessScore(workingArray) > getSortednessScore(bestRandomArray)) {
        bestRandomArray = [...workingArray]; // 更新最佳結果
    }

    drawBars(workingArray); // 繪製當前亂數排列
    document.getElementById('info').textContent = `剩餘次數：${randomStepLeft - 1} / 最佳有序度：${getSortednessScore(bestRandomArray)}`; // 顯示資訊
    randomStepLeft--; // 步數遞減

    if (randomStepLeft <= 0) { // 結束條件
        clearInterval(interval); // 停止模擬
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2); // 計算耗時
        logRun(`全域搜尋完成（依排序次數 ${selectionPassCount} 次執行），耗時 ${elapsed} 秒，最佳有序度: ${getSortednessScore(bestRandomArray)}`); // 紀錄結果
        const confirmSwitch = confirm("是否改為選擇排序再嘗試？"); // 提示使用者切換
        if (confirmSwitch) {
            document.getElementById('algorithmSelect').value = 'selection'; // 改為選擇排序
            startSelectedAlgorithm(); // 重新開始
        }
    }
}

// ===== 開始模擬選定演算法 =====
function startSelectedAlgorithm() {
    clearInterval(interval); // 清除之前的 interval，避免重複執行
    originalArray = [...masterArray]; // 還原原始資料
    workingArray = [...originalArray]; // 建立工作副本
    bestRandomArray = [...originalArray]; // 初始化最佳解
    currentIndex = 0; // 重設位置
    drawBars(workingArray); // 繪製初始條狀圖
    algorithm = document.getElementById('algorithmSelect').value; // 取得選擇的演算法
    startTime = Date.now(); // 紀錄開始時間

    if (algorithm === 'selection') {
        selectionPassCount = 0; // 重設次數
        interval = setInterval(stepSelectionSort, 500); // 每 500ms 執行一次排序步驟
    } else if (algorithm === 'random') {
        if (selectionPassCount === 0) return; // 未執行過選擇排序時不能執行
        randomStepLeft = selectionPassCount; // 以排序次數作為搜尋步數
        interval = setInterval(runRandomSearch, 500); // 開始執行全域搜尋
    }
}

// ===== 重設畫面與資料 =====
function resetSimulation() {
    clearInterval(interval); // 停止任何進行中的模擬
    masterArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100)); // 重新產生隨機資料
    originalArray = [...masterArray]; // 備份原始資料
    workingArray = [...originalArray]; // 設定為當前操作陣列
    bestRandomArray = [...originalArray]; // 重設最佳解
    currentIndex = 0; // 重設排序位置
    drawBars(workingArray); // 重新繪製條狀圖
    document.getElementById('info').textContent = ''; // 清除資訊
}

// ===== 新增執行紀錄到頁面 =====
function logRun(message) {
    const logList = document.getElementById('logList'); // 取得紀錄列表
    const item = document.createElement('li'); // 建立新項目
    item.textContent = `${new Date().toLocaleTimeString()} - ${message}`; // 顯示時間與內容
    logList.appendChild(item); // 加入紀錄區
}

// ===== 控制是否啟用全域搜尋 =====
function checkAvailability() {
    const select = document.getElementById('algorithmSelect'); // 取得選單
    const randomOption = [...select.options].find(opt => opt.value === 'random'); // 找出 random 選項
    if (selectionPassCount === 0) {
        randomOption.disabled = true; // 禁用 random
        randomOption.textContent = '全域搜尋（請先執行選擇排序）'; // 顯示提示文字
        if (select.value === 'random') select.value = 'selection'; // 自動切回 selection
    } else {
        randomOption.disabled = false; // 啟用 random
        randomOption.textContent = '全域搜尋'; // 刪除提示文字
    }
}

// ===== 初始化畫面 =====
window.onload = () => {
    checkAvailability(); // 根據初始狀態設定按鈕啟用狀態
    drawBars(originalArray); // 畫出初始條狀圖
};
