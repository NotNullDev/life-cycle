import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {AppConfig} from "../config";

export const dbClient = postgres(
  AppConfig.database.connectionString
);
export const db = drizzle(dbClient);
