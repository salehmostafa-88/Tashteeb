# ADR 0003: Authentication, sessions and account sharing

Status: Accepted; implemented in Phase 1 (MFA enforcement pending, see runbooks/owner-mfa-and-recovery.md) · 1 October 2026

- Supabase Auth with email + password (owner decision O08: easiest login now). Local config: minimum 10 characters, letters and digits; TOTP MFA enabled for enrolment (owner MFA is a launch requirement).
- Session integration through `@supabase/ssr` cookies; identity verified server-side on every route handler, server action and database command. `src/proxy.ts` handles locale routing only and never authorizes.
- Invitations: random single-use tokens stored hashed, 7-day expiry, bound to email/role/project. The owner can copy the invite link and send it over a messaging app, so the pilot needs no paid email provider. Supabase's built-in mailer covers password reset at pilot volume only.
- Organization creation is operator-gated during the pilot (clarification 10).
- Shared accounts: per-user audit is a product requirement, so one shared login defeats approvals and self-approval rules. From Phase 1 every command and audit event records a client device identifier (random, per browser profile, not a fingerprint). That enables later concurrent-session limits without schema rework. Pricing hypothesis: low-cost field users so sharing saves nothing.
- Service-role key: never in browser bundles or ordinary request paths. Phase 1 uses none at all.
- Implementation notes (Phase 1): `src/proxy.ts` refreshes the session once per navigation, assigns the `sp_device` cookie and sets a nonce CSP; server components and actions use `createSupabaseServerClient` (user JWT + publishable key) and forward `x-device-id`, which the database stores on audit events. Pages re-check access themselves because Next renders layouts and pages in parallel. Sign-out is local to the device. Pages render per request so redirects and 404s carry real HTTP status codes; an owner-only page shown to a non-owner renders an in-page "Not allowed" message with status 200 because Next's `forbidden()` is still experimental.
