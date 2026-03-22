# Track: Labour Management Page Enhancements

## Overview

This track addresses several improvements for the Labour Management page, focusing on calculator behavior, data loading efficiency between Labour Management and Labour Matrix pages, and accurate display of total scheduled hours by excluding manager shifts.

## Functional Requirements

1.  **Automatic Calculator Calculations:**
    *   The calculator on the Labour Management page should automatically perform calculations once all three input values are loaded.
    *   A click on the "Calculate" button should not be necessary if all values are present.

2.  **Optimized Data Loading:**
    *   When navigating between the Labour Management and Labour Matrix pages, the system should prioritize fetching data from the application's state.
    *   New data should only be fetched from the source if the state is empty.
    *   The state should persist when navigating between these two pages, preventing unnecessary data reloads.

3.  **Accurate Total Scheduled Hours Display:**
    *   The Labour Summary section should display the total scheduled hours.
    *   When calculating total scheduled hours (and any other hour-based calculations), shifts identified as belonging to managers must be omitted.
    *   A manager can be identified by their employee role.

## Non-Functional Requirements

*   **Performance:** Data loading between Labour Management and Labour Matrix pages should be optimized to reduce latency and improve user experience.

## Acceptance Criteria

*   **Calculator:** All three values in the calculator load, and the calculation results are displayed immediately without requiring a button click.
*   **Data Navigation:** Navigating from Labour Management to Labour Matrix and back does not clear the data in memory, and the data is displayed instantly upon returning to the Labour Management page if it was already loaded. Data is fetched from the source only when the state is empty.
*   **Scheduled Hours:** The Labour Summary correctly displays the total scheduled hours, accurately excluding hours from employees identified as managers based on their role.

## Out of Scope

*   Changes to the "Calculate" button's appearance or primary function (beyond its conditional necessity).
*   Modifications to the definition or identification of "manager" roles beyond using the employee role.
*   Any other pages or features not directly related to the Labour Management and Labour Matrix page interactions or the Labour Summary display.