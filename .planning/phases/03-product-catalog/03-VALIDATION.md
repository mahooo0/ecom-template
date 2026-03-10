---
phase: 3
slug: product-catalog
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `pnpm vitest run --reporter=verbose` |
| **Full suite command** | `pnpm vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run --reporter=verbose`
- **After every plan wave:** Run `pnpm vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | PROD-01 | unit | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | PROD-02 | unit | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | PROD-03 | unit | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 2 | PROD-04 | integration | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| 03-05-01 | 05 | 3 | PROD-05 | unit | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| 03-06-01 | 06 | 3 | PROD-06 | integration | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| 03-07-01 | 07 | 3 | PROD-07 | unit | `pnpm vitest run` | ❌ W0 | ⬜ pending |
| 03-08-01 | 08 | 4 | PROD-08,PROD-09,PROD-10 | integration | `pnpm vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install vitest and testing dependencies
- [ ] Create vitest.config.ts with workspace aliases
- [ ] Shared test fixtures for product types and mock data

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Image upload drag-and-drop | PROD-03 | Requires browser interaction | Upload image via CldUploadWidget, verify preview and reorder |
| CSV import with large file | PROD-10 | Requires file system interaction | Import 1000-row CSV, verify all rows processed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
