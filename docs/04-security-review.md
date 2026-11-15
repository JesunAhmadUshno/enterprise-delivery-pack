# Security review: RAG evaluation capability

Part of the enterprise delivery pack for
[rag-eval-harness](https://github.com/JesunAhmadUshno/rag-eval-harness).
Status: illustrative delivery document, 2026-11-15.

**Scope and method.** A design-level review of the evaluation harness
as it would be delivered into the pack's illustrative scenario (a
mid-size firm evaluating a customer-support RAG assistant). The
structure follows the OWASP testing habit of working from assets to
threats to controls. Every control claimed below exists in the source
repository and is cited to it. This is a design review of a specific
system, not a penetration test, and no test against a live deployment
was performed; there is no live deployment in the scenario.

## 1. Assets

| ID | Asset | Why it matters |
| --- | --- | --- |
| A1 | Golden sets and gold answers | They define what "correct" means; whoever shapes them shapes every release decision |
| A2 | The Firm's corpus snapshot (scenario) | Support content; may contain internal procedures and, in tickets, personal data |
| A3 | Result files | Release decisions are read from them; a silent change here is a silent change to what ships |
| A4 | The judge budget | Judge calls are a costed resource; unbounded judging is a cost and denial-of-wallet risk |
| A5 | The dashboard | The public and stakeholder-facing surface; wrong numbers here mislead decisions |
| A6 | The CI pipeline | It runs the gate; if the gate can be bypassed or its inputs swapped, the control is theatre |

## 2. Threats and controls

### T1. Teaching to the test (evaluation gaming from inside)

A team under release pressure tunes the pipeline to the golden set
instead of to answer quality. The source record names this risk
against itself: the synthetic Deep set's b11 cases were written after
the failure was seen, so its 32 of 32 is an in-distribution
confirmation, not a held-out result (REPORT.md, threats to validity).

Controls in the source system: synthetic and real results are
labelled and never mixed; hypotheses for the next experiment are to
be pre-registered in a dated, hashed document before the run
(REPORT.md, research review section 2). Residual control for the
Firm: hold out part of the Firm's golden set from the engineers who
tune the pipeline, and rotate in fresh support questions each quarter.
That rotation is a process control, not a code control.

### T2. Result tampering

An attacker, or a careless commit, changes a result file and a
regression ships as a pass.

Controls in the source system: reproduce.sh regenerates every scored
result from the committed evidence and fails on any byte change; CI
runs it on Python 3.11 and 3.12; results live in git, so changes carry
history and authorship. The dashboard build also fails unless its
JavaScript ports reproduce the Python results, so the published
numbers cannot silently diverge from the evidence.

### T3. Corpus poisoning and confident wrong answers

A wrong or malicious document enters the retrieval corpus. Because
the reference pipeline's answers are extractive, a poisoned passage
can be quoted verbatim and scored faithful: faithfulness is 1.000 by
construction on the real runs, which means the metric certifies
grounding in the corpus, not truth of the corpus (REPORT.md, threats
to validity).

Controls in the source system: none at the corpus layer; the harness
measures the pipeline, not corpus provenance. Required control for
the Firm (outside this delivery, named so it is not assumed): corpus
changes go through the same review as code changes, and the golden
set includes questions whose gold answers would change if a key
document were altered, so poisoning shows up as a failure-class
spike. Residual risk stays with the Firm.

### T4. Prompt injection through the measured system

In the scenario, the Firm's production assistant is generative and
will face injection through retrieved content. The harness's
reference pipeline is extractive, so this delivery does not test the
production assistant's injection resistance, and this review does not
claim it does. The source repo is explicit about the adjacent gap:
the hallucination label exists in the taxonomy, but faithfulness is
never exercised on real data because there is no generative answer
step yet; that step is an open backlog item with a stated cost (a
local model on a GPU or a paid API). Until it exists, injection and
hallucination testing of a generative assistant is out of scope and
must be covered by a separate control.

### T5. Metric gaming and metric invalidity

Answers can be shaped to score well on lexical overlap while being
wrong, and lexical metrics miss paraphrase, so good answers can score
badly. The source record measures the mismatch instead of hiding it:
on the 500-case SQuAD sample, sentence answers pass 22 of 500
lexically against 281 of 500 by the embedding judge (REPORT.md,
novelty table).

Controls in the source system: two independent scoring signals
(lexical metrics and the embedding judge) are reported side by side,
and judge agreement is calibrated against a gold-derived proxy
(agreement 0.902 on SQuAD span mode, Cohen's kappa 0.72; 0.925 and
0.73 on HotpotQA span mode). Named limit: the proxy is built from
gold strings and the same lexical metric, so the agreement figure is
partly circular, and no human labels exist. The specified fix is a
human labelling study (200 SQuAD and 200 HotpotQA answers, two
annotators, inter-annotator kappa reported); until it runs, no
release decision in the Firm's process may rest on the judge alone
(see docs/01-business-requirements.md, AC-2 and AC-5).

### T6. Judge cost exhaustion

A large golden set or a misconfigured sample rate turns judging into
an unbounded spend.

Controls in the source system: the BudgetedJudge enforces a hard call
cap that is never exceeded for any input, samples deterministically
(first byte of sha256 of the case id against the sample rate, so the
same cases are judged on every machine), and publishes its accounting
(calls made, calls skipped, total cost) beside the results. In the
modelled configuration the default judge is a local proxy at zero
per-call cost and the embedding judge runs on CPU with no API key, so
the exposure is bounded by design; the cap is what keeps it bounded
if an LLM judge is adopted later.

### T7. Supply chain

Controls in the source system: the core is Python standard library
only (source decision 0001), which removes most dependency risk. The
one external dependency is the model2vec package and a one-time
download of a public model (minishlab/potion-base-8M) for the
embedding judge. The test suite injects a fake embedder, so CI
downloads nothing. For the Firm: pin the package and record the model
revision, as with any dependency.

### T8. Data protection and licensing

Controls in the source system: the evaluation datasets are SQuAD and
HotpotQA samples under CC BY-SA 4.0, with the licence verified from
Hugging Face metadata on 2026-11-04 and recorded in
real-data/DATASETS.md. The harness stores no credential and needs
none to run (source SECURITY.md), and it runs offline. For the
scenario: the Firm's golden set is built from real support questions,
which can carry personal data; scrubbing it before use is the Firm's
control and open item OI-1 in the requirements document.

## 3. Residual risks

| ID | Residual risk | Severity | Owner | Position |
| --- | --- | --- | --- | --- |
| R1 | Golden-set overfitting over time (T1) | Medium | Firm, ML lead | Accepted with the holdout and rotation control; reviewed quarterly |
| R2 | Corpus poisoning is measured only indirectly (T3) | Medium | Firm, support operations | Accepted for this delivery; corpus change review is a separate control the Firm must run |
| R3 | Generative-assistant risks (injection, hallucination) are not tested by this delivery (T4) | High for a generative production assistant | Firm | Not accepted silently: named out of scope in the requirements document, to be covered when a generative answer step is evaluated |
| R4 | Personal data entering the golden set (T8) | Medium | Firm, risk and compliance | Controlled by scrubbing at golden-set build time (OI-1) |
| R5 | Judge scores treated as ground truth by a future reader (T5) | Medium | Delivery team | Controlled by reporting both scoring signals and the calibration caveat wherever judge numbers appear |

## 4. What this review did not do

No penetration test, no dependency audit beyond the standard-library
design and the one named dependency, and no review of the Firm's
production assistant, which is a different system from the one this
pack delivers.
