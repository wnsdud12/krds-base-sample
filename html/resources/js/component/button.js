// common
const common = {
  focusTrap(trap) {
    const focusableElements = trap.querySelectorAll(`a, button, [tabindex="0"], input, textarea, select`);

    if (!focusableElements.length) return;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    trap.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
          // 모달 오픈 후 첫 초점 역방향 제어(modal-content가 첫초점이 아니면 사용 안해도 됨)
        } else if (event.key === "Tab" && event.shiftKey && document.activeElement === trap) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      }
    });
  },
};
// 초기 이벤트
window.addEventListener("DOMContentLoaded", () => {
  const focusTrapTest = document.getElementById("focus-trap-test");
  common.focusTrap(focusTrapTest);
});