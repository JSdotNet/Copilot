---
name: pr-review-story
description: >
  Verify that a pull request fully delivers what was promised in its linked Fincent story.
  Checks scope coverage (all acceptance criteria implemented), no out-of-scope changes,
  and that the PR description connects back to the story. Use after code review and before
  merging to ensure delivery matches the agreed story.
---

# PR vs Story Review

Verify that a pull request is a complete and faithful implementation of its linked `FIN`
story. This skill answers: **"Does the PR deliver exactly what the story describes — no
less, no more?"**

This is complementary to the domain and architecture PR reviews. Run it independently or
after those.

## When to use

- After the PR has passed the domain and architecture review.
- Before a merge decision, to confirm the story is fully delivered.
- When there is doubt about whether the PR scope matches the agreed story.

## Jira Skill Discovery

Before fetching Jira data, discover available Jira skills:

1. Check installed skills for skills whose name or description mentions "jira".
2. Identify a **retrieval-capable** Jira skill — can fetch a single existing issue.
3. If no retrieval skill is found: ask the user to paste the story content manually.

All Jira field mapping and project conventions are owned by the discovered Jira skill.

## Inputs

- **PR** — the pull request to review (URL, number, or branch name).
- **Story** — the linked `FIN` story key (e.g. `FIN-123`). If not provided, look for a
  Jira key mentioned in the PR title, description, or branch name.

## Workflow

### Step 1 — Load the story

Use the discovered retrieval-capable Jira skill to fetch the story. Load:
- Summary (title)
- Description
- Acceptance criteria (look in description, custom field, or attached document)
- Story type: Feature / Bug / Support
- Epic link
- Story points

### Step 2 — Load the PR

Read the PR diff and description:
- Changed files and their purpose
- PR title and description
- Linked issues / Jira keys in the PR body

### Step 3 — Scope coverage check

For each acceptance criterion in the story, determine whether the PR addresses it:

| # | Acceptance Criterion | Covered? | Evidence (file / line) |
|---|---------------------|----------|------------------------|
| 1 | … | ✅ / ❌ / ⚠️ | … |

**Legend:**
- ✅ — criterion is clearly implemented in the diff
- ⚠️ — partially implemented or cannot be fully verified from code alone
- ❌ — no evidence found in the diff

### Step 4 — Out-of-scope changes check

Identify changes in the PR that are **not** related to the story:

| File / area | Change description | Classification |
|-------------|-------------------|----------------|
| … | … | Unrelated / Tech debt / Intentional extra |

Flag any unrelated changes that should be extracted to a separate PR or story.

### Step 5 — Story-PR alignment check

Verify the connection between story and PR:

| Check | Result | Notes |
|-------|--------|-------|
| PR title or description references story key | ✅/❌ | |
| PR scope matches story type (Feature/Bug/Support) | ✅/❌ | |
| Bug story: reproduction steps addressed | ✅/❌/N/A | |
| Feature story: happy path + edge cases present | ✅/⚠️/❌ | |
| UI story: screenshots or test evidence attached | ✅/⚠️/❌/N/A | |

### Step 6 — Verdict

**✅ Fully delivered** — all acceptance criteria covered, no concerning out-of-scope changes.

**⚠️ Partially delivered** — list uncovered criteria; PR may still merge with open follow-up
stories created for the gaps.

**❌ Not delivered / Scope mismatch** — critical acceptance criteria missing, or the PR
changes something fundamentally different from what the story describes. Do not merge; list
specific gaps.

## Output format

```
## PR vs Story: FIN-xxx — [Story title]

**PR**: #N — [PR title]
**Verdict**: ✅ Fully delivered / ⚠️ Partially delivered / ❌ Not delivered

### Acceptance Criteria Coverage
[table from Step 3]

### Out-of-Scope Changes
[table from Step 4, or "None detected."]

### Alignment Check
[table from Step 5]

### Summary
[2-3 sentences: what the PR delivers, what is missing (if any), recommended action]
```

## Working rules

- Do not re-run the domain or architecture review — focus only on story-to-PR fit.
- If acceptance criteria are not explicitly listed, infer them from the story description
  and mark them as "inferred" in the table.
- A ⚠️ criterion is acceptable if a follow-up story is created or already exists.
- Limit out-of-scope flagging to meaningful changes; ignore trivial formatting or import
  clean-ups unless they are in files entirely unrelated to the story.
