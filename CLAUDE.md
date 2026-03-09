# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-script project demonstrating integration between [skore](https://github.com/probabl-ai/skore) and MLflow for experiment tracking. It uses skore's `CrossValidationReport` with `mode="mlflow"` (from PR #2532, not yet released) to log scikit-learn cross-validation results to an MLflow tracking store.

## Commands

**Run the example script:**
```bash
D:/devel/mlflow/.venv/Scripts/python.exe plot_mlflow_backend.py
```

**Run with a remote MLflow server:**
```bash
PROJECT=my-project TRACKING_URI=http://localhost:5000 \
  D:/devel/mlflow/.venv/Scripts/python.exe plot_mlflow_backend.py
```

**Launch the MLflow UI to inspect results:**
```bash
D:/devel/mlflow/.venv/Scripts/mlflow.exe ui \
  --backend-store-uri sqlite:///D:/devel/mlflow/mlflow.db
```
Then open http://localhost:5000.

**Install/reinstall skore from the PR branch** (required — `mode="mlflow"` is not in any released version):
```bash
GIT_LFS_SKIP_SMUDGE=1 uv pip install \
  "git+https://github.com/probabl-ai/skore.git@mlflow-proj-example#subdirectory=skore" \
  --python D:/devel/mlflow/.venv/Scripts/python.exe

GIT_LFS_SKIP_SMUDGE=1 uv pip install \
  "git+https://github.com/probabl-ai/skore.git@mlflow-proj-example#subdirectory=skore-mlflow-project" \
  --python D:/devel/mlflow/.venv/Scripts/python.exe
```

Note: `pip` is not available in this venv — use `uv pip` for package management.

## Architecture

The script (`plot_mlflow_backend.py`) follows this flow:

1. **Train** — `CrossValidationReport(estimator, X, y)` runs 5-fold CV on the Iris dataset with `HistGradientBoostingClassifier`
2. **Store** — `Project(name, mode="mlflow", tracking_uri=...)` creates/opens an MLflow experiment; `project.put(key, report)` serializes the report (via pickle) and logs metrics to MLflow
3. **Query** — `project.summarize()` returns a DataFrame indexed by `(experiment_id, run_id)` with columns: `key`, `report_type`, `learner`, `ml_task`, `dataset`
4. **Retrieve** — `mlflow.get_run(run_id)` for raw MLflow metadata; `project.get(run_id)` to deserialize the full report object back

The default tracking store is a local SQLite file (`mlflow.db`). The `PROJECT` and `TRACKING_URI` environment variables override defaults.

## Key Dependency Constraint

`skore` must be installed from branch `mlflow-proj-example` of the probabl-ai/skore repo. The released version (0.13.1) does not support `mode="mlflow"` and will raise `ValueError: mode must be "hub" or "local"`.
