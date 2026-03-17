# QuackAPI Workspace

This workspace contains the QuackAPI project — a WhatsApp API SaaS platform.

## Project Location
All application code lives in the `QuackAPI/` subdirectory.

## Running the App
The root `package.json` proxies commands to `QuackAPI/`:
- `npm run dev` — starts the dev server (runs `cd QuackAPI && npm run dev`)
- `npm run build` — builds for production
- `npm run start` — starts production build

The workflow is configured to run `cd QuackAPI && npm run dev` on port 5000.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (`QuackAPI/client/`)
- **Backend**: Express.js + TypeScript (`QuackAPI/server/`)
- **Database**: PostgreSQL with Drizzle ORM (`QuackAPI/shared/schema.ts`)
- **WhatsApp**: @whiskeysockets/baileys for multi-device protocol
- **Auth**: JWT-based authentication

## Environment Variables
- `DATABASE_URL` — Replit's built-in PostgreSQL (auto-provisioned)
- `SUPABASE_DATABASE_URL` — Optional Supabase override (takes priority if set)
- `JWT_SECRET` — Secret for JWT token signing
- `SESSION_SECRET` — Session secret
- `STRIPE_SECRET_KEY` — Stripe payments
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` — PayPal payments
- `SMTP_*` — Email configuration for Nodemailer

## Database
- Replit's built-in PostgreSQL is provisioned and connected via `DATABASE_URL`
- Schema is managed with Drizzle ORM: `cd QuackAPI && npm run db:push`

## Key Files
- `QuackAPI/server/index.ts` — Entry point, starts on port 5000
- `QuackAPI/server/routes.ts` — All API route definitions
- `QuackAPI/server/baileys.ts` — WhatsApp integration logic
- `QuackAPI/server/db.ts` — Database connection
- `QuackAPI/shared/schema.ts` — Drizzle schema definitions
- `QuackAPI/vite.config.ts` — Vite configuration
