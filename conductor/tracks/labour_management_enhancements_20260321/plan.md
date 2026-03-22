# Implementation Plan: Labour Management Page Enhancements

## Phase 1: Calculator Auto-Calculation Logic

This phase focuses on implementing the automatic calculation when all calculator inputs are loaded.

- [ ] **Task: Implement auto-calculation for calculator.**
    - [ ] **Goal:** Ensure calculator performs calculations automatically when all three values are loaded.
    - [ ] **TDD:** Write failing test for auto-calculation.
    - [ ] **Implementation:** Implement logic to trigger calculation based on loaded input values.
    - [ ] **Refactor:** Optimize calculation trigger logic.
    - [ ] **Code Coverage:** Ensure >80% coverage for the calculator logic.
    - [ ] **Commit:** Commit calculator auto-calculation logic.
    - [ ] **Task Summary:** Attach git note for calculator auto-calculation.
    - [ ] **Plan Update:** Update `plan.md` with commit SHA.
- [ ] **Task: Conductor - User Manual Verification 'Calculator Auto-Calculation Logic' (Protocol in workflow.md)**
    - [checkpoint: <sha>]

## Phase 2: Optimized Data Loading Between Pages

This phase addresses the efficient loading of data between Labour Management and Labour Matrix pages.

- [ ] **Task: Implement state persistence for Labour Management data.**
    - [ ] **Goal:** Prevent state clearing when navigating between Labour Management and Labour Matrix pages.
    - [ ] **TDD:** Write failing test for state persistence.
    - [ ] **Implementation:** Modify data management to retain state across page navigations.
    - [ ] **Refactor:** Optimize state management for performance.
    - [ ] **Code Coverage:** Ensure >80% coverage for state management logic.
    - [ ] **Commit:** Commit state persistence logic.
    - [ ] **Task Summary:** Attach git note for state persistence.
    - [ ] **Plan Update:** Update `plan.md` with commit SHA.
- [ ] **Task: Implement conditional data fetching.**
    - [ ] **Goal:** Fetch data only if the state is empty when navigating.
    - [ ] **TDD:** Write failing test for conditional fetching.
    - [ ] **Implementation:** Add logic to check state before initiating a data fetch.
    - [ ] **Refactor:** Streamline conditional fetching logic.
    - [ ] **Code Coverage:** Ensure >80% coverage for data fetching logic.
    - [ ] **Commit:** Commit conditional data fetching logic.
    - [ ] **Task Summary:** Attach git note for conditional data fetching.
    - [ ] **Plan Update:** Update `plan.md` with commit SHA.
- [ ] **Task: Conductor - User Manual Verification 'Optimized Data Loading Between Pages' (Protocol in workflow.md)**
    - [checkpoint: <sha>]

## Phase 3: Accurate Total Scheduled Hours Calculation

This phase focuses on correctly calculating and displaying total scheduled hours, excluding manager shifts.

- [ ] **Task: Implement manager shift exclusion logic.**
    - [ ] **Goal:** Omit manager shifts from total scheduled hours calculation.
    - [ ] **TDD:** Write failing test for manager shift exclusion.
    - [ ] **Implementation:** Add logic to identify managers by role and exclude their shifts from calculations.
    - [ ] **Refactor:** Optimize manager identification and exclusion.
    - [ ] **Code Coverage:** Ensure >80% coverage for calculation logic.
    - [ ] **Commit:** Commit manager shift exclusion logic.
    - [ ] **Task Summary:** Attach git note for manager shift exclusion.
    - [ ] **Plan Update:** Update `plan.md` with commit SHA.
- [ ] **Task: Display total scheduled hours in Labour Summary.**
    - [ ] **Goal:** Ensure the Labour Summary correctly displays the calculated total scheduled hours.
    - [ ] **TDD:** Write failing test for displaying total scheduled hours in the summary.
    - [ ] **Implementation:** Update the UI to display the calculated total scheduled hours.
    - [ ] **Refactor:** Ensure UI display logic is clean and efficient.
    - [ ] **Code Coverage:** Ensure >80% coverage for the summary display logic.
    - [ ] **Commit:** Commit Labour Summary display update.
    - [ ] **Task Summary:** Attach git note for Labour Summary display.
    - [ ] **Plan Update:** Update `plan.md` with commit SHA.
- [ ] **Task: Conductor - User Manual Verification 'Accurate Total Scheduled Hours Calculation' (Protocol in workflow.md)**
    - [checkpoint: <sha>]