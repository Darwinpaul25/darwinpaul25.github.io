let currentUnit = "metric";

function switchUnits(unit) {
  // Update active button
  document
    .querySelectorAll(".unit-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  currentUnit = unit;

  // Update unit labels
  const heightUnit = document.querySelector("#height").nextElementSibling;
  const weightUnit = document.querySelector("#weight").nextElementSibling;

  if (unit === "us") {
    heightUnit.textContent = "in";
    weightUnit.textContent = "lbs";
    document.querySelector("#height").value = "0";
    document.querySelector("#weight").value = "0";
  } else {
    heightUnit.textContent = "cm";
    weightUnit.textContent = "kg";
    document.querySelector("#height").value = "0";
    document.querySelector("#weight").value = "0";
  }

  calculateBMI();
}

function resetResults() {
  document.querySelector("#bmi-value").textContent = "-";
  document.querySelector("#bmi-category").textContent = "-";
  document.querySelector("#healthy-weight").textContent = "-";
  document.querySelector("#bmi-prime").textContent = "-";
  document.querySelector("#ponderal-index").textContent = "- kg/m³";
}

function calculateBMI() {
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
    document.querySelector("#bmi-value").textContent = "0";
    document.querySelector("#bmi-category").textContent = "-";
    document.querySelector("#healthy-weight").textContent = "-";
    document.querySelector("#bmi-prime").textContent = "0";
    document.querySelector("#ponderal-index").textContent = "0 kg/m³";

    // Reset pointer position to start
    const pointerLine = document.querySelector(".pointer-line");
    const pointerDot = document.querySelector(".pointer-dot");
    pointerLine.style.left = "0%";
    pointerDot.style.left = "0%";
    return;
  }

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  // Update BMI value
  document.querySelector("#bmi-value").textContent = bmi.toFixed(1);

  // Determine and set category
  let category;
  let color;

  // Update pointer position
  const updatePointer = (bmiValue) => {
    const pointerLine = document.querySelector(".pointer-line");
    const pointerDot = document.querySelector(".pointer-dot");

    // Calculate position percentage (16.5 to 40 is our scale range)
    let position = ((bmiValue - 16.5) / (40 - 16.5)) * 100;

    // Clamp position between 0 and 100
    position = Math.max(0, Math.min(100, position));

    pointerLine.style.left = `${position}%`;
    pointerDot.style.left = `${position}%`;
  };

  if (bmi < 18.5) {
    category = "Underweight";
    color = "#ff5252";
  } else if (bmi < 25) {
    category = "Normal";
    color = "#7ab93d";
  } else if (bmi < 30) {
    category = "Overweight";
    color = "#ffd700";
  } else {
    category = "Obese";
    color = "#ff5252";
  }

  // Update the pointer position
  updatePointer(bmi);

  const categoryElement = document.querySelector("#bmi-category");
  categoryElement.textContent = category;
  categoryElement.style.color = color;

  // Calculate and display BMI Prime
  const bmiPrime = (bmi / 25).toFixed(2);
  document.querySelector("#bmi-prime").textContent = bmiPrime;

  // Calculate and display Ponderal Index
  const ponderalIndex = (weight / Math.pow(heightInMeters, 3)).toFixed(1);
  document.querySelector("#ponderal-index").textContent =
    `${ponderalIndex} kg/m³`;
}

// Initialize everything when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Set up input event listeners for automatic calculation
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    input.addEventListener("input", calculateBMI);
  });

  // Initialize with default values
  calculateBMI();
});
