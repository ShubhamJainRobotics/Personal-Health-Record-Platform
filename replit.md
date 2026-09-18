# My Health Record

A patient-controlled health record that brings medications, allergies, conditions, labs, vitals, and care reminders into one focused workspace.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/health-record` — React/Vite patient-facing application and visual system.
- `artifacts/api-server/src/routes/phr.ts` — PHR API routes and preview seed data.
- `lib/api-spec/openapi.yaml` — source of truth for the generated API client and server validation schemas.
- `lib/db/src/schema/phr.ts` — Drizzle schema for the initial clinical record domains.

## Architecture decisions

- The first milestone uses a seeded preview patient so the core workflow is immediately visible while the authenticated multi-patient model is added in the next phase.
- OpenAPI is the contract boundary; generated React Query hooks and Zod schemas are used by the frontend and API server.
- Date-only clinical fields are normalized back to `YYYY-MM-DD` at the API boundary to avoid timezone shifts.

## Product

- Responsive dashboard with a unified health timeline, record counts, reminders, and attention alerts.
- Medication CRUD with active/past filtering and real API persistence.
- Allergy, condition, lab, and vital record views with loading, empty, and error states.
- Settings/profile surface and responsive navigation ready for the next auth and sharing milestones.

## User preferences

No additional preferences recorded.

## Gotchas

- Restart both managed workflows after API contract, database, or frontend changes so proxy routing and generated hooks stay in sync.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
