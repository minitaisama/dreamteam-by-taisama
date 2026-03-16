# Handoff Contracts

Ultra-short handoff formats for Dream Team v2.

Goal:
- reduce token burn
- reduce drift
- make ownership obvious
- avoid narrative-heavy inter-agent chatter

---

## 1. Core rule

Every handoff should be:
- short
- bounded
- explicit
- role-shaped

Do **not** forward full history by default.

Pass only what the next role needs to act correctly.

---

## 2. Coach → Lebron

Use when delegating execution.

### Contract
```text
Task: <title>
Goal: <one sentence>
Scope: <files / surfaces>
Non-goals: <explicit exclusions>
Acceptance: <main success check>
Risk focus: <main risk>
Stop when: <clear stop condition>
```

### Notes
- keep it compact
- no essay backstory
- if scope is still fuzzy, do not delegate yet

### Example
```text
Task: Fix empty-title validation
Goal: reject empty title cleanly
Scope: create endpoint validation path only
Non-goals: no UI changes
Acceptance: empty title rejected, normal create still works
Risk focus: avoid create-flow regression
Stop when: patch is done and verify commands are reported
```

---

## 3. Lebron → Curry

Use when asking for QA validation.

### Contract
```text
Changed: <files or surfaces>
Commands: <run/test commands used>
Critical path: <what should now work>
Known risk: <main remaining risk or null>
```

### Notes
- do not resend all implementation reasoning
- send only what Curry needs to validate
- prefer exact changed surfaces over vague module names

### Example
```text
Changed: auth callback handler, auth tests
Commands: auth suite ; local callback smoke test
Critical path: successful login lands in dashboard with valid session
Known risk: failed callback retry path
```

---

## 4. Curry → Coach

Use when returning QA result.

### Contract
```text
Tested: <scope>
Result: <PASS|FAIL|RISK|UNVERIFIED>
Remaining risk: <short note or null>
Recommendation: ship | ship_with_risk | hold
```

### Notes
- strongest evidence only
- no long narrative QA essay
- if risk remains, say it plainly

### Example
```text
Tested: auth callback success path + failed callback regression path
Result: RISK
Remaining risk: failed callback retry edge case still inconsistent
Recommendation: ship_with_risk
```

---

## 5. Coach → User

Use for the final synthesized update.

### Contract
```text
State: <DONE|PARTIAL|BLOCKED>
What changed: <short summary>
Evidence: <strongest proof>
Risk / next step: <short note>
```

### Notes
- user should not see orchestration noise
- one compact synthesis beats multiple fragmented reports

---

## 6. Allowed progress updates

Only send progress updates on state change:
- `started`
- `blocked`
- `risk found`
- `finished`

Do not send filler updates.

---

## 7. Escalation rule

If the next role cannot act correctly with the compact contract, escalate minimally:
1. add exact file paths
2. add exact failing command/output
3. add one compact artifact reference
4. only then add broader context

Never jump straight to full transcript forwarding.

---

## 8. Anti-patterns

### Bad Coach → Lebron
```text
Please read the whole repo, think deeply, and improve the architecture however you see fit.
```

Why bad:
- no scope
- no acceptance
- guaranteed drift

### Bad Lebron → Curry
```text
I changed a bunch of files. Please test everything carefully.
```

Why bad:
- no changed surface
- no critical path
- invites broad QA waste

### Bad Curry → Coach
```text
I did various checks and overall it seems mostly okay with some possible concerns.
```

Why bad:
- weak signal
- not actionable
- unclear release posture

---

## 9. Short doctrine

**Short contracts, clear ownership, evidence-first outputs.**
