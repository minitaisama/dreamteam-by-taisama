# Dream Team v2 Examples

Practical examples for the lightweight Dream Team v2 model.

---

## 1. Solo mode

Use when:
- task is small
- scope is clear
- QA is unnecessary

### Example — small docs patch

**User ask**
> Update the README intro to be clearer.

**Coach action**
- handles directly or sends one bounded task to Lebron
- no Curry

**Tiny task card**
```text
Task: Clarify README intro
Goal: make the first paragraph easier to understand
Scope: README intro section only
Non-goals: no structural rewrite of the README
Acceptance: intro is clearer and still accurate
Risk focus: do not change technical meaning
```

**Why Solo**
- tiny scope
- low risk
- no need for independent QA

---

## 2. Build mode (default)

Use when:
- code changes are needed
- risk is moderate
- lightweight QA is useful

### Example — fix a scoped backend bug

**User ask**
> Fix the API error when a user submits an empty title.

### Coach → Lebron
```text
Task: Fix empty-title API error
Goal: reject empty title with clean validation response
Scope: title validation path in create endpoint only
Non-goals: no form redesign, no unrelated validation cleanup
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

### Why Build
- real code change
- moderate blast radius
- QA should verify changed surface only

---

## 3. Release-critical mode

Use when:
- auth/payment/core flow changes
- blast radius is high
- release confidence matters

### Example — auth callback refactor

**User ask**
> Refactor auth callback flow and ship it.

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

### Coach final
- decide `ship` / `ship_with_risk` / `hold`
- summarize strongest evidence + remaining risk only

### Why Release-critical
- auth is core flow
- regression cost is high
- independent QA gate is mandatory

---

## 4. Example — repo review task

### User ask
> Review this repo and tell me what’s weak.

### Lightweight handling
If no code change is needed:
- Coach can do it directly in **Solo**
- or split into bounded review slices if useful

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

## 5. Example — refactor task

### User ask
> Refactor the upload module, keep behavior same.

### Mode
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
- test changed surface
- check one regression path
- ensure no output/API drift

---

## 6. Anti-pattern examples

### Anti-pattern 1 — vague handoff
```text
Please explore the codebase and improve the whole login system.
```

Why bad:
- no scope
- no acceptance
- huge token burn
- invites drift

### Better
```text
Task: Fix login redirect loop
Goal: successful login reaches dashboard consistently
Scope: login redirect logic only
Non-goals: no auth provider changes
Acceptance: login reaches dashboard in local smoke flow
Risk focus: session persistence
```

### Anti-pattern 2 — duplicate analysis
- Coach does full diagnosis
- Lebron re-diagnoses from scratch
- Curry re-diagnoses again

Why bad:
- burns tokens
- slows execution
- creates conflicting narratives

### Better
- Coach freezes problem
- Lebron executes
- Curry validates

---

## 7. Rule of thumb

### Use Solo when
- one person could do it quickly
- low risk
- no independent validation needed

### Use Build when
- code changes matter
- some QA signal is useful
- normal default case

### Use Release-critical when
- blast radius is large
- trust/reliability matters heavily
- ship decision needs explicit gate

---

## 8. One-line reminder

**Default to the lightest mode that still preserves quality.**
