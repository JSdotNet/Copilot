---
name: build-deployment
description: 'Build direction, deployment kind: turn an agreed but unbuilt topology in .arc42/07-deployment-view.md into a change brief plus a change category, then stop. Use when: the deployment view describes a node or environment that does not exist, an agreed resource is not provisioned, configuration is agreed to come from a vault it does not, build the topology we agreed. Emits outcomes, invariants, ubiquitous language, out-of-scope, and acceptance checks; never edits source, infrastructure, or test trees. DO NOT USE FOR: writing a chapter from a deployment that already exists in code (use capture-deployment), or for the building-block, bounded-context, or design-component chapters around it (use the matching build-* skill).'
---

# Build the deployment view in infrastructure

## Purpose

`.arc42/07-deployment-view.md` describes a topology that is agreed and the
repository does not declare — a node, an environment, an infrastructure
dependency, or a configuration source that does not exist, or exists
differently. This skill reads the chapter and produces a **change brief**:
outcomes, invariants, ubiquitous language, out of scope, acceptance checks, plus
one change category.

Then it stops. It does not name a delivery skill, does not choose a cloud
service or an IaC tool, does not apply anything, and does not touch a source,
infrastructure, or test tree.

Deployment briefs carry a risk the others do not: the changes they describe act
on running environments. The brief therefore states what must be true, and never
implies that anything may be applied — provisioning, migrating, and cutting over
are decisions for a person with the authority to make them.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, and the change-brief contract — none of which are repeated here.

## Inputs

- **Target chapter or section.** `.arc42/07-deployment-view.md`, or one `##`
  section, as a `<path>#<heading-slug>` reference.
- **Environments in scope.** Which environments this brief covers. Never assume
  all of them.
- **Repository root.** Default to the current working directory.

The status gate applies to the chapter's `status`. Topology is expensive and
disruptive to change, so confirm before briefing from anything below `active`.

## Chapter status gate

Check `status` before doing anything else, per the protocol's status rules:

- `active` — proceed.
- `draft` or `proposed` — stop and confirm. State what the chapter claims and
  that it is not yet agreed, then ask whether to build it as written or settle
  the chapter through `orch-arc42-content` first.
- `deprecated` — do not build. Report it and stop.

## Spec-to-code mapping

What each part of the view has to become, and where to look to see whether it is
already there:

| Chapter element | What building it requires | Where to check |
|---|---|---|
| Deployment nodes | Each documented node declared, and referenced by a pipeline or AppHost | The existing manifests, IaC, AppHost, and workflows |
| Environments | Each in-scope environment declared with its own parameters | Per-environment parameter files and workflow targets |
| Artifact mapping | Each documented artifact built and placed on its documented node | Build targets and image references |
| Infrastructure dependencies | Each documented dependency declared and reachable from the nodes that need it | Existing resource declarations and connection configuration |
| Configuration sources | Each setting read from the documented source — never from a checked-in literal | The current configuration providers and variable declarations |
| Network and protocol paths | The documented paths reachable, and undocumented ones not exposed | Ingress rules, exposed ports, and service addressing |
| Scaling and availability | Replica, autoscaling, and health-probe settings as documented | The current workload declarations |

State the acceptance checks so they can be verified **from declarations plus a
health check**, not from a manual inspection of a live environment: the resource
is declared and applied by a named pipeline, the setting resolves from the named
source, the documented path answers, the undocumented port is not exposed.

Say explicitly which environments are in scope and which are not. An
environment-unqualified deployment brief is the one most likely to be applied
somewhere it was not meant to be.

Secrets never appear in a brief. Name the vault, the provider, and the setting
name — never a value.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `knowledge-arc42.instructions.md`, and
   `knowledge-chapter-metadata.instructions.md`. Read the target chapter,
   `05-building-block-view.md` for the artifacts, and
   `09-architecture-decisions.md` for the decisions constraining the topology.

2. **Apply the status gate.** Above. Do not proceed past a `draft`, `proposed`,
   or `deprecated` chapter without the stated confirmation.

3. **Resolve the counterpart.** Work the protocol's resolution ladder to
   establish whether the counterpart exists in code at all, and if so in what
   form. Record which rung matched. This determines the change category: no
   counterpart is `new functionality`; a counterpart that works but does less is
   `change to existing behaviour`; a counterpart that is supposed to already
   satisfy an agreed chapter and does not is a `defect`.

4. **Read what already exists.** Establish what is declared today, and which
   declarations a pipeline or AppHost actually references. Distinguish "not
   declared" from "declared but never applied" — they are different work. The
   brief must not ask for work that is already done. Apply the protocol's
   evidence rules: a passing test is evidence the rule holds; a disabled test or
   a TODO promising it is not.

5. **Reach a verdict.** Land on exactly one of the protocol's five verdicts.
   `spec-ahead` is the case this skill exists for. On `aligned`, stop and say
   so. On `code-ahead`, stop and hand the scope to `capture-deployment`; the
   chapter is stale, not unbuilt. On `conflict`, stop and ask — a conflict never
   becomes a `defect` brief on this skill's own authority.

6. **Extract the ubiquitous language.** Use the node, environment, and resource
   names the chapter uses, and the block names from `05-building-block-view.md`,
   so a new declaration is named as the architecture names it.

7. **Draw the out-of-scope boundary.** Name what this change does not do:
   environments deliberately out of scope, application behaviour, package and
   version choices belonging to `.tech`, and the building-block structure in
   `05-building-block-view.md`. An unstated boundary is the one that gets
   crossed.

8. **Derive the acceptance checks.** State checks verifiable from declarations
   and a health check — the resource is declared and applied by a named
   pipeline, each setting resolves from its documented source, each documented
   path answers, and each undocumented port is not exposed. State what the tests
   must establish; do not write them.

9. **Emit the change brief and stop.** Assemble the five parts and the change
   category per the protocol. Then stop. Do not open a source file for editing,
   do not create a test, do not name a delivery orchestration.

10. **Report.** Close with the protocol's report table, one row per chapter in
    scope, with the brief attached.

## Output expectations

- Exactly one change category: `new functionality`,
  `change to existing behaviour`, or `defect`, with the reasoning for it.
- **Outcomes**, **invariants**, **ubiquitous language**, **out of scope**, and
  **acceptance checks**, as the protocol defines them.
- The environments in scope, and those explicitly out of scope, named.
- Each node, resource, and configuration source stated as a requirement, with
  whether it is undeclared or declared-but-unapplied.
- Acceptance checks verifiable from declarations plus a health check.
- Configuration sources named without any secret value.
- An explicit statement that the brief describes required state and authorizes
  no application of it.
- The protocol's report table, with the verdict and the evidence behind it.
- No change to any file in the repository.

## Do not

- Do not edit source code, test code, project files, or infrastructure files.
  This skill emits a brief.
- Do not name a code-side delivery or orchestration skill of any kind. The brief
  stops at the brief; which flow picks it up is the user's decision, made after
  reading it.
- Do not edit the chapter. Building a chapter does not change it — if the
  chapter is wrong, that is a `conflict` or a `code-ahead` verdict, not an edit.
- Do not build from a `draft` or `proposed` chapter without explicit
  confirmation, and never from a `deprecated` one.
- Do not turn a `conflict` into a `defect` brief. Stop and ask which side is
  wrong.
- Do not ask for work that already exists — read the counterpart first.
- Do not treat a TODO, a comment, or a disabled test as proof that something is
  already built.
- Do not apply, provision, migrate, or deploy anything. This skill emits a
  brief.
- Do not include a credential, connection string, key, or token value. Name the
  source.
- Do not leave the environments in scope unstated.
- Do not choose the cloud service, region, IaC tool, or orchestrator. The brief
  states the required topology.
- Do not conflate "not declared" with "declared but never applied".
- Do not brief package or version changes — those go through the repository
  package-update workflow and are recorded in `.tech`.
- Do not brief application behaviour or building-block structure.
