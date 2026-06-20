# AutoTrade Inventory

AutoTrade Inventory is a professional car inventory platform with:

- A **public showroom** for browsing available vehicles
- A secure **admin dashboard** for inventory and brand/site management
- **Neon Auth**-powered sign-in/sign-up flows
- A **Nitro API layer** backed by **Neon Postgres**

---

## What the app does

### Public Experience
- Browse all vehicle listings
- Search by make/model
- Filter by manufacturer and max price
- View detailed car info in a modal
- One-click WhatsApp inquiry (when configured in settings)

### Admin Experience
- Add, edit, and delete car listings
- Upload car photos (stored as data URLs)
- Manage access approvals for account signup
- Enable/disable public signups
- Manage branding + content (site name, hero text, logo, favicon, footer, WhatsApp number)
- Bootstrap first admin user from the configured bootstrap email

---

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS v4
- **Animation:** Motion (`motion/react`)
- **Icons:** Lucide React
- **Toasts:** react-hot-toast
- **Server:** Nitro (`server/` directory)
- **Database:** Neon Postgres (`@neondatabase/serverless`)
- **Auth:** Neon Auth (`@neondatabase/auth`) via Nitro proxy at `/api/auth/*`

---

## App Structure

- `src/pages/` → page-level UI (`Home`, `Admin`, auth page)
- `src/components/` → reusable UI components (cards, forms, navbar, uploaders, etc.)
- `src/services/` → frontend service layer for API calls
- `server/routes/api/` → Nitro API endpoints
- `server/utils/` → server-side helpers (db client, session, admin checks, settings helpers)

---

## Authentication Model

This app uses **Neon Auth** with a **Nitro catch-all proxy**:

- Client auth requests go to: `/api/auth/*`
- Nitro forwards to `NEON_AUTH_BASE_URL`
- Session is resolved server-side using the auth cookie
- Admin-only actions are protected in API handlers (`401/403` guarded)

---

## Core API Areas

- `GET /api/cars` → list cars
- `POST /api/cars` → create car (admin only)
- `PATCH /api/cars/:id` → update car (admin only)
- `DELETE /api/cars/:id` → delete car (admin only)

- `GET /api/admins/me` → check admin status
- `POST /api/admins/bootstrap` → bootstrap admin for allowed bootstrap email

- `GET /api/account-access` → list allowed signup emails (admin only)
- `POST /api/account-access` → allow an email for signup (admin only)

- `GET /api/admins/signup-settings` → read signup availability (admin only)
- `PATCH /api/admins/signup-settings` → enable/disable signups (admin only)

- `GET /api/settings` → public site settings
- `GET /api/admins/site-settings` → admin site settings
- `PATCH /api/admins/site-settings` → update site settings (admin only)

---

## Environment Variables

Create a local environment file and set:

- `DATABASE_URL` → Neon Postgres connection string
- `NEON_AUTH_BASE_URL` → Neon Auth base URL from Neon Console

### Important security rules

- Keep secrets in local env files only (for example `.env.local`).
- Never put secrets inside `src/` files.
- Never prefix secrets with `VITE_` (anything with `VITE_` is public in the browser).
- Use `server/` code for secret-based logic and API calls.

---

## How to add secrets safely

1. Copy `.env.example` values into your local env file.
2. Fill in real values for `DATABASE_URL` and `NEON_AUTH_BASE_URL`.
3. Keep the file out of version control (already handled by `.gitignore`).
4. If you deploy, add the same keys in your deployment platform's environment settings.

---

## Notes

- `nitro()` is intentionally the last plugin in `vite.config.ts` (required for correct dev routing behavior).
- The default bootstrap admin email is currently:
  - `thomas.lifuti@gmail.com`