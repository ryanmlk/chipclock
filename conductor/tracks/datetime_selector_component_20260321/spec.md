# Track: DateTime Selector Component

## Overview

This track focuses on creating a reusable DateTime Selector component that can be used across the application. It aims to provide an improved and easily accessible date and time selection experience, addressing current UI visibility issues and enforcing client-side timezone and time constraints.

## Functional Requirements

1.  **Reusable Component Creation:**
    *   Develop a standardized DateTime Selector component that can be incorporated into multiple pages, including Labour Management and Deployment pages.
    *   The component should abstract the current logic from the Labour Management page and store it in a commonly accessible place.

2.  **UI Enhancements for Visibility:**
    *   Improve the text visibility of the DateTime Selector, especially in both light and dark modes.
    *   For light mode, use black text.
    *   For dark mode, use white text.
    *   The text color scheme should be consistent with the main title styling on the Labour Management screen.

3.  **Time and Timezone Constraints:**
    *   The DateTime Selector must only allow the selection of a date and time that is greater than or equal to the current client's time.
    *   The timezone used for selection and display must be the client's local timezone.

4.  **Mobile Responsiveness:**
    *   Ensure the DateTime Selector component is appropriately usable on mobile devices, adapting its layout and interactions for smaller screens. The existing component on the Labour Management page serves as a reference for expected mobile behavior.

## Non-Functional Requirements

*   **Accessibility:** The component should be accessible, supporting keyboard navigation and screen reader usage. (Implied by mobile usability and common component standards).
*   **Reusability:** The component must be designed for easy integration into different parts of the application.

## Acceptance Criteria

*   A new, reusable DateTime Selector component is created.
*   The component's text is clearly visible in both light and dark modes, using black text for light mode and white text for dark mode, consistent with the Labour Management screen's title styling.
*   Users can only select a date and time that is current or in the future, relative to their client's timezone.
*   The component functions correctly and is usable on mobile devices.
*   The component can be easily integrated into the Labour Management and Deployment pages.

## Out of Scope

*   Modifications to other components or pages not directly related to the DateTime Selector.
*   Server-side timezone handling or validation.
*   Specific implementations of date/time calculations using the selected values; the component's responsibility is selection and display.