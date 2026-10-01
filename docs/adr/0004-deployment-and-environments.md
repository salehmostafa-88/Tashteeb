# ADR 0004: Environments and deployment

Status: Proposed; hosting provider deferred · 1 October 2026

- Phase 0 has no deployment. Local development uses `supabase db start` (Postgres only) or `supabase start` (full stack) with synthetic data.
- CI (GitHub Actions) runs lint, typecheck, unit tests, spec check, build, Playwright and pgTAP with no secrets and SHA-pinned actions.
- Staging and production will be separate Supabase projects and separate app environments with separate keys, redirect lists and storage. Provider, region and plan are chosen before the pilot; a free tier is not assumed to permit commercial production.
- Data residency: no Supabase region is in Egypt. Egyptian personal-data law (Law 151/2020) restricts cross-border transfer; obtain professional advice before storing real client data (pilot gate, not a development blocker).
- Repository is public during the trial (owner decision O09). No real data, private appendix or credentials may be committed; the owner will make it private before commercialisation. Licence choice remains open.
