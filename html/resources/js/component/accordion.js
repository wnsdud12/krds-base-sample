  /*** * krds_accordion * ***/
const krds_accordion = {
  accordionButtons: null,
  accordionHandlers: new Map(),
  init() {
    this.accordionButtons = document.querySelectorAll(".btn-accordion");

    if (!this.accordionButtons.length) return;

    this.setupAccordions();
  },
  accordionToggle(button, accordionItems, accordionType, currentItem) {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    // singleOpen 타입일 경우, 다른 항목 닫기
    if (accordionType !== "multiOpen" && !currentItem.classList.contains("active")) {
      accordionItems.forEach((otherItem) => {
        const otherButton = otherItem.querySelector(".btn-accordion");
        otherButton.setAttribute("aria-expanded", "false");
        otherButton.classList.remove("active");
        otherItem.classList.remove("active");
      });
    }
    // 현재 항목 상태 토글
    button.setAttribute("aria-expanded", !isExpanded);
    button.classList.toggle("active", !isExpanded);
    currentItem.classList.toggle("active", !isExpanded);
  },
  setupAccordions() {
    this.accordionButtons.forEach((button, idx) => {
      const accordionContainer = button.closest(".krds-accordion");
      const accordionItems = accordionContainer.querySelectorAll(".accordion-item");
      const currentItem = button.closest(".accordion-item");
      const accordionContent = currentItem.querySelector(".accordion-collapse");
      const accordionType = accordionContainer.dataset.type || "singleOpen";
      const isOpen = accordionContainer.classList.contains("is-open");

      // 접근성 속성 초기값 설정
      this.setupAriaAttributes(button, accordionContent, idx);

      // 초기 오픈 상태 설정
      if (isOpen || currentItem.classList.contains("active")) {
        button.setAttribute("aria-expanded", "true");
        button.classList.add("active");
        currentItem.classList.add("active");
      }

      // 핸들러 고정 및 저장
      let toggleHandler = this.accordionHandlers.get(button);
      if (!toggleHandler) {
        toggleHandler = this.accordionToggle.bind(this, button, accordionItems, accordionType, currentItem);
        this.accordionHandlers.set(button, toggleHandler);
      }

      // 기존 이벤트 리스너 제거 및 새로 등록
      button.removeEventListener("click", toggleHandler);
      button.addEventListener("click", toggleHandler);
    });
  },
  setupAriaAttributes(button, accordionContent, idx) {
    const uniqueIdx = `${idx}${Math.random().toString(36).substring(2, 9)}`;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("id", `accordionHeader-id-${uniqueIdx}`);
    button.setAttribute("aria-controls", `accordionCollapse-id-${uniqueIdx}`);
    accordionContent.setAttribute("role", "region");
    accordionContent.setAttribute("id", `accordionCollapse-id-${uniqueIdx}`);
    accordionContent.setAttribute("aria-labelledby", `accordionHeader-id-${uniqueIdx}`);
  },
};

// 초기 이벤트
window.addEventListener("DOMContentLoaded", () => {

  krds_accordion.init();
});