# Smart Bill Predictor ⚡️

A smart energy forecasting tool built with **TypeScript** and **Machine Learning**. It predicts your future monthly energy bills based on your appliance inventory, historical consumption patterns, and local temperature/seasonality context.

## 🚀 Features

*   **Inventory-Based Logic**: Calculates consumption based on your specific devices (TV, Air Conditioner, etc.) defined in `inventory.json`.
*   **Machine Learning**: Uses a custom Linear Regression model (Gradient Descent) to learn consumption patterns from historical data (Temperature + Calendar features).
*   **Dynamic Tariffs**: Applies seasonal Brazilian tariff flags automatically (Green, Yellow, Red) based on the month (modeled for Fortaleza context).
*   **Yearly Projection**: Forecasts daily consumption for the entire next year (2026) and aggregates costs by month.

## 📦 Installation

```bash
npm install
```

## 🛠️ How to Use

### 1. Define your Inventory
Edit `src/data/inventory.json` to match your home appliances.
```json
[
  {
    "name": "Air Conditioner",
    "powerWatts": 1200,
    "hoursPerDay": 8
  },
  ...
]
```

### 2. Generate/Update Data
If you change your inventory, you need to recalculate the historical consumption data so the AI learns the correct patterns.
```bash
npm run process-history
```
*This updates `src/data/consumption.csv` using your new inventory setting.*

### 3. Run Prediction
Train the model and see the forecast for 2026.
```bash
npm start
```

## 🧠 How it Works

1.  **Data Processing**: The system reads `consumption.csv` (2025 History).
2.  **Training**: The ML model learns the relationship between **Temperature**, **Date**, and **Consumption**.
3.  **Forecasting**:
    *   It simulates the next 365 days of 2026.
    *   It predicts temperature volatility (18°C - 22°C).
    *   It predicts consumption for each day using the trained model.
4.  **Billing**:
    *   It applies the correct **Tariff Flag** for the month (e.g., Red in dry season, Green in rainy season).
    *   It sums up taxes and rates to give you the final estimated bill.

## 📂 Project Structure

*   `src/data/inventory.json`: Your appliances.
*   `src/data/consumption.csv`: Historical data used for training.
*   `src/core/forecaster.ts`: Custom Machine Learning implementation.
*   `src/utils/tariff-calculator.ts`: Tax and Tariff logic (Seasonal).
*   `src/main.ts`: Main entry point.

---
*Built with TypeScript & Node.js*

*Created by Angelo Castro*