import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  allergiesTable,
  conditionsTable,
  labResultsTable,
  medicationsTable,
  phrUsersTable,
  vitalsTable,
} from "@workspace/db";
import {
  CreateAllergyBody,
  CreateAllergyResponse,
  CreateMedicationBody,
  CreateMedicationResponse,
  DeleteMedicationParams,
  GetCurrentUserResponse,
  GetDashboardResponse,
  GetTimelineQueryParams,
  GetTimelineResponse,
  ListAllergiesResponse,
  ListConditionsResponse,
  ListLabsResponse,
  ListMedicationsResponse,
  ListVitalsResponse,
  UpdateMedicationBody,
  UpdateMedicationParams,
  UpdateMedicationResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const DEMO_PATIENT_ID = "00000000-0000-4000-8000-000000000001";

const asIso = (value: Date | string | null): string | null => {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : value;
};

const asDateOnly = (value: Date | string | null | undefined): string | null => {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return value.toISOString().slice(0, 10);
};

const initialsFor = (fullName: string) =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

async function initializeDemoData() {
  let [patient] = await db
    .select()
    .from(phrUsersTable)
    .where(eq(phrUsersTable.id, DEMO_PATIENT_ID));

  if (!patient) {
    [patient] = await db
      .insert(phrUsersTable)
      .values({
        id: DEMO_PATIENT_ID,
        email: "maya.patel@example.com",
        fullName: "Maya Patel",
        dateOfBirth: "1987-04-12",
        bloodType: "O+",
      })
      .returning();
  }

  const [medicationCount] = await db
    .select({ count: medicationsTable.id })
    .from(medicationsTable)
    .where(eq(medicationsTable.patientId, DEMO_PATIENT_ID));

  if (!medicationCount) {
    await db.insert(medicationsTable).values([
      {
        patientId: DEMO_PATIENT_ID,
        name: "Lisinopril",
        dosage: "10 mg",
        frequency: "Once daily",
        route: "Oral",
        prescriber: "Dr. Anika Shah",
        startDate: "2025-08-14",
        isActive: true,
        notes: "Take in the morning with water.",
      },
      {
        patientId: DEMO_PATIENT_ID,
        name: "Vitamin D3",
        dosage: "1000 IU",
        frequency: "Once daily",
        route: "Oral",
        prescriber: "Dr. Anika Shah",
        startDate: "2025-01-05",
        isActive: true,
        notes: null,
      },
    ]);
    await db.insert(allergiesTable).values({
      patientId: DEMO_PATIENT_ID,
      substanceName: "Penicillin",
      reaction: "Hives and swelling",
      severity: "severe",
      isActive: true,
    });
    await db.insert(conditionsTable).values([
      {
        patientId: DEMO_PATIENT_ID,
        displayName: "Essential hypertension",
        status: "active",
        onsetDate: "2022-06-18",
        notes: "Managed with medication and regular monitoring.",
      },
      {
        patientId: DEMO_PATIENT_ID,
        displayName: "Seasonal allergic rhinitis",
        status: "chronic",
        onsetDate: "2019-03-01",
        notes: null,
      },
    ]);
    await db.insert(labResultsTable).values([
      {
        patientId: DEMO_PATIENT_ID,
        testName: "Hemoglobin A1c",
        value: "5.4",
        unit: "%",
        referenceRange: "4.0–5.6",
        flag: "normal",
        collectedAt: new Date("2026-09-10T09:30:00.000Z"),
      },
      {
        patientId: DEMO_PATIENT_ID,
        testName: "LDL cholesterol",
        value: "118",
        unit: "mg/dL",
        referenceRange: "< 130",
        flag: "normal",
        collectedAt: new Date("2026-09-10T09:30:00.000Z"),
      },
    ]);
    await db.insert(vitalsTable).values([
      {
        patientId: DEMO_PATIENT_ID,
        vitalType: "blood_pressure",
        value: "124/78",
        unit: "mmHg",
        recordedAt: new Date("2026-09-17T07:45:00.000Z"),
        source: "manual",
      },
      {
        patientId: DEMO_PATIENT_ID,
        vitalType: "weight",
        value: "68.4",
        unit: "kg",
        recordedAt: new Date("2026-09-17T07:45:00.000Z"),
        source: "device",
      },
      {
        patientId: DEMO_PATIENT_ID,
        vitalType: "heart_rate",
        value: "72",
        unit: "bpm",
        recordedAt: new Date("2026-09-17T07:45:00.000Z"),
        source: "wearable",
      },
    ]);
  }

  return patient;
}

let demoDataPromise: ReturnType<typeof initializeDemoData> | undefined;

async function ensureDemoData() {
  if (!demoDataPromise) {
    demoDataPromise = initializeDemoData();
  }
  return demoDataPromise;
}

function toPatientProfile(patient: typeof phrUsersTable.$inferSelect) {
  return {
    id: patient.id,
    fullName: patient.fullName,
    email: patient.email,
    dateOfBirth: asDateOnly(patient.dateOfBirth),
    bloodType: patient.bloodType,
    initials: initialsFor(patient.fullName),
  };
}

function toMedicationResponse(
  medication: typeof medicationsTable.$inferSelect,
) {
  return {
    ...medication,
    startDate: asDateOnly(medication.startDate),
    endDate: asDateOnly(medication.endDate),
  };
}

router.get("/me", async (_req, res): Promise<void> => {
  const patient = await ensureDemoData();
  res.json(GetCurrentUserResponse.parse(toPatientProfile(patient)));
});

router.get("/dashboard", async (_req, res): Promise<void> => {
  const patient = await ensureDemoData();
  const [medications, allergies, conditions, labs, vitals] = await Promise.all([
    db
      .select()
      .from(medicationsTable)
      .where(eq(medicationsTable.patientId, patient.id)),
    db
      .select()
      .from(allergiesTable)
      .where(eq(allergiesTable.patientId, patient.id)),
    db
      .select()
      .from(conditionsTable)
      .where(eq(conditionsTable.patientId, patient.id)),
    db
      .select()
      .from(labResultsTable)
      .where(eq(labResultsTable.patientId, patient.id)),
    db
      .select()
      .from(vitalsTable)
      .where(eq(vitalsTable.patientId, patient.id)),
  ]);

  res.json(
    GetDashboardResponse.parse({
      patient: toPatientProfile(patient),
      counts: {
        medications: medications.length,
        allergies: allergies.length,
        conditions: conditions.length,
        labs: labs.length,
        vitals: vitals.length,
      },
      alerts: [
        {
          id: "medication-review",
          severity: "info",
          title: "Medication review due soon",
          description:
            "Your next medication review is recommended before October 12, 2026.",
          actionLabel: "View medications",
        },
        {
          id: "annual-flu",
          severity: "warning",
          title: "Seasonal vaccine reminder",
          description:
            "Your annual influenza vaccine is due this season. Add it after your next visit.",
          actionLabel: "Review immunizations",
        },
      ],
      nextReminder: "Annual wellness visit · Oct 12, 2026",
    }),
  );
});

router.get("/timeline", async (req, res): Promise<void> => {
  const parsed = GetTimelineQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const patient = await ensureDemoData();
  const [medications, allergies, conditions, labs, vitals] = await Promise.all([
    db
      .select()
      .from(medicationsTable)
      .where(eq(medicationsTable.patientId, patient.id))
      .orderBy(desc(medicationsTable.createdAt)),
    db
      .select()
      .from(allergiesTable)
      .where(eq(allergiesTable.patientId, patient.id))
      .orderBy(desc(allergiesTable.createdAt)),
    db
      .select()
      .from(conditionsTable)
      .where(eq(conditionsTable.patientId, patient.id))
      .orderBy(desc(conditionsTable.createdAt)),
    db
      .select()
      .from(labResultsTable)
      .where(eq(labResultsTable.patientId, patient.id))
      .orderBy(desc(labResultsTable.collectedAt)),
    db
      .select()
      .from(vitalsTable)
      .where(eq(vitalsTable.patientId, patient.id))
      .orderBy(desc(vitalsTable.recordedAt)),
  ]);

  const entries = [
    ...medications.map((item) => ({
      id: item.id,
      domain: "medications" as const,
      title: item.name,
      detail: [item.dosage, item.frequency].filter(Boolean).join(" · "),
      date: asIso(item.createdAt) ?? new Date().toISOString(),
      source: "Manual record",
      status: item.isActive ? "Active" : "Past",
    })),
    ...allergies.map((item) => ({
      id: item.id,
      domain: "allergies" as const,
      title: item.substanceName,
      detail: item.reaction ?? "Reaction not recorded",
      date: asIso(item.createdAt) ?? new Date().toISOString(),
      source: "Manual record",
      status: item.severity,
    })),
    ...conditions.map((item) => ({
      id: item.id,
      domain: "conditions" as const,
      title: item.displayName,
      detail: item.notes ?? "Condition record",
      date: item.onsetDate
        ? `${item.onsetDate}T00:00:00.000Z`
        : asIso(item.createdAt) ?? new Date().toISOString(),
      source: "Manual record",
      status: item.status,
    })),
    ...labs.map((item) => ({
      id: item.id,
      domain: "labs" as const,
      title: item.testName,
      detail: `${item.value}${item.unit ? ` ${item.unit}` : ""}`,
      date: asIso(item.collectedAt) ?? new Date().toISOString(),
      source: "Northstar Labs",
      status: item.flag,
    })),
    ...vitals.map((item) => ({
      id: item.id,
      domain: "vitals" as const,
      title: item.vitalType.replaceAll("_", " "),
      detail: `${item.value}${item.unit ? ` ${item.unit}` : ""}`,
      date: asIso(item.recordedAt) ?? new Date().toISOString(),
      source: item.source,
      status: null,
    })),
  ]
    .filter((entry) => parsed.data.domain === "all" || entry.domain === parsed.data.domain)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, parsed.data.limit);

  res.json(GetTimelineResponse.parse(entries));
});

router.get("/medications", async (_req, res): Promise<void> => {
  const patient = await ensureDemoData();
  const rows = await db
    .select()
    .from(medicationsTable)
    .where(eq(medicationsTable.patientId, patient.id))
    .orderBy(desc(medicationsTable.isActive), desc(medicationsTable.createdAt));
  res.json(ListMedicationsResponse.parse(rows.map(toMedicationResponse)));
});

router.post("/medications", async (req, res): Promise<void> => {
  const parsed = CreateMedicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const patient = await ensureDemoData();
  const [created] = await db
    .insert(medicationsTable)
    .values({
      ...parsed.data,
      patientId: patient.id,
      startDate: asDateOnly(parsed.data.startDate),
      endDate: asDateOnly(parsed.data.endDate),
    })
    .returning();
  res
    .status(201)
    .json(CreateMedicationResponse.parse(toMedicationResponse(created)));
});

router.patch("/medications/:id", async (req, res): Promise<void> => {
  const params = UpdateMedicationParams.safeParse(req.params);
  const parsed = UpdateMedicationBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const patient = await ensureDemoData();
  const [updated] = await db
    .update(medicationsTable)
    .set({
      ...parsed.data,
      startDate: asDateOnly(parsed.data.startDate),
      endDate: asDateOnly(parsed.data.endDate),
    })
    .where(
      and(
        eq(medicationsTable.id, params.data.id),
        eq(medicationsTable.patientId, patient.id),
      ),
    )
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Medication not found" });
    return;
  }
  res.json(UpdateMedicationResponse.parse(toMedicationResponse(updated)));
});

router.delete("/medications/:id", async (req, res): Promise<void> => {
  const params = DeleteMedicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const patient = await ensureDemoData();
  const deleted = await db
    .delete(medicationsTable)
    .where(
      and(
        eq(medicationsTable.id, params.data.id),
        eq(medicationsTable.patientId, patient.id),
      ),
    )
    .returning({ id: medicationsTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "Medication not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/allergies", async (_req, res): Promise<void> => {
  const patient = await ensureDemoData();
  const rows = await db
    .select()
    .from(allergiesTable)
    .where(eq(allergiesTable.patientId, patient.id))
    .orderBy(desc(allergiesTable.createdAt));
  res.json(ListAllergiesResponse.parse(rows));
});

router.post("/allergies", async (req, res): Promise<void> => {
  const parsed = CreateAllergyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const patient = await ensureDemoData();
  const [created] = await db
    .insert(allergiesTable)
    .values({ ...parsed.data, patientId: patient.id })
    .returning();
  res.status(201).json(CreateAllergyResponse.parse(created));
});

router.get("/conditions", async (_req, res): Promise<void> => {
  const patient = await ensureDemoData();
  const rows = await db
    .select()
    .from(conditionsTable)
    .where(eq(conditionsTable.patientId, patient.id))
    .orderBy(desc(conditionsTable.createdAt));
  res.json(
    ListConditionsResponse.parse(
      rows.map((row) => ({
        ...row,
        onsetDate: asDateOnly(row.onsetDate),
      })),
    ),
  );
});

router.get("/labs", async (_req, res): Promise<void> => {
  const patient = await ensureDemoData();
  const rows = await db
    .select()
    .from(labResultsTable)
    .where(eq(labResultsTable.patientId, patient.id))
    .orderBy(desc(labResultsTable.collectedAt));
  res.json(
    ListLabsResponse.parse(
      rows.map((row) => ({ ...row, collectedAt: asIso(row.collectedAt) })),
    ),
  );
});

router.get("/vitals", async (_req, res): Promise<void> => {
  const patient = await ensureDemoData();
  const rows = await db
    .select()
    .from(vitalsTable)
    .where(eq(vitalsTable.patientId, patient.id))
    .orderBy(desc(vitalsTable.recordedAt));
  res.json(
    ListVitalsResponse.parse(
      rows.map((row) => ({ ...row, recordedAt: asIso(row.recordedAt) })),
    ),
  );
});

export default router;