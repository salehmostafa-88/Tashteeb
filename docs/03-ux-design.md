# User experience and visual design

## Design direction

The client portal should feel like a considered architectural project presentation: generous whitespace, large calm typography, project photography, a restrained accent and a small number of purposeful graphics. Staff screens should feel familiar to spreadsheet users: consistent columns, predictable filters and short forms. Avoid decorative gauges, 3D charts, forced animation and dense widgets.

The pilot firm's website identifies the MH+A brand and exposes a periwinkle theme color. Use it as a pilot reference, not the identity of the entire SaaS. Proposed palette below is a design recommendation, not an extracted brand guideline. A firm uploads its own authorized logo; the product must not hardcode or hotlink the pilot firm's website logo into other organizations.

## Design tokens

| Token | Proposed value | Use |
| --- | --- | --- |
| canvas | #F6F7FA | Application background |
| surface | #FFFFFF | Cards, forms and drawers |
| text | #17202E | Primary text |
| muted text | #526074 | Secondary text, test contrast |
| border | #DCE1EA | Dividers and input boundaries |
| primary | #4B5FA8 | Accessible darker brand accent |
| accent soft | #EEF0FB | Selected rows and soft surfaces |
| success | #17654A | Approved and completed |
| warning | #805600 | Pending, delayed and low funds |
| danger | #AD2938 | Rejected, overdue or shortfall |
| radius | 12px card, 8px input | Consistent softness |
| spacing | 4, 8, 12, 16, 24, 32, 48px | Shared spacing scale |
| fonts | Noto Sans Arabic and an appropriate Latin sans | Self-host approved font assets |

Accent changes must pass automated contrast checks; a brand accent can be used decoratively when it cannot carry readable text. Body text minimum 16px on phone; targets minimum 44 by 44 CSS pixels. Use visible labels, not placeholder-only forms. No color-only meanings. Respect reduced-motion preferences; animations communicate state changes and last at most roughly 200ms.

## Navigation and routes

| Surface | Routes | Navigation |
| --- | --- | --- |
| Public | `/[locale]`, `/[locale]/login`, `/[locale]/invite` | Simple product/auth pages |
| Staff | `/[locale]/app/[orgId]/projects` | Desktop sidebar, phone compact nav |
| Project | `.../projects/[projectId]/overview`, `/costs`, `/funding`, `/planning`, `/progress`, `/files`, `/audit`, `/settings` | Project switcher and section tabs |
| Engineer | `.../capture`, `.../outbox` | Home, Add, Updates, Sync |
| Review | `/[locale]/app/[orgId]/review` | Pending counts and exception filters |
| Client | `/[locale]/portal/[projectId]` | Overview, Timeline, Updates |
| Organization | `.../settings`, `/members`, `/billing` | Owner-only controls |

Route organization IDs are selectors, not authorization. A client cannot turn an ID into access to the staff app. A user with several legitimate roles chooses a surface explicitly; staff “Preview client view” uses the same client DTO and does not impersonate a client session.

## Client overview

Above the fold: firm logo, project display name, last published update, active stage label and a clear overall-progress value only when computable. A hero image is optional and must be a published project image, not a mandatory stock photograph. If absent, use a clean text header, not a broken image.

Use three principal money cards: funding received by studio, approved company-paid costs, and remaining after management-fee reserve. A secondary expandable summary shows direct client purchases, calculated fees and recorded project cost. The exact values are available on the cards; visual simplicity does not mean concealing the numbers or their definitions. Display a clear currency suffix and formatted thousands separators.

Below the cards: an editable-stage progress track, category cost bars, monthly approved spending and latest approved site photographs. A budget-versus-cost bar appears only with an approved budget. Unknown values occupy the same layout with “Not recorded” and a concise explanation; they do not disappear and leave the client guessing.

No default transaction table, supplier list or raw receipt gallery. Chart tapping opens a category explanation and exact aggregated value, not an unauthorized ledger. An accessible text summary exposes the same safe aggregates for screen readers.

If the remaining balance is negative, show a shortfall label and absolute amount with its formula. If dates or documentation are incomplete, show a restrained quality note. No celebratory completion animation or “on track” label without supporting dates and published status.

## Stage timeline

There is no universal fixed number of stages for all architecture and fit-out projects. Default template: Stage 1 through Stage 6, all editable, with `status = unknown`, percentage null, dates null and weights null. Do not preload all stages as “not started” on a migrated active project.

An optional owner-review template can suggest Brief and survey, Design and approvals, Procurement and preparation, First-fix services, Finishes and installation, and Snagging and handover. These are suggestions, not a sequencing standard; projects may overlap stages or omit design work.

Each stage has name, order, planned start/end, actual start/end, status, progress basis points, weight basis points, owner, latest published note and evidence. Status values: unknown, not_started, in_progress, blocked, completed, skipped. Blocked stages can retain any valid progress; blocked does not mean zero. Completed requires 100 percent and actual completion date. Not-started requires 0 percent and no actual start. Unknown allows null progress. In-progress requires a known value from 0 through 9999 and an actual start date. Skipped stages are excluded only through an approved plan revision.

Overall physical progress = sum(stage weight × published stage progress) / 10000, rounded to the nearest progress basis point. Compute only when active-stage weights sum to 10000 and every included stage has known published progress. Otherwise show “Overall progress not available”. Do not substitute a simple stage count. A separate “2 of 6 stages complete” label is allowed and must not be presented as 33 percent physical completion.

Multiple current stages appear as up to two chips plus “+N”, opening the full list. If none is in progress or blocked, show “Current stage not specified”, or “All stages complete” only when every included stage is completed. For mobile use vertical milestone cards. Desktop may use a horizontal stepper and a collapsible date-based Gantt; absent dates do not produce invented bar positions. Planned, actual and overdue styles have a legend and text labels. Overdue means planned end is before the project's current local date and stage is not completed or skipped; missing dates mean no overdue claim.

## Staff ledger and phone form

Desktop columns: date, description, category, payer, amount, receipt status, review status, entered by and actions. Default view sorts by recent entry, with clear occurrence dates; allow date/category/status/payer filters. Use sticky headers and a slide-out edit panel. Bulk paste initially creates validated drafts, never bulk-approved entries. CSV import handles larger batches.

Phone entry has one action per screen: select project; enter amount and payer; choose category and short description; attach receipt; save or submit. Keep advanced fields collapsed. Date defaults to the project's current date for new entries, visibly editable. A photo is optional only when a missing-receipt reason is supplied under organization policy. Do not require a supplier record for a small cash purchase. Explain direct-client payer in plain language before submission.

Color coding uses stable category groups: materials pale blue, labor pale green, structure/plaster pale amber, MEP pale teal, metal/glazing pale violet, stone/finishes pale rose, carpentry pale slate, other pale gray. Users can change names without losing colors because colors belong to IDs/groups. Row tint is subtle; status chip and refund marker have stronger independent meaning. Rejected/duplicate warnings must remain visible above category tint. Direct purchases use the same category colors as company costs.

## Arabic behaviour

Set `lang="ar"` and `dir="rtl"` at the document root for Arabic. Use CSS logical properties; avoid manual reversed arrays to simulate RTL. Isolate codes, currency identifiers, URLs and mixed text with `bdi` or appropriate direction attributes. Mirror directional arrows, not logos, photographs, checkmarks or numeric signs.

Accept Arabic-Indic and Western digits. Normalize numeric input only after validating decimal and grouping conventions; display an unambiguous preview before saving. Do not strip punctuation indiscriminately. Store original user descriptions unchanged. Search may use a separate normalized Arabic key, preserving the original for display. English translation of a custom category is optional; never machine-translate a contractual term automatically.

Use localized date display but a Gregorian ISO date internally. Show an explicit format hint in manual entry. Negative currency values and parentheses must remain readable under RTL. Test keyboard navigation, screen-reader labels, date pickers, tables, charts, photo captions, printing and validation messages in both languages.

## Required interface states

Every screen has loading, empty, permission-denied, network failure and retry states. Every mutable form has unsaved changes, submitting, saved, validation failure and version-conflict states. Financial and progress cards state their freshness independently. Loss of connectivity cannot turn a submitted button into an apparently successful approval.

Client account revoked: show an access-ended message with no project metadata. Archived project: read-only banner and retained approved history. Subscription past due: studio sees the entitlement message; clients keep read access during the defined grace/read-only policy. Unknown historical data: show missing information, not a generic red error.
