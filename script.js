function calculateBMI() {
  // Get input values
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);

  // Get display elements
  const bmiValue = document.getElementById("bmi-value");
  const bmiCategory = document.getElementById("bmi-category");

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
