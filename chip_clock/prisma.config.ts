import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: `postgresql://${env("PGUSER")}:${env("PGPASSWORD")}@${env("PGHOST")}/${env("PGDATABASE")}`,
  },
});