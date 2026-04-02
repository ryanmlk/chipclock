# Specification for Track: Calculator Page Bug Fixes

## 1.0 Overview

This track addresses several bugs found on the labor management page related to the calculator functionality, specifically concerning the handling of current hours, sales values, and date/time simulations.

## 2.0 Functional Requirements

### 2.1 Current Hours Display and Clearing Bug
- **Bug Description:** When the "current hours worked" field is populated with a value (either saved or calculated), the user is unable to clear the entire value. Upon clearing, the calculated hours reappear.
- **Requirement:** The "current hours worked" field must allow users to completely clear its value. If cleared, it should remain empty and not auto-populate with calculated hours.

### 2.2 Simulation Mode Date/Time Change Logic
- **Bug Description:** If the date/time is changed to be outside of the current time +- 10 minutes (indicating "simulation mode"), the system should disregard any saved hours or current sales values and use only the calculated values based on the selected time.
- **Requirement:** When in simulation mode (date/time outside current time +- 10 mins), the "current hours worked" field should display its calculated value, and the "current sales" field should be empty.

### 2.3 Sales Target Display Logic
- **Bug Description:** The current display logic for the sales target might not be using the lower limit of the matrix range.
- **Requirement:** The value shown for the sales target must be the lower limit of the value range defined in the labor matrix. For example, if the matrix defines a range of "$1000 - $2000 = 30hrs", the sales target displayed should be "$1000".

## 3.0 Non-Functional Requirements

None specified for this track.

## 4.0 Acceptance Criteria

### 4.1 Current Hours Field
- User can successfully clear the "current hours worked" field.
- Cleared "current hours worked" field remains empty and does not re-populate with calculated hours.

### 4.2 Simulation Mode
- Changing the date/time to simulate a future/past scenario correctly triggers simulation mode.
- In simulation mode, "current hours worked" displays the calculated value.
- In simulation mode, "current sales" field is empty.

### 4.3 Sales Target Display
- The displayed sales target accurately reflects the lower bound of the corresponding labor matrix range.

## 5.0 Out of Scope

- Modifications to the labor matrix definition itself.
- Changes to how employees input their availability or submit time-off requests.
- Any other aspects of the labor management page not directly related to the described bugs.
