# Debugging Findings

**Issue**: Shifts for the current day are not returned from the database on Sundays late in the day.

**Root Cause Analysis**:
1. The frontend (in local time) determines the `startOfWeek` correctly. For Sunday, March 22nd (EST), the start of the week is Monday, March 16th. It requests shifts from `2026-03-16` to `2026-03-23`.
2. The backend (`src/app/api/schedule/route.ts`) recalculates `currentWeekStart` using `new Date()` (which relies on UTC). When the local time is Sunday late in the evening, the UTC time has already rolled over to Monday of the *next* week (e.g., March 23rd).
3. The backend calculates `currentWeekStart` as Monday, March 23rd.
4. The backend then incorrectly enforces a "current week onwards" rule by clamping the start date: `if (effectiveStartDate < currentWeekStart) { effectiveStartDate = currentWeekStart; }`.
5. Since the frontend's requested start date (March 16th) is before the backend's erroneously advanced `currentWeekStart` (March 23rd), the backend overwrites `effectiveStartDate` to March 23rd.
6. The resulting database query filters for shifts starting on or after March 23rd, returning zero shifts for Sunday, March 22nd.

**Resolution Plan**:
- Remove or refine the logic that forces `effectiveStartDate = currentWeekStart` in the API route so it respects the explicit dates requested by the frontend.
