# PWA-Product-Catalog Task Ledger

**Status:** Planning
**Last verified:** 2026-09-11
**Repository baseline:** `main` at `91b91c7`; clean before documentation work; only `.gitattributes` existed. The current working tree contains documentation only and no implementation.

Statuses: `Done`, `Ready`, `In progress`, `Not started`, `Blocked`.

## Completed

| ID | Task | Evidence |
|---|---|---|
| PWA-000 | Initialize repository | `git status` showed `main...origin/main`; `91b91c7` is the initial commit. |
| PWA-001 | Record proposed product and UX direction | KB item `c8463d7b-582f-466d-abaa-416be7fe9700`, status `Proposed`. |
| PWA-002 | Inspect repository source of truth before planning | No `package.json`, source, tests, manifest, Service Worker, workflow, or build output was present. |
| PWA-003 | Create aligned documentation baseline | `DESIGN.md`, `SPEC.md`, `EPIC.md`, `ROADMAP.md`, and `TASK.md` were created together and label planned behavior as unimplemented. |
| PWA-004 | Add durable goal, progress, and assignment prompt | `GOAL.md`, `PROGRESS.md`, and `GOAL_PROMPT.md` now define the completion contract, evidence-backed status, blockers, iteration policy, and compact assignment prompt. |

## Ready

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| PWA-010 | Obtain real supplier fixture and quote template | User/business input | Versioned redacted fixture, required fields, pricing rules, and quote acceptance sample. |
| PWA-011 | Confirm MVP product decisions | PWA-010 | Confirmed currency, tax, discount, quantity, image, legal, language, and XLSX decisions. |
| PWA-020 | Scaffold Vite + TypeScript + test harness | PWA-010 | Lockfile, build, type check, unit runner, and browser runner pass. |
| PWA-021 | Establish Pages base path and static routing | PWA-020 | App loads and refreshes under `/PWA-Product-Catalog/` locally and in preview. |

## Not started — data and catalog

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| PWA-030 | Implement versioned Dexie/IndexedDB schema | PWA-020 | Migration tests preserve data and do not use localStorage for catalog/quotes. |
| PWA-031 | Implement CSV/JSON mapping and validation | PWA-030, PWA-010 | Valid, invalid, duplicate, and empty fixtures produce expected results. |
| PWA-032 | Commit imports atomically as catalog versions | PWA-031 | Failure leaves the previous active catalog unchanged. |
| PWA-033 | Implement JSON backup and restore | PWA-030 | Malformed/incompatible backups are rejected without destructive replacement. |
| PWA-040 | Implement search, filters, cards, and product detail | PWA-030 | Mobile and desktop browser checks pass including empty/no-result/long-text states. |

## Not started — quote and output

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| PWA-050 | Implement money, quantity, tax, and discount domain rules | PWA-011 | Unit tests cover rounding, zero, decimal quantity, boundaries, and invalid input. |
| PWA-051 | Implement quote cart and persistence | PWA-030, PWA-050 | Add/edit/remove/reopen flows persist offline. |
| PWA-052 | Implement immutable quote-line snapshots | PWA-051 | Changing catalog price/name does not change saved quote output. |
| PWA-060 | Implement company branding settings | PWA-030, PWA-010 | Settings and bounded local logo assets survive reload and backup/restore. |
| PWA-061 | Implement branded client-side PDF | PWA-052, PWA-060 | PDF inspection proves totals, wrapping, page breaks, branding, and CJK. |
| PWA-062 | Implement share and fallback actions | PWA-061 | Web Share, unsupported, cancellation, and download/copy paths are tested. |

## Not started — PWA runtime and delivery

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| PWA-070 | Add manifest and reviewed icons | PWA-020 | Manifest validation and installability checks pass. |
| PWA-071 | Implement owned versioned Service Worker | PWA-020 | Same-origin GET-only, network-first shell, offline fallback, and cache cleanup tests pass. |
| PWA-072 | Implement waiting-worker Update Now/Later flow | PWA-071 | No automatic skip waiting; explicit activation and controller reload pass. |
| PWA-073 | Verify IndexedDB data survives SW updates | PWA-030, PWA-072 | Catalog, quotes, settings, and assets remain after simulated update. |
| PWA-080 | Add GitHub Actions Pages workflow | PWA-020, PWA-071 | Lockfile build/test gates and intended artifact upload are reviewed. |
| PWA-081 | Verify deployed Pages artifact | PWA-080 | HTTPS shell, manifest, worker, assets, subpath routes, and offline warm-up pass. |

## Blocked

| ID | Blocker | Unblock action |
|---|---|---|
| PWA-010B | No real supplier catalog, pricing rules, logo, or quote sample | Provide a redacted representative dataset and expected quotation. |
| PWA-011B | Business rules and legal wording are unspecified | Confirm tax, discounts, currency, quantity precision, validity, and terms. |
| PWA-081B | No implementation or deployed URL exists to verify | Complete PWA-020 through PWA-080, then run deployment verification. |

## Next action

The highest-value next task is **PWA-010**: obtain a real supplier fixture and quote sample. Do not add framework dependencies or claim implementation completion before that input and the acceptance rules are confirmed. Keep `GOAL.md`, `PROGRESS.md`, and this ledger synchronized after every verified implementation slice.

## Documentation maintenance rule

After each implementation slice, update the affected requirement/task status with exact evidence: files, tests, command results, browser/deployment result, remaining limitations, and rollback/recovery notes. Never convert `Proposed` or `Ready` into `Done` from prose alone.
