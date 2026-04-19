# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-script project demonstrating integration between [skore](https://github.com/probabl-ai/skore) and MLflow for experiment tracking. It uses `skore.evaluate(..., splitter=5)` to build a `CrossValidationReport`, then persists it through a `skore.Project` with `mode="mlflow"` so the metrics land in an MLflow tracking store.

## Commands

**Install dependencies (first run, or after `pyproject.toml` changes):**
```bash
uv sync
```

**Run the example script:**
```bash
uv run python plot_mlflow_backend.py
```

**Run with a remote MLflow server:**
```bash
PROJECT=my-project TRACKING_URI=http://localhost:5000 \
  uv run python plot_mlflow_backend.py
```

**Launch the MLflow UI to inspect results:**
```bash
uv run mlflow ui --backend-store-uri sqlite:///mlflow.db
```
Then open http://localhost:5000.

Use `uv` (not `pip` directly) for package management.

## Architecture

The script (`plot_mlflow_backend.py`) follows this flow:

1. **Train** — `evaluate(estimator, X, y, splitter=5)` runs 5-fold CV on the Iris dataset with `HistGradientBoostingClassifier` and returns a `CrossValidationReport`.
2. **Store** — `Project(name, mode="mlflow", tracking_uri=...)` creates/opens an MLflow experiment; `project.put(key, report)` serializes the report (via pickle) and logs metrics to MLflow.
3. **Query** — `project.summarize()` returns a DataFrame indexed by `(experiment_id, run_id)` with columns: `key`, `report_type`, `learner`, `ml_task`, `dataset`.
4. **Retrieve** — `mlflow.get_run(run_id)` for raw MLflow metadata; `project.get(run_id)` to deserialize the full report object back.

The default tracking store is a local SQLite file (`mlflow.db`). The `PROJECT` and `TRACKING_URI` environment variables override defaults.

## Historical Note

Earlier revisions of this repo pinned `skore` to a pre-release branch (PR #2532) because `mode="mlflow"` was not yet available in any release. That constraint is resolved as of `skore` 0.15, which ships the MLflow backend through the `skore[mlflow]` extra on PyPI.
