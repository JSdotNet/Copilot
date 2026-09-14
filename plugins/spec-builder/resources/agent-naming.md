---
name: agent-naming
description: Naming for the assets a plugin ships beside its agent.
---

# Agent Naming

- An agent file is `agents/<role>.agent.md`, and its `name` equals `<role>`.
- A contract the agent reads by path is `resources/<name>.md`, named for what it governs —
  `create-agent`, `spec-conciseness` — never for the host that would have applied it.
- Agent-governance contracts are `resources/agent-<topic>.md`, with a short, specific
  `<topic>`.
- Repository-wide rules are not a plugin's to ship: they live in `.agents/rules/` with one
  wrapper per host. See [create-instruction.md](create-instruction.md).

## Quick Compliance Check

- [ ] Agent `name` matches the filename.
- [ ] Contracts sit flat in `resources/` and match the skill or topic they govern.
- [ ] Every line changes behavior versus the model default, and no meaning appears twice.
