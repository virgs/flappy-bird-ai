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
