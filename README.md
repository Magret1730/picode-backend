# picode-backend

Backend API for **Picode** — a kid-friendly learning platform where students complete lessons, classworks, and assignments, submit code, and earn XP.

## Project overview

This service provides:

- Course/lesson/classwork/assignment APIs (UUID IDs)
- A safe MVP HTML/CSS submission test runner
- Progress tracking (XP + completed items)
- MVP admin CRUD endpoints for managing content

## Tech stack

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS
- **Database**: PostgreSQL
- **DB access**: Knex (migrations + queries)
- **Tests**: Jest

## Folder structure

High-level layout:

```
src/
  common/
    database/          # Knex provider + DatabaseService (global)
    constants/         # app-wide constants
  modules/
    admin/             # /admin/* (MVP admin CRUD)
    assignments/       # /assignments
    classworks/        # /classworks
    courses/           # /courses
    health/            # /health
    lessons/           # /lessons
    levels/            # /levels
    progress/          # /progress
    submissions/       # /submissions (test runner + submissions)
    users/             # /users (MVP scaffolding)
db/
  migrations/          # Knex migrations
  seeds/               # Knex seeds
```

Module pattern:

- `*.controller.ts`: HTTP endpoints
- `*.service.ts`: business logic
- `*.repository.ts`: database access (Knex)

## Requirements

- Node.js **18+**
- PostgreSQL **13+**

## Environment variables

Copy `.env.example` → `.env` and fill in values.

### Core

- **`PORT`**: API port (default `3000`)
- **`CORS_ORIGIN`**: CORS allowlist (default `*`)

### Database

- **`DATABASE_HOST`**
- **`DATABASE_PORT`** (default `5432`)
- **`DATABASE_NAME`**
- **`DATABASE_USER`**
- **`DATABASE_PASSWORD`**
- **`DATABASE_SSL`**: `true|false` (default `false`)

### Admin (MVP)

- **`ADMIN_KEY`**: admin header key (default `dev-admin`)
  - Requests must include header: `X-Admin-Key: <ADMIN_KEY>`

## Install

```bash
cd picode-backend
npm install
```

## Run locally

1. Start PostgreSQL (local or hosted)
2. Run migrations + seeds
3. Start the API

```bash
npm run migration:run
npm run seed:run
npm run start:dev
```

## Migrations

Run latest migrations:

```bash
npm run migration:run
```

Create a new migration:

```bash
npm run migration:create -- add_some_table
```

## Seeds

Run seeds:

```bash
npm run seed:run
```

Seeds are written to be **idempotent** (safe to re-run).

## Tests

```bash
npm test
```

## API endpoints (MVP)

### Health

- `GET /health`

### Auth (MVP)

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)

### Courses / content

- `GET /courses`
- `GET /courses/:slug`
- `GET /courses/:slug/lessons`
- `GET /levels/:id`
- `GET /lessons/:id`
- `GET /classworks/:id`
- `GET /assignments/:id`

### Submissions

- `POST /submissions/run-tests`

Request body (classwork):

```json
{
  "userId": "demo-user",
  "classworkId": "uuid",
  "submittedCode": "<!doctype html>..."
}
```

Request body (assignment):

```json
{
  "userId": "demo-user",
  "assignmentId": "uuid",
  "submittedCode": "<!doctype html>..."
}
```

Notes:

- `userId` can be the special alias **`demo-user`** (MVP). The backend maps it to a real UUID user row.
- Exactly one of `classworkId` or `assignmentId` must be provided.

### Progress

- `GET /progress/:userId`
  - Accepts `demo-user` (MVP alias) or a real UUID

### Admin (MVP)

All admin endpoints require header `X-Admin-Key: <ADMIN_KEY>`.

- Lessons:
  - `GET /admin/lessons`
  - `GET /admin/lessons/:id`
  - `POST /admin/lessons`
  - `PUT /admin/lessons/:id`
  - `DELETE /admin/lessons/:id`
- Classworks:
  - `GET /admin/classworks`
  - `GET /admin/classworks/:id`
  - `POST /admin/classworks`
  - `PUT /admin/classworks/:id`
  - `DELETE /admin/classworks/:id`
- Assignments:
  - `GET /admin/assignments`
  - `GET /admin/assignments/:id`
  - `POST /admin/assignments`
  - `PUT /admin/assignments/:id`
  - `DELETE /admin/assignments/:id`

## Scripts

- `npm run start:dev`: run API in watch mode
- `npm run build`: build to `dist/`
- `npm test`: run unit tests (Jest)
- `npm run migration:create -- <name>`: create a migration
- `npm run migration:run`: run latest migrations
- `npm run seed:run`: run seeds

## Branching workflow (simple)

- **`main`**: stable / releasable
- **`dev`**: active development

Suggested flow:

1. Create a feature branch off `dev`
2. Open a PR into `dev`
3. Merge `dev` → `main` for releases

## Commit workflow

Keep commits small and descriptive. A simple convention:

- `feat(scope): ...` for new features
- `fix(scope): ...` for bug fixes
- `refactor(scope): ...` for internal changes
- `docs: ...` for documentation updates

## Deployment notes (Render / Railway)

This API works well on either platform. Typical setup:

### Build & start commands

- **Build**: `npm install && npm run build`
- **Start**: `npm run start:prod`

### Database

- Provision a Postgres database
- Set the `DATABASE_*` env vars from the provider connection info
- If your provider requires SSL, set `DATABASE_SSL=true`

### One-time setup

Run migrations + seeds once after deploy (via a one-off job or “shell”/console):

```bash
npm run migration:run
npm run seed:run
```

### Notes / gotchas

- Make sure `PORT` is set to the platform-provided port (or let the platform inject it).
- Set `CORS_ORIGIN` to your frontend URL in production (avoid `*`).
- Set a strong `ADMIN_KEY` (do not keep `dev-admin` in production).

