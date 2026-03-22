# Specification: Redesign Deployment Page (Section 1 & Core Components)

## 1.0 Overview
This track is the first part of a larger initiative to redesign the entire application UI based on a new "Stitch Project" design (Kitchen Operations Dashboard). This specific track focuses on renaming the "Schedule" page to "Deployment", creating foundational reusable UI components, and implementing the first of three distinct sections of the new Deployment page layout.

## 2.0 Out of Scope
- Implementation of "Section 2" and "Section 3" of the Deployment page (reserved for future tracks).
- Redesigning other pages (e.g., Availability, Employees) in this specific track.
- Modifications to backend data models or API endpoints.

## 3.0 Functional Requirements

### 3.1 Route Renaming & Navigation Update
- Completely replace the existing `/manage/schedule` route with a new `/manage/deployment` route.
- Update all internal navigation links (sidebar, header, etc.) that point to the old Schedule page to point to the new Deployment page.
- Update the page title and any user-facing text from "Schedule" to "Deployment".

### 3.2 Reusable UI Components & Shadcn
- Extract and build reusable UI components based on the new design system (to be provided via screenshot/Stitch project).
- **Crucially, use Shadcn UI components as the foundational building blocks** to replicate the Stitch design as much as possible before building custom components from scratch. Customizations should ideally happen via Tailwind classes applied to Shadcn base components.
- Anticipated components include tailored cards, specialized headers, buttons, and potentially data display blocks that will be used across the three sections.

### 3.3 Deployment Page - Section 1 Implementation
- Implement the first section of the new Deployment page layout based on the provided design.
- Integrate the newly created reusable components into this section.
- Connect this section to the existing schedule data fetching logic (`useScheduleStore`, existing API endpoints), adapting the UI to display the current data structure.

### 3.4 Design Asset Retrieval
- Utilize the provided Stitch instructions to fetch reference code and images if a screenshot is not provided in time:
  - Project Title: Kitchen Operations Dashboard (ID: 3770843060122289175)
  - Screen: Kitchen Operations Dashboard (ID: 4a0d94f68b844a449e85d9cff9f6d861)

## 4.0 Non-Functional Requirements
- Maintain existing data fetching logic; no backend API changes are required for this phase.
- Ensure the new layout is responsive and follows accessibility guidelines.
- **Design Consistency and Documentation:** Create and maintain a style guide document detailing the design decisions made during this track (e.g., specific Shadcn variants, Tailwind classes used for specific elements). This document will ensure that future UI redesign tracks remain consistent with these foundational choices, compensating for any inconsistencies in the original Stitch designs.

## 5.0 Acceptance Criteria
- The `/manage/schedule` route is removed and replaced by `/manage/deployment`.
- Navigation links correctly route users to `/manage/deployment`.
- Foundational reusable components are created (heavily leveraging Shadcn) and used within the new page.
- "Section 1" of the new design is implemented and correctly displays schedule data using the existing backend structure.
- The UI captures the essence and visual style of the provided design reference while prioritizing component reusability and Shadcn standards over pixel-perfect adherence to inconsistent design elements.
- A style guide document is created or updated with the design decisions made during this track.