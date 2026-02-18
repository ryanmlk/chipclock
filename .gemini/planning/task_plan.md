# Task Plan: Project Completion

## Goal
Finish the implementation of the ScheduleExtractor project, ensuring all features are functional, bugs are fixed, and the UI is premium.

## Current Phase
Phase 2: Azure to Neon/Vercel Migration

## Phases

### Phase 1: Requirements & Discovery
- [x] Explore codebase structure
- [x] Read key configuration files (`package.json`, `.env`)
- [x] Identify pending features and bugs
- [x] Document findings in `findings.md`
- **Status:** complete

### Phase 2: Azure to Neon/Vercel Migration
- [ ] Update Prisma to use Neon DB connection string
- [ ] Reconfigure Python worker for non-Azure environment
- [ ] Setup webhook/trigger for Gmail parsing
- [ ] Deploy Python logic (Vercel Functions or Render)
- **Status:** in_progress

### Phase 3: Planning & Structure
- [ ] Define technical approach for remaining work
- [ ] Create missing components or services
- [ ] Document decisions with rationale
- **Status:** pending

### Phase 3: Implementation
- [ ] Implement Gmail polling and email parsing
- [ ] Refine PDF schedule extraction logic
- [ ] Complete the Labour Management dashboard
- [ ] Fix any UI inconsistencies
- **Status:** pending

### Phase 4: Testing & Verification
- [ ] Verify end-to-end flow from email to dashboard
- [ ] Document test results in `progress.md`
- [ ] Fix any issues found during testing
- **Status:** pending

### Phase 5: Delivery
- [ ] Final review of all features
- [ ] Ensure premium look and feel
- [ ] Handover to user
- **Status:** pending

## Key Questions
1. What are the specific "missing" features from the user's perspective?
2. Are there any specific bugs that were bothering the user recently?
3. What is the current state of the Gmail worker integration?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use `planning-with-files` | User explicitly requested this skill for tracking. |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| write_to_file missing metadata | 1 | Added ArtifactMetadata |

## Notes
- `chip_clock` is a Next.js app.
- `gmail_worker` is an Azure Function in Python.
- Database seems to be PostgreSQL (judging by Prisma).
