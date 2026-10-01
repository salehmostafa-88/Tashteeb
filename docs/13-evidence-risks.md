# Evidence assumptions and risk register

## Evidence basis

This specification combines the owner's stated needs, the earlier reviewed spreadsheet workflow, prior competitor exploration and current official technical documentation checked on 1 October 2026. It is not a fresh audit of the live spreadsheet or an installed-product comparison. The prior data review is separated into a private appendix outside the repository bundle.

The market position is a hypothesis: Arabic-first project finance and client progress for small interior fit-out studios, with simple phone entry and modest subscription expectations. We have not demonstrated that no competitor solves it, conducted structured customer interviews, established addressable market size or validated pricing. Monograph and broader construction/ERP products informed the discussion but this specification is not a feature-equivalence claim.

## Technical references checked

| Source | Observed capability or caution | Design implication |
| --- | --- | --- |
| [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) | Grants and policies both matter; service role bypasses RLS; views need care | Explicit grants, tenant policies, safe views and direct DB tests |
| [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control) | Private object operations can use RLS; service keys bypass controls | Separate metadata/parent authorization and no public receipt bucket |
| [Supabase database backups](https://supabase.com/docs/guides/platform/backups) | Database backups exclude Storage object bytes | Independent file backup and restore manifest |
| [Next.js PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps) | Manifest and installable web-app pattern; mobile features vary | PWA-first proposal with tested fallbacks, not native-app claim |
| [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication) | Authorization belongs close to the data; handlers/actions need checks | Shared authenticated domain layer and minimal DTOs |
| [MDN Background Synchronization API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API) | Limited browser availability | Foreground/manual sync is required; background sync optional |
| [next-intl translations](https://next-intl.dev/docs/usage/translations) | RTL needs direction, logical CSS and icon handling | Real Arabic layout work, not translated strings alone |
| [Claude Code project memory](https://code.claude.com/docs/en/memory) | Repository CLAUDE.md provides persistent instructions; concise files are preferable | Short root brief and detailed linked phase documents |
| [MH+A website](https://moaazhussam.com/) | Pilot studio branding and architecture/interior focus | Per-studio logo/theme, not a universal SaaS identity |

All architecture choices, exact limits, performance targets, workflow defaults and acceptance criteria are recommendations in this handoff. Source documentation establishes platform capabilities, not that this future implementation is secure or complete. Recheck supported versions and SDK details during Phase 0; do not copy illustrative vendor snippets without production authorization and persistence.

## Risks and mitigation

| Risk | Impact | Mitigation and owner |
| --- | --- | --- |
| Different fee contracts | Wrong balances and disputes | Owner confirms project rule; immutable versions and fixtures |
| Poor historical source data | Attractive but misleading portal | Reviewed import, provenance, unknown states, reconciliation |
| Overbuilding ERP features | Slow launch and unaffordable support | P0/P1 gates; fixed-price/timekeeping models deferred |
| Weak tenant isolation | Confidentiality breach | Database constraints/RLS, API checks, direct hostile tests |
| Offline ambiguity | Duplicate or lost submissions | Durable idempotency, explicit local/server state, retries |
| Arabic only superficially supported | Staff rejection and number-entry mistakes | Native-language QA, bidi tests, original-text preservation |
| Inaccurate site progress | False client expectations | Human-reviewed stage evidence; no spending-based progress |
| Uncontrolled branding | Illegible UI or unauthorized assets | Contrast-safe accents, owner-uploaded raster logo |
| Low subscription economics | Unsustainable product | Measure storage/support, standardize onboarding, validate price |
| Vendor capabilities or prices change | Cost and implementation drift | Lock versions; ADRs; current official-plan review before purchase |
| AI-generated code accepted without review | Hidden financial/security defects | Independent fixtures, database tests and human release gates |
| Public GitHub includes client records | Privacy loss | Synthetic pack; private inputs outside Git; secret/data scans |

## Questions that do not block starting Phase 0

Product name; exact monthly price; final stage labels; firm logo asset; additional report styles. Use neutral placeholders and configurable settings. Questions that do block live money processing include currency, fee basis, refund treatment, approval authority and import reconciliation. Hosting/legal/billing choices block production or paid launch, not local synthetic development.
