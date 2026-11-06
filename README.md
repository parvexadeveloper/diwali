# 🪔 Diwali Spin & Win

Mobile-first Diwali promotional game built with **Next.js App Router + TypeScript + Tailwind CSS + PostgreSQL via Drizzle ORM** (the stack pre-configured in this template; schema in `src/db/schema.ts` is the Drizzle equivalent of the requested Prisma models — SpinEntry, ShippingAddress, UserAccount — with the same fields, unique constraints and relations).

## Flow (exactly as requested)
1. **`/` — Spin page is the initial page.** No IP restriction. Server decides the prize (`POST /api/spin`). One spin per browser/session **and one spin per Instagram profile** (public @username only — never a password).
2. **`/shipping` — Address page** (only for physical prizes). Includes **Email ID**, phone, address, city, state, PIN, country. Validated client + server (`POST /api/shipping`), duplicates prevented.
3. **`/account` — Login / Create Account** with a clean social-login-inspired design under Diwali Spin & Win's own branding. Email + password are saved to the database with **bcrypt hashing (never plain text)**; Instagram handle is unique (one play per profile).
4. **`/success` — Share & Confirm.** Personal link contains the current user's ID: `https://your-domain/?ref=<USER_ID>`. Big WhatsApp share button, Copy/Telegram/SMS, live progress **Friends played: 0/2** (auto-refresh), then **Confirm My Order** → alert: *"Your order is confirmed once your two friends played this game we will deliver the product. Thanks for participating! 🪔 Happy Diwali!"* Order status becomes READY_TO_DELIVER when 2 friends have actually played via the link.
## Prizes (central config: `src/lib/prizes.ts`)
1 Gram Gold · 1 Gram Silver · Diwali Gift Box · iPhone 17 · Android Mobile Phone worth ₹20K — each with a configurable server-side `weight`. The browser never chooses the prize.

## Pages & APIs
Pages: `/` (=spin) · `/spin` (redirects to `/`) · `/shipping` · `/account` · `/success`
APIs: `POST /api/spin` · `GET /api/spin` · `POST|GET /api/shipping` · `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/me` · `POST /api/share` (share/confirm) · `GET /api/stats` · `GET /api/health`

## Security
Server-side prize selection & validation • bcrypt password hashing • HTTP-only HMAC-signed session cookie • in-memory rate limiting on spin/auth/shipping • parameterized queries via Drizzle (no SQL injection) • unique constraints preventing duplicate spins/addresses/accounts • no secrets in client code.

## Run locally
```bash
npm install
cp .env.example .env   # set DATABASE_URL + AUTH_SECRET
npx drizzle-kit push   # create tables in PostgreSQL
npm run dev            # http://localhost:3000
npm run build && npm run start
```

## Deploy to Vercel
1. Push this repo to GitHub and import it in Vercel.
2. Add a PostgreSQL database (Vercel Postgres / Neon / Supabase) and run `DATABASE_URL=<prod-url> npx drizzle-kit push`.
3. In Vercel → Settings → Environment Variables add `DATABASE_URL` and `AUTH_SECRET` (long random string) for Production (and Preview if needed).
4. Deploy — no filesystem storage is used; everything lives in PostgreSQL.

> Note on the account page: it intentionally uses the promotion's own branding and collects only an email + a password for *this* promotion plus a public Instagram @username for the one-play-per-profile rule. It does not impersonate Instagram and never collects Instagram credentials.
