# Owner MFA and account recovery plan

Status: plan agreed for Phase 1; enforcement before the pilot (launch gate in `07-security.md`) · 1 October 2026

## Requirement

Studio owners control members, client access and (from Phase 2) financial approvals, so an owner account must use a second factor before real client data is stored.

## What exists now

- Supabase Auth TOTP enrolment and verification are enabled in `supabase/config.toml`.
- Passwords: minimum 10 characters with letters and digits; sign-in errors never reveal whether an email exists; password reset uses a single-use emailed link and always answers the same way.
- Owner-only database commands already re-check the caller's role on every call, so adding an assurance-level check is a single change in `app_private.require_owner`.

## Planned implementation (before the pilot)

1. Security page for every user: enrol an authenticator app (QR code from `auth.mfa.enroll`), verify, list and remove factors.
2. Sign-in step-up: after the password, users with a verified factor are asked for the 6-digit code before any workspace loads.
3. Enforcement: a platform setting `require_owner_mfa` (on in staging and production, off in local seed data). When on, `app_private.require_owner` rejects sessions whose JWT `aal` claim is not `aal2`, and owner pages show the enrolment screen instead of admin content.
4. Tests: pgTAP for owner commands with `aal1` versus `aal2` claims; Playwright for enrolment and step-up.

## Recovery

- Lost password: self-service reset link (exists now).
- Lost authenticator, other owner available: the other owner removes and re-invites the account, or (once implemented) resets its factors; the action is audited.
- Lost authenticator, sole owner: support-assisted recovery only, after identity verification through the studio's registered contact and a waiting period; a platform operator removes the factor with a recorded reason. No silent support access to project content (`07-security.md`).
- Encourage two owners per studio, or one owner plus a saved recovery factor, during onboarding.

## Not yet decided

Support identity-verification procedure and waiting period; whether finance users must also use MFA before approving money (proposed: yes, from Phase 2).
