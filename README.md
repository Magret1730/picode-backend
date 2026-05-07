# picode-backend

Backend for Picode (NestJS + PostgreSQL + Knex).

## Requirements

- Node.js 18+
- PostgreSQL 13+

## Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Run DB migrations + seed:

```bash
npm run migration:run
npm run seed:run
```

4. Start the API:

```bash
npm run start:dev
```

## Health check

- `GET /health` returns `{ ok: true/false, db: 'up'|'down', durationMs }`

## Submissions

Run checks and save a submission:

- `POST /submissions/run-tests`

Request body:

```json
{
  "userId": "uuid",
  "classworkId": "uuid",
  "submittedCode": "<!doctype html>..."
}
```

or

```json
{
  "userId": "uuid",
  "assignmentId": "uuid",
  "submittedCode": "<!doctype html>..."
}
```

Response:

```json
{
  "passed": false,
  "results": [
    {
      "name": "Heading exists",
      "passed": true,
      "message": "Great job! Heading exists."
    }
  ]
}
```

## Scripts

- `npm run start:dev`: run in watch mode
- `npm run build`: build to `dist/`
- `npm test`: run unit tests (Jest)
- `npm run migration:create -- <name>`: create a migration
- `npm run migration:run`: run latest migrations
- `npm run seed:run`: run seeds

## Database

MVP tables:

- `users`
- `courses` (seeded with **HTML Beginner** and **CSS Beginner**)
- `levels`
- `lessons`
- `classworks`
- `assignments`
- `submissions`
- `progress`

## Migrations & seeds

Run migrations:

```bash
npm run migration:run
```

Seed courses + levels (MVP only):

```bash
npm run seed:run
```

