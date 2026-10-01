# First Claude Code prompt

Use this prompt after placing the handoff files in the repository root.

```text
We are building the Arabic-first small-studio project finance and client-progress SaaS specified in this repository.

Read CLAUDE.md, README.md, docs/00-decisions.md and docs/10-coding-phases.md first. Then read the financial, architecture, data model, API and security contracts before proposing any database schema. Inspect the existing repository and preserve existing code and configuration.

Start Phase 0 only. Give me a brief implementation plan and identify genuine architectural blockers. For nonblocking decisions use the labeled defaults and record them. Do not ask me to restate requirements already in the documents.

Resolve compatible supported dependency versions from current official documentation, pin them and record an ADR. Scaffold the strict TypeScript application, Arabic/English RTL/LTR shell, local database setup, synthetic fixtures and initial test/CI commands. No real client data, paid-service provisioning, production migration, public deployment or GitHub push without my authorization.

Treat the financial fixtures as acceptance examples, not production code. Do not create fake features that appear connected when they are mocked. Do not begin later phases just to produce more code.

Run the Phase 0 checks that are available. At the end provide: changed files, exact setup/run commands, test results, screenshots for the shell if available, decisions recorded, remaining blockers and the next phase recommendation. Update docs/implementation-status.md truthfully. Stop at the Phase 0 gate for review.
```
