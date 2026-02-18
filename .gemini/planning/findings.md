# Findings & Decisions

## Requirements
- Finish the implementation of the ScheduleExtractor project.
- Use `planning-with-files` skill.
- Ensure premium UI and functional end-to-end flow.
- **NEW:** Migrate away from Azure (Neon for DB, non-Azure for Worker).

## Research Findings
- **Frontend:** Next.js with Prisma ORM, Radix UI, Clerk for Auth, Recharts for data visualization.
- **Backend/Worker:** Azure Functions (Python) in `gmail_worker`.
- **Database:** PostgreSQL (likely, based on `pg` dependency and Prisma).
- **Functionality:** Seems to involve extracting schedules from Gmail and parsing them (likely from PDF attachments).

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Use `planning-with-files` | User explicitly requested this skill for tracking. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Denied access to `gmail_worker/.env` | No immediate resolution needed, as long as I can infer needed info from code. |

## Resources
- `chip_clock/prisma/schema.prisma`: Database schema.
- `gmail_worker/gmail_worker.py`: Main worker logic.
- `gmail_worker/schedule_parser.py`: Schedule parsing logic.

## Visual/Browser Findings
- *None yet. Waiting to run the dev server.*
