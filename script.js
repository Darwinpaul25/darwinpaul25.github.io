(function () {
  "use strict";

  // --- 1. STATE & CONSTANTS ---

  const state = {
    unit: "metric", // 'metric' or 'us'
    gender: "male", // 'male' or 'female'
  };

  const CONSTANTS = {
    CONVERSIONS: {
      KG_TO_LBS: 2.20462,
      LBS_TO_KG: 0.453592,
      CM_TO_IN: 0.393701,
      IN_TO_CM: 2.54,
    },
    BMI_CATEGORIES: {
      UNDERWEIGHT: {
        label: "Underweight",
        color: "#4198ff",
        range: [0, 18.5],
      },
      NORMAL: { label: "Normal", color: "#42d7a0", range: [18.5, 25] },
      OVERWEIGHT: { label: "Overweight", color: "#ffeb3b", range: [25, 30] },
      OBESE: { label: "Obese", color: "#ffa726", range: [30, 35] },
      SEVERELY_OBESE: {
        label: "Severely Obese",
        color: "#ff7043",
        range: [35, 40],
      },
      MORBIDLY_OBESE: {
        label: "Morbidly Obese",
        color: "#ff5252",
        range: [40, Infinity],
      },
    },
    ACTIVITY_MULTIPLIERS: {
      sedentary: 1.2,
      "lightly-active": 1.375,
      "moderately-active": 1.55,
      "very-active": 1.725,
      "extra-active": 1.9,
    },
  };

  // --- 2. DOM ELEMENT REFERENCES ---

  const domElements = {
    unitSwitcher: document.querySelector(".unit-switcher"),
    genderSwitcher: document.querySelector(".gender-switcher"),
    heightInput: document.querySelector("#height"),
    weightInput: document.querySelector("#weight"),
    ageInput: document.querySelector("#age"),
    activitySelect: document.querySelector("#activity-level"),
    heightUnit: document.querySelector("#height-unit"),
    weightUnit: document.querySelector("#weight-unit"),
    bmiValue: document.querySelector("#bmi-value"),
    bmiCategory: document.querySelector("#bmi-category"),
    bmiUnitDisplay: document.querySelector("#bmi-unit-display"),
    pointer: document.querySelector(".pointer-triangle"),
    healthyBmiRange: document.querySelector("#healthy-bmi-range"),
    healthyWeightRange: document.querySelector("#healthy-weight-range"),
    dailyCalories: document.querySelector("#daily-calories"),
    weightLossCalories: document.querySelector("#weight-loss-calories"),
    weightGainCalories: document.querySelector("#weight-gain-calories"),
    fitnessAdviceText: document.querySelector("#fitness-advice-text"),
    allInputs: document.querySelectorAll(
      'input[type="number"], #activity-level'
    ),
    maintainItem: document.querySelector("#daily-calories").parentElement,
    lossItem: document.querySelector("#weight-loss-calories").parentElement,
    gainItem: document.querySelector("#weight-gain-calories").parentElement,
  };

  // --- 3. EVENT LISTENERS ---

  function setupEventListeners() {
    domElements.unitSwitcher.addEventListener("click", handleUnitSwitch);
    domElements.genderSwitcher.addEventListener("click", handleGenderSwitch);

    const debouncedCalculate = debounce(calculateAndDisplayResults, 250);
    domElements.allInputs.forEach((input) => {
      input.addEventListener("input", debouncedCalculate);
    });
  }

  // --- 4. EVENT HANDLERS ---

  function handleUnitSwitch(e) {
    const selectedButton = e.target.closest(".unit-btn");
    if (!selectedButton || selectedButton.dataset.unit === state.unit) return;

    const newUnit = selectedButton.dataset.unit;
    const oldUnit = state.unit;
    state.unit = newUnit;

    // Update UI
    updateSwitcherUI(domElements.unitSwitcher, ".unit-btn", "unit", newUnit);
    updateInputUnits();
    convertInputValues(oldUnit, newUnit);
    calculateAndDisplayResults();
  }

  function handleGenderSwitch(e) {
    const selectedButton = e.target.closest(".gender-btn");
    if (!selectedButton || selectedButton.dataset.gender === state.gender)
      return;

    const newGender = selectedButton.dataset.gender;
    state.gender = newGender;

    // Update UI
    updateSwitcherUI(
      domElements.genderSwitcher,
      ".gender-btn",
      "gender",
      newGender
    );
    calculateAndDisplayResults();
  }

  // --- 5. CORE CALCULATION LOGIC ---

  function calculateAndDisplayResults() {
    const height = parseFloat(domElements.heightInput.value);
    const weight = parseFloat(domElements.weightInput.value);
    const age = parseInt(domElements.ageInput.value, 10);
    const activity = domElements.activitySelect.value;

    if (!height || !weight || height <= 0 || weight <= 0) {
      resetUI();
      return;
    }

    // Convert all values to metric for universal calculation
    const heightInCm =
      state.unit === "us" ? height * CONSTANTS.CONVERSIONS.IN_TO_CM : height;
    const weightInKg =
      state.unit === "us" ? weight * CONSTANTS.CONVERSIONS.LBS_TO_KG : weight;
    const heightInM = heightInCm / 100;

    // Perform calculations
    const bmi = weightInKg / (heightInM * heightInM);
    const { label: category, color } = getBmiCategory(bmi);
    const healthyWeight = calculateHealthyWeightRange(heightInM);

    // Update all relevant UI components
    updateBmiDisplay(bmi, category, color);
    updatePointer(bmi);
    updateHealthMetrics(healthyWeight);

    // Calculate and display advice only if age is valid
    if (Number.isFinite(age) && age > 0 && age <= 120) {
      const bmr = calculateBMR(weightInKg, heightInCm, age);
      const tdee = calculateTDEE(bmr, activity);
      updateCalorieAdvice(tdee, bmi);
      updateFitnessAdvice(bmi, activity);
    } else {
      resetAdviceSections();
    }
  }

  function getBmiCategory(bmi) {
    for (const key in CONSTANTS.BMI_CATEGORIES) {
      const { label, color, range } = CONSTANTS.BMI_CATEGORIES[key];
      if (bmi >= range[0] && bmi < range[1]) {
        return { label, color };
      }
    }
    return { label: "N/A", color: "#333" };
  }

  function calculateHealthyWeightRange(heightInM) {
    const minBmi = CONSTANTS.BMI_CATEGORIES.NORMAL.range[0];
    const maxBmi = CONSTANTS.BMI_CATEGORIES.NORMAL.range[1] - 0.1; // 24.9

    const minWeightKg = minBmi * heightInM * heightInM;
    const maxWeightKg = maxBmi * heightInM * heightInM;

    if (state.unit === "us") {
      return {
        min: (minWeightKg * CONSTANTS.CONVERSIONS.KG_TO_LBS).toFixed(1),
        max: (maxWeightKg * CONSTANTS.CONVERSIONS.KG_TO_LBS).toFixed(1),
      };
    }
    return {
      min: minWeightKg.toFixed(1),
      max: maxWeightKg.toFixed(1),
    };
  }

  function calculateBMR(weightKg, heightCm, age) {
    // Mifflin-St Jeor Equation
    if (state.gender === "male") {
      return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
  }

  function calculateTDEE(bmr, activityLevel) {
    const multiplier = CONSTANTS.ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
  }

  // --- 6. UI UPDATE FUNCTIONS ---

  function updateBmiDisplay(bmi, category, color) {
    domElements.bmiValue.textContent = bmi.toFixed(1);
    domElements.bmiCategory.textContent = category;
    domElements.bmiCategory.style.color = color;
  }

  function updatePointer(bmi) {
    const minBmi = 18.5; // Start of Normal range
    const maxBmi = 40; // Practical max for scale
    const scaleWidth = 100; // Percentage width of the scale
    const position = ((bmi - minBmi) / (maxBmi - minBmi)) * scaleWidth;

    const pointer = document.getElementById("bmiPointer");
    if (pointer) {
      pointer.style.left = `${Math.max(0, Math.min(scaleWidth, position))}%`;
    }
  }

  function updateHealthMetrics(healthyWeight) {
    const unitLabel = state.unit === "metric" ? "kg" : "lbs";
    const bmiUnitLabel =
      state.unit === "metric" ? "kg/m<sup>2</sup>" : "lb/in<sup>2</sup>";

    domElements.bmiUnitDisplay.innerHTML = bmiUnitLabel;
    domElements.healthyBmiRange.innerHTML = `18.5 - 24.9 ${bmiUnitLabel}`;
    domElements.healthyWeightRange.textContent = `${healthyWeight.min} - ${healthyWeight.max} ${unitLabel}`;
  }

  function updateCalorieAdvice(tdee, bmi) {
    if (bmi < 18.5) {
      domElements.weightGainCalories.textContent = `${tdee + 500} kcal/day`;
      domElements.gainItem.style.display = "flex";
      domElements.maintainItem.style.display = "none";
      domElements.lossItem.style.display = "none";
    } else if (bmi >= 18.5 && bmi < 25) {
      domElements.dailyCalories.textContent = `${tdee} kcal/day`;
      domElements.maintainItem.style.display = "flex";
      domElements.lossItem.style.display = "none";
      domElements.gainItem.style.display = "none";
    } else {
      domElements.weightLossCalories.textContent = `${tdee - 500} kcal/day`;
      domElements.lossItem.style.display = "flex";
      domElements.maintainItem.style.display = "none";
      domElements.gainItem.style.display = "none";
    }
  }

  function getFitnessAdvice(bmi, activityLevel) {
    let advice = "";
    let activityAdvice = getActivitySpecificAdvice(activityLevel);

    if (bmi < 18.5) {
      advice = `Your BMI suggests you are underweight. 
To gain weight healthily, increase your calorie intake with nutrient-rich foods like nuts and avocados. 
Incorporate strength training 2-3 times weekly to build muscle mass effectively. 
Ensure a balanced diet with adequate protein and healthy fats. 
Consult a nutritionist for a tailored plan, and track your progress weekly. 
${activityAdvice}`;
    } else if (bmi >= 18.5 && bmi < 25) {
      advice = `You are in a healthy BMI range—well done! 
Maintain this with a balanced diet of fruits, vegetables, and lean proteins. 
Engage in 150 minutes of moderate exercise weekly, mixing cardio and strength training. 
Monitor your weight monthly to ensure consistency. 
Stay hydrated and adjust activity if needed to maintain your current weight. 
${activityAdvice}`;
    } else if (bmi >= 25 && bmi < 30) {
      advice = `Your BMI indicates you are overweight. 
Aim for a moderate calorie deficit with whole foods and smaller portions. 
Incorporate 150-300 minutes of cardio weekly, like brisk walking or cycling. 
Strength training can help preserve muscle during weight loss. 
Seek support from a dietitian for sustainable changes and track your progress. 
${activityAdvice}`;
    } else {
      advice = `Your BMI is in the obese range, suggesting a need for weight management. 
Start with a calorie deficit using low-glycemic foods and reduced sugars. 
Begin with low-impact exercises like walking or swimming for 150 minutes weekly. 
Consult a healthcare provider for a safe, personalized plan. 
Track health metrics and celebrate small milestones to stay motivated. 
${activityAdvice}`;
    }
    return advice;
  }

  function getActivitySpecificAdvice(activityLevel) {
    switch (activityLevel) {
      case "sedentary":
        return "With a sedentary lifestyle, add 10-minute walks daily to boost activity.";
      case "lightly-active":
        return "Enhance your light activity with one extra day of exercise weekly.";
      case "moderately-active":
        return "Maintain your routine and vary exercises to avoid plateaus.";
      case "very-active":
        return "Focus on recovery with rest days and proper nutrition.";
      case "extra-active":
        return "Prioritize stretching and balanced meals to prevent injury.";
      default:
        return "";
    }
  }

  function updateFitnessAdvice(bmi, activityLevel) {
    domElements.fitnessAdviceText.textContent = getFitnessAdvice(
      bmi,
      activityLevel
    );
  }

  function resetUI() {
    domElements.bmiValue.textContent = "-";
    domElements.bmiCategory.textContent = "-";
    domElements.bmiCategory.style.color = "inherit";
    domElements.pointer.style.left = "0%";
    domElements.healthyWeightRange.textContent = "-";
    updateInputUnits();
    resetAdviceSections();
  }

  function resetAdviceSections() {
    domElements.dailyCalories.textContent = "-";
    domElements.weightLossCalories.textContent = "-";
    domElements.weightGainCalories.textContent = "-";
    domElements.fitnessAdviceText.textContent =
      "Enter your details to get personalized fitness advice.";
    domElements.maintainItem.style.display = "flex";
    domElements.lossItem.style.display = "flex";
    domElements.gainItem.style.display = "flex";
  }

  // --- 7. UI HELPER FUNCTIONS ---

  function updateSwitcherUI(container, btnClass, dataAttr, activeValue) {
    container.querySelectorAll(btnClass).forEach((btn) => {
      const isActive = btn.dataset[dataAttr] === activeValue;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-checked", isActive);
    });
  }

  function updateInputUnits() {
    const isMetric = state.unit === "metric";
    domElements.heightUnit.textContent = isMetric ? "cm" : "in";
    domElements.weightUnit.textContent = isMetric ? "kg" : "lbs";
    const bmiUnitLabel = isMetric ? "kg/m<sup>2</sup>" : "lb/in<sup>2</sup>";
    domElements.bmiUnitDisplay.innerHTML = bmiUnitLabel;
    domElements.healthyBmiRange.innerHTML = `18.5 - 24.9 ${bmiUnitLabel}`;
  }

  function convertInputValues(oldUnit, newUnit) {
    const height = parseFloat(domElements.heightInput.value);
    const weight = parseFloat(domElements.weightInput.value);

    if (newUnit === "us" && oldUnit === "metric") {
      if (height)
        domElements.heightInput.value = (
          height * CONSTANTS.CONVERSIONS.CM_TO_IN
        ).toFixed(1);
      if (weight)
        domElements.weightInput.value = (
          weight * CONSTANTS.CONVERSIONS.KG_TO_LBS
        ).toFixed(1);
    } else if (newUnit === "metric" && oldUnit === "us") {
      if (height)
        domElements.heightInput.value = (
          height * CONSTANTS.CONVERSIONS.IN_TO_CM
        ).toFixed(1);
      if (weight)
        domElements.weightInput.value = (
          weight * CONSTANTS.CONVERSIONS.LBS_TO_KG
        ).toFixed(1);
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // --- 8. INITIALIZATION ---

  document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    resetUI();
  });
})();
