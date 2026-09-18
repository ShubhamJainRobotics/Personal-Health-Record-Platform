import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const phrUsersTable = pgTable("phr_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  bloodType: text("blood_type"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const medicationsTable = pgTable("phr_medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => phrUsersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),
  route: text("route"),
  prescriber: text("prescriber"),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const allergiesTable = pgTable("phr_allergies", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => phrUsersTable.id, { onDelete: "cascade" }),
  substanceName: text("substance_name").notNull(),
  reaction: text("reaction"),
  severity: text("severity").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const conditionsTable = pgTable("phr_conditions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => phrUsersTable.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  status: text("status").notNull(),
  onsetDate: date("onset_date", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const labResultsTable = pgTable("phr_lab_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => phrUsersTable.id, { onDelete: "cascade" }),
  testName: text("test_name").notNull(),
  value: text("value").notNull(),
  unit: text("unit"),
  referenceRange: text("reference_range"),
  flag: text("flag"),
  collectedAt: timestamp("collected_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const vitalsTable = pgTable("phr_vitals", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => phrUsersTable.id, { onDelete: "cascade" }),
  vitalType: text("vital_type").notNull(),
  value: text("value").notNull(),
  unit: text("unit"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  source: text("source").notNull().default("manual"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertPhrUserSchema = createInsertSchema(phrUsersTable).omit({
  id: true,
  createdAt: true,
});
export const insertMedicationSchema = createInsertSchema(medicationsTable).omit({
  id: true,
  createdAt: true,
});
export const insertAllergySchema = createInsertSchema(allergiesTable).omit({
  id: true,
  createdAt: true,
});
export const insertConditionSchema = createInsertSchema(conditionsTable).omit({
  id: true,
  createdAt: true,
});
export const insertLabResultSchema = createInsertSchema(labResultsTable).omit({
  id: true,
  createdAt: true,
});
export const insertVitalSchema = createInsertSchema(vitalsTable).omit({
  id: true,
  createdAt: true,
});

export type PhrUser = typeof phrUsersTable.$inferSelect;
export type Medication = typeof medicationsTable.$inferSelect;
export type Allergy = typeof allergiesTable.$inferSelect;
export type Condition = typeof conditionsTable.$inferSelect;
export type LabResult = typeof labResultsTable.$inferSelect;
export type Vital = typeof vitalsTable.$inferSelect;
export type InsertPhrUser = z.infer<typeof insertPhrUserSchema>;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type InsertAllergy = z.infer<typeof insertAllergySchema>;