# Implementation Plan: Migrate Prisma to v7

## Phase 1: Core Prisma Upgrade and Setup

- [ ] Task: Research current Prisma version and dependencies
    - [ ] Identify `prisma` and `@prisma/client` versions.
    - [ ] Identify existing database adapter (if any).
- [ ] Task: Upgrade Prisma dependencies
    - [ ] Update `package.json` to specify `prisma@latest` (7.0.0) and `@prisma/client@latest` (7.0.0).
    - [ ] Install `@prisma/adapter-pg` as a dependency.
    - [ ] Run `npm install` or `yarn install` or equivalent.
- [ ] Task: Update `schema.prisma`
    - [ ] Change `provider = "prisma-client-js"` to `provider = "prisma-client"` in `generator client`.
    - [ ] Remove any `previewFeatures = ["driverAdapters"]` and `engineType` attributes.
    - [ ] Remove `url = ...` from `datasource db` while preserving `provider` and other properties.
- [ ] Task: Generate Prisma Client
    - [ ] Run `npx prisma generate`.
- [ ] Task: Conductor - User Manual Verification 'Core Prisma Upgrade and Setup' (Protocol in workflow.md)

## Phase 2: Client Refactoring and ESM/TS Compatibility

- [ ] Task: Implement `prisma.config.ts`
    - [ ] Create `prisma.config.ts` at the repo root with the recommended configuration, including `dotenv/config` and datasource URL.
    - [ ] Remove any `prisma.seed` entry from `package.json` if it exists.
- [ ] Task: Refactor Prisma Client instantiation
    - [ ] Locate all instances of `new PrismaClient()` in the codebase.
    - [ ] Modify instantiation to use the `@prisma/adapter-pg` adapter with `process.env.DATABASE_URL`.
    - [ ] Ensure `import 'dotenv/config'` is present where necessary for environment variables.
- [ ] Task: Ensure ESM & TypeScript Baseline
    - [ ] Verify `package.json` has `"type": "module"`. Add if missing.
    - [ ] Update `tsconfig.json` to include `"module": "ESNext"` and `"moduleResolution": "bundler"`.
- [ ] Task: Conductor - User Manual Verification 'Client Refactoring and ESM/TS Compatibility' (Protocol in workflow.md)

<h2>Phase 3: Seeding Script and Mapped Enum Handling</h2>

- [ ] Task: Update Seeding Script (`prisma/seed.ts`)
    - [ ] Modify `prisma/seed.ts` to instantiate `PrismaClient` with the `@prisma/adapter-pg` adapter.
    - [ ] Ensure `import 'dotenv/config'` is at the top of `prisma/seed.ts`.
- [ ] Task: Identify and Handle Mapped Enums
    - [ ] Scan `schema.prisma` for enums using `@map`.
    - [ ] If found, identify code locations where these enums are used.
    - [ ] Implement temporary workarounds (e.g., using schema names as string literals with `as any` or temporarily removing `@map` directives) and add comments explaining the bug and workaround.
- [ ] Task: Conductor - User Manual Verification 'Seeding Script and Mapped Enum Handling' (Protocol in workflow.md)

## Phase 4: Final Verification and Cleanup

- [ ] Task: Run Migrations
    - [ ] Execute `npx prisma migrate dev` to ensure migrations work with the new setup.
- [ ] Task: Run Seeding Script
    - [ ] Run `npx tsx prisma/seed.ts` (or equivalent as defined in `prisma.config.ts`) to verify seeding.
- [ ] Task: Comprehensive Test Execution
    - [ ] Run the full test suite to ensure no regressions.
- [ ] Task: Remove temporary workarounds for mapped enums
    - [ ] If Prisma releases a fix for the mapped enum bug, remove the temporary workarounds.
- [ ] Task: Conductor - User Manual Verification 'Final Verification and Cleanup' (Protocol in workflow.md)
