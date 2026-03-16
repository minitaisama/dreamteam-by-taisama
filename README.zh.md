# DreamTeam 2.0

一个面向 AI 辅助软件工作的轻量级 operating model。

DreamTeam 2.0 围绕 3 个清晰角色展开：
- **Coach** (`pm-agent`) — 定义范围、拆任务、把控发布
- **Lebron** (`code-agent`) — 实现与本地执行
- **Curry** (`qa-agent`) — 独立验证与发布信心判断

核心目标：
- orchestration 清晰
- execution 快
- 需要时 QA 保持独立
- token burn 尽量低

---

## 它是什么

DreamTeam 2.0 是一个小而实用的 runbook，用来组织 AI agents 参与的软件工作，而不是把每个任务都变成复杂流程。

它有意优化以下几点：
- **Codex-first execution**
- **轻量 handoff**
- **quality per token**
- **明确 ownership**

默认 3 种模式：
- **Solo**
- **Build**
- **Release-critical**

---

## 为什么会有它

这个项目来自一些很真实的痛点：
- 上下文转发过多
- PM / coding / QA 之间重叠太多
- QA 在验证一个不断变化的目标
- token burn 远高于获得的质量收益

DreamTeam 2.0 就是对这些问题的回应。

---

## 灵感来源

DreamTeam 2.0 主要受两个开源方向启发：

### 1. gstack
仓库：<https://github.com/garrytan/gstack>

值得学习的点：
- 明确的 workflow modes
- 很强的 builder-oriented orchestration
- 把 AI work 当作 operating model，而不只是 prompt

### 2. BettaFish
仓库：<https://github.com/666ghj/BettaFish>

值得学习的点：
- 很强的 multi-agent product framing
- 清晰的 engine decomposition
- 结构化的 report/output 思维
- 很强的 demoability 和 packaging

DreamTeam 2.0 并不是对这两个仓库的直接复制。
它是吸收二者的优点后，整理出来的一套更轻、更节约执行成本的 runbook。

---

## 为什么叫 “DreamTeam 2.0”

更早的内部叫法是 **Dream Team**。

现在使用 **DreamTeam 2.0**，是为了强调它已经变成更成熟的公开版本：
- 比早期内部方式更轻
- 对 Codex 更友好
- 对 token efficiency 更明确
- 对 artifacts 与 QA gates 更有纪律

简单说：
- **Dream Team** = 最初概念
- **DreamTeam 2.0** = refine 之后的公开 runbook

---

## 核心原则

- coding 前先冻结 scope
- 使用 tiny task card
- agent 之间 handoff 必须非常短
- 验证固定 contract，而不是不断变化的目标
- 默认选择最轻但仍能保证质量的模式
- 优化 **quality per token**

---

## 灵感来源人物简介

### Garry Tan
Garry Tan 是知名创业者 / 投资人，也是 **gstack** 背后的公开推动者。最值得学习的是他的 workflow abstraction：如何把 AI-assisted work 组织成适合 builder 的明确 operating modes。

### 666ghj / BaiFu
`666ghj`（BaiFu）是一个很强的 AI-builder profile，重点在 **BettaFish**、**MiroFish** 这类 multi-agent 产品。最值得学习的是 productization：如何把一个 multi-agent system 包装得像真正的产品，而不只是技术 demo。

---

## Repo map

- [`dream_team_v2.md`](./dream_team_v2.md) — 主 runbook
- [`ARTIFACTS.md`](./ARTIFACTS.md) — artifact 定义
- [`QA_PLAYBOOK.md`](./QA_PLAYBOOK.md) — 轻量 QA 规则
- [`EXAMPLES.md`](./EXAMPLES.md) — 标准示例
- [`handoff_contracts.md`](./handoff_contracts.md) — 简短 handoff 格式

---

## 多语言版本

- English: [`README.md`](./README.md)
- Vietnamese: [`README.vi.md`](./README.vi.md)
- Chinese: [`README.zh.md`](./README.zh.md)

---

## 一句话总结

**DreamTeam 2.0 是一个轻量级、stage-based 的 runbook：Coach 先冻结问题，Lebron 快速执行有边界的工作，Curry 在需要时基于证据做验证，而所有 handoff 都尽量保持很小，以降低 token burn。**
