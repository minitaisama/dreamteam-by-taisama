# QA_PLAYBOOK.md

Lightweight QA playbook for **DreamTeam 2.0**.

Purpose:
- keep QA independent
- keep QA scoped
- preserve release confidence
- avoid over-testing and token waste

---

## 1. Core philosophy

QA in DreamTeam 2.0 is:
- independent
- evidence-first
- scoped to the contract
- escalated only when risk justifies it

Default rule:
- test the changed surface
- test one critical path
- test one regression path only when needed

Do **not** default to broad exploratory QA on every task.

---

## 2. QA role split

### Lebron
Can say:
- implemented
- locally verified

### Curry
Can say:
- PASS
- FAIL
- RISK
- UNVERIFIED
- `ship | ship_with_risk | hold`

### Coach
Makes final delivery / release call.

---

## 3. QA by mode

### 3.1 Solo
Usually no dedicated QA role.
Use only when risk is low and scope is very small.

### 3.2 Build
Default QA shape:
- changed surface only
- one critical-path check
- one regression watch if needed

### 3.3 Release-critical
Required QA shape:
- changed surface
- one critical path
- one regression path
- explicit release recommendation

---

## 4. PASS / FAIL / RISK / UNVERIFIED

### PASS
Use when:
- scoped checks passed
- no meaningful remaining risk is known

### FAIL
Use when:
- an acceptance condition is broken
- a blocking regression is found

### RISK
Use when:
- primary behavior works
- but meaningful risk still remains
- release may still proceed with eyes open

### UNVERIFIED
Use when:
- required checks could not be completed
- environment or evidence is incomplete

---

## 5. Recommended QA output

```text
Tested: <scope>
Result: <PASS|FAIL|RISK|UNVERIFIED>
Remaining risk: <short note or null>
Recommendation: ship | ship_with_risk | hold
```

Keep it compact.
No QA essay unless the risk is genuinely complex.

---

## 6. Mandatory contract rule

Curry should validate a **fixed contract**, not a moving target.

Before QA starts, Coach should have frozen at least:
- target behavior
- one acceptance check
- one risk focus

If the target is still drifting, QA should say so explicitly.

---

## 7. Escalation triggers

Escalate QA only when one of these is true:
- auth flow changed
- payment flow changed
- core user funnel changed
- backend/UI contract changed
- data mutation risk exists
- concurrency or trust boundary changed
- area has prior regression history

Otherwise keep QA lean.

---

## 8. Backend / UI contract rule

For backend/UI contract changes, require at least:
- **1 pinned API contract test**
- **1 representative UI/render/fixture check**

This is the minimum bar before confident signoff.

---

## 9. Failure classification before recoding

Before telling Lebron to recode, classify the issue:
- code bug
- parser bug
- scorer bug
- data/corpus bug
- infra/env bug

Do not assume every miss is a coding problem.

---

## 10. QA anti-patterns

### Bad
- “test everything carefully”
- validating an evolving target
- repeating full implementation analysis
- broad regression pass for a tiny local change

### Better
- changed-surface QA
- one critical path
- one regression watch when justified
- strongest evidence only

---

## 11. Release recommendation meanings

### `ship`
Checks passed and remaining risk is negligible.

### `ship_with_risk`
Primary path is acceptable, but known risk remains and should be stated clearly.

### `hold`
Risk or failure is significant enough that release should pause.

---

## 12. Doctrine

**QA should maximize confidence per token, not ceremony per task.**
