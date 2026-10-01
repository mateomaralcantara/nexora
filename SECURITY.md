# Security baseline

- RLS enabled for tenant tables.
- Server-side admin key only in server routes.
- Authenticated dashboard protected by Next.js Proxy and verified Supabase JWT claims.
- Public lead creation resolves tenant from the published property server-side.
- Media uploads validate MIME type and maximum size.
- Add Turnstile, rate limiting, CSP, Sentry, MFA and backup/PITR before high-volume production.
