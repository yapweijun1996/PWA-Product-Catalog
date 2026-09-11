# PWA-Product-Catalog Epics

**Status:** Implementation baseline exists; release verification pending
**Last verified:** 2026-09-11
**Current release:** No release. Commit `d5930eb` contains the implementation and is deployed at https://yapweijun1996.github.io/PWA-Product-Catalog/; business and remaining release proofs are still open.

Statuses use `Done`, `In progress`, `Ready`, `Not started`, and `Blocked`. `Done` means repository evidence exists, not that a requirement is merely described.

## Epic 0 — Product validation and foundation

**Status:** Blocked for release completion; technical implementation can proceed with synthetic fixtures.

Goal: convert the proposed direction into implementable, testable contracts using real supplier inputs.

- Product/UX direction recorded in the project KB: `Done`.
- Repository initialized and clean baseline inspected: `Done`.
- Design, specification, roadmap, task, goal, progress, and compact prompt documents aligned: `Done` for this baseline.
- Obtain real supplier catalog, pricing rules, logo, and quote sample: `Blocked` — user input is missing.
- Confirm exact MVP acceptance sample and legal quote wording: `Blocked` — business decision is missing.

## Epic 1 — Static app foundation

**Status:** Implemented; locally verified.

Goal: create the smallest typed Vite application and GitHub Pages-compatible build.

Deliverables:

- `package.json` and lockfile;
- TypeScript/Vite application entrypoint;
- configured Pages base path;
- CSS tokens and responsive shell;
- i18n foundation for `en` (default), `zh-Hans`, `ms`, `vi`, and `ja`;
- unit and browser test harness.

Exit evidence: clean install/build, type check, unit tests, and a locally served shell under the Pages subpath.

## Epic 2 — Catalog import and local persistence

**Status:** Implemented; locally verified with synthetic fixtures.

Goal: safely import and query a local product catalog.

Deliverables:

- Dexie/IndexedDB schema and migrations;
- CSV/JSON parser and mapping wizard;
- row-level validation and duplicate policy;
- atomic catalog-version commit;
- JSON backup and restore;
- XLSX adapter decision based on real supplier input.

Exit evidence: malformed, duplicate, large, and valid fixtures pass import tests without partial writes; reload and offline reopen preserve the active catalog.

## Epic 3 — Catalog browsing

**Status:** Implemented; locally verified.

Goal: find products quickly on mobile and desktop.

Deliverables:

- search-first catalog;
- category filters and filter sheet;
- product cards and detail view;
- empty, no-result, offline, and long-text states;
- image asset policy.

Exit evidence: browser test finds a known product, opens details, and adds it to a quote at mobile and desktop widths.

## Epic 4 — Quote builder

**Status:** Implemented; locally verified.

Goal: create reliable quote drafts from local products.

Deliverables:

- quote cart and bottom action;
- quantity and pricing rules;
- tax and discount calculation;
- immutable product/price snapshots;
- quote history and draft recovery.

Exit evidence: pricing unit tests and browser tests prove deterministic totals and preservation after catalog price changes.

## Epic 5 — Branded PDF and sharing

**Status:** Implemented; local PDF verification partial.

Goal: produce a customer-ready quote without a server.

Deliverables:

- company settings and logo asset;
- independent PDF template;
- bundled font strategy for the five supported locales;
- multi-page layout;
- Web Share plus download/copy fallback.

Exit evidence: generated PDFs are inspected for totals, wrapping, CJK, page breaks, and branding; failure preserves the draft.

## Epic 6 — PWA runtime

**Status:** Implemented; deployed runtime verification partial.

Goal: make the app installable and truthful offline.

Deliverables:

- manifest and icons;
- owned Service Worker;
- same-origin GET-only, versioned shell caching;
- offline navigation fallback;
- waiting-worker update banner with explicit activation;
- IndexedDB migration/update compatibility.

Exit evidence: deployed browser verification passes first load, offline reload, persistence, waiting update, Update Now/Later, cache cleanup, and no data loss; migration-specific and unsupported-device checks remain open.

## Epic 7 — GitHub Pages delivery

**Status:** Deployed; release verification pending.

Goal: deploy only a verified artifact to the repository Pages site.

Deliverables:

- GitHub Actions workflow;
- lockfile-based install;
- build/test gates;
- Pages artifact upload/deploy;
- deployed shell/manifest/worker/asset verification.

Exit evidence: GitHub Actions run 8 (`34600730823`) passed, and fresh-browser HTTPS checks verified https://yapweijun1996.github.io/PWA-Product-Catalog/.

## Epic 8 — Release readiness

**Status:** Blocked until real-input and final PDF acceptance evidence are complete.

Goal: release a validated local-first MVP.

Exit criteria:

- real supplier workflow validated;
- all MVP requirements mapped to passing evidence;
- no known data-loss or stale-update defect;
- accessibility and responsive checks complete;
- docs updated from code and test results;
- deferred scope and limitations visible to users and maintainers.

## Documentation control

The maintained control set is `DESIGN.md`, `SPEC.md`, `EPIC.md`, `ROADMAP.md`, `TASK.md`, `GOAL.md`, `PROGRESS.md`, and `GOAL_PROMPT.md`. `README.md` is the entrypoint. Implementation and release claims must be updated from code and verification evidence, not from this planning set alone.

## Dependencies and sequencing

```text
Epic 0 -> Epic 1 -> Epic 2 -> Epic 3 -> Epic 4 -> Epic 5
                         \-> Epic 6 -> Epic 7 -> Epic 8
```

Epic 2 is the data boundary for later features. Epic 6 must remain independent of IndexedDB ownership. Epic 7 must not deploy before its verification gates pass.
