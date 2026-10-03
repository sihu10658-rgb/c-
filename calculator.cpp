#include <emscripten/emscripten.h>

extern "C" {
    // 자바스크립트에서 호출할 수 있도록 EMSCRIPTEN_KEEPALIVE 선언
    EMSCRIPTEN_KEEPALIVE
    double cppAdd(double a, double b) {
        return a + b;
    }

    EMSCRIPTEN_KEEPALIVE
    double cppSubtract(double a, double b) {
        return a - b;
    }

    EMSCRIPTEN_KEEPALIVE
    double cppMultiply(double a, double b) {
        return a * b;
    }

    EMSCRIPTEN_KEEPALIVE
    double cppDivide(double a, double b) {
        if (b == 0) return 0; // 0으로 나누기 예외 처리
        return a / b;
    }
}
