# Business Requirements Document: RAG evaluation capability

Part of the enterprise delivery pack for
[rag-eval-harness](https://github.com/JesunAhmadUshno/rag-eval-harness).
Status: illustrative delivery document, 2026-11-15.

**Client scenario (illustrative).** A mid-size firm, about 250
employees, is rolling out a customer-support RAG assistant over its
help-centre and product-manual corpus. The scenario is illustrative:
no real firm commissioned this document. The system being delivered,
the evaluation harness, is real and public, and every capability and
metric named below is taken from its repository (README.md and
REPORT.md, main commit c304fe9).

## 1. Problem

The Firm's support assistant answers agent and customer questions from
a document corpus. The retrieval index, the prompts, and the corpus
itself change on a monthly release cadence. Today there is no
trustworthy way to answer the release question: did this change make
the answers better or worse?

The current practice is manual spot-checking: an engineer reads a
handful of answers and ships on judgement. Spot-checking has three
known blind spots, each visible in the source system's published
record:

- It cannot see failure classes. In the source system's Deep set, one
  failure class (right document retrieved, wrong passage on top,
  labelled b11 in the source repo) accounted for 13 of 32 cases. A
  spot check reads answers one at a time and never counts a class.
- It produces no record. There is nothing to compare the next release
  against, so regressions are found by support agents and customers.
- It does not scale with the corpus. The source system's real-data
  runs score 500 and 200 cases per run automatically; no manual
  process reviews at that volume every release.

The business need is an evaluation capability: a repeatable,
recorded, gated measurement of answer quality that runs on every
release candidate, names its failures by class, and blocks a release
that regresses.

## 2. Stakeholders

| Stakeholder | Interest | What they need from this capability |
| --- | --- | --- |
| Support operations lead | Answer quality as experienced by agents and customers | A release decision they can defend, with failures named in plain language |
| ML engineer (assistant owner) | Fast, specific feedback on a change | Per-case results and failure labels, not one aggregate score |
| QA and reliability | No silent regressions | A gate that fails the release on measured regression, with the run recorded |
| Risk and compliance | No unsupported claims made to customers; data handled lawfully | Evidence that quality claims come from measured runs; dataset and corpus licensing in order |
| Support agents (end users of the assistant) | Answers they can trust or escalate | A known, measured error profile instead of anecdote |
| Delivery team | A scope that can actually be shipped | Requirements tied to capabilities that already exist and are measured |

## 3. Scope

In scope:

- Offline evaluation of the assistant's retrieval and answer pipeline
  against a golden set built from real support questions.
- Scoring on the harness's three lexical metrics (faithfulness,
  context recall, answer relevance), a budgeted judge layer, and a
  CPU embedding judge.
- Failure classification on every scored case, using the harness's
  taxonomy.
- A CI regression gate on the golden set, with every run recorded as
  committed result files.
- A results dashboard for review, with per-case drill-down.

Out of scope, named so nobody assumes otherwise:

- The assistant itself. This delivery is the measurement system, not
  the product being measured.
- Live-traffic experiments (A/B tests on real users). The harness is
  an offline evaluator.
- An LLM judge. The source repo lists it as an open backlog item that
  needs a credential decision; the shipped judges are a local lexical
  proxy and a CPU embedding judge.
- A human labelling study. The source repo specifies one (human
  correctness labels on a stratified sample, two annotators) and
  records that it has not been done. Judge agreement figures in the
  source record are against a gold-derived proxy and are partly
  circular; this document does not present them as human agreement.

## 4. Functional requirements

Each requirement names the source capability that satisfies it, so
every line can be checked in the source repository.

| ID | Requirement | Source capability (rag-eval-harness) |
| --- | --- | --- |
| FR-1 | Score a fixed golden set on faithfulness, context recall, and answer relevance, with published pass lines | Level 1 lexical evaluator; pass lines 0.8, 0.8, 0.5 (REPORT.md, Method) |
| FR-2 | Label every failing case with a failure class | Taxonomy: hallucination, retrieval_miss, wrong_or_incomplete_answer |
| FR-3 | Compare a candidate change against the current pipeline on the same cases, per case, not only in aggregate | Paired runs with per-case flags; the source record reports paired statistics (Wilson intervals, exact McNemar tests) |
| FR-4 | Bound the cost of judge scoring per run | BudgetedJudge: a hard call cap that is never exceeded, deterministic sampling by case id hash, and public cost accounting (calls made, calls skipped, total cost) |
| FR-5 | Provide a second, independent scoring signal beside the lexical metrics | Embedding judge over minishlab/potion-base-8M, running on CPU with no API key; thresholds similarity 0.30, support 0.25 |
| FR-6 | Block a release candidate that regresses below a set quality line | CI regression gate at a 0.900 pass-rate threshold on the regression set |
| FR-7 | Make every run reproducible and auditable | reproduce.sh regenerates the scored results from committed evidence and fails on any byte drift; CI runs it on Python 3.11 and 3.12 |
| FR-8 | Present results for non-engineering review, with per-case drill-down | Live dashboard built from the result files; per-case browser over the recorded real runs |

## 5. Non-functional requirements

| ID | Requirement | Basis |
| --- | --- | --- |
| NFR-1 | Evaluation runs on commodity CPU, with no paid API dependency in the default configuration | Source system: Python standard library; the scored sets rerun in a few seconds on CPU; the embedding judge is a local model |
| NFR-2 | Judge spend per run is capped and accounted, never open-ended | FR-4; in the source record, runs made 10 judge calls under a cap of 10 and 15 calls in the Deep run |
| NFR-3 | Results are files in version control, so any historical release decision can be re-derived | Source decision 0003: result files sit beside the scripts that write them |
| NFR-4 | Data used for evaluation carries a verified licence | Source record: SQuAD and HotpotQA samples are CC BY-SA 4.0, verified from Hugging Face metadata on 2026-11-04 |
| NFR-5 | The evaluation path stores no credentials | Source SECURITY.md: no credential is stored in the repository and none is needed to run it |

## 6. Acceptance criteria

Acceptance is decided on the harness's own metrics, measured on the
Firm's golden set once it exists (see open items). The criteria below
state the test and the line. The source system's published runs are
quoted to show each test is real and discriminating; they are not
acceptance evidence for the Firm's assistant, and AC-5 says why.

- AC-1 (gate discriminates). The regression gate must separate a
  known-good configuration from a known-bad one. Source evidence: on
  the synthetic Deep set, the pipeline without the reranker passes 23
  of 32 cases (0.719, below the 0.900 line, gate fails it) and with
  the reranker passes 32 of 32 (1.000, gate passes). For the Firm:
  the same test is run with one deliberately degraded configuration
  before go-live.
- AC-2 (failure classes reported). Every evaluation run delivered to
  the release decision includes counts by failure label, not only a
  pass rate. Source evidence: the Deep record reports the b11 class
  separately (5 of 13 passed without rerank, 13 of 13 with).
- AC-3 (judge budget held). No run exceeds its configured judge call
  cap, and the run record shows calls made, calls skipped, and total
  cost. Source evidence: 10 calls made under a cap of 10 in the Build
  run; the cap is enforced in code, not by convention.
- AC-4 (reproducibility). Re-running the evaluation from the
  committed evidence reproduces the recorded results exactly; the
  delivery is rejected if the reproduction check drifts. Source
  evidence: reproduce.sh and CI on Python 3.11 and 3.12.
- AC-5 (no borrowed quality claims). No quality claim for the Firm's
  assistant may cite the source system's synthetic results. Source
  evidence for the rule: the reranker's synthetic gain did not
  transfer to real data (hypothesis H2, not supported: on 500 SQuAD
  questions the gold answer reached the top passage in 315 cases
  without the reranker and 319 with it, exact sign test p 0.67).
  Claims for the Firm come only from runs on the Firm's own golden
  set and corpus.

## 7. Assumptions and open items

- Open item OI-1: the Firm's golden set does not exist yet. Building
  it (real support questions with gold answers, scrubbed of personal
  data) is the first delivery task and is costed as adoption effort
  in the ROI model (docs/05-roi-model.md, assumption A6).
- Open item OI-2: no human labels exist for judge validation. The
  source repo specifies the study and its size; until it runs, judge
  scores are treated as relative signals (see docs/04-security-review.md,
  threat T5).
- Assumption AS-1: a monthly release cadence for the assistant. Used
  by the ROI model as assumption A1 and labelled there.
- Assumption AS-2: the Firm's pipeline can be run offline against a
  fixed corpus snapshot, which is how the harness evaluates. A
  pipeline that only exists as a hosted API would need an adapter;
  that work is not in this scope.
