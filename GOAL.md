# PWA-Product-Catalog Goal

**Status:** Active implementation; release verification blocked
**Last verified:** 2026-09-11
**Owner:** Project maintainer
**Source of truth:** The repository implementation and its verification evidence. Commit `2a7d766` contains the technical MVP baseline and its tests, and is deployed at https://yapweijun1996.github.io/PWA-Product-Catalog/; release validation remains incomplete.

## Current evidence

The technical slice is implemented. Local gates pass install, typecheck, `npm test` (13 tests), `npm run test:e2e` (10 tests), and build; GitHub Actions run 3 (`34594397124`) passed the then-current 7-browser-test suite. The deployed production URL is https://yapweijun1996.github.io/PWA-Product-Catalog/; fresh-browser checks verified HTTPS, the project subpath, manifest, Service Worker, hashed assets, version `0.1.1`, warmed offline reload, and a real `0.1.0` → `0.1.1` Later/Update Now flow with IndexedDB catalog, quote, settings, and logo read-back. Local Lighthouse mobile scores are Accessibility 100, Best Practices 100, SEO 100, and Agentic Browsing 100. The UI supports English (default), Mandarin Simplified Chinese, Malay, Vietnamese, and Japanese; UI glyphs use SVG and the canonical favicon SVG supplies the app icon. This evidence does not replace real-input or final PDF acceptance.

## Outcome

Deliver a validated, installable, mobile-first, offline-first B2B product catalog and quote-builder PWA for supplier sales representatives. A user must be able to import a catalog, find products, build a quote, export a branded PDF, share/download it, and reopen the data offline from a GitHub Pages deployment.

## Required proof

Completion requires:

- real supplier fixture, pricing rules, branding, and quote acceptance sample;
- implemented source, lockfile, migrations, and deployment workflow;
- unit tests for money, validation, duplicate policy, snapshots, and migrations;
- browser tests for first run, import, search, quote, PDF, offline reload, and user-controlled updates;
- PDF inspection for totals, multi-page wrapping, branding, and the five supported locale text paths;
- HTTPS GitHub Pages verification for the shell, manifest, Service Worker, assets, and project subpath;
- final documentation synchronized to the implementation, test evidence, blockers, and deferred scope.

## Constraints

Keep the MVP local-only and GitHub Pages-compatible. Store durable data in IndexedDB, keep quote line snapshots immutable, use explicit import validation and recovery, avoid secrets and remote analytics, and do not present local data as live inventory. Do not add cloud sync, collaboration, payments, ERP, live stock, or AI before separate scope and security decisions.

## Working boundary

Maintain `DESIGN.md`, `SPEC.md`, `EPIC.md`, `ROADMAP.md`, `TASK.md`, `PROGRESS.md`, and this goal set as control documents. Use `GOAL_PROMPT.md` only as a compact assignment prompt; keep detailed procedures and evidence in the maintained Markdown files. Work only in this repository and approved read-only knowledge sources unless explicit authorization expands the boundary.

## Iteration policy

At each iteration, inspect the current code and Git status, select the highest-value unblocked task, implement the smallest coherent slice, run the narrowest relevant checks plus regressions, and update `PROGRESS.md` and `TASK.md` with exact evidence. Never convert a planned item to verified from prose alone.

## Blocked stop condition

If a required product input, permission, runtime, test fixture, or deployment fact is unavailable, continue independent safe documentation or investigation, then stop with evidence gathered, attempted paths, the exact blocker, and the next input needed. Never claim release readiness or 100% completion while required proof is missing.
