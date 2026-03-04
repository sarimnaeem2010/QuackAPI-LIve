# QuackAPI - WhatsApp API SaaS Platform

## Overview

QuackAPI is a multi-user WhatsApp API SaaS platform (similar to UltraMsg) built with a full-stack TypeScript architecture. It allows users to register, connect multiple WhatsApp devices via QR code scanning, send messages through a REST API, configure webhooks for incoming messages, and manage payments. The system uses the Baileys library to interface with WhatsApp Web's multi-device protocol. Brand name was renamed from WAPIFlow to QuackAPI.

## Email & OTP System

- **Email service**: `server/email.ts` — nodemailer via SpaceMail SMTP (`mail.spacemail.com:465`, SSL)
- **SMTP credentials**: `SMTP_USER` and `SMTP_PASS` are secrets; host/port hardcoded in `server/email.ts`
- **Registration flow**: After signup, user receives a 6-digit OTP email → must verify before JWT is issued
- **Password reset flow**: Forgot password sends a 6-digit OTP email → user enters OTP + new password together
- **Email templates**: `sendWelcomeEmail`, `sendEmailVerificationOTP`, `sendPasswordResetOTP` — branded HTML
- **OTP storage**: Email OTPs stored in `users.emailOtp` + `users.emailOtpExpiresAt` (10-min expiry); reset OTPs stored in `passwordResetTokens` (15-min expiry) with compound token format `uid{id}_{random}_{otp}`

## WhatsApp Support Button

- Floating green button (bottom-right, all pages) in `client/src/App.tsx`
- Links to `https://wa.me/923122398166?text=Hi%2C+I+need+help+with+QuackAPI`

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Client)
- **Framework**: React with TypeScript, bundled by Vite
- **UI Library**: shadcn/ui (new-york style) with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack React Query for server state
- **Routing**: Client-side SPA served from `client/src/`; `/` shows landing page for unauthenticated visitors, dashboard for logged-in users
- **Styling**: Tailwind CSS with CSS variables for theming (dark/light mode support), custom color system using HSL variables
- **Key Libraries**: framer-motion (animations), qrcode.react (QR rendering), recharts (analytics charts), lucide-react (icons), date-fns (date formatting)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (Server)
- **Framework**: Express.js running on Node.js with TypeScript (via tsx)
- **Entry point**: `server/index.ts` creates an HTTP server
- **Development**: Vite dev server middleware with HMR (`server/vite.ts`)
- **Production**: Static file serving from `dist/public` (`server/static.ts`)
- **Build**: Custom build script (`script/build.ts`) using esbuild for server + Vite for client
- **WhatsApp Integration**: `@whiskeysockets/baileys` library for WhatsApp Web multi-device protocol
  - Sessions stored on filesystem at `baileys_sessions/device_{id}/`
  - Each device gets its own auth state directory with Signal protocol keys
  - QR codes generated via `qrcode` package and stored in database
  - Active WebSocket connections managed in-memory via a Map

### Authentication
- **Method**: JWT-based authentication
- **Token**: Signed with `JWT_SECRET` env var (defaults to "supersecret"), expires in 7 days
- **API Keys**: Each user gets a unique API key (`wa_` + random hex) for programmatic API access
- **Password**: Stored in database (hashing should be implemented in storage layer)

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: `node-postgres` (pg) Pool using `DATABASE_URL` environment variable
- **Schema** (`shared/schema.ts`):
  - `users` - id, name, email, password, api_key, subscription_status, plan (starter/professional/enterprise), is_admin (boolean), created_at
  - `devices` - id, user_id, device_name, phone_number, session_data (JSONB), status (disconnected/pending/connected), qr_code, webhook_url, created_at
  - `messages` - id, device_id, to_number, content, type (text/image/pdf/button), status (pending/sent/failed), error_reason, created_at
  - `payments` - id, user_id, amount (cents), currency, gateway (jazzcash/easypaisa/stripe), transaction_id, status (pending/completed/failed), created_at
- **Migrations**: Drizzle Kit with `drizzle-kit push` for schema sync
- **Insert schemas**: Generated via `drizzle-zod` for validation

### API Structure (`shared/routes.ts`)
- Type-safe API route definitions with Zod validation schemas
- Routes:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/me` - Get current user
  - Device CRUD and WhatsApp session management endpoints
  - Message sending endpoints (text, images, buttons, PDFs, OTP)
  - Payment management endpoints
  - Webhook configuration per device
  - Admin dashboard routes (`/api/admin/*`) - stats, users, devices, messages, payments management
  - Admin user management: toggle subscription status, toggle admin role

### Storage Layer (`server/storage.ts`)
- Interface-based pattern (`IStorage`) with `DatabaseStorage` implementation
- Handles all CRUD operations for users, devices, messages, and payments
- API key generation uses `crypto.randomBytes`

### Key Design Decisions
1. **Shared schema**: Database schema and API route definitions live in `shared/` directory, accessible by both client and server
2. **Baileys session persistence**: WhatsApp sessions use `useMultiFileAuthState` storing Signal protocol keys as individual JSON files on disk rather than in the database
3. **Monorepo structure**: Single package.json manages both client and server dependencies
4. **Build optimization**: Server build uses esbuild with an allowlist of dependencies to bundle (reducing cold start syscalls), while others are kept external

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required, connection via `DATABASE_URL` environment variable
- **WhatsApp Web**: Connected via Baileys library (unofficial WhatsApp Web API)

### Key Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - Secret for signing JWT tokens (defaults to "supersecret")

### Notable npm Packages
- `@whiskeysockets/baileys` - WhatsApp Web multi-device API client
- `drizzle-orm` + `drizzle-kit` - Database ORM and migration tooling
- `jsonwebtoken` - JWT token creation and verification
- `qrcode` - Server-side QR code generation for WhatsApp pairing
- `connect-pg-simple` - PostgreSQL session store (available but JWT is primary auth)
- `zod` - Runtime type validation for API inputs
- `drizzle-zod` - Auto-generates Zod schemas from Drizzle table definitions

### Payment Gateway
- **PayPal** (active): REST API v2 integration via `server/paypal.ts`
  - Admin stores Client ID, Client Secret, and mode (sandbox/live) in `adminSettings` DB table
  - Frontend redirects user to PayPal approval URL → PayPal returns to `/paypal/success?token=...` → server captures payment
  - Pages: `/paypal/success` (PayPalSuccessPage) and `/paypal/cancel` (PayPalCancelPage) in `client/src/pages/paypal-return-page.tsx`
  - Admin can update PayPal credentials from the Settings tab in the admin dashboard
- Stripe, JazzCash, and EasyPaisa have been removed

## SEO & Content Pages

### Public Marketing Pages
- `/` - Landing page with full SEO (Organization, Service, SoftwareApplication+aggregateRating, FAQ, WebSite+SearchAction JSON-LD)
- `/pricing` - Public pricing page fetching plans from DB via GET /api/plans, SoftwareApplication+Offer+BreadcrumbList JSON-LD
- `/docs` - Interactive API documentation with TechArticle + BreadcrumbList JSON-LD
- `/blog` - Blog listing page with developer-focused articles
- `/blog/:slug` - Individual blog articles with BlogPosting + BreadcrumbList JSON-LD, ogImage, canonical, wordCount
- `/use-cases` - Use cases landing page
- `/use-cases/:slug` - Use case detail pages with WebPage + BreadcrumbList JSON-LD, ogImage
- `/compare/:slug` - Competitor comparison pages with BreadcrumbList + FAQPage JSON-LD, ogImage
- `/terms`, `/privacy`, `/contact`, `/refund` - Legal and support pages

### SEO Implementation
- `client/src/components/seo.tsx` - Reusable SEO component: title, meta description, OG, Twitter Cards, canonical URLs, hreflang (en + x-default), JSON-LD structured data. No meta keywords (obsolete).
- Server-side `/sitemap.xml` with per-page lastmod dates and `/robots.txt` in `server/routes.ts`
- OG preview images in `client/public/` (og-image.png, og-docs.png, og-blog.png)
- Google Fonts optimized to 2 families (Outfit, Plus Jakarta Sans) with font-display:swap
- Breadcrumb structured data on all content pages (docs, blog, use-cases, compare)
- noindex on authenticated dashboard pages
- Vite code splitting: vendor (react/react-dom/wouter), ui (radix), query (tanstack) chunks