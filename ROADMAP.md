# PWA-Product-Catalog Roadmap

**Status:** Planning
**Last verified:** 2026-09-11
**Current phase:** Phase 0 — validation and foundation
**Implementation status:** Not started; commit `91b91c7` has no application source, dependencies, tests, PWA assets, or deployment workflow. The current working tree contains documentation only.
**Control documents:** `GOAL.md` (completion contract), `PROGRESS.md` (verified state), and `TASK.md` (executable ledger).

This roadmap is an evidence-gated sequence, not a promise of dates. A phase advances only when its exit evidence exists in the repository or from an explicitly recorded browser/deployment verification.

## Phase 0 — Validate the real workflow

**Status:** Blocked for implementation; documentation baseline complete

Inputs required:

- representative CSV/Excel/JSON files;
- required product fields and duplicate rules;
- price, tax, discount, currency, and quantity rules;
- company logo and contact details;
- current quotation example and legal wording;
- expected catalog size and image policy.

Exit gate: a written acceptance fixture and confirmed MVP scope.

## Phase 1 — Catalog foundation

**Status:** Not started

Build:

- Vite/TypeScript shell;
- Pages base path;
- i18n and design tokens;
- Dexie schema and migrations;
- CSV/JSON import wizard;
- search, category filter, and product detail;
- JSON backup/restore.

Exit gate: valid and invalid fixtures, reload persistence, and offline catalog browsing pass.

## Phase 2 — Quotation workflow

**Status:** Not started

Build:

- quote cart;
- deterministic money and tax/discount rules;
- line-item snapshots;
- quote draft/history persistence;
- recipient and notes fields.

Exit gate: totals and snapshot invariants pass unit, integration, and browser tests.

## Phase 3 — Customer-ready output

**Status:** Not started

Build:

- company branding;
- PDF renderer and bundled fonts;
- multi-page quote layout;
- Web Share and fallback actions;
- optional XLSX importer based on Phase 0 evidence.

Exit gate: inspected PDFs pass totals, wrapping, branding, CJK, and failure-recovery checks.

## Phase 4 — PWA runtime and delivery

**Status:** Not started

Build:

- manifest and icons;
- Service Worker with versioned same-origin GET-only network-first shell policy;
- offline fallback;
- user-controlled update banner;
- GitHub Actions build/test/deploy workflow;
- deployed verification.

Exit gate: the real Pages URL works on HTTPS, installs where supported, reloads offline after warm-up, preserves IndexedDB data, and updates only after user approval.

## Phase 5 — Validation release

**Status:** Blocked

Release only after a real supplier completes:

```text
import -> search -> inspect -> quote -> PDF -> share/download -> offline reopen
```

Exit gate: no critical data-integrity, offline, PDF, accessibility, or update defect; limitations and deferred scope are documented.

## Phase 6 — Optional post-MVP capabilities

**Status:** Deferred

Candidates:

- cloud catalog sync;
- team workspace and permissions;
- quote collaboration and approval;
- live stock and ERP integration;
- AI-assisted import or product descriptions.

These require a backend, authentication, data ownership, conflict resolution, and a separate security/operations design. They must not be smuggled into the static MVP.

## Status interpretation

- `Done` means the stated artifact or evidence exists.
- `Not started` means no implementation evidence exists.
- `Blocked` means a required input, decision, permission, or proof is missing.
- `Proposed` means a decision is recorded but not validated.
- Documentation completion never advances an implementation phase.

## Current blockers and risks

1. No real supplier data or quote template is available.
2. Pricing, tax, currency, and legal requirements are not confirmed.
3. The repository has no implementation baseline to verify against.
4. GitHub Pages URL, build ownership, and CI policy are not yet validated.
5. Client-side PDF font size and large catalog/image performance need real fixtures.
6. Offline is local device scope, not shared-team synchronization.
