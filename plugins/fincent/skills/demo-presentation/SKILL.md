---
name: demo-presentation
description: >
  Generate a structured demo presentation for a Fincent sprint review. Follows the
  Fincent Review PPTX template: title, stories per epic, bugs, per-epic demo slides,
  demo section, next sprint preview, release slide, and roadmap. Output is a Markdown
  artifact that mirrors the slide-by-slide structure and can be used directly or to
  populate the PPTX template.
---

# Demo Presentation

Generate a demo presentation for a Fincent sprint review based on the Fincent Review
PPTX template. The output is a structured Markdown document that mirrors every slide
in the template; it can be presented directly or used to fill in the PPTX.

## Template File

The PowerPoint template is located at:
`plugins/fincent/resources/fincent-review-template.pptx`

When generating the `.pptx` directly (e.g. via `automation-sprint-review`), open this
file as the base presentation with `python-pptx`. The relevant slide layouts are:

- `Logo foto` — cover slide (slide 1).
- `Title and Content 2` — title, demo divider, next, release, and info slides.
- `Onze cultuur` — content slides (tasks, bugs, and per-epic slides).

## Fincent Review PPTX slide structure

The template has 13 slides in the following order:

| # | Slide | Content |
|---|-------|---------|
| 1 | Blank / Opener | Visual only; no text content needed |
| 2 | Title | "Fincent Review \| Sprint [name] \| Team Fincent \| [dates]" |
| 3 | Implementatie wensen & taken | Completed implementation stories/tasks per epic |
| 4 | Bugs | Completed bugs this sprint |
| 5–N | Per-epic demo slides | One slide per epic containing demo items |
| N+1 | Demo divider | "Demo \| Team Fincent \| [date] \| [year] \| Release [release]" |
| N+2 | Next | Highlight of the next sprint |
| N+3 | Release | "Release [release] op [month] \| Acceptatie \| release stories" |
| N+4 | Sprint planning | Roadmap/planning: epics + themes for next sprint |
| N+5 | Informatie vanuit implementaties | Notes from implementations / infra |

Generate one Markdown section per slide, clearly labelled.

## Jira Skill Discovery

Before executing any Jira operation, discover what Jira skills are available:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **query-capable** skill — can search or list issues by sprint/filter.
3. Identify a **retrieval-capable** skill — can fetch a single existing issue.
4. If no query skill is found: ask the user to provide sprint data manually.

All Jira field mapping, project keys, and API conventions are owned by the discovered
Jira skill.

## Data fetching

Use the discovered query-capable Jira skill with the following JQL queries:

**Completed stories this sprint:**
```
project = FIN AND sprint = "{sprint name}" AND status = Done
AND "Fincent Team" = "Team B"
ORDER BY issuetype ASC, epic ASC
```

**Next sprint preview:**
```
sprint in openSprints() AND "Fincent Team" = "Team B"
```

**Release scope:**
```
fixVersion = "{release}" AND project = FIN
```

**Open bugs (not completed):**
```
project = FIN AND issuetype = Bug AND sprint = "{sprint name}" AND status != Done
```

Fields to request: summary, issuetype, status, epic, assignee, story points,
fixVersions, description, labels.

## Presentation generation

### Slide 1 — Opener

> *(Blank slide — no content)*

---

### Slide 2 — Title

```
Fincent Review
Sprint [name]
Team Fincent     [start date] – [end date]
```

---

### Slide 3 — Implementatie wensen & taken

List all completed **feature** and **support** stories this sprint, grouped by epic:

**[Epic name]**
- FIN-xxx — [Summary] *(N pts)*
- FIN-yyy — [Summary] *(N pts)*

**[Epic name]**
- …

---

### Slide 4 — Bugs

List all completed **bug** stories this sprint:

| Key | Summary | Epic | Points |
|-----|---------|------|--------|
| FIN-xxx | … | … | N |

If no bugs were completed, write: *"Geen bugs afgerond deze sprint."*

---

### Slides 5–N — Per-Epic Demo Slides

Generate **one slide per epic** that has completed stories. Each slide header:

```
Sprint [name]    Team Fincent    [dates]
[Epic name]
```

Content: a bullet list of stories completed in this epic, suitable for a live demo walkthrough.
For each story include:
- Jira key
- Summary (short)
- Assignee (if relevant for demo handover)
- Any demo notes from the story description or acceptance criteria

---

### Slide N+1 — Demo Divider

```
Demo
Team Fincent
[sprint end date — day + month]
[year]
Release [release name]
```

---

### Slide N+2 — Next Sprint

Title: **Next**

Brief preview of the next sprint:
- Sprint name
- Key focus areas (top 3 epics or themes)
- Any notable upcoming features

Source: open-sprint stories with high priority or "sprint goal" label.

---

### Slide N+3 — Release

```
Release [release] op [month]
Acceptatie    [acceptance test status]
release stories
```

List the stories in the release that are in scope for acceptance testing:

| Key | Summary | Status | Epic |
|-----|---------|--------|------|
| FIN-xxx | … | In Testing | … |

---

### Slide N+4 — Sprint Planning / Roadmap

```
Team Fincent     Sprint [next name]     [theme/color]
- Voorlopige planning
```

List planned epic themes and estimated story counts for the next sprint:

| Epic / Theme | Stories planned | Points |
|-------------|----------------|--------|
| Zaaksysteem | N | N |
| Mijn Geldzaken | N | N |
| Huisstijl | N | N |
| Koppeling Xxllnc | N | N |
| Technical debt | N | N |

---

### Slide N+5 — Informatie vanuit implementaties

Free-text section for information received from running implementations / production:
- Any known issues reported post-release
- Performance observations
- Infrastructure updates

If no information is available, write: *"Geen bijzonderheden vanuit implementaties."*

---

## Output format

- Produce the full Markdown document with all slide sections in order.
- Each slide section uses a level-2 heading (`## Slide N — Title`).
- After the slides, append a **Presenter Notes** section with talking points per slide.
- Ask the user if they want to save the output as a `.md` file.

## Working rules

- Use Dutch language for story summaries and slide content (the template is Dutch).
- Abbreviate long summaries to ≤80 characters to fit a slide bullet.
- If a piece of data (e.g. release date, next sprint) is unknown, mark it `[TODO]`.
- Do not post anything to Jira.

## Tools used

- Discovered query-capable Jira skill — fetch sprint, release, and next-sprint stories.
- Discovered retrieval-capable Jira skill — fetch story detail for demo notes.
