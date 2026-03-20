# Plan: Labour Management Updates

## Phase 1: Sales Projection Extraction [checkpoint: d3817b7]

- [x] Task: Implement sales projection extraction logic from "Chipotle Weekly Schedule.pdf". 58dc5e9
    - [x] Write failing tests for PDF parsing and sales data extraction.
    - [x] Implement PDF parsing to extract sales projection data.
    - [x] Ensure extracted data is standardized.
    - [x] Commit changes for sales projection extraction.
- [x] Task: Conductor - User Manual Verification 'Sales Projection Extraction' (Protocol in workflow.md)

## Phase 2: EOD Projection Integration

- [x] Task: Integrate sales projection as initial value for EOD Projection. ad26f46
    - [x] Write failing tests for EOD Projection initialization.
    - [x] Modify EOD Projection component to load sales projection as initial value.
    - [x] Commit changes for EOD Projection initialization.
- [x] Task: Conductor - User Manual Verification 'EOD Projection Integration' (Protocol in workflow.md)

## Phase 3: User Input and Metric Calculation

- [x] Task: Implement user input for current sales and default hours. cfe3c06
    - [x] Write failing tests for current sales input and default hours calculation.
    - [x] Add input fields for current sales.
    - [x] Implement logic to default current hours based on schedule and time.
    - [x] Commit changes for user input and default hours.
- [x] Task: Implement metric calculation logic. cfe3c06
    - [x] Write failing tests for Matrix Hours, Predicted Closing Hours, and Sales Target calculations.
    - [x] Implement calculation logic for Matrix Hours.
    - [x] Implement calculation logic for Predicted Closing Hours.
    - [x] Implement calculation logic for Sales Target.
    - [x] Add "Calculate" button to trigger metric updates.
    - [x] Commit changes for metric calculation.
- [x] Task: Conductor - User Manual Verification 'User Input and Metric Calculation' (Protocol in workflow.md)

## Phase 4: Testing and Refinement

- [ ] Task: Comprehensive testing and refinement.
    - [ ] Write integration tests for the entire labour management flow.
    - [ ] Run all unit and integration tests.
    - [ ] Verify code coverage meets >80% requirement.
    - [ ] Refactor code for clarity and performance.
    - [ ] Commit changes for testing and refinement.
- [ ] Task: Conductor - User Manual Verification 'Testing and Refinement' (Protocol in workflow.md)
