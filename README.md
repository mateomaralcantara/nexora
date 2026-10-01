# NEXORA REALTY OS

AI-native real estate operating system.

## Included

Public portal, property catalog, projects, CRM, leads, scoring, tasks, appointments, offers, transactions, commissions, rentals, maintenance, documents, marketing, analytics, valuation, AI search, media upload, WhatsApp webhook/send, email send, multi-tenant organizations, Supabase Auth and RLS.

## Setup

1. Copy `.env.example` to `.env.local` and fill credentials.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.
5. Health check: `http://localhost:3000/api/health`.

## Required for full integrations

- Supabase project URL, publishable key and service role key.
- OpenAI API key for AI routes.
- Meta WhatsApp credentials for WhatsApp messaging.
- Resend credentials for email.

## Security

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `META_WHATSAPP_TOKEN` or `RESEND_API_KEY` to browser code.
