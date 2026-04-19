# Modernizing the skore ⇄ MLflow integration demo

**Delivery report — 2026-04-19**
Repo: [`slevin48/mlflow`](https://github.com/slevin48/mlflow)

---

## 1. Context

`slevin48/mlflow` is a public demo repository that wires [skore](https://github.com/probabl-ai/skore)'s cross-validation reports to an MLflow tracking backend. Its editorial point of view is a simple pair:

> **MLflow is where models land for operations.**
> **skore is how a data scientist decides what deserves to land.**

At the start of this engagement, the repo consisted of a single Iris script, an install path pinned to a pre-release skore branch, Windows-absolute paths throughout, and a large `ux-campaign/` directory of prior UX exploration. It was technically out of date (skore 0.15 had since shipped `skore[mlflow]` to PyPI) and editorially unfocused.

## 2. Starting state

| Area | State before |
|---|---|
| Install | `GIT_LFS_SKIP_SMUDGE=1 uv pip install "git+https://github.com/probabl-ai/skore.git@mlflow-proj-example#subdirectory=skore"` and a sibling subpackage install |
| Run command | `D:/devel/mlflow/.venv/Scripts/python.exe plot_mlflow_backend.py` |
| Demo surface | 1 script: `plot_mlflow_backend.py` (Iris + `HistGradientBoostingClassifier`) |
| Python packaging | no `pyproject.toml`, no `uv.lock` |
| Unrelated content | `ux-campaign/` (106 files, ~9 MB of UX test screenshots/videos/scripts) mixed into `main` |
| CI | none |
| Visuals | none |
| `.gitignore` | single entry `/.venv` |

## 3. Goal

1. Catch the demo up to released skore (`skore[mlflow]>=0.15`) with cross-platform commands.
2. Expand the single Iris example into a small portfolio of demos that expose skore's methodological depth (model comparison, shift-left CV, time-series, preprocessing, audit readiness).
3. Quarantine the UX exploration content so the repo is tightly scoped to the demo.
4. Wire up CI and visuals so the cross-platform claim is backed by evidence.
5. Do all of the above without firm/partner/customer names and without Windows-specific paths — this is a public repo.

## 4. Approach

The work was split into two phases and four implementation waves.

### Phase 1 — plan and file

One epic issue (`#2`) was filed with twelve child issues (`#3` through `#14`) covering install, the five new examples, the `ux-campaign/` quarantine, the CI workflow, the screenshots refresh, and two small documentation notes. A dependency graph was established so waves could be executed in parallel where safe:

```
Wave 1 (sequential, 1 agent)          — #3, #4
     │
     ▼
Wave 2 (parallel, 5 agents)           — #5, #6, #7, #8, #9
Wave 3 (parallel, 2 agents)           — #10, #13
     │
     ▼
Wave 4 (parallel, 3 agents)           — #11, #12, #14
```

Each GitHub issue carried labels (`epic`, `documentation`, `chore`, `enhancement`, `demo`, `ci`, `regulated-industries`), an explicit scope, a concrete changelist, and acceptance criteria. The epic issue body tracks children as a checklist so completion is visible at a glance.

### Phase 2 — implement in isolated worktrees

Eleven agents were dispatched to implement the twelve issues (issues `#3` and `#4` were bundled into one PR because they touched overlapping root files). Each non-foreground agent ran in an **isolated git worktree**, so the parallel agents could run `uv sync`, execute scripts, and write to `mlflow.db` without stepping on each other. Branch naming followed `feat/issue-N-<slug>`; PR bodies include `Closes #N` per issue so merges auto-close.

All merges were squash-merges for a linear main history.

## 5. Results

### 5.1 Issues and PRs

| Wave | PR | Title | Closes |
|---|---|---|---|
| 1 | [#15](https://github.com/slevin48/mlflow/pull/15) | modernize install and main script to released skore API | #3, #4 |
| 2 | [#18](https://github.com/slevin48/mlflow/pull/18) | add skrub + skore + MLflow integration demo | #8 |
| 2 | [#19](https://github.com/slevin48/mlflow/pull/19) | add shift-left methodology vignette | #6 |
| 2 | [#20](https://github.com/slevin48/mlflow/pull/20) | add time-series forecasting demo with per-fold view | #7 |
| 2 | [#21](https://github.com/slevin48/mlflow/pull/21) | add model bake-off example | #5 |
| 2 | [#22](https://github.com/slevin48/mlflow/pull/22) | add audit-ready demo with model card export | #9 |
| 3 | [#16](https://github.com/slevin48/mlflow/pull/16) | add pickle-free serialization roadmap note | #13 |
| 3 | [#17](https://github.com/slevin48/mlflow/pull/17) | archive ux-campaign/ to separate branch | #10 |
| 4 | [#23](https://github.com/slevin48/mlflow/pull/23) | add GitHub Actions CI | #11 |
| 4 | [#24](https://github.com/slevin48/mlflow/pull/24) | add notebook companion for bake-off demo | #14 |
| 4 | [#25](https://github.com/slevin48/mlflow/pull/25) | add MLflow UI + skore screenshots to README | #12 |

Total: **11 PRs, 12 issues closed**, epic `#2` closed with a DoD summary.

### 5.2 Definition of Done

- [x] Epic filed with all 12 children linked as a checklist.
- [x] 11 PRs opened and merged (issues #3 + #4 bundled).
- [x] `main` is a clean, self-contained, cross-platform demo.
- [x] `git clone && uv sync && uv run python plot_mlflow_backend.py` works without manual fixes.
- [x] Every `examples/*.py` is runnable the same way.
- [x] CI is **green on main** (6 / 6 jobs across `ubuntu-latest` / `macos-latest` / `windows-latest` × Python 3.11 / 3.12).
- [x] README carries three real screenshots (MLflow experiment view, MLflow run detail, skore ROC plot) and communicates the "one workflow, two lenses" story through code, not slogans.

### 5.3 What ships on `main`

```
.
├── .github/workflows/ci.yml         # 6-cell matrix CI (linux/macos/windows × 3.11/3.12)
├── .gitignore
├── CLAUDE.md                         # agent-facing project notes (updated)
├── README.md                         # user-facing, with screenshots
├── pyproject.toml                    # skore[mlflow]>=0.15, scikit-learn, pandas, mlflow>=3.10, skrub
├── uv.lock
├── plot_mlflow_backend.py            # main Iris/HGB demo, rewritten around evaluate()
├── examples/
│   ├── 01_bakeoff.py                 # 3-estimator comparison on Digits, stability-vs-mean punchline
│   ├── 01_bakeoff.ipynb              # executed notebook companion (outputs committed)
│   ├── 02_shift_left.py              # KFold-shuffled vs TimeSeriesSplit on drifted synthetic data
│   ├── 03_timeseries_regime.py       # TimeSeriesSplit + per-fold view on non-stationary series
│   ├── 04_skrub_integration.py       # skrub.tabular_pipeline + HGBR on fetch_employee_salaries
│   └── 05_audit_ready.py             # Adult Income + model card as MLflow artifact
└── docs/
    └── assets/
        ├── mlflow-bakeoff-experiment.png   # 3-run experiment view
        ├── mlflow-run-detail.png           # run detail with skore-logged metrics
        └── skore-fold-view.png             # skore ROC plot (per-class, 5-fold mean ± std)
```

Orphan branch `ux-campaign-archive` (parentless commit, pushed to `origin`) preserves the UX-exploration content byte-for-byte from `main@73a3839`. The README footer links to it.

### 5.4 Numbers at a glance

| Metric | Value |
|---|---|
| Wall-clock duration (Phase 1 + Phase 2) | ≈ 45 minutes |
| Agent dispatches | 11 (1 foreground, 10 isolated worktrees) |
| PRs opened | 11 |
| PRs merged | 11 |
| Lines of demo Python on main | ≈ 861 across 6 scripts |
| Lines in `uv.lock` | 2 836 |
| Notebook cells (executed) | 14 (7 markdown + 7 code) |
| Screenshots in `docs/assets/` | 3, total ≈ 408 KB (all under the 300 KB/image cap except `mlflow-run-detail.png` at 206 KB) |
| CI matrix cells | 6 (3 OS × 2 Python) |
| CI pass rate on PR branch | 12 / 12 (push + PR runs) |
| CI pass rate on main | 6 / 6 |
| `ux-campaign/` files removed from `main` | 105 |

## 6. Key technical decisions

1. **`skore.evaluate(est, X, y, splitter=5)` as the canonical entry point.** Replaces direct `CrossValidationReport(...)` construction. Returns `CrossValidationReport` / `EstimatorReport` / `ComparisonReport` depending on inputs; passing a list of estimators gives a `ComparisonReport` directly.
2. **`skrub.tabular_pipeline(estimator)` for messy tabular data.** Handles the Adult and `fetch_employee_salaries` schemas without manual imputation; the pipeline's step names surface as MLflow params.
3. **`TimeSeriesSplit` for temporally-ordered data.** Both the shift-left vignette and the time-series regime demo use it; per-fold metrics are logged to MLflow with step indices, retrievable via `mlflow.MlflowClient().get_metric_history(run_id, key)`.
4. **Model card as an MLflow artifact, not a repo file.** `examples/05_audit_ready.py` writes the markdown card to a `tempfile.TemporaryDirectory()` and logs it via `mlflow.log_artifact`, so the audit trail lives on the run — not on a laptop, not in git.
5. **Orphan archive branch created via git plumbing.** `git mktree` + `git commit-tree` produced a parentless commit containing only `ux-campaign/`. No working-tree gymnastics, no history loss.
6. **`uv.lock` committed.** Standard practice for an application-shaped repo; guarantees CI reproducibility.
7. **Squash merges.** Keeps `main` history linear and each commit maps 1:1 to a PR/issue pair.

## 7. Judgment calls worth knowing

1. **skore methodology warnings do not fire from `evaluate()` on `splitter=KFold(shuffle=True)` in skore 0.15.** The warning classes (`ShuffleTrueWarning`, `TimeBasedColumnWarning`, etc.) exist but only fire from `skore.train_test_split(...)`, and they are rendered as `rich` panels rather than Python `warnings.warn`. `examples/02_shift_left.py` still wraps the shuffled-KFold call in `warnings.catch_warnings(record=True)` as a good-faith attempt and, when nothing fires, surfaces the methodology contrast through the numeric gap (shuffled CV over-reports accuracy by 5.15 pts, std explodes from 0.034 to 0.162 under `TimeSeriesSplit`). This is explicitly documented in the PR body.
2. **Digits over Iris for the bake-off.** With sensible defaults, Iris collapses the stability-vs-mean story (RF wins on both metrics). Digits preserves the tradeoff (RF has the top mean, HGB has ~1.6× tighter per-fold spread) and is a zero-network sklearn built-in.
3. **Adult's `sex` column for per-group breakdown.** A real, existing demographic column — no synthetic sensitive features. The model card frames the output strictly as a demo and lists the dataset as unsuitable for any real decisioning.
4. **Screenshots via headless Playwright + matplotlib.** MLflow 3.11's default experiment URL lands on the GenAI "Overview" page; the capture script explicitly routes to `/#/experiments/{id}/runs` to get the training-runs view. The skore plot is rendered directly via `report.metrics.roc().plot()` rather than a browser capture.
5. **Mixed `push` + `pull_request` triggers in CI.** Produces duplicate runs for PRs but is the simplest configuration that guarantees both branch pushes and PR-only events (e.g., from forks) are covered.

## 8. Outstanding items

| Item | Impact | Fix |
|---|---|---|
| 10 agent worktrees under `.claude/worktrees/` are system-locked (≈ 5 GB on disk, mostly duplicated `.venv` directories) | disk only | `for wt in $(git worktree list --porcelain | awk '/^worktree / {print $2}' | grep .claude/worktrees); do git worktree remove -f -f "$wt"; done` when convenient |
| GitHub Actions emits a Node.js 20 deprecation warning against `actions/cache@v4`, `actions/checkout@v4`, `astral-sh/setup-uv@v6` | advisory only | upstream bumps land well before the Sep 2026 removal date |
| Pre-existing issue `#1` ("Research: Bridging the UX Gap") remains open | out of scope for this brief | left as-is; arguably can be closed and relinked from the `ux-campaign-archive` README |

## 9. Possible next steps

- When `skore` adopts skops or an equivalent non-pickle serializer, bump the roadmap note in `README.md` from forward-looking to shipped.
- Add a second time-series example using a real public dataset (airline passengers, electricity demand) once the synthetic version is stable.
- Publish the notebook companion via nbviewer or GitHub Pages so outputs are viewable without a local run.
- Add a `contrib/` entry documenting the epic + wave pattern for future multi-issue refactors.

---

*Report generated 2026-04-19. Artifacts at `docs/REPORT.md` (this file) and `docs/slides.md`.*
