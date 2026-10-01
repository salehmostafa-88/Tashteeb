# ADR 0006: Localization, direction and digits

Status: Accepted · 1 October 2026

- Locales `ar` (default) and `en`, always prefixed in the URL (`/ar/...`, `/en/...`). Browser-language detection is off: Arabic is the default and the explicit switch changes it (D03). Per-user preference arrives with profiles in Phase 1.
- `<html lang dir>` is set per locale; layouts use CSS logical properties (`ps-`, `me-`, `text-start`, `border-s`).
- Digits (owner decision O06): Arabic renders Arabic-Indic digits. Current ICU data renders plain `ar` with Western digits, so all display formatting goes through `src/lib/i18n/format.ts`, which uses `ar-EG-u-nu-arab` explicitly. English uses `en-GB`.
- ICU message arguments must not format numbers in Arabic (`#`, `{n, number}`); pass preformatted text. A unit test enforces this.
- Mixed-direction content (codes, amounts, Latin names in Arabic UI) is wrapped in `<bdi>`; Latin currency symbols in Arabic are wrapped in a left-to-right isolate so `US$` is not reordered.
- Exports (CSV/JSON) always use Western digits and machine-readable minor units.
- Original user text is stored and displayed unchanged; search normalization will use a separate key.
