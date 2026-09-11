# PWA-Product-Catalog

A planned mobile-first, offline-first B2B product catalog and quotation PWA for supplier sales representatives.

## Current status

**Planning only.** The current repository baseline has no application source, package manifest, tests, PWA assets, Service Worker, or GitHub Pages workflow. The design and requirements are intentionally labelled proposed until implementation and verification evidence exists.

## Documentation

- [DESIGN.md](DESIGN.md) — product UX, architecture boundaries, PWA/offline decisions, and design rationale.
- [SPEC.md](SPEC.md) — functional, data, non-functional, and acceptance requirements.
- [EPIC.md](EPIC.md) — epics, dependencies, and exit evidence.
- [ROADMAP.md](ROADMAP.md) — evidence-gated implementation phases.
- [TASK.md](TASK.md) — current task ledger, blockers, and next action.
- [GOAL.md](GOAL.md) — durable completion contract and iteration rules.
- [PROGRESS.md](PROGRESS.md) — evidence-backed progress and current blockers.
- [GOAL_PROMPT.md](GOAL_PROMPT.md) — compact assignable goal prompt (under 2,000 characters).

## Intended MVP flow

```text
Import catalog -> search products -> build quote -> export PDF -> share/download -> reopen offline
```

The MVP is local-only. Cloud sync, collaboration, payments, live stock, ERP integration, and AI are deferred until a real supplier validates the local workflow.
