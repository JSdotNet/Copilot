// Exercises the repo-level status configuration: the built-in fallback ladder a
// repository gets with no config file, and the `.github/knowledge-status.json`
// rules that override it per folder, per file glob, and per scope.
//
// `CONFIG_PATH` resolves two levels above this module, so the config case runs
// against a copy of `metadata.mjs` in a temp tree rather than dropping a config
// file into the plugin. `metadata.mjs` imports only node builtins, so a
// single-file copy is a complete module.
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { allowedStatuses, validateDocument } from "./metadata.mjs";

let failed = 0;
const check = (ok, name, detail) => {
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : `\n        ${detail}`}`);
};
const same = (actual, expected, name) =>
    check(
        JSON.stringify(actual) === JSON.stringify(expected),
        name,
        `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`
    );

// --- Fallback ladder, with no config file present ---------------------------

const fallbacks = [
    {
        name: "the .domain ladder carries the full set, so `ready` and `changed` are usable",
        kind: "domain",
        path: ".domain/ordering/domain.md",
        statuses: ["draft", "planned", "proposed", "ready", "changed", "active", "deprecated"],
    },
    {
        name: ".arc42 keeps its four-rung ladder",
        kind: "arc42",
        path: ".arc42/05-building-block-view.md",
        statuses: ["draft", "proposed", "active", "deprecated"],
    },
    {
        name: ".backlog keeps its work-item ladder",
        kind: "backlog",
        path: ".backlog/epics/checkout.md",
        statuses: ["draft", "ready", "in-progress", "done", "blocked"],
    },
    {
        name: ".tech keeps the adoption ladder",
        kind: "tech",
        path: ".tech/dotnet.md",
        statuses: ["candidate", "trial", "adopted", "hold", "retired"],
    },
    {
        name: ".design keeps its three-rung ladder",
        kind: "design",
        path: ".design/components/button.md",
        statuses: ["draft", "active", "deprecated"],
    },
    {
        name: ".ai reuses the adoption ladder",
        kind: "ai",
        path: ".ai/practices/pairing.md",
        statuses: ["candidate", "trial", "adopted", "hold", "retired"],
    },
];

for (const c of fallbacks) {
    same(allowedStatuses(c.kind, c.path, "chapter"), c.statuses, c.name);
}

same(
    allowedStatuses("domain", ".domain/ordering/domain.md", "file"),
    allowedStatuses("domain", ".domain/ordering/domain.md", "chapter"),
    "the fallback rule is scope-agnostic"
);
same(allowedStatuses("nonsense", "nonsense/x.md", "chapter"), [], "an unknown folder allows nothing");

// --- Config-driven rules ----------------------------------------------------

const config = {
    version: 1,
    folders: {
        domain: {
            path: ".domain",
            rules: [
                { id: "inbox", files: ["_inbox/**"], scope: "any", statuses: ["pending", "processed"] },
                { id: "decision-chapters", files: ["**/decisions.md"], scope: "chapter", statuses: ["proposed", "active"] },
                { id: "containers", files: ["**/naming.md", "**/decisions.md"], scope: "any", statuses: [] },
                { id: "model", files: ["**/domain.md", "cross-cutting/*.md"], scope: "any", statuses: ["draft", "ready", "changed"] },
                { id: "rest", files: ["**/*.md"], scope: "any", statuses: [] },
            ],
        },
    },
};

const root = mkdtempSync(join(tmpdir(), "knowledge-status-"));
let configured;
try {
    const toolDir = join(root, "tools", "knowledge-meta");
    mkdirSync(toolDir, { recursive: true });
    copyFileSync(join(dirname(fileURLToPath(import.meta.url)), "metadata.mjs"), join(toolDir, "metadata.mjs"));
    writeFileSync(join(root, "knowledge-status.json"), JSON.stringify(config), "utf8");
    configured = await import(pathToFileURL(join(toolDir, "metadata.mjs")).href);

    const cases = [
        {
            name: "a file glob picks its own ladder",
            args: ["domain", ".domain/ordering/domain.md", "chapter"],
            statuses: ["draft", "ready", "changed"],
        },
        {
            name: "a single-segment `*` glob matches within one segment",
            args: ["domain", ".domain/cross-cutting/money.md", "chapter"],
            statuses: ["draft", "ready", "changed"],
        },
        {
            name: "`**` matches across segments",
            args: ["domain", ".domain/_inbox/notes/2026-09-01.md", "chapter"],
            statuses: ["pending", "processed"],
        },
        {
            name: "`scope: chapter` wins for a chapter block, first match first",
            args: ["domain", ".domain/ordering/decisions.md", "chapter"],
            statuses: ["proposed", "active"],
        },
        {
            name: "the same file at file scope skips the chapter-scoped rule",
            args: ["domain", ".domain/ordering/decisions.md", "file"],
            statuses: [],
        },
        {
            name: "an empty list means the block carries no status",
            args: ["domain", ".domain/ordering/naming.md", "chapter"],
            statuses: [],
        },
        {
            name: "the catch-all rule ends the ladder",
            args: ["domain", ".domain/ordering/dependencies.md", "chapter"],
            statuses: [],
        },
        {
            name: "a folder the config omits still gets the built-in fallback",
            args: ["tech", ".tech/dotnet.md", "chapter"],
            statuses: ["candidate", "trial", "adopted", "hold", "retired"],
        },
    ];

    for (const c of cases) {
        same(configured.allowedStatuses(...c.args), c.statuses, c.name);
    }

    // --- What the rules mean for validateDocument ---------------------------

    const errorsFor = (relPath, markdown) =>
        configured
            .validateDocument(relPath, markdown)
            .filter((i) => i.severity === "error")
            .map((i) => i.message);

    const modelDoc = [
        "# Ordering",
        "",
        "```meta",
        "status: draft",
        "type: domain",
        "```",
        "",
        "## Order",
        "",
        "```meta",
        "status: ready",
        "type: aggregate",
        "```",
        "",
    ].join("\n");
    same(errorsFor(".domain/ordering/domain.md", modelDoc), [], "`status: ready` is clean where the rules allow it");

    const namingDoc = ["# Naming", "", "```meta", "status: draft", "type: naming", "```", ""].join("\n");
    check(
        errorsFor(".domain/ordering/naming.md", namingDoc).some((m) => m.includes("does not use")),
        "a status on a no-status file is an error",
        `got ${JSON.stringify(errorsFor(".domain/ordering/naming.md", namingDoc))}`
    );

    // An empty ladder switches off `status`, not the block itself: a `.domain`
    // file-level block still carries the required `type`.
    const noStatusDoc = ["# Naming", "", "```meta", "type: naming", "```", ""].join("\n");
    same(errorsFor(".domain/ordering/naming.md", noStatusDoc), [], "a no-status file omits `status` and is clean");

    // --- The resting value and the configured ladder compose ----------------
    //
    // `restingStatusFor` makes `status` optional in `.domain`/`.arc42`/`.design`;
    // the config decides which values a given block may carry. Where a
    // configured ladder drops `active`, the folder's resting value is not on
    // offer any more and `status` goes back to being required.
    const modelChapter = (status) =>
        [
            "# Ordering",
            "",
            "```meta",
            "type: domain",
            ...(status ? [`status: ${status}`] : []),
            "```",
            "",
            "## Order",
            "",
            "```meta",
            "type: aggregate",
            ...(status ? [`status: ${status}`] : []),
            "```",
            "",
        ].join("\n");

    const configuredIssues = (status) =>
        configured.validateDocument(".domain/ordering/domain.md", modelChapter(status));
    check(
        configuredIssues(null).some(
            (i) => i.severity === "error" && i.message.includes("missing required `status`")
        ),
        "a configured ladder without `active` makes `status` required again",
        JSON.stringify(configuredIssues(null).map((i) => i.message))
    );

    // Unconfigured, the built-in `.domain` ladder still carries `active`, so
    // omission means `active` and stating it is the thing worth reporting.
    const plainIssues = (status) => validateDocument(".domain/ordering/domain.md", modelChapter(status));
    same(plainIssues(null).map((i) => i.severity), [], "with no config, omitting `status` in .domain is clean");
    check(
        plainIssues("active").length > 0 &&
            plainIssues("active").every(
                (i) => i.severity === "warning" && i.message.includes("resting value")
            ),
        "with no config, stating the resting value warns",
        JSON.stringify(plainIssues("active").map((i) => i.message))
    );
} finally {
    rmSync(root, { recursive: true, force: true });
}

console.log(failed ? `\n${failed} case(s) failed.` : "\nAll cases passed.");
process.exit(failed ? 1 : 0);
