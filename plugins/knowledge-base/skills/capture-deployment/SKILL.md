---
name: capture-deployment
description: 'Capture direction, deployment kind: read the implemented hosting and infrastructure setup and write or refresh .arc42/07-deployment-view.md, with its nodes, artifact mapping, configuration sources, and topology diagram. Use when: the deployment view is missing or stale, infrastructure changed, a new environment or resource was added, document the topology we deployed. Reads manifests, IaC, and orchestration files as evidence and routes the write through orch-arc42-content. DO NOT USE FOR: turning an agreed but unbuilt deployment chapter into work (use build-deployment), or for the building-block, bounded-context, or design-component chapters around it (use the matching capture-* skill).'
---

# Capture the deployment view from code

## Purpose

The system runs somewhere on something, and `.arc42/07-deployment-view.md` does
not describe it — or describes a topology from before a resource, an
environment, or a hosting model changed. This skill reads the infrastructure
declarations, establishes the nodes and what runs on them, and routes the
chapter through `orch-arc42-content`.

This view is the second rung of counterpart resolution for runtime and hosting
units, alongside the building block view, so keeping it current pays into every
other pass in this family.

`.arc42` has its own folder rules, and they differ from `.domain`:

- **No `type` field.** `.arc42` defines no value set; setting `type` is reported
  as a warning.
- **No `depends-on`.** Cross-references use `related`.
- **The top-level chapter's `meta` block doubles as the file-level block.** Do
  not add a second, duplicate block.

Read `assets/code-sync-protocol.md` before starting. It carries the counterpart
resolution ladder, the evidence rules, the five-way drift verdict, the status
rules, index regeneration, and the report table — none of which are repeated
here.

## Inputs

- **Repository root.** Default to the current working directory.
- **Scope.** The whole view, or one environment, or one `##` section.
- **Environments in scope.** Which environments the chapter covers. Default to
  the ones the repository actually declares.

If `.arc42/` does not exist, stop and run `knowledge-base-init` for the `.arc42`
adoption path. Create the file only when the chapter will have real content.

## Spec-to-code mapping

The view's parts and the infrastructure declarations that evidence each one:

| Chapter element | Code and test evidence |
|---|---|
| Deployment nodes | Declared hosts and runtime environments: container images and their base, Kubernetes workloads, cloud resources in IaC, an Aspire AppHost's registered resources, compose services |
| Environments | The environments the repository actually declares — per-environment IaC parameter files, deployment workflow targets, environment-specific configuration |
| Artifact mapping | Which built artifact runs on which node: image build targets, workload image references, publish profiles, AppHost project registrations |
| Infrastructure dependencies | Databases, caches, message brokers, blob storage, and identity providers actually declared and connected to |
| Configuration sources | Where configuration is read from at runtime: environment variables set by the deployment, configuration providers, mounted files, app-configuration or key-vault references |
| Network and protocol paths | Exposed ports and ingress rules, service-to-service addressing and discovery, and which paths cross a trust boundary |
| Scaling and availability | Replica counts, autoscaling rules, and health probes as declared |

A declaration is evidence that something is **declared**, not that it is
**deployed**. An unreferenced manifest, a resource in IaC that no pipeline
applies, or a compose file nothing runs may be dead. Prefer declarations that a
pipeline or an AppHost actually references, and mark the rest as unverified
rather than recording them as live topology.

**Never record a credential, a connection string, a key, or a token value.**
Record the *source* — the vault, the configuration provider, the environment
variable name — and never the secret itself.

Package and version facts belong in `.tech`, not here. This chapter names the
node and the artifact; `knowledge-tech-update` and `orch-tech` own the
technology graph.

## Workflow

1. **Load governed context.** Read `assets/code-sync-protocol.md`,
   `knowledge-arc42.instructions.md`, and
   `knowledge-chapter-metadata.instructions.md`. Read
   `.arc42/07-deployment-view.md` as it stands, plus `05-building-block-view.md`
   for the artifacts being deployed and `04-solution-strategy.md` for the
   hosting decisions that constrain the topology.

2. **Resolve the counterpart.** Work the resolution ladder from the protocol:
   `naming.md` aliases first, then `.arc42/05-building-block-view.md`, then the
   observed naming convention. Record which rung matched. Stop at `unresolved`
   if the ladder yields no single candidate or more than one.

3. **Read the implementation and its tests.** Read the Dockerfiles, compose
   files, Kubernetes manifests, IaC templates and their per-environment
   parameters, the AppHost if there is one, and the deployment workflows that
   apply them. Apply the protocol's evidence rules without exception: code that
   executes and tests that pass are evidence; comments, TODOs, doc comments, and
   disabled tests are not.

   Then read the unit tests deliberately — they are where rules and the
   ubiquitous language are stated most precisely, and the part of a capture pass
   most easily skimped. Mine them for:

   - **Smoke and health checks.** A test or workflow step that hits a deployed
     endpoint is the only evidence here that a declaration is actually applied
     rather than merely present.
   - **Integration test configuration.** The resources integration tests spin up
     name the infrastructure dependencies the system genuinely needs.
   - **Configuration tests.** A test asserting a setting resolves establishes
     the configuration source — record the source, never the value.

   Two absences are informative and neither is evidence of behaviour: a rule
   with **no** test is recorded as thinly covered rather than with the
   confidence of a tested one, and a **disabled, skipped, or commented-out**
   test is not evidence at all — per the protocol it is a record of an
   intention, and a hint that the rule it asserts may not hold. Where a rule
   appears only in a disabled test, record it as an open question.

4. **Separate declared from deployed.** For each node and resource, establish
   whether a pipeline or an AppHost actually references it. Record the
   referenced ones as topology; record the unreferenced ones as unverified, and
   say what would confirm them. A stale manifest recorded as live topology is
   worse than an acknowledged gap.

5. **Reach a verdict.** Compare what the code establishes against what the
   chapter currently says, and land on exactly one of the protocol's five
   verdicts. `code-ahead` is the case this skill exists for. On `spec-ahead`,
   stop and hand the scope to `build-deployment`. On `conflict`, stop and ask;
   never resolve it by overwriting the chapter.

6. **Draft the chapter.** Write to the template in
   `knowledge-arc42.instructions.md`. The heading carries the bare name; the
   `meta` block carries `status` and no `type` — `.arc42` defines no `type`
   value set, and setting one is reported as a warning. A new chapter starts at
   `status: draft`; an existing chapter's `status` is left untouched. Include
   optional fields only where they have a value.

7. **Draw the topology, and keep secrets out.** Build a Mermaid diagram of
   nodes, the artifacts on them, and the paths between them, marking the ones
   that cross a trust boundary. Record configuration **sources** only — never a
   credential, key, connection string, or token value.

8. **Route the write through `orch-arc42-content`.** Hand over the drafted
   content and the evidence behind each claim. `orch-arc42-content` owns
   template conformance, the metadata blocks, and the consistency review. Do not
   write `.arc42/` files directly.

9. **Regenerate and validate.** After the write lands, per the protocol:

   ```bash
   node .github/tools/knowledge-meta/build.mjs --scope .arc42
   node .github/tools/knowledge-meta/build.mjs --scope .arc42 --check
   ```

10. **Report.** Close with the protocol's report table, one row per chapter
    touched or checked, including the `aligned` ones.

## Output expectations

- `.arc42/07-deployment-view.md` written through `orch-arc42-content`, with one
  `meta` block serving as both chapter and file block.
- Nodes and environments established from declarations a pipeline or AppHost
  actually references.
- Unreferenced declarations recorded as unverified, with what would confirm
  them.
- An artifact-to-node mapping.
- Configuration sources recorded by name, with no secret values anywhere in the
  chapter.
- Network paths recorded, with trust-boundary crossings marked.
- A Mermaid topology diagram.
- Package and version facts left to `.tech`, referenced rather than restated.
- `.arc42/_meta/` regenerated and `--check` clean.
- The protocol's report table, with the `aligned` rows included.

## Do not

- Do not edit source or test code. This direction only reads it.
- Do not write `.arc42/` files directly — the write routes through
  `orch-arc42-content`.
- Do not treat a comment, a TODO, a doc comment, or a disabled test as evidence
  of behaviour.
- Do not set `status: active` because the implementation exists. Code existing
  is not agreement that the code is the intended model.
- Do not resolve a `conflict` verdict by rewriting the chapter to match the
  code. Stop and put the decision to the user.
- Do not record a credential, connection string, key, or token value. Record the
  source.
- Do not record an unreferenced manifest or IaC resource as live topology. Mark
  it unverified.
- Do not set a `type` field, and do not add `depends-on`.
- Do not add a second, file-level `meta` block.
- Do not restate `.tech` package or version facts. Link to them.
- Do not infer an environment that no declaration or workflow target names.
- Do not scaffold an empty chapter.
- Do not hand-edit files under `_meta/`.
