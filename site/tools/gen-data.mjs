// Generates src/data.json from the pack's own committed files:
// docs/01 to docs/06 and roi/roi-model.csv. The build fails on drift:
// if a headline figure, a document title, a diagram, or the Jev gate
// record in the sources stops matching what this page states, the
// build stops instead of publishing a stale dashboard.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const read = (p) => readFileSync(join(repo, p), "utf-8");

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const head = rows[0];
  return rows.slice(1).filter((r) => r.length > 1).map((r) =>
    Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

const csv = parseCsv(read("roi/roi-model.csv"));
const byId = Object.fromEntries(csv.map((r) => [r.id, r]));
const fail = (msg) => { throw new Error("gen-data drift check failed: " + msg); };

const inputs = csv.filter((r) => r.section === "input").map((r) => ({
  id: r.id, item: r.item, value: r.value, unit: r.unit,
  kind: r.class, source: r.source_or_basis, note: r.working,
}));
const computations = csv.filter((r) => r.section === "computation").map((r) => ({
  id: r.id, item: r.item, value: r.value, unit: r.unit, working: r.working,
}));
const sensitivity = csv.filter((r) => r.section === "sensitivity").map((r) => ({
  id: r.id, item: r.item, value: Number(r.value), working: r.working,
}));

if (byId.C11.value !== "172.7") fail("C11 year-1 ROI is not 172.7 in the CSV");
if (byId.C12.value !== "2.5") fail("C12 payback is not 2.5 in the CSV");
if (Number(byId.S4.value) !== -20) fail("S4 combined case is not -20 in the CSV");
if (byId.A1.value !== "12" || byId.A3.value !== "6") fail("fragile assumption base values moved");

const roiDoc = read("docs/05-roi-model.md");
if (!roiDoc.includes("172.7 percent")) fail("ROI doc no longer states 172.7 percent");
if (!roiDoc.includes("Minus 20 percent")) fail("ROI doc no longer states the combined case");

const jevRows = [...roiDoc.matchAll(/\| ([^|]+) \| (0\.\d+) \| (Clear|Review|Block) \|/g)]
  .map((m) => ({ statement: m[1].trim(), noul: Number(m[2]), route: m[3] }));
if (jevRows.length !== 5) fail("expected 5 Jev gate rows, found " + jevRows.length);
if (jevRows[0].noul !== 0.88 || jevRows[0].route !== "Clear") fail("Jev headline row moved");
if (jevRows.some((r) => r.route === "Block")) fail("a Jev statement is now blocked");

const docMeta = [
  ["docs/01-business-requirements.md", "Business requirements", "Problem, six stakeholders, scope with named exclusions, eight functional requirements tied to harness capabilities, and acceptance criteria tied to the harness metrics."],
  ["docs/02-process-map.md", "Process map", "The current manual workflow against the proposed gated one, step by step, with the failure each proposed step prevents and the source evidence for it."],
  ["docs/03-solution-architecture.md", "Solution architecture", "Components, data flow, four trust boundaries, deployment shape, and seven recorded decisions with their reasons."],
  ["docs/04-security-review.md", "Security review", "Six assets, eight system-specific threats with controls cited to the source repo, five residual risks with owners, and a plain statement that no penetration test was performed."],
  ["docs/05-roi-model.md", "ROI model", "The worked model below: every input labelled measured or assumption, the computation shown, and the sensitivity cases including the one that does not pay back."],
  ["docs/06-demo-script.md", "Demo script", "A timed 15 minute walkthrough on the real rag-eval-harness dashboard, with speaker notes and honest answers to the three hardest expected questions."],
];
const docs = docMeta.map(([path, name, summary]) => {
  const text = read(path);
  const title = text.split("\n")[0].replace(/^# /, "").trim();
  if (!title) fail(path + " has no title");
  return { path, name, title, summary };
});

const mermaidOf = (path) => {
  const m = read(path).match(/```mermaid\n([\s\S]*?)```/);
  if (!m) fail(path + " has no mermaid block");
  return m[1].trim();
};

const data = {
  inputs, computations, sensitivity, jevRows, docs,
  diagrams: {
    process: mermaidOf("docs/02-process-map.md"),
    architecture: mermaidOf("docs/03-solution-architecture.md"),
  },
  headline: { roi: 172.7, paybackMonths: 2.5, netBenefitCad: 11400, year1CostCad: 6600 },
  base: {
    cyclesPerYear: Number(byId.A1.value),
    answersPerCycle: Number(byId.A2.value),
    minutesPerReview: Number(byId.A3.value),
    rateCadPerHour: Number(byId.A4.value),
    flaggedShare: Number(byId.A5.value) / 100,
    supervisionHours: Number(byId.A5b.value),
    adoptionDays: Number(byId.A6.value),
  },
};
writeFileSync(join(here, "..", "src", "data.json"), JSON.stringify(data, null, 2));
console.log("data.json written from docs/ and roi/roi-model.csv; all drift checks passed");
