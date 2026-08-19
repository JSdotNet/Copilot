---
name: start
description: "Start this repository's application the way the repository says to, then open it. Use when: starting or running the app locally, 'start the app', 'run it and open it', or resuming work on a branch."
---

# Start the Application

Start the app from the repository's own startup instruction instead of a command guessed per
session, then open it. Usually that is `aspire run` plus a browser on the front end.

## Find the Instruction

First source that answers the question wins; say which one was used.

1. `.claude/start.md` — the startup instruction, from
   [`resources/claude-start-template.md`](../../resources/claude-start-template.md).
2. `.claude/orch-context.md` — `## How to Run`, `## Base URLs`, `## Healthy Startup`.
3. The repository's own getting-started docs — `README.md`, `CONTRIBUTING.md`,
   `.github/instructions/`.
4. Inference — an `*.AppHost` project means `aspire run`; otherwise `package.json` scripts,
   `compose.yaml`, `.claude/launch.json`. Say that this was a guess.

`**Runnable application:** none` in `.claude/orch-context.md` means there is nothing to
start. Say so and stop.

## Run It

1. Check whether it is already running before starting a second copy — worktrees share
   ports. Reuse a running instance and say so.
2. Run the declared command in the background. Never substitute a different command when the
   declared one fails; report the failure.
3. Wait for the declared readiness signal, or `list_resources` on the Aspire MCP server when
   the repository has an AppHost. Stop waiting on a fatal error or two minutes of silence.
4. Open the URL from `## Open`, else the front end from `## Base URLs`, else whatever the
   startup output printed. Use the inline browser pane (`preview_start`); fall back to
   giving the plain URL. Re-read the port every start — it changes.
5. Follow the optional sections when the file has them: `## Sign In` for a local session, and
   `## Go To` to land on the area the current branch changes (match `git diff --name-only`
   against its entries).

Report in a couple of lines: which instruction source, the command, health, and the open URL.
Leave the app running. Offer once to write `.claude/start.md` when the start had to be
inferred.

## Constraints

- Never type a password, token, or key into a form. With no non-interactive sign-in path,
  open the page, name where the credential lives, and let the user sign in.
- Never restart a running instance without saying so.
- Never run destructive setup (database drop, volume prune, `git clean`) as part of starting.
  Propose it instead.

## Related Skills

- `aspire-run` (plugin: `qa`) — startup inside QA validation, with MCP evidence requirements.
- `aspire-log-monitor` (plugin: `qa`) — watch logs and traces while the app is up.
