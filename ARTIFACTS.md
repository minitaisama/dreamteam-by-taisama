# ARTIFACTS.md

Artifact definitions for **DreamTeam 2.0**.

Purpose:
- make handoffs clearer
- reduce re-explaining
- preserve source of truth
- improve quality per token

---

## 1. Core rule

Artifacts should carry work forward so agents do **not** need to replay long transcripts.

Default rule:
- artifact > transcript
- fixed contract > evolving chat
- structured evidence > narrative recap

---

## 2. Artifact set

DreamTeam 2.0 uses a small default artifact set.

### 2.1 `task_card.md`
Created by **Coach** before delegated work starts.

Purpose:
- freeze scope
- define acceptance
- define risk focus

Recommended fields:
```text
Task:
Goal:
Scope:
Non-goals:
Acceptance:
Risk focus:
Stop when:
```

### 2.2 `build_result.json`
Created by **Lebron** after implementation work.

Purpose:
- show what changed
- show what was verified
- expose remaining issue if any

Suggested schema:
```json
{
  "status": "done|partial|blocked",
  "files_changed": ["path1", "path2"],
  "verify": [
    {"command": "...", "result": "pass|fail"}
  ],
  "commit": "<hash or null>",
  "remaining_issue": "<null or short text>"
}
```

### 2.3 `qa_result.json`
Created by **Curry** when QA is needed.

Purpose:
- show scope tested
- show strongest checks
- show risk and release posture

Suggested schema:
```json
{
  "status": "PASS|FAIL|RISK|UNVERIFIED",
  "scope_tested": ["path or feature"],
  "checks": [
    {"name": "...", "result": "pass|fail|risk|unverified", "evidence": "short note"}
  ],
  "regressions_found": ["..."],
  "release_recommendation": "ship|ship_with_risk|hold",
  "remaining_risk": "<null or short text>"
}
```

### 2.4 `release_note.md`
Created by **Coach** when a release-sensitive decision is made.

Purpose:
- summarize final posture
- preserve strongest evidence
- preserve known risk

Recommended fields:
```text
Decision:
Strongest evidence:
Known risk:
Rollback note:
```

---

## 3. Release state

Every artifact should imply or explicitly carry a release state.

Recommended states:
- `draft`
- `candidate`
- `approved`
- `published`

Use this to avoid confusion between:
- work in progress
- ready for review
- approved output
- final public output

---

## 4. Ownership

### Coach owns
- `task_card.md`
- `release_note.md`

### Lebron owns
- `build_result.json`

### Curry owns
- `qa_result.json`

One artifact should have one clear owner.

---

## 5. Minimal metadata

When useful, include:
- `owner`
- `created_at`
- `source_inputs`
- `release_state`

Keep metadata minimal.
Do not turn artifacts into ceremony.

---

## 6. Artifact policy by mode

### Solo
Usually no formal artifact required beyond a compact result.

### Build
Prefer:
- `task_card.md`
- `build_result.json`
- `qa_result.json` only if QA is needed

### Release-critical
Prefer all of:
- `task_card.md`
- `build_result.json`
- `qa_result.json`
- `release_note.md`

---

## 7. Anti-patterns

### Bad
- “see thread above” as the main handoff
- giant prose recap instead of structured result
- no distinction between candidate and approved output
- multiple agents editing the same artifact without ownership

### Better
- one compact task card
- one build result
- one QA result if needed
- one release note for risky work

---

## 8. Doctrine

**Artifacts should make the next step obvious without forcing the next role to reread the whole story.**
