# DreamTeam 2.0

Một operating model gọn nhẹ cho công việc phần mềm có AI hỗ trợ.

DreamTeam 2.0 được tổ chức quanh 3 vai trò rõ ràng:
- **Coach** (`pm-agent`) — chốt scope, chia task, gate release
- **Lebron** (`code-agent`) — implementation và local execution
- **Curry** (`qa-agent`) — validation độc lập và release confidence

Mục tiêu chính:
- orchestration rõ ràng
- execution nhanh
- QA độc lập khi cần
- token burn thấp

---

## Đây là gì

DreamTeam 2.0 là một runbook nhỏ để chạy công việc phần mềm với AI agents mà không biến mọi task thành process theater.

Nó được tối ưu có chủ đích cho:
- **Codex-first execution**
- **handoff gọn**
- **quality per token**
- **ownership rõ ràng**

3 mode mặc định:
- **Solo**
- **Build**
- **Release-critical**

---

## Vì sao nó tồn tại

Project này xuất phát từ pain rất thực tế:
- forward context quá nhiều
- overlap giữa PM / code / QA
- QA validate target đang trôi
- token burn cao hơn mức chất lượng nhận lại

DreamTeam 2.0 là câu trả lời cho mấy vấn đề đó.

---

## Nguồn cảm hứng

DreamTeam 2.0 được truyền cảm hứng từ 2 hướng open-source mạnh:

### 1. gstack
Repo: <https://github.com/garrytan/gstack>

Điểm đáng học:
- workflow modes rõ ràng
- orchestration rất builder-facing
- nhìn AI work như operating model, không chỉ là prompt

### 2. BettaFish
Repo: <https://github.com/666ghj/BettaFish>

Điểm đáng học:
- product framing rất mạnh cho multi-agent systems
- chia engine rõ ràng
- tư duy output/report có cấu trúc
- packaging và demoability rất tốt

DreamTeam 2.0 không copy trực tiếp repo nào.
Nó lấy ý từ cả hai rồi rút thành một runbook nhẹ hơn và tiết kiệm execution cost hơn.

---

## Vì sao gọi là “DreamTeam 2.0”

Trước đây framing nội bộ là **Dream Team**.

Tên mới **DreamTeam 2.0** để nhấn mạnh đây là bản public refined hơn:
- nhẹ hơn cách vận hành cũ
- hợp Codex hơn
- explicit hơn về token efficiency
- kỷ luật hơn về artifacts và QA gates

Nói ngắn:
- **Dream Team** = concept ban đầu
- **DreamTeam 2.0** = public runbook đã refine

---

## Nguyên tắc cốt lõi

- freeze scope trước khi code
- dùng tiny task card
- handoff giữa agents phải cực ngắn
- validate fixed contract, không validate target đang evolve
- luôn chọn mode nhẹ nhất mà vẫn giữ được chất lượng
- tối ưu **quality per token**

---

## Profile / người truyền cảm hứng

### Garry Tan
Garry Tan là founder/investor nổi tiếng và là người đứng sau **gstack**. Điều đáng học nhất từ repo của ông là workflow abstraction: cách biến AI-assisted work thành các mode vận hành rõ ràng cho builder.

### 666ghj / BaiFu
`666ghj` (BaiFu) là một AI-builder profile rất mạnh, tập trung vào các multi-agent product như **BettaFish** và **MiroFish**. Điều đáng học ở đây là productization: cách package một hệ multi-agent để nó nhìn như product thật, không chỉ là technical demo.

---

## Repo map

- [`dream_team_v2.md`](./dream_team_v2.md) — runbook chính
- [`ARTIFACTS.md`](./ARTIFACTS.md) — định nghĩa artifacts
- [`QA_PLAYBOOK.md`](./QA_PLAYBOOK.md) — luật QA gọn nhẹ
- [`EXAMPLES.md`](./EXAMPLES.md) — ví dụ chuẩn
- [`handoff_contracts.md`](./handoff_contracts.md) — format handoff ngắn

---

## Bản ngôn ngữ

- English: [`README.md`](./README.md)
- Vietnamese: [`README.vi.md`](./README.vi.md)
- Chinese: [`README.zh.md`](./README.zh.md)

---

## Bản tóm tắt một dòng

**DreamTeam 2.0 là một runbook stage-based gọn nhẹ: Coach freeze bài toán, Lebron execute bounded work nhanh, Curry validate bằng evidence khi cần, và mọi handoff đều được giữ thật nhỏ để giảm token burn.**
