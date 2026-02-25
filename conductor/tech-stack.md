# Technology Stack

## 1.0 Frontend/Web Application

-   **Framework:** Next.js (React.js based) for server-side rendering (SSR) and API routes.
-   **Language:** TypeScript
-   **Styling & Components:** Tailwind CSS, Radix UI for accessible UI components, and **Shadcn** for pre-built, customizable UI components.
-   **Authentication:** NextAuth.js or Clerk for secure user management and session handling.
-   **State Management:** Zustand for efficient client-side state management.
-   **Deployment:** Vercel

## 2.0 Backend (Python Worker/API)

-   **Language:** Python 3.10+
-   **Web Framework:** FastAPI (ASGI) for building robust and performant APIs.
-   **Gmail Integration:** Google API Python Client for secure interaction with Gmail API.
-   **PDF Parsing:** `pdfplumber` or similar library for extracting data from PDF schedules.
-   **Database Driver:** `psycopg2-binary` for PostgreSQL connectivity.
-   **Containerization:** Dockerized for containerization.
-   **Deployment Target:** Vercel (Next.js API routes with Python runtime)

## 3.0 Database

-   **Type:** PostgreSQL
-   **ORM (for Next.js):** Prisma ORM for type-safe database access and migrations.
-   **Hosting:** Vercel (PostgreSQL database)

## 4.0 Deployment

-   **Frontend:** Vercel
-   **Database:** Vercel (PostgreSQL)
-   **Backend:** Vercel (Python Serverless Functions)
-   **CI/CD:** GitHub Actions for automated testing and deployment.
