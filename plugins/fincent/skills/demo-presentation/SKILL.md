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

This skill owns the presentation logic: turning sprint-review information into slide
content, ordering that content into the Fincent review structure, and preparing material
that can be written into the PPTX template.

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

## Preferred input source

Use existing report artifacts only.

When this skill is invoked by `automation-sprint-review`, the caller should pass:

- one or more generated sprint reports
- the generated release report
- the resolved sprint names
- the resolved release name
- the team

Use those report artifacts as the **primary source** for slide content.

If the required report artifacts are missing, stop and ask the caller or user to provide
them. Do not access Jira from this skill.

## Data sources

### Primary source: sprint and release reports

When sprint and release report artifacts are provided, extract slide content from them:

- completed stories and bugs from the sprint report(s)
- epic grouping from the sprint report(s)
- release acceptance and in-scope release items from the release report
- cross-sprint themes, labels, and carry-over context when useful for presenter notes

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
- Any delivery context already captured in the sprint report narrative

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
- When called from `automation-sprint-review`, return the slide content directly so the
  orchestration skill can save it and build the `.pptx`.
- When run standalone, ask the user if they want to save the output as a `.md` file.

## Working rules

- Use Dutch language for story summaries and slide content (the template is Dutch).
- Abbreviate long summaries to ≤80 characters to fit a slide bullet.
- If a piece of data (e.g. release date, next sprint) is unknown, mark it `[TODO]`.
- Do not access or post anything to Jira.

## Tools used

- Provided sprint and release report artifacts — primary source for slide content.
