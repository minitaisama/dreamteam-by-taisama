# DreamTeam 2.0

A lightweight operating model for AI-assisted software work.

DreamTeam 2.0 is built around 3 clear roles:
- **Coach** (`pm-agent`) — scope, task framing, release gate
- **Lebron** (`code-agent`) — implementation and local execution
- **Curry** (`qa-agent`) — independent validation and release confidence

The core goal is simple:
- keep orchestration clear
- keep execution fast
- keep QA independent when needed
- keep token burn low

---

## What it is

DreamTeam 2.0 is a small runbook for running software work with AI agents without turning every task into process theater.

It is intentionally optimized for:
- **Codex-first execution**
- **lightweight handoffs**
- **quality per token**
- **clear role ownership**

The default modes are:
- **Solo**
- **Build**
- **Release-critical**

---

## Why it exists

This project came from real workflow pain:
- too much context forwarding
- too much overlap between PM / coding / QA
- QA validating a moving target
- too much token burn for the amount of quality gained

DreamTeam 2.0 is the response to that.

---

## Inspirations

DreamTeam 2.0 was inspired by two strong open-source directions:

### 1. gstack
Repo: <https://github.com/garrytan/gstack>

What it contributed:
- explicit workflow modes
- strong builder-facing orchestration ideas
- treating AI work as an operating model, not just prompts

### 2. BettaFish
Repo: <https://github.com/666ghj/BettaFish>

What it contributed:
- strong product framing for multi-agent systems
- clear engine decomposition
- structured report/output thinking
- excellent demoability and packaging

DreamTeam 2.0 does **not** try to copy either repo directly.
It takes ideas from both and adapts them into a lighter, more execution-economic runbook.

---

## Why “DreamTeam 2.0”

The earlier internal framing was **Dream Team**.

The new name **DreamTeam 2.0** signals that this is the refined public version:
- lighter than the original internal operating style
- more Codex-friendly
- more explicit about token efficiency
- more disciplined about artifacts and QA gates

In short:
- **Dream Team** = the original concept
- **DreamTeam 2.0** = the refined public runbook

---

## Core principles

- freeze scope before coding
- use tiny task cards
- keep inter-agent handoffs brutally short
- validate a fixed contract, not an evolving target
- default to the lightest mode that still preserves quality
- optimize for **quality per token**

---

## People / profiles behind the inspirations

### Garry Tan
Garry Tan is a well-known startup founder/investor and the public force behind **gstack**. The key thing to learn from his repo is workflow abstraction: how to turn AI-assisted work into explicit operating modes for builders.

### 666ghj / BaiFu
`666ghj` (BaiFu) is a strong AI-builder profile focused on multi-agent products such as **BettaFish** and **MiroFish**. The key thing to learn there is productization: how to package a multi-agent system so it feels like a real product, not just a technical demo.

---

## Repo map

- [`dream_team_v2.md`](./dream_team_v2.md) — main runbook
- [`ARTIFACTS.md`](./ARTIFACTS.md) — artifact definitions
- [`QA_PLAYBOOK.md`](./QA_PLAYBOOK.md) — lightweight QA rules
- [`EXAMPLES.md`](./EXAMPLES.md) — canonical examples
- [`handoff_contracts.md`](./handoff_contracts.md) — compact handoff formats

---

## Language versions

- English: [`README.md`](./README.md)
- Vietnamese: [`README.vi.md`](./README.vi.md)
- Chinese: [`README.zh.md`](./README.zh.md)

---

## Short version

**DreamTeam 2.0 is a lightweight stage-based runbook where Coach freezes the problem, Lebron executes bounded work fast, Curry validates with evidence when needed, and every handoff stays small to minimize token burn.**
