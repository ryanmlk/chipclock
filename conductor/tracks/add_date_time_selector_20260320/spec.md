# Specification: Future Date and Time Selector for Labour Management

## 1.0 Overview

This track introduces a new date and time selector to the Labour Management Dashboard. The purpose is to enable users to select future dates and times for proactive labor management and to facilitate accurate testing of related calculations. The selector will replace the current date displayed in the dashboard's title.

## 2.0 Functional Requirements

### 2.1 Date and Time Selector Component
- A date and time selector component shall be added to the Labour Management Dashboard.
- This component will visually replace the current date displayed in the dashboard's title area.

### 2.2 Date and Time Selection Logic
- The selector must only allow users to select dates and times that are in the future relative to the current system time.
- The default value of the selector will be the current date and time at the moment the Labour Management Dashboard page loads.
- The selected date and time value will be used as the reference point for all relevant calculations that currently rely on the system's current date and time. This specifically includes calculations involving remaining hours in a day, which will now be calculated against the selected date and time.

### 2.3 UI Component
- The Shadcn DatePicker component will be utilized for implementing the date and time selector to ensure consistency with the existing UI.

## 3.0 Non-Functional Requirements

### 3.1 Performance
- The addition of the date and time selector should not negatively impact the performance or responsiveness of the Labour Management Dashboard.

### 3.2 Integration
- The new component must integrate seamlessly with the existing UI and design system, adhering to established design patterns.

## 4.0 Out of Scope

- Editing or modifying any components on the Labour Management Dashboard other than the new date and time selector itself.
- Altering any logic not directly related to calculations that use the current date and time.
- Modifying the existing date display in the title beyond its replacement by the new selector component.