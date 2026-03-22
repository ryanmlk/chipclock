# Implementation Plan: Labour Matrix Calculation and UI Enhancement

## Phase 1: Calculation Logic and Initial UI Implementation [checkpoint: 8748e77]
- [x] **Task: Update Labour Matrix calculation logic.**
    - [x] Write failing integration tests for the new calculation logic.
    - [x] Implement the logic to find the correct hour allowance based on sales projection and upper limits.
    - [x] Ensure calculations for sales targets, allowed hours, and predicted gain/loss use the updated logic.
    - [x] Commit code changes.
    - [x] Update plan.md with commit SHA (a3341d7).
- [x] **Task: Implement UI for displaying Labour Matrix ranges.**
    - [x] Write failing unit tests for the new UI display logic.
    - [x] Implement the display of `<LowerLimit> to <Upper Limit>` format.
    - [x] Handle the implicit lower limit ($0 for the first record, previous upper limit + 1 for others).
    - [x] Apply correct currency formatting ($, comma thousands separator, no decimals).
    - [x] Commit code changes.
    - [x] Update plan.md with commit SHA (faf5142).
- [x] **Task:** Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Testing, Refinement, and Quality Assurance [checkpoint: 355fcae]
- [x] **Task: Refactor code and tests.**
    - [x] Review and refactor the calculation logic implementation.
    - [x] Review and refactor the UI implementation.
    - [x] Review and refactor associated unit and integration tests.
    - [x] Commit code changes.
    - [x] Update plan.md with commit SHA (N/A).
- [x] **Task: Verify non-functional requirements.**
    - [x] Conduct manual testing to ensure performance is not negatively impacted.
    - [x] Ensure seamless integration and adherence to design patterns.
    - [x] Commit code changes.
    - [x] Update plan.md with commit SHA (N/A).
- [x] **Task:** Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Finalization and Documentation [checkpoint: feffd43]
- [x] **Task: Update relevant documentation.**
    - [x] Review `spec.md` and `product.md` for any necessary updates based on the implementation.
    - [x] Commit documentation changes.
    - [x] Update plan.md with commit SHA (N/A).
- [x] **Task: Ensure all code style and coverage requirements are met.**
    - [x] Run linters and formatters.
    - [x] Verify code coverage meets project requirements (>80%).
    - [x] Commit code changes.
    - [x] Update plan.md with commit SHA (N/A).
- [x] **Task:** Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)