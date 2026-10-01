# ADR 0007: AI provider for capture and insights

Status: Proposed; requires owner approval of a paid provider (O13, O15) · 1 October 2026

## Decision (proposed)

- Provider: Anthropic Claude API via the official `@anthropic-ai/sdk` TypeScript SDK, called only from server-side jobs, never from the browser.
- Model: `claude-opus-5-5` (current default) for both receipt extraction and insight writing. Effort and model are configuration, so cost can be tuned after measurement without code changes; any change is the owner's decision.
- Output: structured outputs (`output_config.format` with a JSON schema) so responses are machine-validated; amounts come back as text and are parsed exactly by the application.
- Images: base64 from private storage after EXIF stripping. No public URLs are given to the provider.
- Credentials: `ANTHROPIC_API_KEY` as a server-only secret, never `NEXT_PUBLIC_`, absent from CI.
- Interface: `Extractor` and `InsightWriter` interfaces with the Anthropic implementation and a recorded fake for tests.
- Bulk: historical receipt imports may use the Batches API; interactive capture uses the standard API with retries and a timeout.

## Why

Vision plus strict structured output in one call, good Arabic handling, and an SDK in the project's language. A dedicated OCR engine plus a separate language model would add a second vendor and a second failure surface; the spike measures whether the single-model approach meets the accuracy bar on handwritten Arabic.

## Consequences

Usage-based cost per studio, metered in `ai_usage` and limited by plan quota. Receipt images leave the platform for the provider, so per-studio consent and the data-transfer review in ADR 0004 apply. If the spike fails the accuracy bar, revisit with the measured failure types before building the UI.
