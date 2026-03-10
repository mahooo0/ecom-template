---
phase: 13
slug: shipping
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `vitest run --reporter=verbose` |
| **Full suite command** | `vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `vitest run --reporter=verbose`
- **After every plan wave:** Run `vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | SHIP-01 | integration | `vitest run shipping.service.test.ts -t "zone creation"` | ❌ W0 | ⬜ pending |
| 13-01-02 | 01 | 1 | SHIP-02 | integration | `vitest run shipping.service.test.ts -t "method creation"` | ❌ W0 | ⬜ pending |
| 13-02-01 | 02 | 1 | SHIP-03 | unit | `vitest run shipping.service.test.ts -t "rate calculation"` | ❌ W0 | ⬜ pending |
| 13-02-02 | 02 | 1 | SHIP-06 | unit | `vitest run shipping.service.test.ts -t "free shipping threshold"` | ❌ W0 | ⬜ pending |
| 13-03-01 | 03 | 2 | SHIP-04 | integration | `vitest run order.service.test.ts -t "add tracking"` | ❌ W0 | ⬜ pending |
| 13-04-01 | 04 | 2 | SHIP-05 | manual-only | Manual verification in browser | ❌ Manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/server/src/modules/shipping/shipping.service.test.ts` — stubs for SHIP-01, SHIP-02, SHIP-03, SHIP-06
- [ ] `apps/server/src/modules/order/order.service.test.ts` — stubs for SHIP-04
- [ ] `tests/fixtures/shipping.fixtures.ts` — shared fixtures for zones, methods, addresses
- [ ] `vitest.config.ts` — test framework configuration
- [ ] Framework install: `pnpm add -D vitest @vitest/ui`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Customer views tracking info with carrier URL | SHIP-05 | Requires visual verification of tracking section rendering, external link behavior | 1. Create order with tracking number 2. Navigate to order detail page 3. Verify carrier name, tracking number, and "Track Package" link display 4. Click link to verify it opens correct carrier tracking page |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
