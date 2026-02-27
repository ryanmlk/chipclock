import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: "postgresql://" + env("PGUSER") + ":" + env("PGPASSWORD") + "@" + env("PGHOST") + "/" + env("PGDATABASE") + "?sslmode=require",
    },
});