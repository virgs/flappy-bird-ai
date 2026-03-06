# Memento — Architectural Decisions & Context

## Package Manager: pnpm

**Decision:** Migrated from npm to pnpm.

**Changes made:**
- Ran `pnpm import` to generate `pnpm-lock.yaml` from `package-lock.json`
- Deleted `package-lock.json`
- Added `"packageManager": "pnpm@10.30.3"` to `package.json`
- Added `pnpm.onlyBuiltDependencies` config for `@parcel/watcher` and `esbuild` (needed for vite)
- Added `package-lock.json` to `.gitignore`

**Why pnpm:** Better performance, strict dependency resolution, disk-space efficiency via content-addressable store.

---

## Dependency Update (2026-03-06)

**Decision:** Updated all dependencies to their latest versions using `pnpm update --latest`.

**Notable major version upgrades:**
- `vite` 6 → 7, `@vitejs/plugin-react` 4 → 5
- `eslint` 9 → 10, `@eslint/js` 9 → 10
- `@fortawesome/*` 6 → 7, `@fortawesome/react-fontawesome` 0.2 → 3.2
- `globals` 16 → 17, `typescript-eslint` 8.32 → 8.56

**Note:** `eslint-plugin-react-hooks@7` has a peer dependency warning against eslint v10 (still lists v9 in its peer range), but this is a minor warning and does not affect build or runtime.

Build verified working after all updates.

---

## Testing Setup (2026-03-06)

**Decision:** Added Vitest as the test framework (natural choice for Vite projects).

**Dependencies added:** `vitest`, `@vitest/coverage-v8`, `jsdom` (all dev).

**Config:** `vitest.config.ts` with `jsdom` environment and v8 coverage provider.

**Scripts added to `package.json`:** `test`, `test:watch`, `coverage`.

**Test files created (7 files, 48 tests):**
- `src/math/array-shufller.test.ts`
- `src/birds/neural-network/ArtificialNeuralNetwork.test.ts`
- `src/birds/neuro-evolutionary/GeneticAlgorithm.test.ts`
- `src/birds/simmulated-annealing/SimulatedAnnealing.test.ts`
- `src/time/sleep.test.ts`
- `src/repository/Repository.test.ts`
- `src/birds/q-learning/QTableHandler.test.ts`

**Key decisions:**
- Phaser mocked via `vi.mock('phaser')` in QTableHandler tests (Phaser requires WebGL/Canvas, not available in Node).
- `GameConstants` mocked in tests that depend on it — it imports asset files with `?url` that are only meaningful in a browser/Vite build context.
- jsdom 28 changed localStorage to file-backed storage; tests use `vi.stubGlobal('localStorage', ...)` with an in-memory Map implementation instead.

---

## CI/CD — CircleCI (2026-03-06)

**Decision:** Added CircleCI pipeline with five jobs: lint → test → coverage → build → deploy.

**Files created:**
- `.circleci/config.yml` — pipeline definition
- `eslint.config.js` — ESLint flat config (eslint 10 + typescript-eslint + react-hooks + react-refresh)

**Scripts added:** `lint` (`eslint src`)

**Pipeline jobs:**
| Job | Command | Trigger |
|---|---|---|
| lint | `pnpm lint` | every push |
| test | `pnpm test` | every push |
| coverage | `pnpm coverage` | every push |
| build | `pnpm build` | every push |
| deploy | git push to main | main branch only, after lint+test+build pass |

**Deployment strategy:** Builds output to `docs/` (existing GitHub Pages convention), commits, and pushes to `main` with `[skip ci]` to avoid triggering a loop.

**Required secrets (CircleCI):**
- Context name: `github-pages`
- `GITHUB_TOKEN` — GitHub Personal Access Token with `repo` (write) scope. Set this in CircleCI → Organization Settings → Contexts → `github-pages`.

**Code fixes made to pass lint:**
- `src/math/array-shufller.ts` — `var` → `let`
- `src/game/actors/BirdActor.ts` — `&&` short-circuit → `if` block
- `src/navbar/NavbarComponent.tsx` — `&&` short-circuit → `if` block
- `src/repository/Repository.ts` — removed empty `else {}` block

---

## Navbar — Coffee Button (2026-03-06)

**Decision:** Added "Buy Me a Coffee" button permanently to the far-right of the navbar.

**Implementation:**
- Icon: `faMugHot` from `@fortawesome/free-solid-svg-icons`
- Variant: `warning` (Bootstrap yellow)
- Text "Coffee" hidden on small screens via `d-none d-lg-inline` (consistent with other buttons)
- Grouped with the Sound toggle in a single `<Nav className="ms-auto d-flex align-items-center gap-2">` so the Coffee button is always at the far right regardless of whether the Sound toggle is shown.

**Testing:**
- Added `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` as dev dependencies.
- Added `setupFiles: ['@testing-library/jest-dom/vitest']` to `vitest.config.ts`.
- Created `src/navbar/NavbarComponent.test.tsx` (5 tests).
- Key: `ResizeObserver` must be stubbed with `vi.stubGlobal` (not in jsdom).
- Key: React-Bootstrap `<Button href="...">` renders as `<a role="button">`, not `role="link"`.
- Key: Must call `cleanup()` explicitly in `afterEach` when `globals` is not enabled in vitest config, or tests accumulate DOM across test cases.

---

## Navbar — Speed Slider Centering (2026-03-06)

**Problem:** `mx-auto` on the speed slider only centers it when a left nav with `me-auto` is present. When `roundSettings` is false (no left nav), auto-margins are distributed unevenly, causing the slider to drift left.

**Fix:** CSS Grid with `grid-template-columns: 1fr auto 1fr` on the Container. The left column is always rendered (empty `<div>` when no round). The center is always truly centered.

**Changes:**
- `NavbarComponent.scss` — added `.navbar-grid` class
- `NavbarComponent.tsx` — applied `navbar-grid` to Container; replaced conditional left `<Nav>` with always-present `<div>`; removed `mx-auto` from speed slider; changed right Nav to `justify-content-end`

---

## CircleCI — corepack pnpm Key Mismatch (2026-03-06)

**Problem:** `corepack prepare pnpm@10.30.3 --activate` fails in `cimg/node:22.11` with "Cannot find matching keyid". The corepack bundled with that image has outdated signing keys and cannot verify the pnpm 10.30.3 package.

**Fix:** Replace `corepack enable && corepack prepare pnpm@10.30.3 --activate` with `npm install -g pnpm@10.30.3`. This bypasses corepack's signature verification entirely.

**File:** `.circleci/config.yml` — `setup` command, "Install pnpm" step.

---

## CircleCI — pnpm Global Install Permission Error (2026-03-06)

**Problem:** `npm install -g pnpm@10.30.3` fails in CircleCI with `EACCES` when trying to rename `/usr/local/lib/node_modules/pnpm`. The `circleci` user cannot modify root-owned global modules.

**Fix:** Install pnpm into a user-owned prefix and persist PATH:
- `echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$BASH_ENV"`
- `npm install --global --prefix "$HOME/.local" pnpm@10.30.3`

This avoids writes to `/usr/local` and keeps pnpm available in subsequent steps/jobs.

**File:** `.circleci/config.yml` — `setup` command, "Install pnpm" step.

---

## Q-Learning Birds — Never Learning Bug (2026-03-06)

**Root cause (final):** Per-frame recording with a 20-frame flap cooldown (`flapCoolDownMs = 200ms`, `fixedFrameIntervalInMs = 10ms`) caused a 19:1 DO_NOT_FLAP bias. `BirdActor.updateSoul()` calls `props.update()` every frame but `props.shouldFlap()` only every 20 frames. Recording moves every frame meant 19 of every 20 recorded moves had `action = DO_NOT_FLAP`, regardless of what the bird actually decided.

**Fix (decision-level recording):**
- Moves are now recorded in `shouldFlap()` (at each decision point, ~every 20 frames), not in `update()` (every frame).
- Death moves are still recorded in `update()` using `previousDecisionState` when a death reward is detected.
- Added `previousDecisionState?: State` field to track the state at the last decision.

**Default settings updated for stable learning:**
- `learningRate.value`: 0.9 → 0.1 (α=0.9 caused Q-values to oscillate)
- `explorationRateDecay.value`: 0.005 → 0.01
- `gridSpatialAbstraction.horizontal.value`: 25 → 10 (reduces state space from ~160k to ~10k)
- `gridSpatialAbstraction.vertical.value`: 20 → 10

**Files:** `src/birds/q-learning/QLearningBird.ts`, `src/birds/q-learning/QLearningDefaultSettings.ts`

**Tests added (2026-03-06):**
- `src/birds/q-learning/QLearningBird.test.ts` (14 tests)
- `src/birds/human/HumanControlledBird.test.ts` (10 tests)
- `src/birds/neural-network/NeuralNetworkBird.test.ts` (7 tests)
