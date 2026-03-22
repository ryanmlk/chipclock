# Specification: Labour Matrix Calculation and UI Enhancement

## 1.0 Overview

This track aims to refactor the logic for the Labour Matrix, specifically concerning the calculation of sales targets, allowed hours, and predicted gain/loss. It also includes a UI enhancement to display the labour matrix configuration more understandably, showing ranges of sales levels and their corresponding allowed hours.

## 2.0 Functional Requirements

### 2.1 Calculation Logic Updates
- The Labour Matrix logic for determining allowed hours based on sales projections will be updated.
- For a given sales projection, the system will identify the corresponding hour allowance by finding the first record in the Labour Matrix where the `Upper Limit` is greater than or equal to the projected sales.
- This updated logic will be applied to the calculations for sales targets, allowed hours, and predicted gain/loss.

### 2.2 UI Enhancement for Labour Matrix Configuration
- The Labour Matrix configuration, currently located in `manage/labour/config`, will be updated to display ranges more clearly.
- For each record in the configuration, the display format for the sales level will be `<LowerLimit> to <Upper Limit>`.
- **Implicit Lower Limit:**
    - For the first record, the `LowerLimit` will be implicitly `$0`.
    - For subsequent records, the `LowerLimit` will be the `Upper Limit` of the previous record plus one.
- **UI Display Format:**
    - Sales values will be formatted using a dollar sign and comma for thousands separators (e.g., `$4,613`).
    - The displayed range will be in the format: `$LowerLimit to $UpperLimit`.

### 2.3 Data Structure
- The Labour Matrix data is currently stored in the database with `sales_level` (representing the Upper Limit) and `hours_allowed` properties. This structure will be maintained.

## 3.0 Non-Functional Requirements

### 3.1 Performance
- The changes should not negatively impact the performance of the Labour Management page.

### 3.2 Maintainability
- The code should be clear, well-commented, and follow project conventions.

## 4.0 Acceptance Criteria

- Calculations for sales targets, allowed hours, and predicted gain/loss accurately reflect the updated logic using the closest higher upper sales limit.
- The Labour Matrix configuration in `manage/labour/config` displays sales ranges in the format `$LowerLimit to $UpperLimit`.
- The implicit lower limit is correctly applied ($0 for the first record, previous upper limit + 1 for subsequent records).
- Currency formatting for sales values ($, comma thousands separator) is correctly applied.

## 5.0 Out of Scope

- Modifications to any other parts of the Labour Management system not directly related to the Labour Matrix calculations or display.
- Storing the implicit lower limit in the database.