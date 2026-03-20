# Specification: Labour Management Updates

### 1.0 Overview

This track aims to enhance the labour management page by incorporating sales projection data, calculating updated EOD (End of Day) projection metrics, and providing a more dynamic user experience for managing current sales and hours.

### 2.0 Functional Requirements

**2.1 Sales Projection Extraction:**
*   The system shall extract sales projection data from the "Chipotle Weekly Schedule.pdf". This extraction logic needs to be implemented within the existing API structure.

**2.2 EOD Projection Initialization:**
*   The extracted sales projection shall be used as the initial value when loading the EOD Projection on the labour management page.

**2.3 User Input for Current Sales and Hours:**
*   Users shall be able to manually enter current sales figures.
*   Current hours shall be defaulted based on scheduled hours up to the current time.

**2.4 Metric Calculation:**
*   Upon clicking a "Calculate" button, the following metrics shall be updated:
    *   **Matrix Hours:** The hours allowed based on the matrix for the EOD Projection.
    *   **Predicted Closing Hours:** Current Hours + Hours remaining based on the schedule and current time.
    *   **Sales Target:** The sales value needed to reach the target for the predicted closing hours.

**2.5 Schedule PDF Processing:**
*   The "Chipotle Weekly Schedule.pdf" will be processed by altering existing logic and testing within the `api` folder, specifically focusing on adding extraction logic for sales projection.

### 3.0 Non-Functional Requirements

*   **Performance:** Metric calculations should be performed efficiently to provide near real-time updates.
*   **Data Integrity:** Sales projection and calculated metrics must be accurate and consistently updated.

### 4.0 Acceptance Criteria

*   Sales projection data can be successfully extracted from the "Chipotle Weekly Schedule.pdf".
*   The EOD Projection defaults correctly upon page load, using the extracted sales projection.
*   Users can input current sales, and current hours are defaulted correctly.
*   Clicking the "Calculate" button updates all three metrics (Matrix Hours, Predicted Closing Hours, Sales Target) accurately.
*   The PDF extraction logic integrates seamlessly with the existing API without disrupting other functionalities.

### 5.0 Out of Scope

*   Modifications to the core scheduling logic beyond what is required for sales projection extraction and metric calculation.
*   User interface redesign beyond the necessary fields for input and display of new metrics.
*   Direct integration with external sales data sources (as this is explicitly scoped to the PDF).
