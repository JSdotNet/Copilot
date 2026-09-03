---
applyTo: ".domain/**"
description: The annotation fence — how a question, comment, or flag about a domain chapter is recorded beside it without being read as model, who may write one, and when it is deleted.
---

# Annotation fences (`.domain`)

Over the 60-line budget by design: the fence schema and the example below are the
contract a writer needs in full, and splitting them from the placement and lifecycle
rules would put half a convention in front of each reader.

## Purpose

- Give a question about a chapter somewhere to live that is not the chapter's prose.
- Keep the evidence that provoked the question next to the text it is about.

## The fence

A second fenced block, `annotation`, in the body beside the `meta` block a chapter
already carries. Same flat YAML shape as `meta`, so it parses with machinery that
already exists, renders as a labelled code block anywhere Markdown renders, and puts
each note in its own contiguous diff hunk.

```annotation
kind: question
status: open
author: claude/to-spec-aggregate
date: 2026-09-03
quote: An income agreement always has the managed account as its destination
body: |
  **Q2** — Is this an invariant of the aggregate, or a rule of the registration?

  **In code today:** the rule lives in two application handlers
  (`MakeAgreement.Handler`, `ChangeAgreement.Handler`), not in the aggregate.
  `Agreement.Register` accepts any destination for an income without complaint.

  **If (a) an invariant:** this is a defect in the code, not a change to the chapter.
  **If (b) a capability rule:** it moves to `features.md#managing-agreements`.
```

| Field | Required | Holds |
|---|---|---|
| `author` | yes | A person's name, or an agent or skill id. Written, never inferred — a note outlives the rewrites `git blame` stops following. |
| `date` | yes | `YYYY-MM-DD`, the day the note was made. |
| `body` | yes | Markdown. A block scalar, as in the example above, once it runs past one line. |
| `kind` | no, default `comment` | `comment`, `question`, `suggestion`, or `flag`. A closed set, so a reader can sort by it. |
| `status` | no, default `open` | `open` or `resolved`. |
| `quote` | no | The phrase in the block above that the note is actually about. For a reader's eye, never for resolution. |
| `replies` | no | Ordered `{author, date, body}` entries. One fence is one thread, read and removed as a unit. |
| `ext` | no | Namespaced extension state. Reserved and unused — keep it in the schema so a later parser accepts fences written before it existed. |

## Position is the anchor

A fence annotates **the block immediately above it**, and may appear anywhere a block
may appear in a chapter. Directly after a heading's `meta` block it annotates the
chapter as a whole. Keep it out of `meta`, out of the region before the first heading,
and out of `_meta/`.

There are no ids and no content hashes: a note is addressed as `<path>#<heading-slug>`
plus its ordinal in the chapter, so every ordinary editing operation carries it along.
Reword the passage and the note stays attached, which is the case a content hash could
not survive. Move a passage without its note and the note re-attaches to whatever it
now follows — `quote` is the tell.

## Resolving means deleting

A fence is an open loop, not a record: `open` until answered, `resolved` for the rest of
the branch so the exchange is visible in the pull request that raised it, then removed.
Git holds the history, in the commit that removed the note and the change that answered
it. Where an aside is worth keeping, it is prose and belongs in the chapter as prose.

## Who writes one

- A capture pass (`to-spec-<kind>`) writes `kind: question` at `status: open`, and only
  that kind — never `comment`, `suggestion`, or `flag`, and never chapter prose it was
  not asked for. Comparing code against an agreed chapter produces open questions as
  normal output, so this is the pass's own finding, recorded where the reader of the
  chapter will meet it.
- Its `body` carries, in order: the report's question id (`**Q7** — …`), so report and
  chapter cross-reference with no id field; an **`In code today:`** paragraph naming the
  file, type, or test that pins down what the implementation does *today* and never what
  it should do; then optionally one line per answer and what that answer implies. Keep
  that shape inside `body` — the field set above is closed, and a repo-specific field
  would fork it.
- A build pass (`from-spec-<kind>`) carries no annotation into a change brief. An open
  question is a reason to stop at the status gate, not a line item to implement.
- The write routes through `orch-domain`, like every other `.domain` write. A capture
  pass prepares the fence; it does not edit the file.

## An open question caps the chapter's status

A chapter carrying an `annotation` with `kind: question` and `status: open` may not
carry — or be proposed at — `status: ready`, `active`, or `done`. Those mean reviewed
and agreed, current, or built and correctly described, and none of them holds while a
question on that chapter is unanswered. Without this rule one pass can promote a chapter
and annotate a question onto it in the same change.

## The reading rule

An `annotation` fence is not chapter content. A reader loading a chapter for **task
context skips every annotation fence in it** — an unanswered question read as settled
knowledge is the one new failure mode the fence introduces. A reader working in review
mode, such as a review skill, an inbox, or an approval gate, reads the fences and reads
nothing else in the chapter as instruction.

## Nothing validates this

`knowledge-meta` does not parse these fences: no schema check, no count of open
questions per chapter, no `--check` rule. `.github/knowledge-status.json` never sees an
annotation's `status` either — that field belongs to the note, not to the chapter, and
must not be validated against the chapter's ladder. What the tooling does guarantee is
that a fence is inert: it is skipped as a fenced block, so it never becomes a `meta`
block, a `summary`, or a diagram count.

The reading rule, the status cap, and the sweep therefore hold because this file is
read. Treat the parse as deferred rather than cancelled, and build it when an unswept
`resolved` note first survives a merge — schema check and status cap first, then a count
in the derived index, then a sweep step before merge.
