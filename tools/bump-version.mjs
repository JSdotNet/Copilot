#!/usr/bin/env node
// bump-version.mjs — move one plugin's version in the four places it lives.
//
//   node tools/bump-version.mjs <plugin> [patch|minor|major|<x.y.z>]   # default: patch
//
// A version lives in the Copilot manifest, the Claude manifest, the marketplace entry, and
// the copilot-plugins.md table row, and .agents/rules/manifests.md says all four agree.
// Nothing generates one from another any more, so this is the one write the rule allows a
// script to make: the same value into every place, and nothing else touched. Run
// node tools/check-assets.mjs afterwards; it fails on any of the four still differing.

import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [plugin, step = "patch"] = process.argv.slice(2);
if (!plugin) { console.error("usage: node tools/bump-version.mjs <plugin> [patch|minor|major|<x.y.z>]"); process.exit(2); }

async function exists(p) { try { await stat(p); return true; } catch { return false; } }
async function readJson(p) { return JSON.parse(await readFile(p, "utf8")); }
async function writeJson(p, value) { await writeFile(p, JSON.stringify(value, null, 2) + "\n", "utf8"); }

const copilotPath = path.join(ROOT, "plugins", plugin, ".github", "plugin", "plugin.json");
const claudePath = path.join(ROOT, "plugins", plugin, ".claude-plugin", "plugin.json");
const marketplacePath = path.join(ROOT, ".claude-plugin", "marketplace.json");
const tablePath = path.join(ROOT, "copilot-plugins.md");

const manifests = [];
if (await exists(copilotPath)) manifests.push(copilotPath);
if (await exists(claudePath)) manifests.push(claudePath);
if (!manifests.length) { console.error(`plugins/${plugin}: no manifest found`); process.exit(1); }

const current = (await readJson(manifests[0])).version;
let next;
if (/^\d+\.\d+\.\d+$/.test(step)) next = step;
else {
    const [major, minor, patch] = current.split(".").map(Number);
    next = step === "major" ? `${major + 1}.0.0` : step === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
}

const touched = [];
for (const p of manifests) {
    const m = await readJson(p);
    m.version = next;
    await writeJson(p, m);
    touched.push(path.relative(ROOT, p));
}

const marketplace = await readJson(marketplacePath);
const entry = (marketplace.plugins ?? []).find((e) => e.name === plugin);
if (entry) {
    entry.version = next;
    await writeJson(marketplacePath, marketplace);
    touched.push(".claude-plugin/marketplace.json");
}

const table = await readFile(tablePath, "utf8");
const row = new RegExp(`^(\\| \`${plugin}\` \\| \`)[0-9.]+(\` \\| \`plugins/${plugin}\` \\|)`, "m");
if (row.test(table)) {
    await writeFile(tablePath, table.replace(row, `$1${next}$2`), "utf8");
    touched.push("copilot-plugins.md");
} else {
    console.error(`copilot-plugins.md: no row for ${plugin}; add one by hand`);
}

console.log(`${plugin}: ${current} -> ${next}`);
for (const t of touched) console.log(`  ${t.replace(/\\/g, "/")}`);
