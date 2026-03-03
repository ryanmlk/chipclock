# Product Definition: Chipotle Schedule Extractor

## 1.0 Introduction

The Chipotle Schedule Extractor is a comprehensive internal tool designed to streamline the management of employee schedules, availability, time-off requests, and labor metrics for Chipotle restaurants. It aims to reduce manual data entry, minimize scheduling conflicts, and optimize labor costs by providing an integrated platform for both employees and managers.

## 2.0 Vision

To empower Chipotle management with an intuitive, efficient, and data-driven platform for labor management, fostering a balanced work-life for employees while optimizing operational efficiency and profitability.

## 2.1 Visual Design Vision

The application's user interface will be modern, clean, and highly functional, guided by the "Kitchen Operations Dashboard" (Stitch Project) design system. This includes a focus on data readability, responsive feedback, and intuitive navigation.

## 3.0 Minimum Viable Product (MVP)

The MVP will focus on the core functionalities essential for immediate value delivery:

### 3.1 Employee Shift Extraction & Parsing
- **Gmail Integration:** Securely connect to designated Gmail accounts to extract email attachments containing weekly schedules (primarily PDF format).
- **PDF Parsing:** Accurately parse PDF schedule documents to extract employee names, shift timings (start and end), and assigned roles/positions.
- **Data Standardization:** Convert extracted data into a standardized format compatible with the system's database schema.

### 3.2 Deployment Management
- **Deployment Display:** Present extracted and manually entered shifts in a clear deployment view (e.g., daily shifts, filtered by time blocks) for managers and individual employees.
- **Basic CRUD for Shifts:** Allow managers to Create, Read, Update, and Delete individual shifts within the application.
- **Conflict Detection:** Highlight immediate scheduling conflicts (e.g., overlapping shifts for a single employee).

### 3.3 Employee Availability & Time-Off Requests
- **Availability Input:** Enable employees to input recurring weekly availability slots (e.g., Monday 9 AM - 5 PM).
- **Time-Off Request Submission:** Allow employees to submit time-off requests with specified dates and reasons.
- **Manager Approval:** Provide managers with a simple interface to review and approve/deny time-off requests.

### 3.4 User Authentication & Authorization
- **Secure Login:** Implement secure authentication for managers and employees (e.g., email/password or SSO if applicable to Chipotle's existing systems).
- **Role-Based Access Control (RBAC):** Differentiate access and functionalities between managers and employees (e.g., only managers can create/edit schedules).

## 4.0 Technical Specification

### 4.1 Architecture

The system will employ a monorepo architecture, comprising a Next.js frontend/API and a Python backend service, communicating via RESTful APIs.

- **Frontend/Web Application:**
    - **Framework:** Next.js (React.js based) for server-side rendering (SSR) and API routes.
    - **Language:** TypeScript
    - **Styling:** Tailwind CSS, Radix UI for accessible UI components.
    - **Authentication:** NextAuth.js or Clerk for secure user management and session handling.
    - **State Management:** Zustand for efficient client-side state management.

- **Backend (Python Worker/API):**
    - **Language:** Python 3.10+
    - **Web Framework:** FastAPI (ASGI) for building robust and performant APIs.
    - **Gmail Integration:** Google API Python Client for secure interaction with Gmail API.
    - **PDF Parsing:** `pdfplumber` or similar library for extracting data from PDF schedules.
    - **Database Driver:** `psycopg2-binary` for PostgreSQL connectivity.
    - **Deployment:** Dockerized for containerization and easy deployment.

### 4.2 Database

- **Type:** PostgreSQL
- **ORM (for Next.js):** Prisma ORM for type-safe database access and migrations.
- **Schema:**
    - `Employee` (id, first_name, last_name, email, role, weekly_hrs, etc.)
    - `WeeklySchedule` (id, week_start_date, created_by, published, shifts)
    - `Shift` (id, schedule_id, employee_id, shift_start, shift_end, position)
    - `AvailabilitySlot` (id, employee_id, day_of_week, start_time, end_time)
    - `AvailabilityException` (id, employee_id, date, is_available, reason)
    - `TimeOffRequest` (id, employee_id, start_date, end_date, status, reviewed_by)
    - `LabourMatrix` (id, sales_level, hours_allowed)
    - `AuditLog` (id, actor_id, action, object_type, object_id, details)

### 4.3 Deployment

- **Containerization:** Docker for both Next.js and Python services.
- **Orchestration:** To be determined (e.g., Azure Container Apps, Kubernetes) for production.
- **CI/CD:** GitHub Actions for automated testing and deployment.

## 5.0 Future Considerations (Beyond MVP)

- **Advanced Labor Analytics:** Integrate sales data for predictive scheduling and labor cost optimization.
- **Reporting:** Generate reports on employee hours, overtime, and scheduling efficiency.
- **Mobile Application:** Native mobile apps for employees to view schedules and manage availability on the go.
- **Notifications:** Email or in-app notifications for new schedules, time-off approvals, etc.
- **Integration with POS/HR Systems:** Seamless data exchange with existing Chipotle systems.