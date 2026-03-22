# Implementation Plan: Labour Matrix Calculation and UI Enhancement

## Phase 1: Calculation Logic and Initial UI Implementation
- [ ] **Task: Update Labour Matrix calculation logic.**
    - [ ] Write failing integration tests for the new calculation logic.
    - [ ] Implement the logic to find the correct hour allowance based on sales projection and upper limits.
    - [ ] Ensure calculations for sales targets, allowed hours, and predicted gain/loss use the updated logic.
    - [ ] Commit code changes.
    - [ ] Update plan.md with commit SHA.
- [ ] **Task: Implement UI for displaying Labour Matrix ranges.**
    - [ ] Write failing unit tests for the new UI display logic.
    - [ ] Implement the display of `<LowerLimit> to <Upper Limit>` format.
    - [ ] Handle the implicit lower limit ($0 for the first record, previous upper limit + 1 for others).
    - [ ] Apply correct currency formatting ($, comma thousands separator, no decimals).
    - [ ] Commit code changes.
    - [ ] Update plan.md with commit SHA.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Testing, Refinement, and Quality Assurance
- [ ] **Task: Refactor code and tests.**
    - [ ] Review and refactor the calculation logic implementation.
    - [ ] Review and refactor the UI implementation.
    - [ ] Review and refactor associated unit and integration tests.
    - [ ] Commit code changes.
    - [ ] Update plan.md with commit SHA.
- [ ] **Task: Verify non-functional requirements.**
    - [ ] Conduct manual testing to ensure performance is not negatively impacted.
    - [ ] Ensure seamless integration and adherence to design patterns.
    - [ ] Commit code changes.
    - [ ] Update plan.md with commit SHA.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Finalization and Documentation
- [ ] **Task: Update relevant documentation.**
    - [ ] Review `spec.md` and `product.md` for any necessary updates based on the implementation.
    - [ ] Commit documentation changes.
    - [ ] Update plan.md with commit SHA.
- [ ] **Task: Ensure all code style and coverage requirements are met.**
    - [ ] Run linters and formatters.
    - [ ] Verify code coverage meets project requirements (>80%).
    - [ ] Commit code changes.
    - [ ] Update plan.md with commit SHA.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)