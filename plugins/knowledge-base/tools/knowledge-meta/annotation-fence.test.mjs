// Exercises the guarantee `knowledge-annotations.instructions.md` rests on: an
// `annotation` fence is INERT to this tooling. Nothing here parses annotations —
// that is deliberately deferred — so what has to hold is that a fence never
// becomes a `meta` block, never leaks into `summary`, never counts as a diagram,
// and never trips the escape lint. If any of these break, fences written under
// the convention start corrupting derived indexes.
import {
    documentDigest,
    escapeSequenceIssues,
    parseDocument,
    validateDocument,
} from "./metadata.mjs";

let failed = 0;
const check = (ok, name, detail) => {
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : `\n        ${detail}`}`);
};
const F = "```";

// A chapter in the shape the convention prescribes: `meta` first, then prose,
// then an `annotation` fence against the block it is about.
const annotated = [
    "# Ordering",
    "",
    `${F}meta`,
    "status: draft",
    "type: domain",
    `${F}`,
    "",
    "The ordering context owns the order lifecycle.",
    "",
    "## Order",
    "",
    `${F}meta`,
    "status: draft",
    "type: aggregate",
    `${F}`,
    "",
    "An order is confirmed once, and only with at least one line.",
    "",
    `${F}annotation`,
    "kind: question",
    "status: open",
    "author: claude/to-spec-aggregate",
    "date: 2026-09-03",
    "quote: only with at least one line",
    "body: |",
    "  **Q2** — Is this an invariant of the aggregate, or a rule of the registration?",
    "",
    "  **In code today:** the guard lives in `ConfirmOrder.Handler`, not in `Order`.",
    "  A literal \\n here must not trip the escape lint, and neither must this",
    "  ## indented heading-looking line.",
    `${F}`,
    "",
].join("\n");

const { fileTitle, fileMeta, chapters } = parseDocument(annotated);

check(fileTitle === "Ordering", "the file title is read past the annotation", `got ${fileTitle}`);
check(fileMeta?.type === "domain", "the file-level `meta` block still parses", JSON.stringify(fileMeta));

const headings = chapters.map((c) => `${"#".repeat(c.level)} ${c.text}`);
check(
    JSON.stringify(headings) === JSON.stringify(["# Ordering", "## Order"]),
    "a fence adds no phantom chapter",
    `got ${JSON.stringify(headings)}`
);

const order = chapters.find((c) => c.text === "Order");
check(order?.meta?.type === "aggregate", "the chapter's own `meta` block still parses", JSON.stringify(order?.meta));
check(
    order?.meta?.kind === undefined && order?.meta?.author === undefined,
    "no annotation field leaks into the chapter's `meta`",
    JSON.stringify(order?.meta)
);

// `status` inside a fence is the note's, not the chapter's, so it must never be
// offered to the folder's status ladder. `open` is on no ladder — were the fence
// read as a metadata block, this document would fail validation.
const errors = validateDocument(".domain/ordering/domain.md", annotated).filter(
    (i) => i.severity === "error"
);
check(errors.length === 0, "an annotated chapter validates clean", JSON.stringify(errors.map((i) => i.message)));

const digest = documentDigest(annotated);
check(
    digest.summary === "The ordering context owns the order lifecycle.",
    "the summary comes from the lede, not the fence body",
    `got ${JSON.stringify(digest.summary)}`
);
check(digest.diagrams === 0, "a fence is not counted as a diagram", `got ${digest.diagrams}`);

check(
    escapeSequenceIssues(annotated).length === 0,
    "an escape sequence inside a fence is not flagged",
    JSON.stringify(escapeSequenceIssues(annotated).map((i) => i.message))
);

// The convention puts the fence *after* the `meta` block. Getting that backwards
// is caught, because the look-ahead for `meta` finds the annotation instead.
const misplaced = [
    "# Ordering",
    "",
    `${F}annotation`,
    "kind: comment",
    "author: someone",
    "date: 2026-09-03",
    "body: Placed before the meta block, which the convention forbids.",
    `${F}`,
    "",
    `${F}meta`,
    "status: draft",
    "type: domain",
    `${F}`,
    "",
].join("\n");

check(
    validateDocument(".domain/ordering/domain.md", misplaced).some((i) =>
        i.message.includes("missing its `meta` block")
    ),
    "a fence displacing the `meta` block is reported",
    JSON.stringify(validateDocument(".domain/ordering/domain.md", misplaced).map((i) => i.message))
);

console.log(failed ? `\n${failed} case(s) failed.` : "\nAll cases passed.");
process.exit(failed ? 1 : 0);
