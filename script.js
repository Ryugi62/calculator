document.addEventListener("DOMContentLoaded", () => {
  const uiElements = getUIElements();
  let currentInput = "0";
  let isMultiLineDisplay = false; // 여러 줄 디스플레이 모드 추적을 위한 변수

  function getUIElements() {
    return {
      displayNumber: document.querySelector(".number"),
      displayKorean: document.querySelector(".korean"),
      totalDisplay: document.querySelector(".total"),
      totalKorean: document.querySelector(".total-korean"),
      buttons: document.querySelectorAll(".buttons button"),
      lineBreakButton: document.getElementById("lineBreakButton"),
    };
  }

  function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function formatDisplayValue(value) {
    return value.replace(/(\d+)/g, (match) => formatNumberWithCommas(match));
  }

  function updateMainDisplay() {
    if (isMultiLineDisplay) {
      updateLineBreakDisplay(); // 여러 줄 디스플레이 모드일 때만 업데이트
    } else {
      uiElements.displayNumber.textContent = formatDisplayValue(currentInput);
      uiElements.displayKorean.textContent = numberToKorean(currentInput);
    }
    resetTotalDisplayIfNeeded();
  }

  function resetTotalDisplayIfNeeded() {
    if (currentInput === "0") {
      uiElements.totalDisplay.textContent = "0";
      uiElements.totalKorean.textContent = "0";
    }
  }

  // 숫자를 한국어로 변환하는 함수
  function numberToKorean(expression) {
    const units = ["", "만", "억", "조", "경"];
    const tokenRegex = /(\d[\d,]*|\D)/g;

    return expression
      .match(tokenRegex)
      .map((token) => {
        if (isNaN(token.replace(/,/g, ""))) {
          return token;
        }

        let koreanNumber = "";
        let num = parseInt(token.replace(/,/g, ""), 10);

        let numGroups = [];
        while (num > 0) {
          numGroups.unshift(num % 10000);
          num = Math.floor(num / 10000);
        }

        numGroups.forEach((group, index) => {
          if (group > 0) {
            koreanNumber += `${group.toLocaleString("ko-KR")}${
              units[numGroups.length - 1 - index]
            } `;
          }
        });

        return koreanNumber.trim() || "0";
      })
      .join("");
  }

  // 수식 계산 함수
  function calculateExpression() {
    try {
      let expression = currentInput
        .replace(/,/g, "")
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

      let result = math.evaluate(expression);

      if (result >= 1e20) throw new Error("Result too large");

      return Number(result.toFixed(3));
    } catch (error) {
      alert(error.message || "Invalid expression");
      return "Error";
    }
  }

  function updateLineBreakDisplay() {
    if (!isMultiLineDisplay) return; // 여러 줄 모드가 아니면 함수 종료

    const inputParts = currentInput.split(/([+\-*/])/);
    let formattedLine = '<div class="multiline-display">';

    for (let i = 0; i < inputParts.length; i++) {
      const currentPart = inputParts[i].trim();

      if (currentPart) {
        if (/[+\-*/]/.test(currentPart)) {
          formattedLine += `<span class="operator">${currentPart}</span>`;
        } else {
          formattedLine += `<span class="number">${formatDisplayValue(
            currentPart
          )}</span>`;
          if (i < inputParts.length - 1) {
            formattedLine += '</div><div class="multiline-display">';
          }
        }
      }
    }

    formattedLine += "</div>";
    uiElements.displayNumber.innerHTML = formattedLine;
  }

  // 버튼 클릭 처리 함수
  function handleButtonClick(buttonValue) {
    switch (buttonValue) {
      case "AC":
        currentInput = "0";
        break;
      case "delete":
        currentInput = currentInput.slice(0, -1) || "0";
        break;
      case "=":
        if (/[+\-*/]$/.test(currentInput)) {
          alert("Invalid ending operator");
        } else {
          let result = calculateExpression();
          if (result !== "Error") {
            uiElements.totalDisplay.textContent =
              formatNumberWithCommas(result);
            uiElements.totalKorean.textContent = numberToKorean(
              result.toString()
            );
          } else {
            uiElements.totalDisplay.textContent = "Error";
            uiElements.totalKorean.textContent = "";
          }
        }
        break;
      default:
        currentInput =
          currentInput === "0" ? buttonValue : currentInput + buttonValue;
    }
    updateMainDisplay();
  }

  uiElements.buttons.forEach((button) =>
    button.addEventListener("click", () =>
      handleButtonClick(button.textContent.trim())
    )
  );

  uiElements.lineBreakButton.addEventListener("click", () => {
    isMultiLineDisplay = !isMultiLineDisplay; // "여러 줄 보기" 버튼 클릭 시 모드 전환
    updateMainDisplay();
  });

  updateMainDisplay();
});
