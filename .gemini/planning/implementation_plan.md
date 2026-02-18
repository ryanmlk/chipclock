# Implementation Plan - Finish ScheduleExtractor (Chip Clock)

This plan outlines the steps to complete the ScheduleExtractor project, focusing on the management dashboard, weekly schedule grid view, and overall UI/UX polish to provide a "premium" experience.

## Proposed Changes

### [Component] Database Migration (Azure → Neon)
Move data and connection logic from Azure PostgreSQL to Neon.
- **[MODIFY] [prisma/schema.prisma](file:///mnt/area51/Projects/ScheduleExtractor/chip_clock/prisma/schema.prisma)**: Update environment variables references.
- **[MODIFY] [.env](file:///mnt/area51/Projects/ScheduleExtractor/chip_clock/.env)**: Update `POSTGRES_CONN_STR` with Neon connection string.

### [Component] Gmail Worker Migration (Azure → Vercel)
Migrate the Python parsing logic to a Vercel environment.
- **[MODIFY] [schedule_parser.py](file:///mnt/area51/Projects/ScheduleExtractor/gmail_worker/schedule_parser.py)**: 
    - Replace `camelot` with `pdfplumber` for table extraction.
    - Remove dependencies on Ghostscript.
    - Update to use the new `storage_utils.py`.
- **[NEW] [storage_utils.py](file:///mnt/area51/Projects/ScheduleExtractor/gmail_worker/storage_utils.py)**: 
    - Implement file storage using Vercel Blob or simply pass byte data if files are processed on-the-fly.
    - Remove `azure-storage-blob` dependency.
- **[NEW] [api/parse.py]**: Create a Vercel-compatible Python API route to handle the parsing trigger.
- **[NEW] [vercel.json]**: Configure Cron jobs for periodic Gmail polling.

### [Component] Management Dashboard Hub
The current `/manage` page is a placeholder. I will transform it into a functional hub.

#### [MODIFY] [page.tsx](file:///mnt/area51/Projects/ScheduleExtractor/chip_clock/src/app/manage/page.tsx)
- Implement a card-based dashboard layout.
- Add summary statistics (Total Employees, Today's Shifts, Labour Status).
- Add clear navigation cards to:
    - **Labour Management**: Sales vs. Hours calculation.
    - **Employee Management**: Staff directory and roles.
    - **Availability Tracker**: Weekly recurring availability.
    - **Schedule Manager**: Deployment and weekly grid views.

### [Component] Weekly Schedule Grid
The "Weekly Overview" in `/manage/schedule` is currently a placeholder. I will implement a proper grid view.

#### [MODIFY] [page.tsx](file:///mnt/area51/Projects/ScheduleExtractor/chip_clock/src/app/manage/schedule/page.tsx)
- Replace the "coming soon" placeholder with a functional weekly grid.
- Rows: Employees.
- Columns: Days of the week (Mon-Sun).
- Cells: Shift times and positions.
- Add navigation between weeks.

### [Component] UI/UX Polish
Improve the landing page and navigation to feel more premium.

#### [MODIFY] [page.tsx](file:///mnt/area51/Projects/ScheduleExtractor/chip_clock/src/app/page.tsx)
- Modernize the landing page layout using glassmorphism and better typography.
- Improve the name entry and schedule display flow.

#### [MODIFY] [navBar.tsx](file:///mnt/area51/Projects/ScheduleExtractor/chip_clock/src/components/navBar.tsx)
- Clean up navigation items and ensure consistent styling.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure code quality.
- Verify API routes (`/api/schedule`, `/api/employees`) return expected data using `curl` or manual browser checks.

### Manual Verification
1.  **Management Hub**: Navigate to `/manage` and verify all dashboard cards lead to their respective sections.
2.  **Weekly Grid**: Go to `/manage/schedule`, switch to "Weekly Overview", and verify that a grid of employees and shifts for the week is displayed correctly.
3.  **Responsive Design**: Test the new components on different screen sizes using browser developer tools.
4.  **End-to-End Flow**:
    - Add a mock shift in the Schedule Manager.
    - Verify it appears on the personal landing page schedule view.
    - Check the Labour Management page to see if it updates the scheduled hours.
