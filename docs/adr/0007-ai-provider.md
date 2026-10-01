# ADR 0007: AI providers for capture and insights

Status: Accepted in principle (owner decision O16); implementation in Phase 3/4b · 1 October 2026

## Decision

- AI is optional and bring-your-own-key. Each studio selects Anthropic Claude, Google Gemini or OpenAI, a model, and its own API key, and pays the provider directly.
- Calls are server-side only, from jobs, never from the browser.
- One provider-neutral prompt version and JSON output schema. One adapter per provider using that provider's official SDK and its structured-output feature. The server validates every response against the same schema and parses amounts exactly with the application's own parser.
- Keys are stored encrypted, write-only from the interface (last four characters displayed), decrypted only inside the extraction/insight job, never logged, never in `NEXT_PUBLIC_*`, absent from CI.
- Default model suggestion for Anthropic: `claude-opus-5-5`. Model suggestions for Gemini and OpenAI are verified against each provider's current documentation when the adapter is implemented; the owner can type any model ID the provider accepts.
- A recorded fake adapter exists only for automated tests.

## Consequences

No AI cost for the platform operator, but accuracy and behaviour vary by provider and model; the accuracy spike measures each provider on the same private sample set and the settings screen reports which models were measured. Each studio must accept a consent notice before images leave the platform. Supporting three SDKs increases maintenance; adapters stay thin and share one validation path.
