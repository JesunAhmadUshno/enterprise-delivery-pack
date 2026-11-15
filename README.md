# enterprise-delivery-pack

An enterprise delivery pack for one real, public system:
[rag-eval-harness](https://github.com/JesunAhmadUshno/rag-eval-harness),
an evaluation harness for retrieval-augmented generation (RAG) systems,
with a live dashboard at
https://jesunahmadushno.github.io/rag-eval-harness/.

## Claims ceiling, stated first

This pack is an illustrative delivery pack built on a real system. It is
not a record of a real client engagement. The client in these documents
is one clearly labelled illustrative scenario: a mid-size firm (about
250 employees) rolling out a customer-support RAG assistant over its
help-centre and product-manual corpus. No real firm commissioned this
work, and no outcome is attributed to that scenario that was not
measured in the source repository.

## Contents

| Document | What it shows |
| --- | --- |
| [docs/01-business-requirements.md](docs/01-business-requirements.md) | Business Requirements Document: problem, stakeholders, scope, functional and non-functional requirements, acceptance criteria tied to the harness's own metrics |
| [docs/02-process-map.md](docs/02-process-map.md) | Process map: the current evaluation workflow against the proposed one, step tables and a Mermaid diagram |
| [docs/03-solution-architecture.md](docs/03-solution-architecture.md) | Solution architecture: components, data flow, trust boundaries, deployment shape, decisions with reasons |
| [docs/04-security-review.md](docs/04-security-review.md) | Security review: assets, threats, controls, residual risks, specific to this system |
| [docs/05-roi-model.md](docs/05-roi-model.md) | ROI model: a worked model whose inputs are each labelled measured or assumption, with a sensitivity note |
| [roi/roi-model.csv](roi/roi-model.csv) | The ROI model as data: inputs, the computation, and the sensitivity cases |
| [docs/06-demo-script.md](docs/06-demo-script.md) | Demo script: a timed 15-minute walkthrough on the real dashboard and repo, with speaker notes and the three hardest expected questions |

## Dashboard

A live dashboard for this pack is at
https://jesunahmadushno.github.io/enterprise-delivery-pack/.
It presents the six documents, renders the process map and the
solution architecture from the Mermaid sources in docs/02 and
docs/03, and shows the ROI model as data: every input labelled
measured or assumption, the computation, the sensitivity cases
including the combined unfavourable case, and an explorer that
recomputes the ROI from the CSV inputs when the two fragile
assumptions (A1 and A3) move. The page data is generated at build
time from the pack files by site/tools/gen-data.mjs, and the build
fails if the sources drift from what the page states.

## How the pack was grounded

Every technical and performance claim in these documents traces to a
number or a fact in the source repository. The grounding pass read, at
source main commit c304fe9 on 2026-11-15:

- `README.md`: the research question, the headline result, and the
  reproduction contract.
- `REPORT.md`: every measured run, the scored hypotheses, the misses,
  the threats to validity, the judge calibration record, and the
  decision history.
- `SECURITY.md` and `docs/decisions/` in the source repo: the security
  posture and the recorded architecture decisions.
- The live dashboard, which is built from the source repo's result
  files and fails its build unless its browser code reproduces them.

The rules applied while writing:

- If a needed figure does not exist in the source repo, the document
  says so and treats the figure as a labelled assumption or an open
  item. Nothing is borrowed silently.
- The source repo's own negative results and limits are carried into
  this pack, not edited out. Two examples: the reranker's synthetic
  gain did not transfer to real data (REPORT.md hypothesis H2, not
  supported), and faithfulness on the real runs is 1.000 by
  construction because the answers are extractive.
- The origin claim attached to the source project (a private pipeline
  said to have gone from a 72.7 percent pass rate to 95 percent or
  more) is self-reported, has no evidence in the source repo, and is
  used nowhere in this pack as evidence.
- The ROI headline is a model output under stated assumptions, never a
  realized saving. The ROI and impact statements went through the Jev
  claim_check gate before this pack was finalized; the outcome is
  recorded in docs/05-roi-model.md.

## License

Apache-2.0 (see LICENSE), matching the source repository's code
license.
