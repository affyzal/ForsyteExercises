## Forsyte Exercises

This repository is a small monorepo used for frontend exercises on top of a realistic backend.

- **Root**: orchestrates workspaces with Turbo and pnpm.
- **`apps/api`**: NestJS + Prisma + Postgres API exposing agent and risk-related endpoints.
- **`apps/web`**: Next.js frontend where candidates complete the exercises.

### Quick start

#### Prerequisites

- **Node.js**: version 18 or newer.
- **Package manager**: `pnpm` (see the `packageManager` field in `package.json`).
- **PostgreSQL**: a running PostgreSQL instance (local install, Docker, etc.).

#### 1. Install dependencies

From the repo root:

```bash
pnpm install
```

#### 2. Set up the database

The API needs a PostgreSQL database before it can start. Follow these steps from the `apps/api` directory.

**Create the database and configure the connection:**

1. Ensure you have a PostgreSQL database called `forsyteco` available. How you create it depends on your setup (e.g. `createdb`, a Docker container, a GUI tool, etc.).
2. Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

The default connection string in `.env.example` expects Postgres on `localhost:5432` with user `postgres` and password `postgres`. Update `DATABASE_URL` in your new `.env` file if your setup differs.

**Run migrations, generate the Prisma client, and seed data:**

```bash
pnpm prisma:generate   # generate the Prisma client from the schema
pnpm prisma:migrate    # apply database migrations
pnpm prisma:seed       # seed demo data (users, clients, matters, etc.)
```

The seed script creates:

- A primary organisation (`forsyte`) with a small set of users, clients, matters, risk assessments, and risk flags.
- A wired mock agent model (`forsyte.ask-forsyte-mock-1-alpha-v5`) and a demo agent session.

You can also browse the database with:

```bash
pnpm prisma:studio     # open Prisma Studio at http://localhost:5555
```

- Schema: `apps/api/prisma/schema.prisma`
- Seed script: `apps/api/prisma/seed.ts`

#### 3. Run the stack

Start both API and web via Turbo:

```bash
pnpm dev
```

Or run them separately:

```bash
pnpm dev --filter api   # NestJS API on http://localhost:8000
pnpm dev --filter web   # Next.js app on http://localhost:3000
```

API docs are available at http://localhost:8000/swagger once the API is running.

#### Tests and linting

```bash
pnpm test           # turbo run test across workspaces
pnpm test --filter api
pnpm lint
pnpm lint --filter web
```

### Authentication

- The API is protected by JWT access tokens.
- A public login endpoint is available at `POST /auth/login` and expects:
  - `email` (e.g. `buzz.aldrin@forsyte.co`)
  - `password` (e.g. `beeCompliant33`)
- Frontend calls to protected endpoints (including the Ask Forsyte agent routes) must send:
  - `Authorization: Bearer <accessToken>`

### Candidate exercises

The exercises are **frontend-only** and live in `apps/web`. You should treat the API (`apps/api`) as a stable backend.

The main exercise docs are:

- [`docs/exercise-1.md`](docs/exercise-1.md) – build the “Ask Forsyte” assistant layout in the frontend using mocked data (no real API calls).
- [`docs/exercise-2.md`](docs/exercise-2.md) – wire that layout to the real NestJS agent API in three stages (plain answers, markdown+resources, and multi-part answers).

