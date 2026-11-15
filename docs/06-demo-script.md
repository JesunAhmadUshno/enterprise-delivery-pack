# Demo script: rag-eval-harness, 15 minutes

Part of the enterprise delivery pack for
[rag-eval-harness](https://github.com/JesunAhmadUshno/rag-eval-harness).
Status: illustrative delivery document, 2026-11-15.

**Setting.** Live on the real dashboard
(https://jesunahmadushno.github.io/rag-eval-harness/) and the real
repository. Nothing in this script is a mock-up: every screen is the
shipped site or the shipped repo, and every number spoken is in
REPORT.md. Speaker notes are in italics under each segment. Total
running time: about 15 minutes.

## Segment 1. The problem, in one minute (0:00 to 1:30)

Say: "Every team shipping a RAG assistant faces the same release
question: did this change make the answers better or worse? Most
answer it by reading a few answers and shipping on judgement. This
harness is the alternative: score every case, label every failure,
gate the release, and keep the record."

*Speaker notes. Do not open with the origin story. If asked later:
the project began as the public version of a private pipeline said to
have improved from a 72.7 percent pass rate to 95 percent or more.
That claim is self-reported, has no evidence in the repo, and this
demo does not use it.*

## Segment 2. Watch a failure class, live (1:30 to 4:00)

Do: Open the dashboard playground. Run the Deep corpus with BM25
alone, then switch the reranker on. Point at the cases that flip.

Say: "The failure to watch is the quiet one: the right document is
retrieved, but the wrong passage sits on top, so the answer is built
from the wrong text. On the 32-case synthetic Deep set, the pipeline
passes 23 of 32 without the reranker and 32 of 32 with it. The class
behind most of that gap goes from 5 of 13 to 13 of 13."

*Speaker notes. Say "synthetic" out loud. This set was written for
the project, and part of it was written after the failure was seen.
The next segment is where the same fix meets data nobody wrote for
it. Do not let the room leave this segment believing 32 of 32 is a
real-world score.*

## Segment 3. The turn: the fix meets real data (4:00 to 6:30)

Do: Move to the recorded real runs. Show the SQuAD 500-case results:
gold answer in the top passage, 315 cases without the reranker, 319
with it.

Say: "On 500 real SQuAD questions, the same reranker moves the gold
answer into the top passage in four net cases: 26 helped, 22 hurt, an
exact sign test gives p 0.67. The flagship fix does not transfer, and
the dashboard shows that in the same place it shows the synthetic
win. A measurement tool you can trust is one that publishes its own
negative result."

*Speaker notes. This is the centre of the demo, not an embarrassment
to rush past. The harness's job is to catch exactly this: a change
that looks like a win on friendly data and is a coin flip on real
data. If the room asks why the reranker still ships: on the synthetic
set it is a real, gated improvement, and the transfer test with
candidate fixes is published, including that no candidate helped both
datasets, so no further change shipped (repo decision 0002).*

## Segment 4. The one real gain: the answer step (6:30 to 9:00)

Do: Show the sentence against span comparison on the same 500 SQuAD
cases, then open the per-case browser and filter to a few span-mode
passes.

Say: "The largest measured gain was not ranking. It was the answer
step. Cutting a span out of the top sentence, instead of returning
the whole sentence, takes lexical passes on SQuAD from 24 of 500 to
113 of 500, an exact McNemar test at p below 0.0001. That survives a
Bonferroni correction across the run's comparisons; the reranker
effects do not. The per-case browser is how a reviewer checks a claim
like that: 700 recorded real questions, all four variants, filterable
by dataset, answer mode, verdict, and failure label."

*Speaker notes. Have one concrete case ready to open. If the room
asks about HotpotQA: span passes go 1 to 7 of 200, and context recall
there is 0.518, which the report names as the binding constraint:
retrieval, not the answer step, is the ceiling on multi-hop
questions.*

## Segment 5. The gate and the budget (9:00 to 11:30)

Do: Show the regression gate in the repo (level-3-deep) and
reproduce.sh. Then the judge: the threshold calibrator on the
dashboard, and judge.py's budget controls in the repo.

Say: "Two controls make this safe to run on every release. First, a
regression gate at a 0.900 pass rate: on the Deep set it fails the
unreranked configuration at 0.719 and passes the reranked one at
1.000, and reproduce.sh regenerates every scored result and fails CI
on any byte of drift. Second, judging is budgeted: a hard call cap
that the code never exceeds, deterministic sampling, and the cost
accounting printed beside the results. In the Build run that meant 10
judge calls under a cap of 10, with 10 cases recorded as skipped, not
silently dropped."

*Speaker notes. On calibration, be precise: agreement with a
gold-derived proxy is 0.902 on SQuAD span mode (kappa 0.72) and 0.925
on HotpotQA span mode (kappa 0.73), and the proxy is partly circular,
which the report says. The thresholds (0.30, 0.25) are checked
constants, not fitted values.*

## Segment 6. The limits, unprompted (11:30 to 13:00)

Do: Open the dashboard's limits view, or the threats section of
REPORT.md.

Say: "What this does not do. Faithfulness reads 1.000 on the real
runs by construction, because the answers are extractive, so the
hallucination check is not exercised on real data yet. The real runs
are samples, 500 of 10,570 SQuAD questions and 200 of 7,405 HotpotQA,
not the full splits. Retrieval is BM25 only; there is no dense
baseline. And there are no human labels behind the judge, so its
scores are relative signals. Each limit in the report names the exact
work that would close it."

*Speaker notes. Volunteering the limits before questions is the
credibility move. Every item here is printed in the source repo; you
are reading its record, not confessing.*

## Segment 7. Close: what adoption looks like (13:00 to 15:00)

Say: "Adoption is a golden set built from your own support questions,
your pipeline wired in, and the gate set, costed in our model at five
engineer-days. The model's headline, with its assumptions printed, is
a year-1 ROI of about 173 percent on reviewer time alone, paying back
in about two and a half months, and the same model printed honestly
goes negative if you release four times a year and review fast by
hand. We would rather show you both numbers than sell you the first
one."

*Speaker notes. If the room wants the model, walk docs/05-roi-model.md
and roi/roi-model.csv. Every input there is labelled measured or
assumption. Do not quote the 173 percent without the words "model
output under stated assumptions" attached.*

## The three hardest questions, with honest answers

**Q1. "Your headline fix failed on real data. Why should we trust
this harness with our releases?"**

A: Because catching that failure is the product. The reranker looked
like a clean win on the synthetic set, 23 of 32 to 32 of 32. The
harness then ran it on 700 real questions, with paired statistics,
and published the negative result in its own README: no detectable
transfer, sign test p 0.67. A tool that hides that result would be
the one to distrust. The gate, the taxonomy, and the per-case record
are what keep a coin-flip change from shipping as an improvement.

**Q2. "Faithfulness is 1.000 by construction. Is your hallucination
metric meaningless?"**

A: On the current real runs, it is unexercised, and the report says
so in those words. The reference pipeline answers extractively, with
a sentence or a span from the retrieved text, so there is nothing
unsupported for the metric to catch. The metric becomes meaningful
when a generative answer step is evaluated, which is a named backlog
item with a stated cost: a local model on a GPU or a paid API, run
over the 700 real questions in both rerank settings. Until then, any
vendor who quotes you a hallucination score from an extractive
pipeline is quoting a construction artifact, including us if we did.

**Q3. "Your judge has never been checked against human labels. Why
believe any of its scores?"**

A: You should believe them as relative signals, not as ground truth,
and the record supports exactly that much. Agreement is measured
against a proxy built from gold answers: 0.902 agreement and kappa
0.72 on SQuAD span mode, 0.925 and 0.73 on HotpotQA span mode. The
proxy is built partly from the same lexical metric, so the agreement
figure is partly circular; the report states that too. The human
study that would settle it is specified and costed in the report: 200
SQuAD and 200 HotpotQA answers, two annotators, inter-annotator kappa
reported. It has not been done, and this demo does not pretend
otherwise.
