# Specification: Migrate Prisma to v7

## 1.0 Overview
This track aims to upgrade the project's Prisma ORM from version 6 to version 7. The migration will encompass core Prisma dependencies, client refactoring, ensuring ESM and TypeScript compatibility, updating the seeding script, and addressing potential breaking changes related to mapped enums.

## 2.0 Out of Scope
- Migrating to Prisma Accelerate (unless caching is already in use and explicitly requested to be preserved).
- Any major refactoring unrelated to the Prisma v7 migration.

## 3.0 Functional Requirements
- **Prisma Upgrade:**
    - Upgrade `prisma` and `@prisma/client` packages to `7.0.0` or latest stable v7.
    - Update relevant dependencies (e.g., database adapters).
- **Client Refactoring:**
    - Refactor Prisma client import and instantiation to align with Prisma v7's Direct TCP + adapter recommendation.
    - Ensure correct adapter is used for the project's database (PostgreSQL in this case, so `@prisma/adapter-pg`).
- **ESM & TypeScript Compatibility:**
    - Verify and update `package.json` to ensure `"type": "module"` is set.
    - Adjust `tsconfig.json` for ESNext module and bundler module resolution.
    - Ensure `dotenv/config` is explicitly imported for environment variable loading.
- **Seeding Script Update:**
    - Modify `prisma/seed.ts` to use the new adapter-based Prisma Client instantiation.
    - Ensure `dotenv/config` is imported in the seeding script.
- **Mapped Enum Handling:**
    - Identify any enums in `schema.prisma` that use `@map`.
    - Provide guidance and implement temporary workarounds for the known bug related to mapped enum values in Prisma v7 (using schema names as string literals with `as any` or temporarily removing `@map`) until a fix is released.

## 4.0 Non-Functional Requirements
- **No functional regressions:** Existing features must continue to work as expected after the migration.
- **Maintainability:** The updated code should adhere to existing code style guidelines and maintain readability.
- **Performance:** The migration should not introduce any significant performance degradation.

## 5.0 Acceptance Criteria
- All Prisma-related packages are upgraded to v7.
- The application successfully connects to the database using the new Prisma Client instantiation with the appropriate adapter.
- All existing database operations (CRUD) function correctly.
- `prisma generate` and `prisma migrate dev` commands execute without errors.
- The seeding script (`prisma/seed.ts`) runs successfully and populates the database as expected.
- ESM and TypeScript configurations are compatible with Prisma v7.
- If mapped enums are present, workarounds are implemented, and the application functions correctly with them.
- All existing tests pass.

## 6.0 Additional Resources
- Context7 can be used as needed during the migration for up-to-date documentation and code examples if any instructions are unclear or issues are encountered.