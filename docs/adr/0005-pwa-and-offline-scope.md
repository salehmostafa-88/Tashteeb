# ADR 0005: PWA and offline scope

Status: Accepted (scope), implementation deferred · 1 October 2026

- The mobile product is a responsive installable PWA, not native apps.
- Delivery order (owner decision O11): the pilot runs with an online phone capture form plus on-device draft autosave; the full IndexedDB outbox, attachment queue and conflict handling (Phase 5) follow the pilot.
- Service worker, when added, caches versioned static assets and an offline shell only, never API responses, authenticated HTML, signed URLs or receipts.
- No offline approval, funding, fee-rule, publication or membership actions. Background Sync is optional; foreground/manual retry is the contract.
