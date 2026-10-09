# LeadFlow backend

API Node.js + TypeScript + Express. Instala y ejecuta sus comandos desde esta carpeta; el frontend es un proyecto npm independiente en `../frontend`.

## Configuración

```powershell
Copy-Item .env.example .env
```

Configura `DATABASE_URL` para una instancia PostgreSQL accesible y `FRONTEND_ORIGIN` con el origen exacto desde el que se ejecutará el frontend (por defecto `http://localhost:5173`). No compartas ni publiques el `.env`.

La API de lectura del CRM expone `GET /api/leads` y `GET /api/leads/:id`; el origen de frontend autorizado por CORS se controla mediante `FRONTEND_ORIGIN`.

## Desarrollo y verificación

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
```

`db:migrate` crea y aplica migraciones de desarrollo; `db:deploy` aplica las migraciones existentes en el entorno configurado.
