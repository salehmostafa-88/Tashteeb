# Screen layouts and interaction contract

This is an implementation-level layout specification, not a rendered or user-tested prototype. Build it in Phase 0/4 and obtain visual approval before polishing every secondary screen. Values in examples are synthetic. Refer to `docs/03-ux-design.md` for tokens and behavioural rules.

## Responsive frame

Client page maximum content width 1200px; staff workspace can extend to 1440px. Horizontal page padding: 16px on narrow phones, 24px on tablets, 32px desktop. Breakpoints are content-driven; proposed ranges are below 640px, 640–1023px and at least 1024px. Test 360, 390, 768, 1024 and 1440 CSS pixels. Arabic mirrors reading flow using direction/logical properties, not a separate duplicated layout.

## Client desktop overview

| Vertical band | Components | Size and behaviour |
| --- | --- | --- |
| Header | Firm logo, project name, language, profile | Logo max 160 by 56px, intrinsic aspect preserved |
| Context | Optional project photograph, active-stage chips, progress | Two columns; photograph collapses when missing |
| Main finance | Funding, company paid costs, remaining after fee reserve | Three equal cards; 32–40px primary values |
| Explanation | Direct purchases, fees, total project cost | Secondary inline summaries; definitions expandable |
| Progress | Stage track and overall progress explanation | Full-width; no invented dates/percentages |
| Finance charts | Category costs and monthly costs | Two columns; exact accessible summaries |
| Budget | Approved cost-base budget versus actual | Conditional on approved budget, otherwise clear missing state |
| Site updates | Last three published image cards and captions | Three columns; private update bodies absent |
| Footer | Separate finance/progress freshness and quality notes | Persistent plain-language definitions |

The main remainder card says `المتبقي بعد احتساب الأتعاب`, not a generic `الرصيد البنكي`. Tapping its explanation shows funding minus company paid costs minus calculated management fees. Direct purchases are explicitly shown as paid by the client outside studio-held funding.

## Client phone overview

Order is logo/name, stage/current-progress summary, remainder card, two smaller cards for funding/company costs, expandable fee/direct summary, vertical stage timeline, cost charts and photo updates. Use a single content column for charts and photos. Keep an optional bottom navigation to Overview, Timeline and Updates; avoid a horizontal spreadsheet-like strip.

Do not permanently hide category costs below many photos. Show the latest update preview, then allow “View all updates”. Chart tooltips must work by tap, not hover alone. When a label is long, wrap it instead of truncating the only Arabic description.

## Staff desktop costs

Header: project switcher and currency, followed by a compact approved-cost total and pending count. Action row: Add cost, Import, filters and Export according to role. Main table displays the agreed columns with subtle category tint. Selecting a row opens a 440–520px side panel with editable draft fields or a read-only approved record and history. Never permit inline editing of approved amount cells.

The review panel displays payer, amount, fee eligibility/effect, receipt preview, missing-evidence warning, author and prior edits before Approve/Reject. Approval is a deliberate action with a clear summary. Reject opens a mandatory reason field. Owner correction previews old/new values and the net aggregate change before confirmation.

Bulk actions in P0 are limited to assigning draft categories and submitting individually validated drafts; no unchecked “Approve all” that bypasses receipt/payer review. Search matches original Arabic terms and normalized search keys without modifying descriptions.

## Engineer capture screen

First row: assigned project and offline/sync status. Amount gets a large numeric keypad input with currency fixed by project. Payer is a two-choice control with explanatory labels. Category is searchable with a short recent list. Description is one or two lines. Receipt area offers camera and file picker with preview/removal. Date and supplier are under Details. A sticky bottom action saves draft or submits; exact wording changes with connectivity.

After submission show server acknowledgment and “Add another”; retain project/category preference only within user scope. Do not reuse the previous amount or receipt accidentally. The sync badge opens the outbox rather than dismissing errors invisibly.

## Stage editor

Staff edit planned dates and weights in a compact table/list; physical updates use a separate review form. This separation prevents confusing a schedule edit with a claim of completed work. Weight total and missing progress warnings remain visible. Rename stages freely within a draft plan; approving a changed plan creates a new version.

Published client view uses cards with stage name, status label, progress bar when known, planned dates when supplied and last update. Blocked is a label plus icon. A date-based Gantt is secondary and hidden when no usable dates exist; milestone order still works.

## Component inventory

`OrganizationBrand`, `ProjectHeader`, `MoneyCard`, `MoneyDefinition`, `DataQualityNote`, `StageStepper`, `StageCard`, `ProgressBar`, `CategoryCostChart`, `MonthlyCostChart`, `BudgetComparison`, `PublishedUpdateCard`, `CostTable`, `CostEditor`, `ReceiptUploader`, `ReviewDrawer`, `SyncBadge`, `OutboxList`, `EmptyState`, `AccessDenied`, `VersionConflictDialog`.

Each component documents accepted DTO, null state, RTL behaviour, keyboard support and loading/error states. Domain calculations stay outside visual components. MoneyCard receives a minor-unit string plus currency and semantic label, not a pre-rounded number.

## Microcopy examples

| Meaning | Arabic | English |
| --- | --- | --- |
| Device-only save | محفوظ على هذا الجهاز | Saved on this device |
| Waiting for network | في انتظار الاتصال للإرسال | Waiting to send |
| Submitted | تم الإرسال للمراجعة | Submitted for review |
| Approved | معتمد | Approved |
| Unknown progress | نسبة الإنجاز غير مسجلة | Progress not recorded |
| Current stage unknown | المرحلة الحالية غير محددة | Current stage not specified |
| Direct purchase | دفعه العميل مباشرة للمورد | Paid directly by client |
| Calculated fees | الأتعاب المحتسبة | Calculated management fees |
| Remainder | المتبقي بعد احتساب الأتعاب | Remaining after fee reserve |
| Missing receipt | المستند غير مرفق | Receipt not attached |
| Conflict | تم تعديل هذا السجل من مستخدم آخر | This record changed elsewhere |

Have a native Arabic reviewer validate vocabulary with the actual studio. Keep familiar source category terms even when spelling differs; editing a display name must not erase the original imported text.
