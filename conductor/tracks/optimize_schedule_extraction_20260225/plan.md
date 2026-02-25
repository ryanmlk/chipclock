# Implementation Plan: Optimize Schedule Extraction for Vercel Deployment

This plan outlines the steps for replacing the heavy PDF parsing library with a lighter alternative and implementing a pre-deployment size check.

## Phase 1: Library Evaluation and Setup

- [ ] Task: Evaluate and Select Lightweight PDF Library
    - [ ] Implement Feature: Research `PyMuPDF` (fitz), `pdf.js`, and `pypdf` for footprint size and layout retention capabilities.
    - [ ] Implement Feature: Select the most appropriate library that satisfies the < 250MB constraint.
- [ ] Task: Integrate New Library
    - [ ] Write Tests: Ensure basic test infrastructure exists for the extraction service.
    - [ ] Implement Feature: Add the chosen library to `requirements.txt`.
    - [ ] Implement Feature: Remove `pdfplumber` and `ghostscript` dependencies if present.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Library Evaluation and Setup' (Protocol in workflow.md)

## Phase 2: Refactor Extraction Logic

- [ ] Task: Refactor PDF Parsing
    - [ ] Write Tests: Create unit tests for parsing specific edge cases from the schedule format. Use `@Schedule.pdf` as the reference input file for testing the parser.
    - [ ] Implement Feature: Rewrite the text extraction logic in `schedule_parser.py` using the new library.
    - [ ] Implement Feature: Ensure accurate extraction of `employee_name`, `position`, `shift_start`, and `shift_end`.
- [ ] Task: Data Validation against Ground Truth
    - [ ] Write Tests: Write an integration test that compares the output of the new parser (when run on `@Schedule.pdf`) against `Extracted_Schedule.csv`.
    - [ ] Implement Feature: Use the provided SQL statement (or its output) to verify the data structure.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Refactor Extraction Logic' (Protocol in workflow.md)

## Phase 3: Pre-deployment Size Check

- [ ] Task: Develop Size Estimation Script
    - [ ] Write Tests: Not strictly applicable for a bash/utility script, but ensure it handles missing directories gracefully.
    - [ ] Implement Feature: Create a script (e.g., `check_size.sh` or a node script) that calculates the size of the `.vercel/output/functions` or equivalent deployment directory.
    - [ ] Implement Feature: Configure the script to exit with an error code if the size exceeds ~240MB (leaving a safety margin).
- [ ] Task: Integrate Script into Workflow
    - [ ] Implement Feature: Add the size check script to `package.json` scripts (e.g., `predeploy` or `build:check`).
    - [ ] Implement Feature: Update documentation (e.g., `README.md`) on how to use the size check.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Pre-deployment Size Check' (Protocol in workflow.md)