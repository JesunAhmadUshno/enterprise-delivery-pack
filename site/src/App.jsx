import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import data from "./data.json";

const REPO = "https://github.com/JesunAhmadUshno/enterprise-delivery-pack";
const SOURCE = "https://github.com/JesunAhmadUshno/rag-eval-harness";

mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });

function Diagram({ id, source, label }) {
  const ref = useRef(null);
  useEffect(() => {
    let live = true;
    mermaid.render(id, source).then(({ svg }) => {
      if (live && ref.current) ref.current.innerHTML = svg;
    }).catch(() => {
      if (ref.current) ref.current.textContent = "Diagram source is in the linked document.";
    });
    return () => { live = false; };
  }, [id, source]);
  return <div className="diagram" role="img" aria-label={label} ref={ref} />;
}

function computeRoi(cycles, minutes) {
  const b = data.base;
  const manualPerCycle = (b.answersPerCycle * minutes / 60) * b.rateCadPerHour;
  const harnessHours = (b.answersPerCycle * b.flaggedShare * minutes / 60) + b.supervisionHours;
  const harnessPerCycle = harnessHours * b.rateCadPerHour;
  const baselineYear = manualPerCycle * cycles;
  const runningYear = harnessPerCycle * cycles;
  const adoption = b.adoptionDays * 8 * b.rateCadPerHour;
  const cost = runningYear + adoption;
  const net = baselineYear - cost;
  const monthlySaving = manualPerCycle - harnessPerCycle;
  return {
    roi: cost > 0 ? (net / cost) * 100 : 0,
    net,
    cost,
    payback: monthlySaving > 0 ? adoption / monthlySaving : Infinity,
  };
}

function Explorer() {
  const [cycles, setCycles] = useState(data.base.cyclesPerYear);
  const [minutes, setMinutes] = useState(data.base.minutesPerReview);
  const r = computeRoi(cycles, minutes);
  const base = computeRoi(data.base.cyclesPerYear, data.base.minutesPerReview);
  const atBase = cycles === data.base.cyclesPerYear && minutes === data.base.minutesPerReview;
  return (
    <div className="explorer">
      <div className="controls">
        <label>
          Evaluation cycles per year (assumption A1)
          <input type="range" min="1" max="24" step="1" value={cycles}
            onChange={(e) => setCycles(Number(e.target.value))} />
          <span className="fig">{cycles} cycles</span>
        </label>
        <label>
          Manual review minutes per answer (assumption A3)
          <input type="range" min="1" max="12" step="0.5" value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))} />
          <span className="fig">{minutes} minutes</span>
        </label>
        <button type="button" className="btn btn-card" onClick={() => {
          setCycles(data.base.cyclesPerYear); setMinutes(data.base.minutesPerReview);
        }}>Reset to the base case</button>
      </div>
      <div className="explorer-out" aria-live="polite">
        <p className="bigfig">{r.roi.toFixed(1)} percent</p>
        <p>Year-1 ROI at these settings, recomputed in your browser from the CSV inputs. Net benefit CAD {Math.round(r.net).toLocaleString("en-CA")} on year-1 cost CAD {Math.round(r.cost).toLocaleString("en-CA")}. Payback {Number.isFinite(r.payback) ? r.payback.toFixed(1) + " months" : "none in year 1 at these settings"}.</p>
        <p>{atBase
          ? "These are the base settings, so this matches the published headline."
          : "The published headline at the base settings is " + base.roi.toFixed(1) + " percent. Moving A1 or A3 is exactly what the sensitivity table below records."}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <main>
      <header className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Enterprise delivery pack</h1>
            <p className="lead">Six delivery documents for rag-eval-harness, plus a labelled, testable ROI model.</p>
            <p className="actions">
              <a className="btn btn-ink" href={REPO}>Read the pack on GitHub</a>
              <a className="btn btn-card" href="#roi">See the ROI model</a>
            </p>
          </div>
          <div className="hero-note">
            <p className="note-title">Illustrative scenario, stated plainly</p>
            <p>The client in this pack is an illustrative scenario: a mid-size firm rolling out a customer-support RAG assistant. No real firm commissioned this work. The system, its measurements, and its negative results are real and public in the source repository.</p>
            <p><a href={SOURCE}>Source system: rag-eval-harness</a></p>
          </div>
        </div>
      </header>

      <section className="container section">
        <h2>The six documents</h2>
        <div className="doc-grid">
          {data.docs.map((d) => (
            <article className="doc" key={d.path}>
              <h3>{d.name}</h3>
              <p>{d.summary}</p>
              <p><a href={REPO + "/blob/main/" + d.path}>Open {d.path}</a></p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2>Diagrams from the pack</h2>
        <p className="section-lead">Both diagrams are rendered here from the Mermaid sources committed in the pack documents, so the page cannot drift from the documents.</p>
        <h3>Process map: current workflow against proposed workflow</h3>
        <Diagram id="diagram-process" source={data.diagrams.process} label="Process map diagram from docs 02, current workflow against proposed workflow" />
        <h3>Solution architecture: data flow</h3>
        <Diagram id="diagram-arch" source={data.diagrams.architecture} label="Solution architecture data flow diagram from docs 03" />
      </section>

      <section className="container section" id="roi">
        <h2>The ROI model</h2>
        <p className="section-lead">Headline, as a model output under the stated assumptions: year-1 ROI of {data.headline.roi} percent with a {data.headline.paybackMonths} month payback. It monetizes reviewer time only. No quality benefit is monetized, because the source record shows the flagship improvement did not transfer to real data.</p>
        <h3>Try the two fragile assumptions</h3>
        <Explorer />
        <h3>Inputs, labelled as the source labels them</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>id</th><th>input</th><th>value</th><th>class</th><th>source or basis</th></tr></thead>
            <tbody>
              {data.inputs.map((r) => (
                <tr key={r.id}><td className="fig">{r.id}</td><td>{r.item}</td><td className="fig">{r.value} {r.unit}</td><td>{r.kind}</td><td>{r.source}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>Computation</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>id</th><th>step</th><th>result</th><th>working</th></tr></thead>
            <tbody>
              {data.computations.map((r) => (
                <tr key={r.id}><td className="fig">{r.id}</td><td>{r.item}</td><td className="fig">{r.value} {r.unit}</td><td>{r.working}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>Sensitivity cases from the model</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>case</th><th>change</th><th>year-1 ROI</th></tr></thead>
            <tbody>
              {data.sensitivity.map((r) => (
                <tr key={r.id} className={r.value < 0 ? "neg" : undefined}><td className="fig">{r.id}</td><td>{r.item}</td><td className="fig">{r.value} percent</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>The combined unfavourable case (S4) is minus 20 percent: at four cycles a year and three minutes per manual review, the model does not pay back in year 1 on labour alone. It is part of the model, printed here at the same size as the headline.</p>
      </section>

      <section className="container section">
        <h2>Claim gate record</h2>
        <p className="section-lead">The ROI and impact statements passed through the Jev claim_check gate before the pack was finalized (model jev-1.13.0, 2026-11-15). Bands: clear at 0.85 or above, block at 0.10 or below, review between.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>statement</th><th>noul</th><th>route</th></tr></thead>
            <tbody>
              {data.jevRows.map((r) => (
                <tr key={r.statement}><td>{r.statement}</td><td className="fig">{r.noul.toFixed(2)}</td><td>{r.route}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>No statement was blocked. The four review routes are handled by printing every figure with its inputs, labels, and source, so a reader can recompute it.</p>
      </section>

      <footer className="footer">
        <div className="container">
          <p>Enterprise delivery pack for rag-eval-harness. Every number on this page is generated at build time from the pack files in the repository, and the build fails if the sources drift. The ROI headline is a model output under stated assumptions, not a realized saving.</p>
          <p><a href={REPO}>Repository</a></p>
          <p className="support-links">
            <a className="support-pill" href="https://github.com/sponsors/JesunAhmadUshno">Sponsor this work</a>
            <a className="support-pill" href="https://github.com/sponsors/JesunAhmadUshno">Donate</a>
            <a className="support-pill" href="https://buymeacoffee.com/jesun">Buy Me a Coffee</a>
            <a className="support-pill" href="https://calendly.com/jesunahmadushno/30min">Work with me</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
