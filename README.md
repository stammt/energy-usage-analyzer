# Energy Usage Analyzer

I have successfully built the Energy Usage Analyzer application. This tool allows you to upload utility data, correlate it with historical weather, and gain actionable insights into your home's energy efficiency.

## Features Implemented

### 1. Data Ingestion
- **File Upload**: Drag & drop support for utility CSV files.
- **Intelligent Parsing**: Automatically detects Date and Usage columns (supporting Hours, Therms, kWh).
- **Home Profile**: Configuration for Heating Source, Cooling Source, and Zip Code.

### 2. Weather Integration
- **Geocoding**: Converts Zip Code to Latitude/Longitude using Zippopotam.us.
- **Historical Weather**: Fetches daily temperature data from Open-Meteo matching your exact usage dates.

### 3. Analytics Engine
- **Data Unification**: Merges disparate utility logs (Electric/Gas) with weather data into a unified daily view.
- **Unit Conversion**: robustly converts Gas Therms to kWh for "Total Energy" analysis.
- **Regression Analysis**: Calculates:
    -   **Base Load**: Your "always on" energy usage.
    -   **Heating Slope**: kWh used per Heating Degree Day (HDD).
    -   **Cooling Slope**: kWh used per Cooling Degree Day (CDD).

### 4. Visualization & Insights
- **Interactive Dashboard**: Composed chart showing Energy Usage bars vs. Temperature line.
- **Insight Cards**: Quick summary of your efficiency metrics (e.g., "Heating Sensitivity: 3.2 kWh/HDD").
- **Recommendations**: Tailored energy-saving tips based on your specific analysis results.

## Project Structure

- `src/app/page.tsx`: Main application controller.
- `src/components/file-uploader.tsx`: CSV parsing logic.
- `src/components/dashboard.tsx`: Recharts visualization.
- `src/components/insights.tsx`: Metrics display.
- `src/components/recommendations.tsx`: Logic for generating tips.
- `src/lib/analytics.ts`: Core math engine (Regression, HDD/CDD).
- `src/lib/weather-service.ts`: API integration.

## Usage Guide
1.  **Upload**: Drag your CSV file into the upload box.
2.  **Configure**: Enter your Zip Code and select your heating type in the form.
3.  **Fetch Weather**: Click the button to pull historical data.
4.  **Analyze**: View the dashboard, check your specific "Heating Slope", and read the recommendations to save money!

## Running Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open Browser**:
    Navigate to [http://localhost:3000](http://localhost:3000).
