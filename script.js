function switchUnits() {
  const isMetric = document.querySelector(
    'input[name="units"][value="metric"]'
  ).checked;

  // Toggle visibility of inputs
  document.getElementById("metric-height").style.display = isMetric
    ? "flex"
    : "none";
  document.getElementById("metric-weight").style.display = isMetric
    ? "flex"
    : "none";
  document.getElementById("imperial-height").style.display = isMetric
    ? "none"
    : "flex";
  document.getElementById("imperial-weight").style.display = isMetric
    ? "none"
    : "flex";

  // Clear all inputs
  document.getElementById("height").value = "";
  document.getElementById("weight").value = "";
  document.getElementById("height-feet").value = "";
  document.getElementById("height-inches").value = "";
  document.getElementById("weight-pounds").value = "";

  // Reset result
  document.getElementById("bmi-value").textContent = "-";
  document.getElementById("bmi-category").textContent = "-";
}

function calculateBMI() {
  const isMetric = document.querySelector(
    'input[name="units"][value="metric"]'
  ).checked;
  let height, weight;

  // Get display elements
  const bmiValue = document.getElementById("bmi-value");
  const bmiCategory = document.getElementById("bmi-category");

  if (isMetric) {
    height = parseFloat(document.getElementById("height").value);
    weight = parseFloat(document.getElementById("weight").value);
  } else {
    // Convert imperial measurements to metric
    const feet = parseFloat(document.getElementById("height-feet").value);
    const inches = parseFloat(document.getElementById("height-inches").value);
    const pounds = parseFloat(document.getElementById("weight-pounds").value);

    if (
      isNaN(feet) ||
      isNaN(inches) ||
      isNaN(pounds) ||
      feet < 0 ||
      inches < 0 ||
      pounds <= 0
    ) {
      bmiValue.textContent = "Invalid Input";
      bmiCategory.textContent = "Please enter valid values";
      return;
    }

    height = (feet * 12 + inches) * 2.54; // Convert to cm
    weight = pounds * 0.453592; // Convert to kg
  }

  // Check if inputs are valid
  if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
    bmiValue.textContent = "Invalid Input";
    bmiCategory.textContent = "Please enter valid values";
    return;
  }

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  // Display BMI value rounded to 1 decimal place
  bmiValue.textContent = bmi.toFixed(1);

  // Determine BMI category
  let category;
  if (bmi < 18.5) {
    category = "Underweight";
  } else if (bmi < 25) {
    category = "Normal weight";
  } else if (bmi < 30) {
    category = "Overweight";
  } else {
    category = "Obese";
  }

  // Display BMI category
  bmiCategory.textContent = category;
}
