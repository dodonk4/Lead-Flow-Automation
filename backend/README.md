# LeadFlow backend

Node.js + TypeScript + Express API. Install and run its commands from this folder; the frontend is an independent npm project in `../frontend`.

## Configuration

```powershell
Copy-Item .env.example .env
```

Set `DATABASE_URL` to a reachable PostgreSQL instance and `FRONTEND_ORIGIN` to the exact origin the frontend runs from (default `http://localhost:5173`). Do not share or publish the `.env` file.

The CRM read API exposes `GET /api/leads` and `GET /api/leads/:id`; the frontend origin allowed by CORS is controlled by `FRONTEND_ORIGIN`.

## Development and verification

```sh
npm install
npm run dev
npm test
npm run build
```

## Prisma

```sh
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
```

`db:migrate` creates and applies development migrations; `db:deploy` applies the existing migrations in the configured environment.
`db:seed` loads the three fictitious advisors and their assignment rules idempotently; it does not modify existing records.
