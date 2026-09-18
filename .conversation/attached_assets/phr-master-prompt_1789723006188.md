# MASTER PROMPT: AI-Powered Personal Health Record (PHR) & Care Coordination Platform

> **Note on scope:** The requested title referenced an "Agriculture Crop Advisory Assistant," but the raw assignment data supplied describes a **Personal Health Record (PHR) application** for patient-controlled, interoperable health data aggregation. This Master Prompt is built strictly from the raw assignment data provided, using the exact section structure, depth, and formatting conventions requested. If an agriculture version is also needed, it should be generated as a separate Master Prompt from agriculture-specific raw data.

---

## 1. Header & System Persona Role

```
You are a Senior Full-Stack Engineer and Healthcare Systems Architect with deep expertise in:
- FHIR R4 / SMART on FHIR interoperability standards
- HIPAA-aligned application security and data isolation
- React.js + Node.js/Express.js production architectures
- PostgreSQL schema design for clinical data
- Google Gemini (@google/genai) SDK integration for clinical decision support
- Zod-based runtime validation and Tailwind CSS design systems

You are being asked to build a complete, production-grade Personal Health
Record (PHR) application end-to-end, in a single continuous build session,
without skipping steps, without leaving TODOs, and without placeholder logic.
Every file you generate must be complete, runnable, and internally consistent
with every other file you generate. Treat this prompt as the single source
of truth for scope, schema, security, and behavior.
```

---

## 2. Core Mission Directive

Build a **secure, patient-controlled Personal Health Record platform** that aggregates diagnoses, medications, allergies, immunizations, lab results, and vitals from multiple sources (EHRs, labs, pharmacies, wearables) into one unified, chronological timeline per patient — with fine-grained, time-limited consent controls for sharing that data with doctors, caregivers, or emergency responders, plus AI-assisted clinical decision support (drug–drug and drug–allergy interaction checks, missing vaccine/screening reminders).

The system must never allow one patient to see another patient's data, must never allow a shared party to access data outside the scope and time window the patient explicitly granted, and must degrade gracefully (never silently fabricate clinical facts) when the AI layer is used for decision support.

---

## 3. Product Goal

Reduce duplicate testing, medication errors, and diagnostic delay by giving every patient — especially the chronically ill, the elderly, and those who move between providers — a single longitudinal health record they own and control, with tools that let them safely and temporarily open specific slices of that record to specific people, and that proactively flags dangerous drug interactions and overdue preventive care.

---

## 4. Mandatory Features

1. **Unified Health Timeline** — chronological, filterable feed of diagnoses, medications, allergies, immunizations, labs, and vitals, normalized from heterogeneous sources into one internal schema.
2. **FHIR/SMART on FHIR Ingestion Layer** — connectors that pull structured clinical data from EHRs, labs, pharmacies, and wearable APIs, map it to internal entities, and de-duplicate against existing records.
3. **Fine-Grained, Time-Limited Consent Sharing** — patients grant scoped access (e.g., "medications + allergies only, 72 hours, Dr. Mehta") via shareable secure links or QR codes; access auto-expires and is fully revocable.
4. **Clinical Decision Support (CDS)** —
   - Drug–drug interaction checks on every new medication entry.
   - Drug–allergy conflict checks on every new medication entry.
   - Missing/overdue vaccination and age-appropriate screening reminders.
5. **Care Coordination Tools** — caregiver roles, shared care notes, appointment/provider directory per patient, and an audit trail of who viewed what and when.
6. **Emergency Access Mode** — a break-glass, heavily audited, minimal-necessary-data view (allergies, critical meds, blood type, emergency contacts) accessible via a short-lived emergency code.
7. **Manual Record Entry & Document Upload** — for sources without FHIR connectivity, patients or caregivers can manually add entries or upload documents (PDFs/images) that get parsed and normalized.
8. **Audit Log & Access Transparency** — every read/write of every record is logged and visible to the patient in a human-readable access history.
9. **AI Health Assistant (Gemini-powered)** — natural-language Q&A over the patient's own record ("What medications am I currently on that interact with ibuprofen?"), always grounded in the patient's actual stored data, never external medical claims presented as fact without disclaimers.

---

## 5. Technology Requirements

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **React.js** (Vite) + **Tailwind CSS** | Component-driven, mobile-first, WCAG 2.1 AA target |
| Backend | **Node.js + Express.js** | REST API, layered controller/service/repository pattern |
| Database | **Replit Postgres** (PostgreSQL) | Row Level Security enforced at the DB layer |
| AI SDK | **@google/genai** (Gemini) | Server-side only, never exposed to client |
| Validation | **Zod** | Shared schemas for request/response validation, both client and server |
| Auth | Session-based auth (httpOnly secure cookies) + role-based access control (RBAC) | Roles: `patient`, `caregiver`, `provider`, `emergency_responder`, `admin` |
| File Storage | Object storage abstraction (local disk in dev, pluggable for S3-compatible in prod) | For uploaded documents/images |

Do not substitute any of these technologies. Do not add a second database. Do not add a GraphQL layer unless explicitly asked later.

---

## 6. Application Pages (Routes)

| Route | Page | Access |
|---|---|---|
| `/` | Landing / marketing page | Public |
| `/login`, `/register` | Auth pages | Public |
| `/dashboard` | Patient home: timeline summary, alerts, upcoming reminders | Patient |
| `/timeline` | Full unified health timeline with filters | Patient, authorized caregiver |
| `/records/medications` | Medications list + add/edit | Patient |
| `/records/allergies` | Allergies list + add/edit | Patient |
| `/records/immunizations` | Immunization history + due reminders | Patient |
| `/records/labs` | Lab results with trend charts | Patient |
| `/records/vitals` | Vitals log (BP, glucose, weight, HR, etc.) | Patient |
| `/records/diagnoses` | Diagnoses / conditions list | Patient |
| `/connections` | Manage EHR/lab/pharmacy/wearable connections (SMART on FHIR launch) | Patient |
| `/sharing` | Consent management: active shares, create new share, revoke | Patient |
| `/sharing/view/:token` | Scoped read-only view for an external party using a share link | Shared party (token-gated) |
| `/emergency/:code` | Break-glass emergency view | Emergency responder (code-gated) |
| `/care-team` | Caregivers, providers, care notes | Patient, caregiver |
| `/audit-log` | Full access history | Patient |
| `/ai-assistant` | Conversational AI assistant over own record | Patient |
| `/upload` | Manual document upload & parsing review queue | Patient |
| `/settings` | Profile, security, notification preferences | Patient |
| `/admin` | System admin: user management, connector health | Admin only |

---

## 7. User Flow

1. **Onboarding:** Patient registers → verifies identity/email → completes baseline profile (DOB, blood type, emergency contacts).
2. **Connect Sources:** Patient authorizes SMART on FHIR connections to their EHR/pharmacy/lab/wearable via OAuth2 launch flow; the system pulls initial bundles and normalizes them into the unified schema.
3. **Review Timeline:** Normalized entries appear on `/timeline`; duplicates from overlapping sources are flagged for merge/dismiss.
4. **Ongoing Sync:** Background jobs poll/subscribe for new FHIR resources and append to the timeline; CDS engine re-evaluates on every new medication or allergy entry.
5. **Manual Entry:** For non-connected sources, patient uploads a document or manually enters a record; entry enters a "pending normalization" state, then is reconciled into the timeline.
6. **Sharing:** Patient goes to `/sharing`, selects data scope + recipient + duration, generates a secure link/QR; recipient opens `/sharing/view/:token`, sees only the scoped data, and the window auto-expires.
7. **Emergency Use:** Patient (or their device/wearable) has a pre-generated emergency code; a responder enters it at `/emergency/:code` and sees only critical minimal-necessary data, heavily logged.
8. **AI Assistance:** Patient asks a question on `/ai-assistant`; the backend retrieves only that patient's own records, constructs a grounded prompt, and returns an answer with a clear "not a substitute for professional medical advice" disclaimer.
9. **Audit Review:** Patient periodically reviews `/audit-log` to see every access event tied to their record.

---

## 8. Target Domains & Categorization

Core clinical data domains the system must model, normalize into, and reason over:

- **Diagnoses / Conditions** — ICD-10-coded, onset date, status (active/resolved/chronic).
- **Medications** — RxNorm-coded, dosage, frequency, prescriber, start/end date, active flag.
- **Allergies & Intolerances** — substance (RxNorm/SNOMED-coded), reaction, severity.
- **Immunizations** — CVX-coded vaccine, date administered, lot/provider, series completion status.
- **Labs** — LOINC-coded test, value, unit, reference range, flag (normal/high/low/critical), collected date.
- **Vitals** — type (BP, HR, glucose, weight, SpO2, temp), value, unit, recorded date, source (manual/wearable).
- **Care Notes / Encounters** — free-text or structured visit summaries, linked to a provider.
- **Documents** — uploaded files (labs PDFs, discharge summaries, imaging reports) with parsed extraction status.

---

## 9. Form & Advisory Configuration

- **Medication Entry Form:** name (RxNorm autocomplete), dosage, frequency, route, prescriber, start date, end date (optional), notes → on submit, triggers CDS interaction + allergy check against all *active* medications and allergies for that patient.
- **Allergy Entry Form:** substance (autocomplete), reaction description, severity (mild/moderate/severe/life-threatening) → on submit, re-runs CDS check against all *active* medications.
- **Immunization Reminder Configuration:** age-based and condition-based vaccine schedule (configurable rule table), surfaced as dashboard alerts when overdue.
- **Screening Reminder Configuration:** age/sex/condition-based screening rules (e.g., mammogram, colonoscopy, A1C) surfaced the same way.
- **Consent/Share Form:** recipient identifier (email/phone or generated link), data scope (multi-select of domains from Section 8), duration (1 hour to 30 days, or custom), optional note to recipient.
- **Emergency Profile Configuration:** patient pre-selects which fields are visible in break-glass mode (defaults: allergies, active meds, blood type, emergency contacts, critical diagnoses).

---

## 10. Database Schema (Production SQL for PostgreSQL)

```sql
-- ========== USERS & AUTH ==========
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             TEXT UNIQUE NOT NULL,
    password_hash     TEXT NOT NULL,
    role              TEXT NOT NULL CHECK (role IN ('patient','caregiver','provider','emergency_responder','admin')),
    full_name         TEXT NOT NULL,
    date_of_birth     DATE,
    blood_type        TEXT,
    phone             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token     TEXT UNIQUE NOT NULL,
    expires_at        TIMESTAMPTZ NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== CARE RELATIONSHIPS ==========
CREATE TABLE care_relationships (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    related_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('caregiver','provider')),
    status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(patient_id, related_user_id)
);

-- ========== SOURCE CONNECTIONS (FHIR/SMART) ==========
CREATE TABLE source_connections (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type       TEXT NOT NULL CHECK (source_type IN ('ehr','pharmacy','lab','wearable')),
    source_name       TEXT NOT NULL,
    fhir_base_url     TEXT,
    access_token_enc  TEXT,
    refresh_token_enc TEXT,
    token_expires_at  TIMESTAMPTZ,
    status            TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected','disconnected','error')),
    last_synced_at    TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== CLINICAL DOMAIN TABLES ==========
CREATE TABLE conditions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_connection_id UUID REFERENCES source_connections(id) ON DELETE SET NULL,
    icd10_code        TEXT,
    display_name      TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','chronic')),
    onset_date        DATE,
    resolved_date      DATE,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE medications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_connection_id UUID REFERENCES source_connections(id) ON DELETE SET NULL,
    rxnorm_code       TEXT,
    name              TEXT NOT NULL,
    dosage            TEXT,
    frequency         TEXT,
    route             TEXT,
    prescriber        TEXT,
    start_date        DATE,
    end_date          DATE,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE allergies (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_connection_id UUID REFERENCES source_connections(id) ON DELETE SET NULL,
    substance_code    TEXT,
    substance_name    TEXT NOT NULL,
    reaction          TEXT,
    severity          TEXT CHECK (severity IN ('mild','moderate','severe','life_threatening')),
    is_active         BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE immunizations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_connection_id UUID REFERENCES source_connections(id) ON DELETE SET NULL,
    cvx_code          TEXT,
    vaccine_name      TEXT NOT NULL,
    date_administered DATE NOT NULL,
    provider          TEXT,
    lot_number        TEXT,
    series_complete   BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lab_results (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_connection_id UUID REFERENCES source_connections(id) ON DELETE SET NULL,
    loinc_code        TEXT,
    test_name         TEXT NOT NULL,
    value             TEXT NOT NULL,
    unit              TEXT,
    reference_range   TEXT,
    flag              TEXT CHECK (flag IN ('normal','high','low','critical')),
    collected_at      TIMESTAMPTZ NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vitals (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_connection_id UUID REFERENCES source_connections(id) ON DELETE SET NULL,
    vital_type        TEXT NOT NULL CHECK (vital_type IN ('blood_pressure','heart_rate','glucose','weight','spo2','temperature','respiratory_rate')),
    value             TEXT NOT NULL,
    unit              TEXT,
    recorded_at       TIMESTAMPTZ NOT NULL,
    source            TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','wearable','device')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name         TEXT NOT NULL,
    file_url          TEXT NOT NULL,
    mime_type         TEXT NOT NULL,
    parse_status      TEXT NOT NULL DEFAULT 'pending' CHECK (parse_status IN ('pending','parsed','failed','reviewed')),
    parsed_summary    TEXT,
    uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE care_notes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_id         UUID NOT NULL REFERENCES users(id),
    note_text         TEXT NOT NULL,
    visibility        TEXT NOT NULL DEFAULT 'care_team' CHECK (visibility IN ('private','care_team')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== CONSENT / SHARING ==========
CREATE TABLE consent_shares (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_token       TEXT UNIQUE NOT NULL,
    recipient_label   TEXT NOT NULL,
    scopes            TEXT[] NOT NULL,  -- e.g. ARRAY['medications','allergies']
    expires_at        TIMESTAMPTZ NOT NULL,
    revoked_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE emergency_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emergency_code    TEXT UNIQUE NOT NULL,
    visible_fields    TEXT[] NOT NULL DEFAULT ARRAY['allergies','active_medications','blood_type','emergency_contacts','critical_conditions'],
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== CDS ALERTS ==========
CREATE TABLE cds_alerts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type        TEXT NOT NULL CHECK (alert_type IN ('drug_drug','drug_allergy','missing_vaccine','missing_screening')),
    severity          TEXT NOT NULL CHECK (severity IN ('info','warning','critical')),
    description       TEXT NOT NULL,
    related_ids       UUID[],
    is_dismissed      BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== AUDIT LOG ==========
CREATE TABLE audit_log (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id          UUID REFERENCES users(id),
    actor_label       TEXT,          -- e.g. "Shared link: Dr. Mehta" or "Emergency responder"
    action            TEXT NOT NULL, -- 'view','create','update','delete','share_create','share_revoke','emergency_access'
    resource_type     TEXT NOT NULL,
    resource_id       UUID,
    occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address        TEXT
);

-- ========== INDEXES ==========
CREATE INDEX idx_conditions_patient   ON conditions(patient_id);
CREATE INDEX idx_medications_patient  ON medications(patient_id);
CREATE INDEX idx_allergies_patient    ON allergies(patient_id);
CREATE INDEX idx_immunizations_patient ON immunizations(patient_id);
CREATE INDEX idx_labs_patient         ON lab_results(patient_id);
CREATE INDEX idx_vitals_patient       ON vitals(patient_id);
CREATE INDEX idx_audit_patient        ON audit_log(patient_id);
CREATE INDEX idx_consent_token        ON consent_shares(share_token);
CREATE INDEX idx_emergency_code       ON emergency_profiles(emergency_code);
```

---

## 11. Row Level Security (RLS) / Data Isolation Rules

```sql
ALTER TABLE conditions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cds_alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log       ENABLE ROW LEVEL SECURITY;

-- Patients see only their own rows
CREATE POLICY patient_owns_conditions ON conditions
    USING (patient_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY patient_owns_medications ON medications
    USING (patient_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY patient_owns_allergies ON allergies
    USING (patient_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY patient_owns_immunizations ON immunizations
    USING (patient_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY patient_owns_labs ON lab_results
    USING (patient_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY patient_owns_vitals ON vitals
    USING (patient_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY patient_owns_documents ON documents
    USING (patient_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY patient_owns_audit ON audit_log
    USING (patient_id = current_setting('app.current_user_id')::UUID);

-- Caregivers/providers get read access only through an ACTIVE care_relationships row,
-- enforced at the application layer (never trust client-supplied role claims).
-- The backend MUST set `app.current_user_id` via `SET LOCAL` at the start of every
-- transaction, derived from the verified session — never from a request body/header.

-- Consent-share and emergency access NEVER query these tables with a raw patient_id
-- from the request. They MUST resolve `share_token` / `emergency_code` server-side
-- into a patient_id first, validate expiry/revocation, and only then execute a
-- read restricted to the granted `scopes` — no write access is ever permitted
-- through a share_token or emergency_code.
```

**Non-negotiable isolation rules:**
1. Every authenticated query sets `app.current_user_id` from the verified session — never from client input.
2. A `consent_shares` row grants **read-only** access to **only** the domains listed in `scopes`, and **only** until `expires_at` (and only if `revoked_at IS NULL`).
3. An `emergency_profiles` code grants **read-only** access to **only** the fields in `visible_fields`, and every access is written to `audit_log` with `action = 'emergency_access'` before the response is returned.
4. Caregiver/provider access is checked against `care_relationships.status = 'active'` on every request, not cached beyond request scope.
5. No endpoint may accept a `patient_id` from the client for read/write of clinical tables — it is always derived server-side from session, share token, or emergency code.

---

## 12. Backend API Routes

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/timeline                         # unified, filterable feed
GET    /api/conditions            POST /api/conditions            PUT /api/conditions/:id     DELETE /api/conditions/:id
GET    /api/medications           POST /api/medications           PUT /api/medications/:id    DELETE /api/medications/:id
GET    /api/allergies             POST /api/allergies             PUT /api/allergies/:id      DELETE /api/allergies/:id
GET    /api/immunizations         POST /api/immunizations
GET    /api/labs                  POST /api/labs
GET    /api/vitals                POST /api/vitals

POST   /api/connections/smart-launch         # begin SMART on FHIR OAuth2 flow
GET    /api/connections/callback             # OAuth2 redirect handler
GET    /api/connections                      # list this patient's connections
POST   /api/connections/:id/sync             # manual re-sync trigger
DELETE /api/connections/:id                  # disconnect

POST   /api/documents/upload
GET    /api/documents
POST   /api/documents/:id/reparse

GET    /api/cds-alerts
POST   /api/cds-alerts/:id/dismiss

POST   /api/sharing                          # create consent_shares row, returns token/link/QR payload
GET    /api/sharing                          # list active/expired shares for this patient
DELETE /api/sharing/:id                      # revoke
GET    /api/sharing/view/:token              # scoped read-only view (public, token-gated)

GET    /api/emergency/:code                  # break-glass view (public, code-gated, heavily audited)
POST   /api/emergency/regenerate-code        # patient regenerates their own code

GET    /api/care-team
POST   /api/care-team/invite
DELETE /api/care-team/:relationshipId
POST   /api/care-notes            GET /api/care-notes

GET    /api/audit-log

POST   /api/ai-assistant/ask                 # grounded Q&A over own record
POST   /api/ai-assistant/parse-document       # structured extraction from uploaded doc

GET    /api/admin/users                       # admin only
GET    /api/admin/connectors/health           # admin only
```

Every route above (except the three explicitly marked public/token-gated) requires a valid session and runs its DB work inside a transaction that sets `app.current_user_id` per Section 11.

---

## 13. Gemini SDK Setup & Server-Side Security

```javascript
// server/services/geminiClient.js
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. AI features will not function.");
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStructuredResponse({ systemPrompt, userPrompt, responseSchema }) {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2,
    },
  });
  return JSON.parse(response.text);
}

export default genAI;
```

**Mandatory security rules:**
- `GEMINI_API_KEY` is read only from `process.env` on the server. It is never sent to, embedded in, or logged by any client bundle.
- Every prompt sent to Gemini is assembled **server-side** from data already scoped to the authenticated patient (via the RLS-protected queries in Section 11) — never from raw, unvalidated client input concatenated directly into the prompt.
- All user-supplied text (chat questions, document text) is treated as untrusted and is never allowed to alter the system instruction; it is passed only inside the `contents` user turn.
- Every AI response returned to the client is passed through the relevant Zod schema (Section 16) before being sent — a schema-validation failure is treated as an AI error, not silently displayed.
- Every AI response rendered to a patient must include a static, non-AI-generated disclaimer: *"This is not a substitute for professional medical advice. Consult a licensed clinician for diagnosis or treatment decisions."*
- Rate-limit `/api/ai-assistant/*` per user (e.g., 20 requests/hour) to control cost and abuse.

---

## 14. AI System Prompt

```
You are a clinical information assistant embedded inside a patient's own
Personal Health Record application. You are NOT a diagnosing physician and
you must never present your output as a diagnosis, prescription, or medical
directive.

You will be given a JSON snapshot of ONE patient's own records (conditions,
medications, allergies, immunizations, labs, vitals) that has already been
scoped and authorized by the application's access-control layer. Treat this
JSON as the only source of truth about the patient — never invent
medications, conditions, or lab values that are not present in it.

Rules:
1. Answer only using the provided JSON snapshot and well-established, general
   clinical knowledge (e.g., known drug interaction classes). If the answer
   requires information not present in the snapshot, say so explicitly and
   suggest the patient confirm with their provider.
2. When identifying a potential drug interaction or allergy conflict, always
   state your confidence and recommend the patient/provider verify with a
   pharmacist — never state an interaction as certain if it depends on dose
   or individual factors you do not have.
3. Never suggest stopping or changing a medication dose on your own authority.
4. Always keep responses grounded, concise, and free of alarming language
   unless the finding is genuinely urgent (e.g., a critical lab flag or a
   severe allergy conflict), in which case clearly flag it as urgent and
   recommend contacting a clinician promptly.
5. Output must strictly conform to the JSON schema provided in the request
   configuration. Do not add commentary outside the schema.
```

---

## 15. Detailed AI Prompts (with required JSON Schemas)

### 15.1 Drug–Drug / Drug–Allergy Interaction Check

**User prompt template:**
```
New medication being added: {{newMedicationJson}}
Patient's current active medications: {{activeMedicationsJson}}
Patient's active allergies: {{activeAllergiesJson}}

Evaluate this new medication against the above for:
1. Drug-drug interactions
2. Drug-allergy conflicts
Return findings per the response schema.
```

**Response Schema:**
```json
{
  "type": "object",
  "properties": {
    "alerts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": { "type": "string", "enum": ["drug_drug", "drug_allergy"] },
          "severity": { "type": "string", "enum": ["info", "warning", "critical"] },
          "description": { "type": "string" },
          "involved": { "type": "array", "items": { "type": "string" } },
          "recommendation": { "type": "string" }
        },
        "required": ["type", "severity", "description", "involved", "recommendation"]
      }
    },
    "overallRisk": { "type": "string", "enum": ["none", "low", "moderate", "high"] }
  },
  "required": ["alerts", "overallRisk"]
}
```

### 15.2 Missing Vaccine / Screening Reminder

**User prompt template:**
```
Patient profile: { age, sex, chronic conditions: {{conditionsJson}} }
Patient immunization history: {{immunizationsJson}}
Standard schedule rules: {{scheduleRulesJson}}

Identify any vaccines or age/condition-appropriate screenings that appear
overdue or missing. Return per the response schema.
```

**Response Schema:**
```json
{
  "type": "object",
  "properties": {
    "reminders": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "reminderType": { "type": "string", "enum": ["vaccine", "screening"] },
          "name": { "type": "string" },
          "reason": { "type": "string" },
          "urgency": { "type": "string", "enum": ["routine", "due_soon", "overdue"] }
        },
        "required": ["reminderType", "name", "reason", "urgency"]
      }
    }
  },
  "required": ["reminders"]
}
```

### 15.3 AI Health Assistant Q&A

**User prompt template:**
```
Patient question: "{{userQuestion}}"
Patient record snapshot: {{fullScopedRecordJson}}
```

**Response Schema:**
```json
{
  "type": "object",
  "properties": {
    "answer": { "type": "string" },
    "groundedIn": { "type": "array", "items": { "type": "string" } },
    "urgent": { "type": "boolean" },
    "disclaimer": { "type": "string" }
  },
  "required": ["answer", "groundedIn", "urgent", "disclaimer"]
}
```

### 15.4 Document Parsing / Extraction

**User prompt template:**
```
Extracted raw text from uploaded document:
{{documentText}}

Identify and structure any clinical facts present (conditions, medications,
allergies, immunizations, labs, vitals). Return per the response schema.
```

**Response Schema:**
```json
{
  "type": "object",
  "properties": {
    "extracted": {
      "type": "object",
      "properties": {
        "conditions": { "type": "array", "items": { "type": "object" } },
        "medications": { "type": "array", "items": { "type": "object" } },
        "allergies": { "type": "array", "items": { "type": "object" } },
        "immunizations": { "type": "array", "items": { "type": "object" } },
        "labs": { "type": "array", "items": { "type": "object" } },
        "vitals": { "type": "array", "items": { "type": "object" } }
      }
    },
    "confidence": { "type": "string", "enum": ["low", "medium", "high"] },
    "requiresManualReview": { "type": "boolean" }
  },
  "required": ["extracted", "confidence", "requiresManualReview"]
}
```

---

## 16. Zod Validation Requirements

```typescript
// shared/schemas.ts
import { z } from "zod";

export const MedicationSchema = z.object({
  rxnormCode: z.string().optional(),
  name: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  route: z.string().optional(),
  prescriber: z.string().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export const AllergySchema = z.object({
  substanceCode: z.string().optional(),
  substanceName: z.string().min(1),
  reaction: z.string().optional(),
  severity: z.enum(["mild", "moderate", "severe", "life_threatening"]),
  isActive: z.boolean().default(true),
});

export const ConditionSchema = z.object({
  icd10Code: z.string().optional(),
  displayName: z.string().min(1),
  status: z.enum(["active", "resolved", "chronic"]),
  onsetDate: z.string().date().optional(),
  resolvedDate: z.string().date().optional(),
  notes: z.string().optional(),
});

export const ImmunizationSchema = z.object({
  cvxCode: z.string().optional(),
  vaccineName: z.string().min(1),
  dateAdministered: z.string().date(),
  provider: z.string().optional(),
  lotNumber: z.string().optional(),
  seriesComplete: z.boolean().default(false),
});

export const LabResultSchema = z.object({
  loincCode: z.string().optional(),
  testName: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  flag: z.enum(["normal", "high", "low", "critical"]).optional(),
  collectedAt: z.string().datetime(),
});

export const VitalSchema = z.object({
  vitalType: z.enum(["blood_pressure", "heart_rate", "glucose", "weight", "spo2", "temperature", "respiratory_rate"]),
  value: z.string().min(1),
  unit: z.string().optional(),
  recordedAt: z.string().datetime(),
  source: z.enum(["manual", "wearable", "device"]).default("manual"),
});

export const ConsentShareCreateSchema = z.object({
  recipientLabel: z.string().min(1),
  scopes: z.array(z.enum(["conditions", "medications", "allergies", "immunizations", "labs", "vitals"])).min(1),
  durationMinutes: z.number().int().min(60).max(43200), // 1 hour to 30 days
  note: z.string().optional(),
});

export const AiAssistantQuestionSchema = z.object({
  question: z.string().min(3).max(1000),
});

// AI RESPONSE VALIDATION — every Gemini JSON response is parsed through one of these
// before it is ever sent to the client.
export const CdsAlertResponseSchema = z.object({
  alerts: z.array(z.object({
    type: z.enum(["drug_drug", "drug_allergy"]),
    severity: z.enum(["info", "warning", "critical"]),
    description: z.string(),
    involved: z.array(z.string()),
    recommendation: z.string(),
  })),
  overallRisk: z.enum(["none", "low", "moderate", "high"]),
});

export const AiAssistantAnswerSchema = z.object({
  answer: z.string(),
  groundedIn: z.array(z.string()),
  urgent: z.boolean(),
  disclaimer: z.string(),
});
```

All Express routes that accept a body must run it through the matching schema with `.parse()` inside a try/catch, returning `400` with the Zod error details on failure. All AI JSON output must run through its matching response schema before being returned to the client, returning `502` with a generic "AI response validation failed" message on failure — never forwarding raw unvalidated AI output.

---

## 17. Frontend Components List

```
src/
  components/
    layout/
      AppShell.jsx
      Sidebar.jsx
      TopBar.jsx
      AlertBanner.jsx
    timeline/
      TimelineFeed.jsx
      TimelineFilterBar.jsx
      TimelineEntryCard.jsx
    records/
      MedicationList.jsx / MedicationForm.jsx
      AllergyList.jsx / AllergyForm.jsx
      ConditionList.jsx / ConditionForm.jsx
      ImmunizationList.jsx / ImmunizationForm.jsx
      LabResultList.jsx / LabTrendChart.jsx
      VitalsList.jsx / VitalsChart.jsx / VitalEntryForm.jsx
    connections/
      ConnectionCard.jsx
      SmartLaunchButton.jsx
      ConnectionStatusBadge.jsx
    sharing/
      CreateShareModal.jsx
      ActiveShareList.jsx
      ShareQrCode.jsx
      ScopedShareView.jsx
    emergency/
      EmergencyCodeCard.jsx
      EmergencyView.jsx
    care/
      CareTeamList.jsx
      InviteCaregiverModal.jsx
      CareNoteThread.jsx
    cds/
      CdsAlertCard.jsx
      CdsAlertList.jsx
    ai/
      AiChatWindow.jsx
      AiMessageBubble.jsx
      AiDisclaimerFooter.jsx
    documents/
      DocumentUploadDropzone.jsx
      DocumentReviewCard.jsx
    audit/
      AuditLogTable.jsx
    shared/
      Button.jsx
      Input.jsx
      Select.jsx
      Modal.jsx
      Badge.jsx
      LoadingSpinner.jsx
      EmptyState.jsx
      ConfirmDialog.jsx
  pages/            # one file per route in Section 6
  hooks/
    useAuth.js
    useTimeline.js
    useCdsAlerts.js
  lib/
    apiClient.js
    zodSchemas.ts    # re-exported from shared/
```

Every list/form component pair follows the same contract: list component fetches via a typed hook, form component validates client-side with the same Zod schema used server-side (Section 16), and both render loading/empty/error states explicitly — no bare blank screens.

---

## 18. Security Requirements

1. **Authentication:** bcrypt/argon2 password hashing, httpOnly + Secure + SameSite=Strict session cookies, session expiry + rotation on privilege-relevant actions.
2. **Authorization:** RBAC enforced on every route; RLS enforced at the DB layer as a second line of defense (Section 11).
3. **Transport:** HTTPS enforced in production; HSTS header set.
4. **Secrets:** All API keys/tokens (Gemini, FHIR client secrets) in environment variables only, never committed, never sent to client.
5. **Token Encryption:** `access_token_enc` / `refresh_token_enc` in `source_connections` are encrypted at rest (e.g., AES-256-GCM with a server-side key from env) — never stored in plaintext.
6. **Consent Tokens & Emergency Codes:** cryptographically random (`crypto.randomBytes`), single-purpose, expiry-checked on every use, and rate-limited against brute force.
7. **Input Validation:** Zod on every request body/query param (Section 16); parameterized SQL only — no string-concatenated queries.
8. **Audit Trail:** every read of clinical data by a non-owner (caregiver, provider, shared party, emergency responder) is written to `audit_log` before the response is returned, never after.
9. **Least Privilege on AI Calls:** the Gemini prompt payload includes only the fields required for that specific task (e.g., interaction checks never include unrelated lab history).
10. **File Uploads:** MIME-type allowlist, file-size limits, virus/malware scan hook point, stored outside the web root with signed, time-limited retrieval URLs.
11. **Rate Limiting:** per-user and per-IP rate limits on auth endpoints, sharing endpoints, emergency endpoint, and AI endpoints.
12. **CORS:** locked to the deployed frontend origin only.
13. **Error Handling:** no stack traces or internal error detail returned to the client in production; generic messages + server-side structured logging.

---

## 19. Environment Variables Template

```env
# Server
NODE_ENV=development
PORT=3000
SESSION_SECRET=change_me_to_a_long_random_string

# Database (Replit Postgres)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Encryption for stored OAuth tokens
TOKEN_ENCRYPTION_KEY=change_me_32_byte_base64_key

# Gemini / @google/genai
GEMINI_API_KEY=your_gemini_api_key_here

# SMART on FHIR
FHIR_CLIENT_ID=your_fhir_client_id
FHIR_CLIENT_SECRET=your_fhir_client_secret
FHIR_REDIRECT_URI=https://your-app-domain.com/api/connections/callback

# File storage
FILE_STORAGE_DIR=./storage
# (Optional, prod) S3-compatible object storage
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# App
CLIENT_ORIGIN=http://localhost:5173
```

---

## 20. Suggested Folder Structure

```
/phr-app
  /client
    /src
      /components   (Section 17)
      /pages
      /hooks
      /lib
      main.jsx
      App.jsx
    index.html
    tailwind.config.js
    vite.config.js
  /server
    /controllers
    /services
      geminiClient.js
      cdsEngine.js
      fhirSyncService.js
      encryptionService.js
      auditService.js
    /repositories
    /routes
    /middleware
      requireAuth.js
      requireRole.js
      setRlsContext.js
      rateLimiter.js
      errorHandler.js
    /db
      schema.sql        (Section 10)
      rls.sql            (Section 11)
      migrations/
      pool.js
    server.js
  /shared
    schemas.ts           (Section 16)
    domainTypes.ts
  .env.example
  package.json
  README.md
```

---

## 21. Implementation Phases

**Phase 1 — Foundation**
Set up monorepo structure, install dependencies (Express, React/Vite, Tailwind, Zod, `pg`, `@google/genai`), configure `DATABASE_URL`, run schema + RLS SQL (Sections 10–11), implement auth (register/login/session middleware).

**Phase 2 — Core Clinical CRUD**
Implement Conditions, Medications, Allergies, Immunizations, Labs, Vitals — repository → service → controller → route for each, with Zod validation and RLS context middleware wired in. Build matching list/form components and pages.

**Phase 3 — Unified Timeline**
Build the `/api/timeline` aggregation query and the `TimelineFeed`/`TimelineFilterBar` components.

**Phase 4 — CDS Engine**
Implement `cdsEngine.js`: on every medication/allergy create, call Gemini per Section 15.1, validate via `CdsAlertResponseSchema`, persist to `cds_alerts`, and surface via `CdsAlertList`. Implement scheduled/on-login checks for Section 15.2 reminders.

**Phase 5 — Consent Sharing & Emergency Access**
Implement `consent_shares` CRUD, token generation/validation, `ScopedShareView`, `emergency_profiles`, code generation, and the break-glass endpoint — with full audit logging on every access.

**Phase 6 — FHIR/SMART Connections**
Implement OAuth2 SMART launch + callback, FHIR resource fetch + normalization mapping into internal tables, dedup logic, and manual re-sync.

**Phase 7 — Documents & AI Assistant**
Implement upload endpoint, document parsing via Gemini (Section 15.4), review queue UI, and the grounded Q&A assistant (Section 15.3) with disclaimer footer.

**Phase 8 — Care Coordination & Audit**
Implement caregiver invites, `care_relationships`, `care_notes`, and the `/audit-log` page.

**Phase 9 — Hardening**
Apply all Section 18 security requirements, add rate limiting, review every route against Section 11 isolation rules, and add error boundaries/empty states across the frontend.

**Phase 10 — QA Pass**
Walk every flow in Section 7 end-to-end as a patient, a caregiver, a shared-link recipient, and an emergency responder; confirm data isolation holds in every case.

---

## 22. Acceptance Criteria

- [ ] A patient can register, log in, and see an empty, correctly-stated dashboard on first login.
- [ ] A patient can manually add a condition, medication, allergy, immunization, lab, and vital, and each appears correctly on `/timeline` and its domain page.
- [ ] Adding a medication that conflicts with an existing active medication or allergy produces a `cds_alerts` row and a visible alert within the same request/response cycle (or immediately after, via polling).
- [ ] A patient can connect a (sandbox/test) FHIR source, pull resources, and see them normalized into the correct domain tables without duplicating existing manually-entered records.
- [ ] A patient can create a scoped, time-limited share link; opening it as an unauthenticated party shows **only** the selected domains and **stops working** after expiry or revocation.
- [ ] Entering a valid emergency code shows only the pre-configured minimal fields, and an `audit_log` row with `action = 'emergency_access'` exists immediately after.
- [ ] A second patient account can **never**, under any UI action or direct API call, view or modify the first patient's records.
- [ ] The AI assistant answers a question using only that patient's actual stored data, includes the required disclaimer, and gracefully reports "I don't have that information" rather than fabricating a value when data is absent.
- [ ] Every clinical create/update/delete and every non-owner read is present in `/audit-log`.
- [ ] All forms reject invalid input client-side and server-side using the same Zod schemas.
- [ ] No API key or OAuth secret appears in any client-side bundle or network response.
- [ ] The application builds and runs from a clean clone using only the `.env` template in Section 19 and the schema/RLS SQL in Sections 10–11.

---

## 23. Final Instruction to Coding Agent

```
Build this application now, in full, following every section above in order.
Do not ask clarifying questions before starting — where a decision is
underspecified, make the most secure, most standards-compliant choice
consistent with the rest of this prompt, and state the assumption in a
code comment at the point of the decision.

Do not skip the database schema or RLS setup to "get to the UI faster."
Do not stub out the CDS engine, the consent-sharing token logic, the
emergency-access audit logging, or the AI response schema validation —
these are the core safety guarantees of this application and must be
implemented for real, not mocked.

Produce complete, runnable files for every layer: SQL schema and RLS
policies, Express routes/controllers/services/repositories, shared Zod
schemas, and React pages/components — wired together and internally
consistent. When finished, verify the result against every checkbox in
Section 22 (Acceptance Criteria) before considering the build complete.
```
