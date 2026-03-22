# Implementation Plan: Labour Management Page Enhancements

## Phase 1: Calculator Auto-Calculation Logic

This phase focuses on implementing the automatic calculation when all calculator inputs are loaded.

- [x] **Task: Implement auto-calculation for calculator.**
    - [x] **Goal:** Ensure calculator performs calculations automatically when all three values are loaded.
    - [x] **TDD:** Write failing test for auto-calculation.
    - [x] **Implementation:** Implement logic to trigger calculation based on loaded input values.
    - [x] **Refactor:** Optimize calculation trigger logic.
    - [x] **Code Coverage:** Ensure >80% coverage for the calculator logic.
    - [x] **Commit:** Commit calculator auto-calculation logic.
    - [x] **Task Summary:** Attach git note for calculator auto-calculation.
    - [x] **Plan Update:** Update `plan.md` with commit SHA (3464062).
- [x] **Task: Conductor - User Manual Verification 'Calculator Auto-Calculation Logic' (Protocol in workflow.md)**
    - [checkpoint: 3464062]

## Phase 2: Optimized Data Loading Between Pages

This phase addresses the efficient loading of data between Labour Management and Labour Matrix pages.

- [x] **Task: Implement state persistence for Labour Management data.**
    - [x] **Goal:** Prevent state clearing when navigating between Labour Management and Labour Matrix pages.
    - [x] **TDD:** Write failing test for state persistence.
    - [x] **Implementation:** Modify data management to retain state across page navigations.
    - [x] **Refactor:** Optimize state management for performance.
    - [x] **Code Coverage:** Ensure >80% coverage for state management logic.
    - [x] **Commit:** Commit state persistence logic.
    - [x] **Task Summary:** Attach git note for state persistence.
    - [x] **Plan Update:** Update `plan.md` with commit SHA (fe96835).
- [x] **Task: Implement conditional data fetching.**
    - [x] **Goal:** Fetch data only if the state is empty when navigating.
    - [x] **TDD:** Write failing test for conditional fetching.
    - [x] **Implementation:** Add logic to check state before initiating a data fetch.
    - [x] **Refactor:** Streamline conditional fetching logic.
    - [x] **Code Coverage:** Ensure >80% coverage for data fetching logic.
    - [x] **Commit:** Commit conditional data fetching logic.
    - [x] **Task Summary:** Attach git note for conditional data fetching.
    - [x] **Plan Update:** Update `plan.md` with commit SHA (fe96835).
- [x] **Task: Conductor - User Manual Verification 'Optimized Data Loading Between Pages' (Protocol in workflow.md)**
    - [checkpoint: fe96835]

## Phase 3: Accurate Total Scheduled Hours Calculation

This phase focuses on correctly calculating and displaying total scheduled hours, excluding manager shifts.

- [x] **Plan Update:** Update `plan.md` with commit SHA (e5449f9).
- [x] **Task: Display total scheduled hours in Labour Summary.**
    - [x] **Goal:** Ensure the Labour Summary correctly displays the calculated total scheduled hours.
    - [x] **TDD:** Write failing test for displaying total scheduled hours in the summary.
    - [x] **Implementation:** Update the UI to display the calculated total scheduled hours in a card.
    - [x] **Refactor:** Ensure UI display logic is clean and efficient.
    - [x] **Code Coverage:** Ensure >80% coverage for the summary display logic.
    - [x] **Commit:** Commit Labour Summary display update.
    - [x] **Task Summary:** Attach git note for Labour Summary display.
    - [x] **Plan Update:** Update `plan.md` with commit SHA (e5449f9).
- [ ] **Task: Conductor - User Manual Verification 'Accurate Total Scheduled Hours Calculation' (Protocol in workflow.md)**
    - [checkpoint: e5449f9]