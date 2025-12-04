
/*** * krds_calendar * ***/ // *btn-set-date: aria-pressed > aria-selected 변경 해야함(상위 속성도 같이)
const krds_calendar = {
  datePickerArea: null,
  activeDateSelector: null,
  init() {
    this.datePickerArea = document.querySelectorAll(".krds-calendar-area");

    if (!this.datePickerArea.length) return;

    this.setupDatePicker();
    this.setupGlobalListeners();
    this.setupOpenCloseEvents();
    this.setupDateComboBox("init");
    this.toggleDateSelector();
    this.actionDatePicker();

    // ui 동작 확인용 테스트 코드
    this.example();
  },
  setupDatePicker() {
    this.datePickerArea.forEach((datePicker) => {
      datePicker.querySelector(".calendar-wrap").setAttribute("tabindex", "0");

      // 접근성 초기값 설정
      datePicker.querySelectorAll(".calendar-tbl td").forEach((cell) => {
        const dateButton = cell.querySelector(".btn-set-date");
        if (!dateButton) return;
        if (cell.classList.contains("period")) {
          dateButton.setAttribute("aria-pressed", "true");
        }
        if (cell.classList.contains("day-event")) {
          dateButton.setAttribute("aria-label", `${dateButton.innerText} 일정있음`);
        }
        if (cell.classList.contains("today")) {
          dateButton.setAttribute("aria-label", `${dateButton.innerText} 오늘`);
        }
      });
    });
  },
  setupGlobalListeners() {
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".calendar-conts")) {
        this.closeAllDatePickers();
      }
    });
  },
  setupOpenCloseEvents() {
    const datePickerButtons = document.querySelectorAll(".form-btn-datepicker");
    datePickerButtons.forEach((button) => {
      button.addEventListener("click", () => this.openDatePicker(button));
    });

    // 탭 이동 닫기
    this.datePickerArea.forEach((datePicker) => {
      // 마지막 버튼이 blur될 때 datepicker 닫기(포커스 트랩을 사용하지 않을때 적용)
      // const lastActionButton = datePicker.querySelector(".calendar-btn-wrap .krds-btn:last-child");
      // if (lastActionButton) {
      //   lastActionButton.addEventListener("blur", () => this.closeAllDatePickers());
      // }

      // calendar-select의 마지막 버튼이 blur될 때 선택기 닫기
      datePicker.querySelectorAll(".calendar-select").forEach((select) => {
        const lastSelectButton = select.querySelector(".sel > li:last-child > button");
        if (lastSelectButton) {
          lastSelectButton.addEventListener("blur", () => {
            this.resetDateSelector();
          });
        }
      });
    });
  },
  openDatePicker(button) {
    // 열려있던 달력 모두 닫기
    this.closeAllDatePickers();

    const currentDatePicker = button.closest(".calendar-conts").querySelector(".krds-calendar-area");
    currentDatePicker.classList.add("active");

    // 접근성
    button.setAttribute("aria-expanded", "true");

    // 포커스 트랩 설정
    common.focusTrap(currentDatePicker);

    // 포커스 이동
    setTimeout(() => {
      currentDatePicker.querySelector(".calendar-wrap").focus();
    }, 50);
  },
  resetDateSelector() {
    this.datePickerArea.forEach((datePicker) => {
      const selectMenus = datePicker.querySelectorAll(".calendar-select");
      selectMenus.forEach((select) => select.classList.remove("active"));
      this.setupDateComboBox("reset");
      this.activeDateSelector = null;
    });
  },
  closeAllDatePickers() {
    this.datePickerArea.forEach((datePicker) => {
      if (datePicker.classList.contains("active")) {
        const target = datePicker.closest(".calendar-conts").querySelector(".form-btn-datepicker");
        target.focus();
      }
      datePicker.classList.remove("active");
      this.resetDateSelector();
    });

    // 접근성
    const datePickerButtons = document.querySelectorAll(".form-btn-datepicker");
    datePickerButtons.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
  },
  setupDateComboBox(option, target) {
    const comboBoxs = document.querySelectorAll(".calendar-drop-down > button");
    if (option === "init") {
      comboBoxs.forEach((comboBox, idx) => {
        const listBox = comboBox.nextElementSibling.querySelector(".sel");
        const listOptions = listBox.querySelectorAll("button");
        const uniqueIdx = `${idx}${Math.random().toString(36).substring(2, 9)}`;

        comboBox.setAttribute("role", "combobox");
        comboBox.setAttribute("aria-haspopup", "listbox");
        comboBox.setAttribute("aria-expanded", "false");
        comboBox.setAttribute("aria-controls", `combo-list-${uniqueIdx}`);

        listBox.setAttribute("role", "listbox");
        listBox.setAttribute("id", `combo-list-${uniqueIdx}`);
        listBox.querySelectorAll("li").forEach((li) => li.setAttribute("role", "none"));

        listOptions.forEach((listOption) => {
          listOption.setAttribute("role", "option");
          listOption.setAttribute("aria-selected", "false");
          if (listOption.classList.contains("active")) {
            listOption.setAttribute("aria-selected", "true");
            comboBox.innerHTML = listOption.innerHTML;
          }
        });
      });
    }
    if (option === "reset") {
      comboBoxs.forEach((comboBox) => {
        comboBox.setAttribute("aria-expanded", "false");
      });
      if (target) {
        target.setAttribute("aria-expanded", "true");
      }
    }
    if (option === "change") {
      comboBoxs.forEach((comboBox) => {
        const listBox = comboBox.nextElementSibling.querySelector(".sel");
        const listOptions = listBox.querySelectorAll("button");

        comboBox.setAttribute("aria-expanded", "false");

        listOptions.forEach((listOption) => {
          listOption.classList.remove("active");
          listOption.setAttribute("aria-selected", "false");
        });
      });
      if (target) {
        target.setAttribute("aria-selected", "true");
        target.classList.add("active");
        target.closest(".calendar-drop-down").querySelector("button").innerHTML = target.innerHTML;
      }

      // ui 동작 확인용 테스트 코드
      this.example();
    }
  },
  toggleDateSelector() {
    this.datePickerArea.forEach((datePicker) => {
      const selectToggleButtons = datePicker.querySelectorAll(".calendar-drop-down .btn-cal-switch");
      const selectOptions = datePicker.querySelectorAll(".calendar-select .sel button");

      // 공통 이벤트 처리
      const handleBtnClick = (event, selectMenu) => {
        const layer = selectMenu;

        // 이미 활성화된 레이어 닫기
        if (this.activeDateSelector === layer) {
          layer.classList.remove("active");
          this.setupDateComboBox("reset");
          this.activeDateSelector = null;
          return;
        }

        // 현재 열려 있는 레이어가 있으면 닫음
        if (this.activeDateSelector) {
          this.activeDateSelector.classList.remove("active");
          this.setupDateComboBox("reset");
        }

        // 클릭한 버튼에 해당하는 레이어 열기
        layer.classList.add("active");
        this.setupDateComboBox("reset", event.target);
        this.activeDateSelector = layer;
      };

      // 셀렉터 설정
      selectToggleButtons.forEach((toggle) => {
        toggle.addEventListener("click", (event) => {
          const selectMenu = event.target.closest(".calendar-drop-down").querySelector(".calendar-select");
          handleBtnClick(event, selectMenu);
        });
      });

      // 년도, 월 선택
      selectOptions.forEach((option) => {
        option.addEventListener("click", (event) => {
          this.resetDateSelector();
          this.setupDateComboBox("change", event.target);

          // 포커스 이동
          setTimeout(() => {
            option.closest(".calendar-drop-down").querySelector(".btn-cal-switch")?.focus();
          }, 50);
        });
      });

      // esc 닫기
      datePicker.addEventListener("keydown", (event) => {
        if (event.code === "Escape") {
          this.resetDateSelector();
        }
      });
    });
  },
  actionDatePicker() {
    this.datePickerArea.forEach((datePicker) => {
      const actionButtons = datePicker.querySelectorAll(".calendar-btn-wrap button:not(#get-today)");
      actionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          this.closeAllDatePickers();
        });
      });
    });
  },
  // ui 동작 확인용 테스트 코드
  example() {
    this.datePickerArea.forEach((datePicker) => {
      const year = datePicker.querySelector(".calendar-switch-wrap .year").innerText.slice(0, -1);
      const month = datePicker.querySelector(".calendar-switch-wrap .month").innerText.slice(0, -1);
      const caption = datePicker.querySelector(".calendar-tbl caption");
      const tblCells = datePicker.querySelectorAll(".calendar-tbl td");
      const tblCellBtns = datePicker.querySelectorAll(".calendar-tbl td .btn-set-date");
      const actionBtns = datePicker.querySelectorAll(".calendar-btn-wrap button");
      let clickCount = 0;
      let startTd = null;

      // 캡션 설정
      caption.innerHTML = `${year}년 ${month}월`;

      // 테스트용 (실제 구현에서는 날짜 배열을 받아 처리함)
      tblCells.forEach((cell) => {
        const day = cell.querySelector(".btn-set-date").innerText.padStart(2, "0");
        let [numberYear, numberMonth] = [parseFloat(year), parseFloat(month)];
        if (cell.classList.contains("old")) {
          if (numberMonth === 1) {
            numberYear -= 1;
            numberMonth = 12;
          } else {
            numberMonth -= 1;
          }
        } else if (cell.classList.contains("new")) {
          if (numberMonth === 12) {
            numberYear += 1;
            numberMonth = 1;
          } else {
            numberMonth += 1;
          }
        }
        cell.setAttribute("data-date", `${numberYear}.${String(numberMonth).padStart(2, "0")}.${day}`);
      });

      // action
      const accReset = (action, btn, type) => {
        // 인풋 단일
        const targetInput = btn.closest(".calendar-conts").querySelector("input.datepicker.cal");
        // 인풋 분할
        const targetInputStart = btn.closest(".calendar-conts").querySelector(".input-group.range.set li:first-child input.datepicker");
        const targetInputEnd = btn.closest(".calendar-conts").querySelector(".input-group.range.set li:last-child input.datepicker");

        action.addEventListener("click", () => {
          if (targetInput) {
            targetInput.setAttribute("type", "text");
            const target = action.innerText;
            if (target === "오늘") {
              accSet();
            }
            if (target === "확인") {
              if (type === "single") {
                const value = action.closest(".krds-calendar-area").querySelector("td.period.start.end").getAttribute("data-date");
                targetInput.value = value;
              } else {
                const value1 = action.closest(".krds-calendar-area").querySelector("td.period.start")?.getAttribute("data-date");
                const value2 = action.closest(".krds-calendar-area").querySelector("td.period.end")?.getAttribute("data-date") || "";
                targetInput.value = `${value1} ~ ${value2}`;
              }
            }
          } else {
            targetInputStart.setAttribute("type", "text");
            targetInputEnd.setAttribute("type", "text");
            const target = action.innerText;
            if (target === "오늘") {
              accSet();
            }
            if (target === "확인") {
              const value1 = action.closest(".krds-calendar-area").querySelector("td.period.start")?.getAttribute("data-date");
              const value2 = action.closest(".krds-calendar-area").querySelector("td.period.end")?.getAttribute("data-date") || "";
              targetInputStart.value = value1;
              targetInputEnd.value = value2;
            }
          }
        });
        // 공통 접근성
        const accSet = () => {
          const prevItems = action.closest(".krds-calendar-area").querySelectorAll(".period");
          prevItems.forEach((prev) => {
            prev.classList.remove("period", "start", "end");
            prev.querySelector(".btn-set-date").removeAttribute("aria-pressed");
          });
          action.closest(".krds-calendar-area").querySelector("td.today").classList.add("period", "start", "end");
          action.closest(".krds-calendar-area").querySelector("td.today .btn-set-date").setAttribute("aria-pressed", "true");
        };
      };

      // btn-set-date
      tblCellBtns.forEach((btn) => {
        // disabled 설정
        if (btn.closest("td.new, td.old")) {
          btn.setAttribute("disabled", "true");
        }

        // var
        const isSingle = btn.closest(".calendar-wrap").classList.contains("single");

        if (isSingle) {
          btn.addEventListener("click", () => {
            tblCellBtns.forEach((otherBtn) => {
              otherBtn.closest("td").classList.remove("period", "start", "end");
              otherBtn.removeAttribute("aria-pressed");
            });
            btn.closest("td").classList.add("period", "start", "end");
            btn.setAttribute("aria-pressed", "true");  
          });
          // action
          actionBtns.forEach((action) => {
            accReset(action, btn, "single");
          });
        } else {         
          btn.addEventListener("click", () => {
            const currentTd = btn.closest("td");
            // 현재 td의 날짜
            const currentDate = new Date(currentTd.getAttribute("data-date"));
            // 두 번째 클릭일 때, 시작날짜 이전 이면 초기화
            if (startTd) {
              const startDate = new Date(startTd.getAttribute("data-date"));
              if (currentDate < startDate) {
                console.log("시작날짜 이전은 선택할 수 없습니다.");
                startTd = null;
                clickCount = 0;
                // return;
              }
            }

            clickCount++;

            if (clickCount % 2 === 1) {
              tblCellBtns.forEach((otherBtn) => {
                otherBtn.closest("td").classList.remove("period", "start", "end");
                otherBtn.removeAttribute("aria-pressed");
              });
              btn.closest("td").classList.add("period", "start");
              btn.setAttribute("aria-pressed", "true");
              startTd = currentTd;
            } else {
              btn.closest("td").classList.add("period", "end");
              btn.setAttribute("aria-pressed", "true");
              let started = false;
              tblCellBtns.forEach((otherBtn) => {
                const td = otherBtn.closest("td");
                if (td === startTd) {
                  started = true;
                }
                if (started && td !== currentTd) {
                  td.classList.add("period");
                  otherBtn.setAttribute("aria-pressed", "true");
                }
                if (td === currentTd) {
                  started = false;
                }
              });
              startTd = null;
            }
          });
          // action
          actionBtns.forEach((action) => {
            accReset(action, btn);
          });
        }
      });
    });
  },
};
// 초기 이벤트
window.addEventListener("DOMContentLoaded", () => {
  krds_calendar.init();
});