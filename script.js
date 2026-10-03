const display = document.getElementById('display');

// --- C++ (WebAssembly) 연동 설정 ---
let cppAddFunction = null;

Module.onRuntimeInitialized = () => {
    try {
        cppAddFunction = Module.cwrap('cppAdd', 'number', ['number', 'number']);
        console.log("C++ Wasm 모듈 로드 완료!");
    } catch (e) {
        console.warn("C++ 모듈이 없습니다. Math.js 및 기본 연산으로 동작합니다.");
    }
};

function appendValue(val) {
    display.value += val;
}

function clearDisplay() {
    display.value = '';
}

// 계산 처리 (C++ Wasm 최적화 + Math.js 종합 엔진)
function equal() {
    let expr = display.value;
    if (!expr) return;

    try {
        let processedExpr = expr.replace(/(\d)i/g, '$1*i');

        // 예: 덧셈 연산이고 C++ Wasm이 준비되어 있다면 C++로 태우기!
        if (processedExpr.includes('+') && !processedExpr.includes('zeta') && !processedExpr.includes('sin') && cppAddFunction) {
            let parts = processedExpr.split('+');
            let a = parseFloat(parts[0]);
            let b = parseFloat(parts[1]);
            
            if (!isNaN(a) && !isNaN(b)) {
                let result = cppAddFunction(a, b);
                display.value = result;
                return;
            }
        }

        // 그 외 제타 함수, 삼각함수, 복소수 등은 Math.js로 처리
        let result = math.evaluate(processedExpr);
        
        if (result && typeof result.toString === 'function') {
            display.value = result.toString();
        } else {
            display.value = result;
        }
    } catch (error) {
        display.value = '오류';
    }
}

// --- 그래프 기능 구현 ---
let myChart = null;

function drawGraph() {
    const fnStr = document.getElementById('fnInput').value;
    const labels = [];
    const data = [];

    for (let x = -10; x <= 10; x += 0.5) {
        labels.push(x.toFixed(1));
        try {
            let y = math.evaluate(fnStr, { x: x });
            if (isNaN(y) || !isFinite(y) || typeof y === 'object') {
                data.push(null);
            } else {
                data.push(y);
            }
        } catch (e) {
            data.push(null);
        }
    }

    const canvasElem = document.getElementById('mathGraph');
    if (!canvasElem) return;
    const ctx = canvasElem.getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `y = ${fnStr}`,
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'X축' } },
                y: { title: { display: true, text: 'Y축' } }
            }
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    drawGraph();
});
