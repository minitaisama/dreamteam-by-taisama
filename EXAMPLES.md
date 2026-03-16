# EXAMPLES.md

Canonical examples for **DreamTeam 2.0**.

Purpose:
- show how the runbook is supposed to be used
- reduce interpretation drift
- make the model easier to adopt

---

## 1. Solo example

### User ask
> Update the README intro to be clearer.

### Recommended mode
**Solo**

### Why
- small scope
- low risk
- no independent QA needed

### Tiny task card
```text
Task: Clarify README intro
Goal: make the first paragraph easier to understand
Scope: README intro only
Non-goals: no major rewrite
Acceptance: intro is clearer and still accurate
Risk focus: do not change technical meaning
```

### Expected handling
- Coach handles directly or sends one bounded pass to Lebron
- no Curry by default

---

## 2. Build example

### User ask
> Fix the API error when a user submits an empty title.

### Recommended mode
**Build**

### Why
- code change required
- moderate risk
- light QA is useful

### Coach → Lebron
```text
Task: Fix empty-title API error
Goal: reject empty title with clean validation response
Scope: title validation path in create endpoint only
Non-goals: no UI redesign, no unrelated validation cleanup
Acceptance: empty title returns expected validation response and normal titles still work
Risk focus: avoid breaking existing create flow
Stop when: patch is done, verify commands run, result is reported
```

### Lebron → Curry
```text
Changed: api/create route, validation helper
Commands: npm test -- create-title-validation ; curl local create endpoint cases
Critical path: empty title rejected cleanly, normal create still works
Known risk: whitespace-only title path should be checked
```

### Curry → Coach
```text
Tested: create endpoint title validation
Result: PASS
Remaining risk: null
Recommendation: ship
```

### Expected user-facing synthesis
```text
State: DONE
What changed: empty-title validation now returns a clean error response
Evidence: targeted tests passed and normal create path still works
Risk / next step: whitespace-only titles are covered in the check
```

---

## 3. Release-critical example

### User ask
> Refactor auth callback flow and ship it.

### Recommended mode
**Release-critical**

### Why
- auth is a core flow
- regression cost is high
- explicit release posture is required

### Coach → Lebron
```text
Task: Refactor auth callback flow
Goal: simplify callback handling without changing successful login behavior
Scope: auth callback handler, session write path, related tests
Non-goals: no UI redesign, no provider expansion
Acceptance: successful login still works, failed callback handled cleanly, tests pass
Risk focus: session creation and redirect behavior
Stop when: code is patched, verify commands pass, result is reported
```

### Lebron → Curry
```text
Changed: auth callback handler, session write logic, auth tests
Commands: auth test suite ; local callback smoke test
Critical path: successful login lands in app with valid session
Known risk: failed callback redirect and retry path
```

### Curry → Coach
```text
Tested: auth callback success path + failed callback regression path
Result: RISK
Remaining risk: failed callback retry path inconsistent under one edge case
Recommendation: ship_with_risk
```

### Coach final synthesis
```text
State: PARTIAL
What changed: auth callback refactor is in place and main success path works
Evidence: auth suite passed and callback smoke flow succeeded
Risk / next step: one retry edge case remains; release posture is ship_with_risk
```

---

## 4. Review-only example

### User ask
> Review this repo and tell me what’s weak.

### Recommended mode
Usually **Solo**.

### Why
- no code change required
- the task is analysis, not implementation

### Tiny task card
```text
Task: Review repo architecture and process quality
Goal: identify strongest weaknesses and next fixes
Scope: repo structure, docs, CI, release discipline
Non-goals: no code patching
Acceptance: concise prioritized findings with actions
Risk focus: avoid generic review fluff
```

---

## 5. Refactor example

### User ask
> Refactor the upload module, keep behavior the same.

### Recommended mode
Usually **Build**.

### Coach → Lebron
```text
Task: Refactor upload module
Goal: improve internal structure without changing behavior
Scope: upload module + tests only
Non-goals: no API shape changes, no UI changes
Acceptance: tests pass and upload behavior remains the same
Risk focus: hidden behavior drift
Stop when: refactor is done, tests pass, result is reported
```

### Curry focus
- changed surface
- one regression path
- ensure behavior/API did not drift

---

## 6. Anti-patterns

### Anti-pattern A — vague delegation
```text
Please explore the codebase and improve the login system.
```

Why bad:
- no scope
- no acceptance
- invites drift
- burns tokens

### Better
```text
Task: Fix login redirect loop
Goal: successful login reaches dashboard consistently
Scope: login redirect logic only
Non-goals: no auth provider changes
Acceptance: login reaches dashboard in local smoke flow
Risk focus: session persistence
```

### Anti-pattern B — duplicate analysis
- Coach diagnoses deeply
- Lebron re-diagnoses from scratch
- Curry re-diagnoses again

Why bad:
- repeated analysis
- token waste
- slow execution

### Better
- Coach freezes problem
- Lebron executes
- Curry validates

---

## 7. Rule of thumb

### Use Solo when
- one bounded pass is enough
- risk is low
- no independent QA is needed

### Use Build when
- code changes matter
- moderate QA signal is useful
- this is the normal default

### Use Release-critical when
- blast radius is high
- trust/reliability matters heavily
- explicit ship/hold posture is needed

---

## 8. Doctrine

**Default to the lightest mode that still preserves quality.**
