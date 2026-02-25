# Specification: Optimize Schedule Extraction for Vercel Deployment

## 1.0 Overview

The goal of this track is to resolve deployment issues on Vercel caused by the schedule extraction functionality. Currently, the serverless function exceeds Vercel's 250 MB unzipped maximum size limit due to heavy PDF parsing libraries. The primary objective is to swap the existing heavy library for a lighter alternative while maintaining the exact same extraction logic and output format. Additionally, a local script will be created to verify the unzipped size before deployment to prevent future failures.

## 2.0 Functional Requirements

### 2.1 Library Replacement
- Identify and integrate a lightweight PDF parsing library suitable for a serverless environment (e.g., PyMuPDF, pdf.js, or similar).
- Replace the current heavy library (presumably `pdfplumber` or its underlying dependencies like `ghostscript`) with the chosen lightweight alternative.
- Ensure the new library accurately extracts the required text and layout information from the provided Chipotle schedule PDFs.

### 2.2 Extraction Logic Verification
- Maintain the existing parsing logic to accurately extract `employee_name`, `position`, `shift_start`, and `shift_end`.
- Use the provided `Extracted_Schedule.csv` as the ground truth to verify the output of the new implementation against the sample PDF.
- The output format and data types must remain identical to the current implementation to ensure compatibility with the database schema.
- **Reference SQL for Testing:** The following SQL statement can be used to extract the schedule from the database for comparison during testing:
  ```sql
  SELECT E.first_name || ' ' || E.last_name AS Employee_Name, S.position, S.shift_start, S.shift_end FROM "Employee" E RIGHT JOIN "Shift" S ON S.employee_id = E.id WHERE S.schedule_id = <LATEST_SCHEDULE_ID>;
  ```

### 2.3 Pre-deployment Size Check
- Develop a local script (e.g., a bash script or an npm script using a tool like `bundlephobia` or a custom size calculator) that estimates the unzipped size of the serverless function.
- The script should target the specific directory or build output that Vercel deploys (e.g., `.vercel/output/functions` or the Next.js API routes build).
- The script should output a clear warning or error if the estimated size exceeds or approaches the 250 MB limit.

## 3.0 Non-Functional Requirements

### 3.1 Vercel Compatibility
- The primary constraint is Vercel's 250 MB unzipped serverless function size limit. The final build *must* fall below this threshold.
- If lightweight libraries prove insufficient to meet the size constraint, fallback strategies (e.g., Edge Functions, external microservices) must be evaluated and proposed as a secondary phase.

### 3.2 Performance
- The extraction process should remain performant enough to execute within standard serverless function timeout limits.

## 4.0 Acceptance Criteria

- The schedule extraction API endpoint successfully parses a test PDF and returns the expected structured data.
- The extracted data matches the format and content of `Extracted_Schedule.csv` or the output of the reference SQL statement.
- The application successfully deploys to Vercel without encountering the "exceeded the unzipped maximum size of 250 MB" error.
- A local command or script exists that can accurately estimate the unzipped deployment size and warn if it exceeds limits.

## 5.0 Out of Scope

- Changes to the frontend UI or user experience.
- Modifications to the database schema or underlying data models.
- Implementation of external microservices or edge functions (unless the primary library swap strategy fails).