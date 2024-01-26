document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    displayNumber: document.querySelector(".number"),
    displayKorean: document.querySelector(".korean"),
    totalDisplay: document.querySelector(".total"),
    totalKorean: document.querySelector(".total-korean"),
    buttons: document.querySelectorAll(".buttons button"),
  };

  let currentInput = "0";

  const numberWithCommas = (x) =>
    x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatDisplayValue = (value) =>
    value.replace(/(\d+)/g, (match) => numberWithCommas(match));
  const updateDisplay = () => {
    elements.displayNumber.textContent = formatDisplayValue(currentInput);
    elements.displayKorean.textContent = numberToKorean(currentInput);
    if (currentInput === "0") {
      elements.totalDisplay.textContent = "0";
      elements.totalKorean.textContent = "0";
    }
  };

  function numberToKorean(expression) {
    const units = ["", "만", "억", "조", "경"];
    const tokenRegex = /(\d[\d,]*|\D)/g;

    return expression
      .match(tokenRegex)
      .map((token) => {
        if (isNaN(token.replace(/,/g, ""))) {
          return token; // Return non-numeric tokens (like operators and spaces) as is
        }

        let koreanNumber = "";
        let num = parseInt(token.replace(/,/g, ""), 10); // Remove commas for parsing

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

  const calculate = () => {
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
  };

  const handleButtonClick = (buttonValue) => {
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
          let result = calculate();
          if (result !== "Error") {
            elements.totalDisplay.textContent = numberWithCommas(result);
            elements.totalKorean.textContent = numberToKorean(
              result.toString()
            );
          } else {
            elements.totalDisplay.textContent = "Error";
            elements.totalKorean.textContent = "";
          }
        }
        break;
      default:
        currentInput =
          currentInput === "0" ? buttonValue : currentInput + buttonValue;
    }
    updateDisplay();
  };

  elements.buttons.forEach((button) =>
    button.addEventListener("click", () =>
      handleButtonClick(button.textContent.trim())
    )
  );

  updateDisplay();
});
