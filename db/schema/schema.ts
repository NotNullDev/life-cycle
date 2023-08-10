import {json, pgTable, serial, text} from "drizzle-orm/pg-core";
import {z} from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").unique("user_email_unique").notNull(),
  password: text("password").notNull(),
});

export const recordsSchema = pgTable("records_schema", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: serial("owner_id").references(() => users.id),
  schema: json("schema").notNull(),
});

export const schemaFieldTypes = ["text", "number", "date", "datetime", "time", "option"] as const;

export const schemaSchema = z.object({
  id: z.number(),
  fieldType: z.enum(schemaFieldTypes),
  fieldDefaultValue: z.string(),
})

export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  schemaId: serial("schema_id").references(() => recordsSchema.id),
  ownerId: serial("owner_id").references(() => users.id),
  values: json("values").notNull(),
});

export const recordValueSchema = z.object({
  id: z.number(),
  fieldTypeId: z.enum(schemaFieldTypes),
  fieldValue: z.string(),
});

