## Forsyte Exercises

This repository is a small monorepo used for frontend exercises on top of a realistic backend.

- **Root**: orchestrates workspaces with Turbo and pnpm.
- **`apps/api`**: NestJS + Prisma + Postgres API exposing agent and risk-related endpoints.
- **`apps/web`**: Next.js frontend where candidates complete the exercises.

### Environment and tooling (quick start)

#### Requirements

- **Node.js**: version 18 or newer.
- **Package manager**: `pnpm` (see the `packageManager` field in `package.json`).

#### Install dependencies

From the repo root:

```bash
pnpm install
```

#### Run the stack

Start both API and web via Turbo:

```bash
pnpm dev
```

Or run them separately:

```bash
pnpm dev --filter api   # NestJS API (apps/api)
pnpm dev --filter web   # Next.js app (apps/web)
```

#### Tests and linting

```bash
pnpm test           # turbo run test across workspaces
pnpm test --filter api
pnpm lint
pnpm lint --filter web
```

### Database, Prisma, and seed data

The API uses Prisma with a Postgres database:

- Schema: `apps/api/prisma/schema.prisma`
- Seed script: `apps/api/prisma/seed.ts`

From `apps/api` you can initialise and inspect data:

```bash
pnpm prisma:generate   # generate Prisma client
pnpm prisma:migrate    # run dev migrations
pnpm prisma:seed       # seed demo data
pnpm prisma:studio     # open Prisma Studio
```

The seed script creates:

- A primary organisation (`forsyte`) with a small set of users, clients, matters, risk assessments, and risk flags.
- A wired mock agent model (`forsyte.ask-forsyte-mock-1-alpha-v5`) and a demo agent session.

### Candidate exercises

The exercises are **frontend-only** and live in `apps/web`. You should treat the API (`apps/api`) as a stable backend.

The main exercise docs are:

- [`docs/exercise-1.md`](docs/exercise-1.md) – build the “Ask Forsyte” assistant layout in the frontend using mocked data (no real API calls).
- [`docs/exercise-2.md`](docs/exercise-2.md) – wire that layout to the real NestJS agent API in three stages (plain answers, markdown+resources, and multi-part answers).

