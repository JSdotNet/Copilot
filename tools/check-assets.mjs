#!/usr/bin/env node
// check-assets.mjs — the review lint AGENTS.md describes, as a script.
//
//   node tools/check-assets.mjs            # report, exit 1 on any error
//   node tools/check-assets.mjs --budgets  # also list every asset over its body budget
//
// Checks what the removed sync generator used to lint and what a reviewer is otherwise
// expected to catch by eye. Every file it reads is hand-authored; it writes nothing.
//
//   marketplace   every entry has a folder, every folder with a Claude manifest has an
//                 entry, and name/version/description agree across the Claude manifest,
//                 the Copilot manifest, the marketplace, and the copilot-plugins.md table
//   dependencies  a declared range is well-formed and names a marketplace
//   agents        name equals the filename, a description exists, a model pin is a value
//                 Claude accepts, Skill is granted, the Claude tools are exactly the
//                 translation of the Copilot ids in tools/tool-map.json, and no
//                 specialist carries a session-spawning or delegation tool
//   hooks         hooks/hooks.json never uses type: prompt on SessionStart, and every
//                 Copilot sessionStart prompt has its Claude twin — a command hook that
//                 prints hooks/session-start-context.md holding the same text
//   rules         every .agents/rules/<topic>.md has a wrapper per host, the wrappers'
//                 globs and description are derived from it, and neither wrapper has
//                 grown a rule of its own
//   contracts     every plugins/*/resources/*.md with frontmatter carries name (equal to
//                 its filename) and description, and never applyTo or paths; no plugin
//                 has an instructions/ folder
//   budgets       body-line counts against the budgets in AGENTS.md — reported, never
//                 an error
//
// Dependency-free ESM against node: built-ins.

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGINS = path.join(ROOT, "plugins");
const SHARED_RULES = path.join(ROOT, ".agents", "rules");
const CLAUDE_RULES = path.join(ROOT, ".claude", "rules");
const COPILOT_RULES = path.join(ROOT, ".github", "instructions");
const MARKETPLACE = path.join(ROOT, ".claude-plugin", "marketplace.json");
const TABLE = path.join(ROOT, "copilot-plugins.md");
const TOOL_MAP = path.join(ROOT, "tools", "tool-map.json");
const showBudgets = process.argv.includes("--budgets");

const BUDGETS = { "SKILL.md": 40, "rule": 60, ".agent.md": 80 };
const WRAPPER_BODY_MAX = 3;
const MODEL_PIN = /^(opus|sonnet|haiku|fable|inherit|claude-[\w.-]+)$/;
// Tools that sequence, spawn, or delegate. Only a runner's agent may carry them, and no
// runner ships from this repository — the flow-runner lives in delivery@jsdotnet — so this
// guards agents added later rather than any on disk today.
const FLOW_CONTROL_TOOLS = new Set([
    "SendMessage", "create_session", "send_session_message", "respond_to_session_plan",
    "list_sessions_and_chats", "get_session", "list_projects",
]);
const RUNNER_PLUGINS = new Set([]);
// The two host plugins are built on one host's rendering surface and ship one manifest each.
const HOST_ONLY = { "claude-desktop": "claude", "copilot-app": "copilot" };

const errors = [];
const notes = [];
const error = (m) => errors.push(m);

async function exists(p) { try { await stat(p); return true; } catch { return false; } }
async function json(p) { return JSON.parse(await readFile(p, "utf8")); }
async function walk(dir) {
    const out = [];
    for (const e of await readdir(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (e.name !== "node_modules") out.push(...(await walk(p))); }
        else out.push(p);
    }
    return out;
}
function frontmatter(text) {
    const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
    return m ? { fm: m[1], body: m[2] } : { fm: "", body: text };
}
function bodyLines(body) {
    return body.split(/\r?\n/).filter((l) => l.trim() !== "").length;
}
function rel(p) { return path.relative(ROOT, p).replace(/\\/g, "/"); }
function scalar(fm, key) {
    const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(fm);
    if (!m) return null;
    return m[1].trim().replace(/^['"]|['"]$/g, "");
}
function yamlList(fm, key) {
    const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(fm);
    if (!m) return null;
    if (m[1].trim().startsWith("[")) {
        return m[1].trim().slice(1, -1).split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
    }
    const rest = fm.slice(m.index + m[0].length);
    const items = [];
    for (const line of rest.split(/\r?\n/)) {
        const item = /^\s+-\s+['"]?([^'"\r\n]+?)['"]?\s*$/.exec(line);
        if (item) items.push(item[1]);
        else if (line.trim() !== "" && !/^\s/.test(line)) break;
    }
    return items;
}

const folders = (await readdir(PLUGINS, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort();

// ── marketplace, manifests, table ───────────────────────────────────────────

const marketplace = await json(MARKETPLACE);
const listed = new Map((marketplace.plugins ?? []).map((p) => [p.name, p]));
const tableText = await readFile(TABLE, "utf8");
const tabled = new Map([...tableText.matchAll(/^\| `([a-z-]+)` \| `([0-9.]+)` \| `plugins\/\1` \|/gm)].map((m) => [m[1], m[2]]));

for (const [name, entry] of listed) {
    const dir = path.join(PLUGINS, name);
    if (entry.source !== `./plugins/${name}`) error(`marketplace: ${name} has source ${entry.source}, expected ./plugins/${name}`);
    if (!(await exists(dir))) { error(`marketplace: ${name} is listed but plugins/${name} does not exist`); continue; }
    const claudePath = path.join(dir, ".claude-plugin", "plugin.json");
    if (!(await exists(claudePath))) { error(`${name}: listed in the marketplace but has no .claude-plugin/plugin.json`); continue; }
    const claude = await json(claudePath);
    for (const field of ["name", "version", "description"]) {
        if (claude[field] !== entry[field]) error(`${name}: ${field} differs between marketplace.json and .claude-plugin/plugin.json`);
    }
}

for (const folder of folders) {
    const dir = path.join(PLUGINS, folder);
    const claudePath = path.join(dir, ".claude-plugin", "plugin.json");
    const copilotPath = path.join(dir, ".github", "plugin", "plugin.json");
    const hasClaude = await exists(claudePath);
    const hasCopilot = await exists(copilotPath);
    const hostOnly = HOST_ONLY[folder];
    if (!hasClaude && !hasCopilot) { error(`plugins/${folder}: no manifest at all`); continue; }
    if (hasClaude && hasCopilot && hostOnly) error(`plugins/${folder}: is ${hostOnly}-only yet ships both manifests`);
    if (!hasClaude && hostOnly !== "copilot") error(`plugins/${folder}: no .claude-plugin/plugin.json; every plugin ships both unless it is host-only`);
    if (!hasCopilot && hostOnly !== "claude") error(`plugins/${folder}: no .github/plugin/plugin.json; every plugin ships both unless it is host-only`);

    const claude = hasClaude ? await json(claudePath) : null;
    const copilot = hasCopilot ? await json(copilotPath) : null;
    const primary = claude ?? copilot;
    if (primary.name !== folder) error(`plugins/${folder}: manifest name "${primary.name}" must equal the folder name`);
    if (claude && copilot) {
        for (const field of ["name", "version", "description"]) {
            if (copilot[field] !== claude[field]) error(`${folder}: ${field} differs between the Claude and Copilot manifests`);
        }
    }
    if (claude) {
        if (!listed.has(folder)) error(`plugins/${folder} has a Claude manifest but no marketplace entry, so Claude Code will not offer it`);
        if ("skills" in claude) error(`${folder}: Claude manifest names skills; Claude scans skills/ already`);
        if ("hooks" in claude) error(`${folder}: Claude manifest names hooks; that fails with "Duplicate hooks file detected"`);
        const agentsDir = path.join(dir, "agents");
        const agentFiles = (await exists(agentsDir)) ? (await walk(agentsDir)).filter((f) => f.endsWith(".agent.md")).map((f) => "./" + rel(f).slice(`plugins/${folder}/`.length)) : [];
        const declared = new Set(Array.isArray(claude.agents) ? claude.agents : []);
        for (const f of agentFiles) if (!declared.has(f)) error(`${folder}: ${f} is not listed under agents in the Claude manifest, so handoffs to it dangle`);
        for (const d of declared) if (!(await exists(path.join(dir, d)))) error(`${folder}: Claude manifest lists ${d}, which does not exist`);
        for (const dep of Array.isArray(claude.dependencies) ? claude.dependencies : []) {
            if (!dep.name || !dep.marketplace) error(`${folder}: a dependency needs name and marketplace`);
        }
    }
    const tableVersion = tabled.get(folder);
    if (tableVersion === undefined) error(`copilot-plugins.md: no row for ${folder}; every plugin has one`);
    else if (tableVersion !== primary.version) error(`copilot-plugins.md: ${folder} is ${tableVersion} in the table but ${primary.version} in its manifest`);
    if (await exists(path.join(dir, "instructions"))) {
        error(`plugins/${folder}/instructions: no host applies a glob from inside a plugin; shared text is a resources/<name>.md contract referenced by path`);
    }
}
for (const name of tabled.keys()) {
    if (!folders.includes(name)) error(`copilot-plugins.md: ${name} has a row but no plugins/${name}`);
}

// ── agents ──────────────────────────────────────────────────────────────────
//
// One tools list serves both hosts: the Copilot ids the author wrote, followed by the Claude
// names tools/tool-map.json translates them to. Each host silently drops the entries it does
// not recognise. The translation is checked, not generated: a Claude entry the map does not
// derive, or one it derives that is missing, is an error.

const toolMap = await json(TOOL_MAP);
function claudeToolsFor(copilotIds, folder, declaredServers, agentsKey) {
    const expected = new Set();
    const unmapped = [];
    for (const id of copilotIds) {
        const direct = toolMap.tools[id];
        if (direct) { for (const t of direct) expected.add(t); continue; }
        let matched = false;
        for (const [prefix, server] of Object.entries(toolMap.mcpPrefixes)) {
            if (id === prefix || id.startsWith(prefix)) {
                if (!declaredServers.has(server)) error(`${folder}: agent declares '${id}', routed to MCP server '${server}', but the Claude manifest declares no such server`);
                expected.add(`mcp__plugin_${folder}_${server}`);
                expected.add(`mcp__${server}`);
                matched = true;
                break;
            }
        }
        if (!matched) unmapped.push(id);
    }
    for (const t of toolMap.alwaysInclude) expected.add(t);
    if (agentsKey && agentsKey.length) {
        expected.delete("Agent");
        expected.add(`Agent(${agentsKey.join(", ")})`);
    }
    return { expected, unmapped };
}

for (const folder of folders) {
    const agentsDir = path.join(PLUGINS, folder, "agents");
    if (!(await exists(agentsDir))) continue;
    const claudePath = path.join(PLUGINS, folder, ".claude-plugin", "plugin.json");
    const declaredServers = new Set((await exists(claudePath)) ? Object.keys((await json(claudePath)).mcpServers ?? {}) : []);
    for (const file of (await walk(agentsDir)).filter((f) => f.endsWith(".agent.md"))) {
        const { fm, body } = frontmatter(await readFile(file, "utf8"));
        const label = rel(file);
        const expectedName = path.basename(file, ".agent.md");
        const name = scalar(fm, "name");
        if (name !== expectedName) error(`${label}: frontmatter name "${name}" must equal the filename "${expectedName}"`);
        if (!/^description:\s*\S/m.test(fm)) error(`${label}: description is required; Claude refuses to load an agent without one`);
        const model = scalar(fm, "model");
        if (model && !MODEL_PIN.test(model)) error(`${label}: model "${model}" is not a value Claude accepts; put the preference in a ## Model section`);
        const tools = yamlList(fm, "tools") ?? [];
        if (!tools.includes("Skill")) error(`${label}: tools does not include Skill, so the agent cannot reach plugin skills`);
        const copilotIds = tools.filter((t) => !/^(mcp__|[A-Z])/.test(t));
        const claudeEntries = tools.filter((t) => /^(mcp__|[A-Z])/.test(t));
        const agentsKey = yamlList(fm, "agents");
        const { expected, unmapped } = claudeToolsFor(copilotIds, folder, declaredServers, agentsKey);
        for (const id of unmapped) error(`${label}: Copilot tool id '${id}' is not in tools/tool-map.json; add the mapping rather than guessing`);
        for (const t of expected) if (!claudeEntries.includes(t)) error(`${label}: tools is missing '${t}', which tool-map.json derives from the Copilot ids`);
        for (const t of claudeEntries) if (!expected.has(t)) error(`${label}: tools carries '${t}', which no Copilot id in the list derives`);
        if (!RUNNER_PLUGINS.has(folder)) {
            const carried = tools.filter((t) => FLOW_CONTROL_TOOLS.has(t));
            if (copilotIds.includes("agent") && !(agentsKey && agentsKey.length)) carried.push("agent (unscoped)");
            if (carried.length) error(`${label}: only a runner plugin's agent may carry flow-control tools: ${carried.join(", ")}`);
        }
        if (/^handoffs:/m.test(fm)) {
            for (const m of fm.matchAll(/^\s+agent:\s*['"]?([\w-]+)/gm)) {
                if (!body.includes(`\`${m[1]}\``) && !body.includes(`${m[1]} agent`) && !body.includes(`${m[1]}.agent.md`) && !body.includes(`:${m[1]}`)) {
                    error(`${label}: handoff target "${m[1]}" is not named in the body; Claude ignores the handoffs key`);
                }
            }
        }
    }
}

// ── hooks ───────────────────────────────────────────────────────────────────
//
// Copilot reads hooks.json at the plugin root (camelCase events, type: prompt). Claude reads
// hooks/hooks.json, and rejects a prompt hook on SessionStart at runtime, so that one is a
// command hook printing hooks/session-start-context.md as additionalContext. Both files are
// hand-authored; the sidecar must hold the Copilot prompts verbatim so the two hosts hear the
// same thing.

for (const folder of folders) {
    const rootHooks = path.join(PLUGINS, folder, "hooks.json");
    const claudeHooks = path.join(PLUGINS, folder, "hooks", "hooks.json");
    const sidecar = path.join(PLUGINS, folder, "hooks", "session-start-context.md");
    if (await exists(claudeHooks)) {
        const doc = await json(claudeHooks);
        const events = doc.hooks ?? doc;
        for (const group of events.SessionStart ?? []) {
            for (const hook of group.hooks ?? []) {
                if (hook.type === "prompt") error(`${folder}/hooks/hooks.json: SessionStart type: prompt fails silently in Claude Code; author it as a command hook`);
            }
        }
    }
    if (HOST_ONLY[folder] || !(await exists(rootHooks))) continue;
    const doc = await json(rootHooks);
    const prompts = (doc.hooks?.sessionStart ?? []).filter((h) => h.type === "prompt").map((h) => h.prompt);
    if (!prompts.length) continue;
    if (!(await exists(claudeHooks))) { error(`${folder}: hooks.json has a sessionStart prompt but there is no hooks/hooks.json to carry it to Claude`); continue; }
    const events = (await json(claudeHooks)).hooks ?? {};
    const hasCommand = (events.SessionStart ?? []).some((g) => (g.hooks ?? []).some((h) => h.type === "command"));
    if (!hasCommand) error(`${folder}/hooks/hooks.json: no SessionStart command hook, so the Copilot sessionStart prompt reaches Claude nowhere`);
    if (!(await exists(sidecar))) { error(`${folder}: no hooks/session-start-context.md; the Claude command hook has nothing to print`); continue; }
    const text = (await readFile(sidecar, "utf8")).replace(/\r\n/g, "\n").trim();
    if (text !== prompts.join("\n\n").trim()) error(`${folder}/hooks/session-start-context.md differs from the sessionStart prompt(s) in hooks.json; the two hosts must hear the same text`);
}

// ── rules ───────────────────────────────────────────────────────────────────

function yamlPaths(fm) { return yamlList(fm, "paths"); }

const topics = new Set();
if (await exists(SHARED_RULES)) {
    for (const entry of (await readdir(SHARED_RULES)).filter((f) => f.endsWith(".md") && f !== "README.md").sort()) {
        const topic = entry.slice(0, -3);
        topics.add(topic);
        const shared = `.agents/rules/${entry}`;
        const { fm } = frontmatter(await readFile(path.join(SHARED_RULES, entry), "utf8"));
        if (scalar(fm, "name") !== topic) error(`${shared}: frontmatter name must equal the filename "${topic}"`);
        const description = scalar(fm, "description");
        if (!description) error(`${shared}: description is required; the Copilot wrapper copies it`);
        const paths = yamlPaths(fm);
        if (!paths || !paths.length) { error(`${shared}: needs a paths list; without one neither wrapper can be derived`); continue; }

        const claudeWrapper = path.join(CLAUDE_RULES, `${topic}.md`);
        if (!(await exists(claudeWrapper))) error(`${shared}: no .claude/rules/${topic}.md, so Claude applies this rule nowhere`);
        else {
            const { fm: cfm, body } = frontmatter(await readFile(claudeWrapper, "utf8"));
            const cpaths = yamlPaths(cfm) ?? [];
            if (cpaths.join(",") !== paths.join(",")) error(`.claude/rules/${topic}.md: paths differ from ${shared} (${cpaths.join(",")} vs ${paths.join(",")})`);
            const lines = bodyLines(body);
            if (lines > WRAPPER_BODY_MAX) error(`.claude/rules/${topic}.md: ${lines} body lines; a wrapper points at ${shared}, it does not restate it`);
        }
        const copilotWrapper = path.join(COPILOT_RULES, `${topic}.instructions.md`);
        if (!(await exists(copilotWrapper))) error(`${shared}: no .github/instructions/${topic}.instructions.md, so Copilot applies this rule nowhere`);
        else {
            const { fm: gfm, body } = frontmatter(await readFile(copilotWrapper, "utf8"));
            if (scalar(gfm, "applyTo") !== paths.join(",")) error(`.github/instructions/${topic}.instructions.md: applyTo must be ${shared}'s paths joined with commas (${paths.join(",")})`);
            if (scalar(gfm, "description") !== description) error(`.github/instructions/${topic}.instructions.md: description differs from ${shared}`);
            const lines = bodyLines(body);
            if (lines > WRAPPER_BODY_MAX) error(`.github/instructions/${topic}.instructions.md: ${lines} body lines; a wrapper points at ${shared}, it does not restate it`);
        }
    }
}
for (const [dir, suffix, label] of [[CLAUDE_RULES, ".md", ".claude/rules"], [COPILOT_RULES, ".instructions.md", ".github/instructions"]]) {
    if (!(await exists(dir))) continue;
    for (const entry of (await readdir(dir)).filter((f) => f.endsWith(suffix))) {
        const topic = entry.slice(0, -suffix.length);
        if (!topics.has(topic)) error(`${label}/${entry}: no .agents/rules/${topic}.md behind it; a rule is authored once and wrapped, never written in a wrapper`);
    }
}

// ── contracts ───────────────────────────────────────────────────────────────

for (const folder of folders) {
    const resDir = path.join(PLUGINS, folder, "resources");
    if (!(await exists(resDir))) continue;
    for (const entry of (await readdir(resDir, { withFileTypes: true })).filter((e) => e.isFile() && e.name.endsWith(".md"))) {
        const where = `plugins/${folder}/resources/${entry.name}`;
        const { fm } = frontmatter(await readFile(path.join(resDir, entry.name), "utf8"));
        if (!fm) continue; // a template or prompt fragment, not a contract
        const name = entry.name.slice(0, -3);
        if (scalar(fm, "applyTo") !== null) error(`${where}: applyTo is one host's spelling on a file no host applies; a contract is reached by path`);
        if (yamlPaths(fm) !== null) error(`${where}: paths belongs to a repository rule, not a plugin contract`);
        if (scalar(fm, "name") !== name) error(`${where}: frontmatter name must equal the filename "${name}"`);
        if (!scalar(fm, "description")) error(`${where}: description is required`);
    }
}

// ── budgets (report only) ───────────────────────────────────────────────────

const over = [];
let budgeted = 0;
for (const file of await walk(PLUGINS)) {
    const base = path.basename(file);
    if (!base.endsWith(".md")) continue;
    const parent = path.basename(path.dirname(file));
    const { fm, body } = frontmatter(await readFile(file, "utf8"));
    const isContract = parent === "resources" && scalar(fm, "name") !== null && scalar(fm, "description") !== null;
    const key = base === "SKILL.md" ? "SKILL.md"
        : isContract ? "rule"
        : base.endsWith(".agent.md") ? ".agent.md"
        : null;
    if (!key) continue;
    budgeted++;
    const lines = bodyLines(body);
    if (lines > BUDGETS[key]) over.push({ file: rel(file), lines, budget: BUDGETS[key] });
}
over.sort((a, b) => b.lines / b.budget - a.lines / a.budget);

// ── report ──────────────────────────────────────────────────────────────────

for (const n of notes) console.log(`note   ${n}`);
for (const e of errors) console.log(`error  ${e}`);
console.log(`\nbudgets: ${over.length} of ${budgeted} budgeted assets exceed their budget (reported, not an error)`);
if (showBudgets) for (const o of over) console.log(`  ${String(o.lines).padStart(4)} / ${o.budget}  ${o.file}`);
console.log(`\n${errors.length} error(s) across ${folders.length} plugins.`);
process.exit(errors.length ? 1 : 0);
