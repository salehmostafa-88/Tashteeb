# Security and permission model

## Threat model

Protect confidential client finances, private receipt images, supplier details, site photographs and project status from other studios, unrelated projects, revoked users, public links and compromised sessions. Primary threats are broken object authorization, overbroad database/storage policies, mass assignment, cross-user caching, unsafe uploads, duplicate commands and privileged credentials in browser code. A concealed UI button is not an access control.

## Role matrix

All non-owner staff permissions below require active project assignment. Clients require an active project-specific grant. “Own” means the authenticated author, not an actor ID in the request.

| Action | Owner | Finance | Manager | Engineer | Client |
| --- | --- | --- | --- | --- | --- |
| Manage studio, members, billing | Yes | No | No | No | No |
| Create project and grant access | Yes | No | No | No | No |
| Read full project financial ledger | Yes | Assigned | Assigned | Own entries only | No |
| Create cost draft | Yes | Assigned | Assigned | Assigned | No |
| Edit/submit own draft | Yes | Own | Own | Own | No |
| Approve/reject money | Yes | Assigned, not own | No | No | No |
| Correct approved money | Yes with reason | No | No | No | No |
| Record funding and fee withdrawals | Yes | Assigned | No | No | No |
| Change fee/budget policy | Yes | Draft budget only | Propose only | No | No |
| Submit stage/site update | Yes | No by default | Assigned | Assigned | No |
| Publish progress/photos | Yes | No | Assigned | No | No |
| Read draft/unpublished site media | Yes | No by default | Assigned | Own drafts | No |
| Read approved client dashboard | Yes | Assigned | Assigned | Assigned if studio permits | Granted project |
| Read raw receipts | Yes | Assigned | Assigned | Own entries | No |
| Import/export full project finance | Yes | Assigned export/preview | No | No | No |
| Read full audit | Yes | Financial subset | Progress subset | Own submission events | No |

Owner self-approval is allowed only with an explicit logged reason when the submitter equals reviewer. Finance self-approval is denied by default. If a studio needs different rules, add a narrowly tested permission capability later; do not make every role a configurable superuser in MVP. Organization owner transfer requires a verified active recipient and must not leave zero owners.

## Database controls

Enable RLS and set explicit grants on every exposed table. Revoke default anonymous access and unnecessary authenticated writes. For financial tables, allow scoped SELECT and dedicated command execution, not direct writes. Test all four operations directly using anonymous and authenticated database roles, not just through UI endpoints.

Policies must constrain organization membership, active project assignment, row ownership where needed and client publication state. Composite foreign keys prevent a permitted cost row referencing another tenant's category or file. Functions checking membership must avoid recursive policy loops and read untrusted mutable user metadata only as display data, never roles.

SECURITY DEFINER functions are exceptional trusted code: explicit auth.uid checks, strict authorization for each action, locked search path, schema-qualified identifiers, no generic table name or SQL arguments, revoked PUBLIC execute and targeted authenticated grants. No function may accept a free actor_id or return arbitrary tenant data. Test direct RPC invocation with hostile parameters.

Read views require `security_invoker = true` where applicable, or remain in a private schema with no client grant. The client summary projection has its own policy requiring an active client project grant (or authorized staff preview), not merely organization membership. It contains only preselected safe fields. Removing a grant must immediately block API reads even if the JWT is still valid.

## Session and application controls

Use the provider's supported SSR integration and verify identity server-side. Secure cookies, HTTPS, same-site settings and CSRF protection/Origin checking on cookie-authenticated writes are required. Do not rely on route middleware alone; route handlers, server actions and database commands each check authorization close to data access. Do not expose production secrets through NEXT_PUBLIC variables, client bundles, source maps or logs.

Invitations use random single-use tokens stored hashed, expire by default after seven days and bind to the intended identity/role/project. Redirect destinations are allowlisted to prevent open redirects. Rate-limit login, invitation and upload endpoints; use generic account-existence responses where appropriate. Owner MFA is a launch requirement; recovery and loss-of-device handling must be documented before production.

Apply a tested Content Security Policy, safe rich-text rendering or plain text, output escaping and dependency scanning. Never render descriptions as arbitrary HTML. CSV exports neutralize spreadsheet formula injection for user-entered cells beginning with dangerous formula prefixes, without mutating stored source text.

## File security

Keep receipt and site-photo buckets private. Authorization uses registered file metadata and its parent entity, not only a guessed path prefix. An uploaded object is not client-visible until ready, clean and explicitly attached to a published client-safe update. The same photo used as a private receipt does not automatically inherit publication.

Validate real file signatures, size and image dimensions; reject active HTML/SVG uploads for logo and receipt use in MVP, re-encode accepted raster images, strip EXIF location metadata and scan supported documents before delivery. Accept JPEG/PNG/WebP and reviewed PDF support; HEIC requires a tested safe conversion path or a clear unsupported message, never silent data loss. Restrict image decompression resource use and decompression-bomb risks.

Clients receive protected file endpoints which recheck access on each request; do not expose storage listing or permanent public URLs. Staff downloads may use short-lived signed URLs, default at most 60 seconds, with the documented limitation that an already issued URL can remain usable until expiry. For immediate revocation needs, proxy delivery for staff too. Browser and CDN file cache headers must not create a cross-user cache.

Upload tickets expire and are scoped to a single expected object. Finalization checks ticket owner, current membership and metadata. Orphan pending objects may be cleaned after a disclosed short retention window, proposed 24 hours; never remove submitted or linked evidence under the orphan rule.

## Audit, support and deletion

Audit financial approval, rejection, correction, refund, fee-rule change, imports, budget changes, stage publication, access grants/revocations and exports. Audit is append-only for app roles. No sensitive amounts, descriptions or receipt contents in general telemetry; IDs and error classes usually suffice. Privileged DB administrators remain technically capable of changes, so audit integrity also needs restricted operations access and protected backups.

SaaS support has no default access to tenant project content. A future support session requires time-limited owner consent, explicit scope and an audit trail; do not implement a silent impersonation button. Development and staging use synthetic data unless a separately approved sanitized dataset is provided.

Organization closure starts an owner-authorized export and retention workflow. Do not permanently delete financial records on subscription cancellation. Confirm legal retention obligations with qualified advice before final policy. After permitted deletion, cover database rows, storage objects, caches and the documented backup-expiry lifecycle; do not promise instant erasure from immutable backups.

## Release blockers

Any cross-tenant or cross-project leak; client access to unpublished media; public receipts; exposed service credentials; authorization bypass through direct database/RPC calls; untested financial correction; unresolved critical dependency vulnerability; no tested backup restoration. A working login screen does not satisfy any of these gates.
