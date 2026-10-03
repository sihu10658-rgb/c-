const display = document.getElementById('display');

// --- C++ (WebAssembly) 연동 설정 ---
let cppAddFunction = null;

// Emscripten Wasm 모듈이 초기화되면 실행됨
Module.onRuntimeInitialized = () => {
    try {
        // C++로 작성된 함수('cppAdd')를 자바스크립트 함수로 래핑
        // 첫 번째 인자: C++ 함수 이름, 두 번째 인자: 반환 타입('number'), 세 번째 인자: 매개변수 타입 배열
        cppAddFunction = Module.cwrap('cppAdd', 'number', ['number', 'number']);
        console.log("C++ Wasm 모듈 로드 완료! 이제 C++ 함수를 내장 함수처럼 호출할 수 있습니다.");
    } catch (e) {
        console.warn("C++ 모듈을 불러오는 중이거나 아직 컴파일 파일이 없습니다. 기본 JS 연산으로 동작합니다.");
    }
};

function appendValue(val) {
    display.value += val;
}

function clearDisplay() {
    display.value = '';
}

// 계산 및 C++ 연동 처리
function equal() {
    let expr = display.value;
    if (!expr) return;

    try {
        // 예시: 덧셈(+) 연산이 포함되어 있고 C++ 함수가 준비되어 있다면 C++ 함수 호출!
        if (expr.includes('+') && cppAddFunction) {
            let parts = expr.split('+');
            let a = parseFloat(parts[0]);
            let b = parseFloat(parts[1]);
            
            if (!isNaN(a) && !isNaN(b)) {
                // 🔥 C++ 함수를 자바스크립트 내장 함수처럼 호출!
                let result = cppAddFunction(a, b);
                display.value = result;
                return;
            }
        }

        // 그 외의 수식은 자바스크립트 기본 eval로 처리 (복소수나 기타 수식)
        let result = eval(expr);
        display.value = result;
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
            const f = new Function('x', `return ${fnStr};`);
            data.push(f(x));
        } catch (e) {
            data.push(null);
        }
    }

    const ctx = document.getElementById('mathGraph').getContext('2d');

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
                pointRadius: 2
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

// 페이지 로드 시 기본 그래프 실행
window.onload = () => {
    drawGraph();
};
