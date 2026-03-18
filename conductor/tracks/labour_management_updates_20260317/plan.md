# Plan: Labour Management Updates

## Phase 1: Sales Projection Extraction

- [ ] Task: Implement sales projection extraction logic from "Chipotle Weekly Schedule.pdf".
    - [ ] Write failing tests for PDF parsing and sales data extraction.
    - [ ] Implement PDF parsing to extract sales projection data.
    - [ ] Ensure extracted data is standardized.
    - [ ] Commit changes for sales projection extraction.
- [ ] Task: Conductor - User Manual Verification 'Sales Projection Extraction' (Protocol in workflow.md)

## Phase 2: EOD Projection Integration

- [ ] Task: Integrate sales projection as initial value for EOD Projection.
    - [ ] Write failing tests for EOD Projection initialization.
    - [ ] Modify EOD Projection component to load sales projection as initial value.
    - [ ] Commit changes for EOD Projection initialization.
- [ ] Task: Conductor - User Manual Verification 'EOD Projection Integration' (Protocol in workflow.md)

## Phase 3: User Input and Metric Calculation

- [ ] Task: Implement user input for current sales and default hours.
    - [ ] Write failing tests for current sales input and default hours calculation.
    - [ ] Add input fields for current sales.
    - [ ] Implement logic to default current hours based on schedule and time.
    - [ ] Commit changes for user input and default hours.
- [ ] Task: Implement metric calculation logic.
    - [ ] Write failing tests for Matrix Hours, Predicted Closing Hours, and Sales Target calculations.
    - [ ] Implement calculation logic for Matrix Hours.
    - [ ] Implement calculation logic for Predicted Closing Hours.
    - [ ] Implement calculation logic for Sales Target.
    - [ ] Add "Calculate" button to trigger metric updates.
    - [ ] Commit changes for metric calculation.
- [ ] Task: Conductor - User Manual Verification 'User Input and Metric Calculation' (Protocol in workflow.md)

## Phase 4: Testing and Refinement

- [ ] Task: Comprehensive testing and refinement.
    - [ ] Write integration tests for the entire labour management flow.
    - [ ] Run all unit and integration tests.
    - [ ] Verify code coverage meets >80% requirement.
    - [ ] Refactor code for clarity and performance.
    - [ ] Commit changes for testing and refinement.
- [ ] Task: Conductor - User Manual Verification 'Testing and Refinement' (Protocol in workflow.md)
