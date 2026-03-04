# QuackAPI - WhatsApp API SaaS Platform

## Overview
A full-stack WhatsApp API SaaS platform that allows users to connect WhatsApp devices via QR codes, send messages (text, images, PDFs) through a REST API, and manage webhooks and payments.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (in `QuackAPI/client/`)
- **Backend**: Express.js + TypeScript (in `QuackAPI/server/`)
- **Database**: Supabase PostgreSQL with Drizzle ORM (schema in `QuackAPI/shared/`)
- **WhatsApp**: @whiskeysockets/baileys for multi-device protocol
- **Auth**: JWT-based authentication

## Running
- `cd QuackAPI && npm run dev` — starts the dev server on port 5000
- `cd QuackAPI && npm run db:push` — push schema changes to the database

## Key Environment Variables
- `SUPABASE_DATABASE_URL` — Supabase PostgreSQL pooler connection string (takes priority over DATABASE_URL)
- `DATABASE_URL` — Fallback PostgreSQL connection string (auto-provisioned by Replit)
- `JWT_SECRET` — secret for JWT token signing
- `SESSION_SECRET` — session secret

## Project Structure
```
QuackAPI/
├── client/src/       — React frontend
├── server/           — Express backend
├── shared/           — Shared schemas and types
├── script/           — Build scripts
└── drizzle.config.ts — Drizzle ORM config
```
