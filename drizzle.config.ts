import type { Config } from "drizzle-kit";
import {AppConfig} from "./config";

export default {
  schema: "./db/schema/*",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: AppConfig.database.connectionString,
  },
} satisfies Config;
