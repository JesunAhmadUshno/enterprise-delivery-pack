# ROI model: what the evaluation capability returns

Part of the enterprise delivery pack for
[rag-eval-harness](https://github.com/JesunAhmadUshno/rag-eval-harness).
Status: illustrative delivery document, 2026-11-15. The model as data:
[roi/roi-model.csv](../roi/roi-model.csv).

**Read this first.** The headline figure below is a model output
under stated assumptions, for the pack's illustrative scenario (a
mid-size firm rolling out a customer-support RAG assistant on a
monthly release cadence). It is not a realized saving, not a case
study, and not a promise. Every input is labelled **measured** (taken
from the source repository's record) or **assumption** (a planning
figure for the scenario, chosen by the author of this model). The
sensitivity section shows what the headline becomes when the two most
fragile assumptions move, including the case where the model does
not pay back.

## 1. What the model monetizes, and what it refuses to

The model monetizes one thing: reviewer time. In the manual baseline,
an engineer reads sampled answers one by one before every release.
With the harness, the machine scores every case, and the human reads
only the failures the harness flags, plus a fixed supervision
allowance.

The model refuses to monetize quality. There is no defect-escape
saving, no customer-satisfaction figure, and no revenue line, for a
reason that comes from the source record: the harness's flagship
improvement did not transfer to real data. On 500 SQuAD questions,
the gold answer reached the top passage in 315 cases without the
reranker and 319 with it (exact sign test p 0.67); the transfer
hypothesis is recorded as not supported (REPORT.md, H2). A model that
sold a quality saving on top of that record would be inventing the
benefit it claims to measure. Quality enters this pack as acceptance
criteria and gates (docs/01-business-requirements.md), not as money.

## 2. Inputs

Measured, from the source record:

| ID | Input | Value | Source |
| --- | --- | --- | --- |
| M1 | Machine time for a scored evaluation run | A few seconds on CPU | Source README: reproduce.sh reruns the scored sets in a few seconds. Machine time is not a cost driver and is excluded from the computation |
| M2 | Judge cash cost in the modelled configuration | CAD 0 per run | The default judge is a local lexical proxy at zero per-call cost; the embedding judge runs on CPU with no API key; judge calls are hard-capped (level-2-build/judge.py) |
| M3 | Gate separation on the source synthetic Deep set | 0.719 without rerank, 1.000 with, gate line 0.900 | REPORT.md, Deep run. Used qualitatively only: evidence the gate discriminates. Not a client outcome |
| M4 | Reranker transfer verdict | Not supported | REPORT.md, H2. The reason section 1 monetizes no quality benefit |

Assumptions, for the illustrative scenario:

| ID | Input | Value | Note |
| --- | --- | --- | --- |
| A1 | Evaluation cycles per year | 12 | Monthly release cadence. Fragile assumption 1 |
| A2 | Sampled answers reviewed per cycle, manual baseline | 200 | Planning figure for a monthly release |
| A3 | Manual review time per sampled answer | 6 minutes | Read the question, the passage, and the answer; check against the source. Fragile assumption 2 |
| A4 | Loaded cost of the reviewer | CAD 75 per hour | ML engineer or QA analyst, fully loaded. Also sets the adoption day rate |
| A5 | Share of the sample flagged for human review with the harness | 15 percent, plus 1 hour supervision per cycle | The source repo's real-data failure shares vary widely by metric and dataset, so no source figure is borrowed here |
| A6 | Adoption effort, one-time | 5 engineer-days | Build the Firm's golden set, wire the pipeline, set the gate (open item OI-1) |
| A7 | Cash cost per evaluation run | CAD 0 | CI minutes treated as negligible; the run itself is cash-free per M2. Kept as an explicit zero so the assumption is visible |

## 3. Computation

| Step | Working | Result |
| --- | --- | --- |
| Manual minutes per cycle | 200 answers x 6 min | 1,200 min = 20 h |
| Manual cost per cycle | 20 h x CAD 75 | CAD 1,500 |
| Manual baseline per year | CAD 1,500 x 12 cycles | CAD 18,000 |
| Harness review per cycle | 200 x 15 percent x 6 min = 3 h, plus 1 h supervision | 4 h |
| Harness cost per cycle | 4 h x CAD 75 | CAD 300 |
| Harness running cost per year | CAD 300 x 12 | CAD 3,600 |
| Adoption cost, one-time | 5 days x 8 h x CAD 75 | CAD 3,000 |
| Year-1 net benefit | CAD 18,000 - (3,600 + 3,000) | CAD 11,400 |
| **Year-1 ROI (model output)** | **11,400 / 6,600** | **172.7 percent, about 173 percent** |
| Payback on adoption cost | 3,000 / (1,500 - 300) per month | 2.5 months |

## 4. Sensitivity: the two fragile assumptions

A1 (cycles per year) and A3 (minutes per review) carry the result.
Both scale the manual baseline, which is where the money is.

| Case | Change | Year-1 ROI |
| --- | --- | --- |
| Base | A1 = 12, A3 = 6 min | 172.7 percent |
| S1 | A3 = 3 min | 71 percent (net CAD 3,750 on cost CAD 5,250) |
| S2 | A3 = 10 min | 257 percent (net CAD 21,600 on cost CAD 8,400) |
| S3 | A1 = 4 cycles | 43 percent (net CAD 1,800 on cost CAD 4,200) |
| S4 | A3 = 3 min and A1 = 4 cycles | **Minus 20 percent** (net minus CAD 750 on cost CAD 3,750) |

S4 is the honest edge of the model: a firm that releases four times a
year and reviews fast by hand does not recover the adoption cost in
year 1 on labour alone. In that case the case for the harness rests
on the non-monetized benefits (a gate that blocks regressions, a
recorded decision trail, failure classes counted instead of
anecdotes), and this document does not dress that up as a financial
return.

## 5. Claim gate record

The ROI and impact statements in this document went through the Jev
claim_check gate before the pack was finalized (2026-11-15, model
jev-1.13.0, one evaluation per statement, spec and result files held
in the programme's Jev record as edp-roi-claim1 to edp-roi-claim5).
Bands: clear at 0.85 or above, block at 0.10 or below, review between.

| Statement | Noul | Route |
| --- | --- | --- |
| Headline ROI and payback, as a labelled model output | 0.88 | Clear |
| Labour-only monetization, no quality benefit claimed | 0.51 | Review |
| Gate separates the two measured Deep configurations | 0.59 | Review |
| Zero marginal cash cost per run in the modelled configuration | 0.42 | Review |
| Sensitivity cases, including the negative combined case | 0.70 | Review |

No statement was blocked, so nothing was removed on gate grounds.
The four review routes are handled the way the source project handles
its own review-routed claims: each figure is printed with its inputs,
its labels, and its source, so a reader can recompute it. Input tokens
per evaluation: 782, 590, 580, 583, 795.
