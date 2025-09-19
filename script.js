let currentUnit = "metric";

// Debounce function to limit the rate at which handleBMIChange is called
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

function switchUnits(unit) {
  // Update active button
  document
    .querySelectorAll(".unit-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Get current values before switching
  const heightInput = document.querySelector("#height");
  const weightInput = document.querySelector("#weight");
  const currentHeight = parseFloat(heightInput.value) || 0;
  const currentWeight = parseFloat(weightInput.value) || 0;

  // Update unit labels
  const heightUnit = heightInput.nextElementSibling;
  const weightUnit = weightInput.nextElementSibling;

  if (unit === "us" && currentUnit === "metric") {
    // Convert from metric to US
    heightUnit.textContent = "in";
    weightUnit.textContent = "lbs";
    heightInput.value = (currentHeight / 2.54).toFixed(1); // cm to inches
    weightInput.value = (currentWeight * 2.20462).toFixed(1); // kg to lbs
  } else if (unit === "metric" && currentUnit === "us") {
    // Convert from US to metric
    heightUnit.textContent = "cm";
    weightUnit.textContent = "kg";
    heightInput.value = (currentHeight * 2.54).toFixed(1); // inches to cm
    weightInput.value = (currentWeight / 2.20462).toFixed(1); // lbs to kg
  }

  currentUnit = unit;

  // Update BMI scale markers
  const scaleMarkers = document.querySelectorAll(".scale-marker");
  scaleMarkers.forEach((marker) => {
    const value = parseFloat(marker.textContent);
    if (unit === "us") {
      marker.textContent = (value * 0.0703).toFixed(1); // Convert to lb/in²
    } else {
      marker.textContent = (value / 0.0703).toFixed(1); // Convert to kg/m²
    }
  });

  handleBMIChange();
}

function resetResults() {
  document.querySelector("#bmi-value").textContent = "-";
  document.querySelector("#bmi-category").textContent = "-";
  document.querySelector("#healthy-weight").textContent = "-";
  document.querySelector("#bmi-prime").textContent = "-";
  document.querySelector("#ponderal-index").textContent = "- kg/m³";

  // Reset pointer position
  const pointer = document.querySelector(".pointer-triangle");
  pointer.style.left = "0%";
}

function updateBMIDisplay(bmi, category, color) {
  // Update BMI value
  document.querySelector("#bmi-value").textContent = bmi.toFixed(1);

  // Update category and color
  const categoryElement = document.querySelector("#bmi-category");
  categoryElement.textContent = category;
  categoryElement.style.color = color;
}

function updatePointer(bmi) {
  const pointer = document.querySelector(".pointer-triangle");

  // Calculate position percentage (18.5 to 40 is our scale range)
  let position = ((bmi - 18.5) / (40 - 18.5)) * 100;

  // Clamp position between 0 and 100
  position = Math.max(0, Math.min(100, position));

  pointer.style.left = `${position}%`;
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return { category: "Underweight", color: "#4198ff" };
  if (bmi < 25) return { category: "Normal", color: "#42d7a0" };
  if (bmi < 30) return { category: "Overweight", color: "#ffeb3b" };
  if (bmi < 35) return { category: "Obese", color: "#ffa726" };
  if (bmi < 40) return { category: "Severely Obese", color: "#ff7043" };
  return { category: "Morbidly Obese", color: "#ff5252" };
}

function calculateHealthyWeightRange(heightInMeters) {
  const minWeight = 18.5 * (heightInMeters * heightInMeters);
  const maxWeight = 24.9 * (heightInMeters * heightInMeters);

  if (currentUnit === "us") {
    return {
      min: (minWeight * 2.20462).toFixed(1),
      max: (maxWeight * 2.20462).toFixed(1),
      unit: "lbs",
    };
  }
  return {
    min: minWeight.toFixed(1),
    max: maxWeight.toFixed(1),
    unit: "kg",
  };
}

function updateHealthMetrics(bmi, weight, heightInMeters) {
  // Update BMI Prime
  const bmiPrime = (bmi / 25).toFixed(2);
  document.querySelector("#bmi-prime").textContent = bmiPrime;

  // Update Ponderal Index with correct units
  let ponderalIndex, ponderalUnit;
  if (currentUnit === "us") {
    // Convert to imperial units (lb/in³)
    ponderalIndex = ((weight * 0.453592) / Math.pow(heightInMeters, 3)).toFixed(
      1
    );
    ponderalUnit = "lb/in³";
  } else {
    ponderalIndex = (weight / Math.pow(heightInMeters, 3)).toFixed(1);
    ponderalUnit = "kg/m³";
  }
  document.querySelector("#ponderal-index").textContent =
    `${ponderalIndex} ${ponderalUnit}`;

  // Update Healthy BMI Range with correct units
  const healthyBmiRange = document.querySelector(
    ".info-item:nth-child(3) span"
  );
  if (currentUnit === "us") {
    healthyBmiRange.textContent = "18.5 lb/in² - 24.9 lb/in²";
  } else {
    healthyBmiRange.textContent = "18.5 kg/m² - 24.9 kg/m²";
  }

  // Update Healthy Weight Range
  const healthyWeight = calculateHealthyWeightRange(heightInMeters);
  const healthyWeightRange = document.querySelector(
    ".info-item:nth-child(4) span"
  );
  healthyWeightRange.textContent = `${healthyWeight.min} - ${healthyWeight.max} ${healthyWeight.unit}`;
}

function handleBMIChange() {
  // Get input values
  let height = parseFloat(document.querySelector("#height").value);
  let weight = parseFloat(document.querySelector("#weight").value);

  // Convert US units to metric
  if (currentUnit === "us") {
    height = height * 2.54; // inches to cm
    weight = weight * 0.453592; // lbs to kg
  }

  // Check for empty or invalid inputs
  if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
    resetResults();
    return;
  }

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  // Get BMI category and color
  const { category, color } = getBMICategory(bmi);

  // Update all displays
  updateBMIDisplay(bmi, category, color);
  updatePointer(bmi);
  updateHealthMetrics(bmi, weight, heightInMeters);
}

// Initialize everything when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create a debounced version of handleBMIChange
  const debouncedBMIChange = debounce(handleBMIChange, 100);

  function resetScale() {
    // Reset pointer and BMI value/category
    document.querySelector("#bmi-value").textContent = "-";
    document.querySelector("#bmi-category").textContent = "-";
    document.querySelector(".pointer-triangle").style.left = "0%";

    // Reset all metrics with correct units
    document.querySelector("#bmi-prime").textContent = "-";
    document.querySelector("#ponderal-index").textContent =
      currentUnit === "us" ? "- lb/in³" : "- kg/m³";

    const healthyBmiRange = document.querySelector(
      ".info-item:nth-child(3) span"
    );
    healthyBmiRange.textContent =
      currentUnit === "us"
        ? "18.5 lb/in² - 24.9 lb/in²"
        : "18.5 kg/m² - 24.9 kg/m²";

    const healthyWeightRange = document.querySelector(
      ".info-item:nth-child(4) span"
    );
    healthyWeightRange.textContent =
      currentUnit === "us" ? "0 - 0 lbs" : "0 - 0 kg";
  }

  // Set up input event listeners for automatic calculation
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    const handleInput = () => {
      if (input.value === "" || input.value === "0") {
        resetScale();
      } else {
        debouncedBMIChange();
      }
    };

    // Listen for all relevant input events
    input.addEventListener("input", handleInput);
    input.addEventListener("change", handleInput);

    // Handle blur event separately to ensure we have a valid value
    input.addEventListener("blur", () => {
      if (input.value === "" || isNaN(parseFloat(input.value))) {
        input.value = "0";
        resetScale();
      }
    });
  });

  // Initialize with default values
  handleBMIChange();
});
