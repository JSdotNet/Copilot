# Fincent Definition of Ready (DOR)

A story may only be included in a sprint when **all** applicable criteria below are met.
This applies to all story types: features, bugs, and support requests.

## Story Description

- The story describes functionality that can be tested independently.
- The story is written from the end-user perspective, preferably in the format:
  *"As a [user], I want [functionality], so that [benefit]."*
- The title is a concise, clear summary of the story — not identical to the description.
- The title does not contain an open question (no `?` or question phrasing such as
  "Should we…", "How to…", "Is it possible to…").
- The title does not mention a specific person by name (stories are team-owned, not
  person-owned).
- The description is in the story field itself, not in the comments.
- The description is not a copy of an email or customer message.
- The description is specific: no vague formulations such as "it might be useful if..." or
  "an idea could be...".

## Scope and Context

- The story is linked to an epic, if it is part of larger functionality.
- The story is linked to a version, so it can be bundled as a release.
- For modifications to an existing situation: screenshots and/or links of the current state
  are attached.

## Refinement

- The story is refined: the development team has reviewed and where necessary supplemented
  or adjusted it.
- The story has a team estimate (in story points or hours).
- A story must not exceed **12 hours** or the equivalent in story points. If it is larger,
  it must be split.

## Design

- If the story contains a UI component: design images (screens/mockups) must be included
  directly in the story. This is mandatory — a Figma link does not replace images, even
  when a Figma link is also provided.
  A Figma link is optional and can be added in addition to the images.
- Interactions and animations are worked out in the design (if applicable).

## Bugs

A bug contains a clear description of what is going wrong and what the desired result is.
Preferably a bug also contains a reproduction path. Other helpful context includes:

- Link to the page
- Screenshot(s)
- Required conditions (logged in / logged out, user role, etc.)
- Steps to reproduce the bug
- Device type
- Browser and version
- Operating system and version

## Optional (recommended)

- Happy flow and edge cases (error handling, external API integrations) are described.
- Deviating behavior on mobile is mentioned.
