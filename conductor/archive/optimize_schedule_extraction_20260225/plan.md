# Implementation Plan: Optimize Schedule Extraction for Vercel Deployment

This plan outlines the steps for replacing the heavy PDF parsing library with a lighter alternative and implementing a pre-deployment size check.

## Phase 1: Library Evaluation and Setup [checkpoint: 585b0e7]

- [x] Task: Evaluate and Select Lightweight PDF Library
    - [x] Implement Feature: Research `PyMuPDF` (fitz), `pdf.js`, and `pypdf` for footprint size and layout retention capabilities.
    - [x] Implement Feature: Select the most appropriate library that satisfies the < 250MB constraint.
- [x] Task: Integrate New Library
    - [x] Write Tests: Ensure basic test infrastructure exists for the extraction service.
    - [x] Implement Feature: Add the chosen library to `requirements.txt`.
    - [x] Implement Feature: Remove `pdfplumber` and `ghostscript` dependencies if present.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Library Evaluation and Setup' (Protocol in workflow.md)

## Phase 2: Refactor Extraction Logic [checkpoint: 38454ba]

- [x] Task: Refactor PDF Parsing
    - [x] Write Tests: Create unit tests for parsing specific edge cases from the schedule format. Use `@Schedule.pdf` as the reference input file for testing the parser.
    - [x] Implement Feature: Rewrite the text extraction logic in `schedule_parser.py` using the new library.
    - [x] Implement Feature: Ensure accurate extraction of `employee_name`, `position`, `shift_start`, and `shift_end`.
- [x] Task: Data Validation against Ground Truth
    - [x] Write Tests: Write an integration test that compares the output of the new parser (when run on `@Schedule.pdf`) against `Extracted_Schedule.csv`.
    - [x] Implement Feature: Use the provided SQL statement (or its output) to verify the data structure.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Refactor Extraction Logic' (Protocol in workflow.md)

## Phase 3: Pre-deployment Size Check [checkpoint: 3ffabb1]

- [x] Task: Develop Size Estimation Script
    - [x] Write Tests: Not strictly applicable for a bash/utility script, but ensure it handles missing directories gracefully.
    - [x] Implement Feature: Create a script (e.g., `check_size.sh` or a node script) that calculates the size of the `.vercel/output/functions` or equivalent deployment directory.
    - [x] Implement Feature: Configure the script to exit with an error code if the size exceeds ~240MB (leaving a safety margin).
- [x] Task: Integrate Script into Workflow
    - [x] Implement Feature: Add the size check script to `package.json` scripts (e.g., `predeploy` or `build:check`).
    - [x] Implement Feature: Update documentation (e.g., `README.md`) on how to use the size check.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Pre-deployment Size Check' (Protocol in workflow.md)