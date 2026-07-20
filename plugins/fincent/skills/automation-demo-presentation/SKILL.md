---
name: automation-demo-presentation
description: >
  Automation that generates demo presentations for one or more Fincent sprint reviews in
  one run. For each sprint, it calls the demo-presentation skill via a parallel subagent
  and saves each output as a Markdown file. Ideal for preparing back-to-back sprint review
  sessions or catching up after a sprint gap.
---

# Automation: Demo Presentation (Multi-Sprint)

Fetch Jira data and generate demo presentations for multiple `FIN` sprints in parallel,
then optionally save each presentation as a Markdown artifact.

Use this skill when you need presentations for several sprints at once, for example when
two sprints overlap in the same review session or when a sprint review was missed.

## Input

Provide one or more sprint names or a release name:

- **By sprint names**: `demo-presentation automation for "Sprint 42 - Xanthic", "Sprint 43 - Yellow"`
- **By release**: `demo-presentation automation for release pre-2025.3`

If a release name is given, first resolve the sprints in that release:

```
JQL: project = FIN AND fixVersion = "{release}" AND "Fincent Team" = "Team B"
     → read unique sprint names from the results
```

## Execution plan

1. **Resolve sprint list** — determine the sprint names to generate presentations for.
2. **Fan-out** — launch one `Explore` subagent per sprint using the `demo-presentation` skill.
   Each subagent produces a full slide-by-slide presentation independently.
3. **Collect results** — wait for all subagents, then assemble output.
4. **Produce output** — individual presentations in chronological sprint order.

> **Rule**: subagents only read Jira and generate their presentation. They must not post to Jira.

## Output

### Per-Sprint Presentation

For each sprint, output the full structured Markdown presentation produced by the
`demo-presentation` skill, preceded by a header:

```
## Sprint: {sprint name}
```

Separate each presentation with `---`.

### Session Index

After all presentations, append a brief index:

| Sprint | Epics covered | Stories | Bugs fixed | Release |
|--------|--------------|---------|------------|---------|
| Sprint 42 - Xanthic | N | N | N | pre-2025.3 |
| Sprint 43 - Yellow | … | … | … | … |

## Working rules

- Process up to 4 sprints in parallel; for more, run in batches of 4.
- If a sprint subagent fails, include a row in the index marked `⚠️ fetch failed`
  and continue with the others.
- Use Dutch language for slide content (the Fincent Review template is Dutch).
- Ask the user if they want to save each presentation as a separate `.md` file
  (e.g., `demo-sprint-42-xanthic.md`).

## Tools used

- Discovered query-capable Jira skill — resolve sprints and releases via JQL.
- Parallel subagents via `demo-presentation` skill for individual sprint presentations.
