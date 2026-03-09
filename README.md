# MLflow + skore Integration

Connect skore's `CrossValidationReport` to an MLflow backend for experiment tracking and persistence.

Based on: https://skoredoc.eks.probabl.dev/2532/auto_examples/technical_details/plot_mlflow_backend.html

## Requirements

- Python 3.x
- Virtual environment at `.venv/`
- MLflow 3.10.1 (already installed)
- skore (install below)

## Setup

The `mode="mlflow"` feature is part of PR #2532 and not yet in a released version of skore. Install both required packages from the PR branch using `uv` (pip is not available in this venv):

```bash
# Install skore from the PR branch (GIT_LFS_SKIP_SMUDGE avoids a Git LFS error on non-LFS objects)
GIT_LFS_SKIP_SMUDGE=1 uv pip install \
  "git+https://github.com/probabl-ai/skore.git@mlflow-proj-example#subdirectory=skore" \
  --python D:/devel/mlflow/.venv/Scripts/python.exe

# Install the MLflow plugin (separate package in the same repo)
GIT_LFS_SKIP_SMUDGE=1 uv pip install \
  "git+https://github.com/probabl-ai/skore.git@mlflow-proj-example#subdirectory=skore-mlflow-project" \
  --python D:/devel/mlflow/.venv/Scripts/python.exe
```

> **Note:** `GIT_LFS_SKIP_SMUDGE=1` is required because the repo uses Git LFS for some assets (e.g. SVG logos) that are not accessible without LFS credentials. Skipping smudge does not affect the installed package.

## Running the Example

```bash
D:/devel/mlflow/.venv/Scripts/python.exe plot_mlflow_backend.py
```

By default this uses a local SQLite database (`mlflow.db`) as the tracking store. No server required.

### Using a remote MLflow server

Set environment variables to override the defaults:

```bash
PROJECT=my-project TRACKING_URI=http://localhost:5000 \
  D:/devel/mlflow/.venv/Scripts/python.exe plot_mlflow_backend.py
```

| Variable | Default | Description |
|---|---|---|
| `PROJECT` | `iris-hgb-project` | MLflow experiment name |
| `TRACKING_URI` | `sqlite:///mlflow.db` | MLflow tracking store URI |

## What the Script Does

1. **Build a report** — trains a `HistGradientBoostingClassifier` on the Iris dataset using `CrossValidationReport`
2. **Push to MLflow** — initializes a `skore.Project` in `mode="mlflow"` and stores the report with `project.put()`
3. **Summarize** — retrieves a summary DataFrame with columns: `key`, `report_type`, `learner`, `ml_task`, `dataset`
4. **Access run metadata** — fetches the MLflow run and its logged metrics via `mlflow.get_run(run_id)`
5. **Load back** — retrieves the stored report from MLflow with `project.get(run_id)` and prints its metrics

## Results

The script was run on 2026-03-09 against the Iris dataset using a `HistGradientBoostingClassifier` with 5-fold cross-validation. Results retrieved from MLflow:

### MLflow Run Summary

| Field | Value |
|---|---|
| Experiment | `iris-hgb-project` |
| Run ID | `54f0b2c1b0ac4f32acd194dfb8cf4d57` |
| Key | `hgb-baseline` |

### Metrics (logged to MLflow)

| Metric | Mean | Std |
|---|---|---|
| Accuracy | 0.9467 | 0.0650 |
| Precision (macro) | 0.9467 | 0.0650 |
| Recall (macro) | 0.9467 | 0.0650 |
| ROC AUC | 0.9913 | 0.0099 |
| Log loss | 0.2823 | 0.2432 |
| Fit time (s) | 0.6037 | — |
| Predict time (s) | 0.0177 | — |

### Per-class Metrics (from loaded report)

| Metric | Class | Mean | Std |
|---|---|---|---|
| Precision | 0 | 1.0000 | 0.0000 |
| | 1 | 0.9351 | 0.0630 |
| | 2 | 0.9203 | 0.1334 |
| Recall | 0 | 1.0000 | 0.0000 |
| | 1 | 0.9000 | 0.1732 |
| | 2 | 0.9400 | 0.0548 |
| ROC AUC | 0 | 1.0000 | 0.0000 |
| | 1 | 0.9800 | 0.0209 |
| | 2 | 0.9810 | 0.0188 |

The model performs very well overall, with class 0 achieving perfect scores across all metrics. Classes 1 and 2 show slightly more variance, likely due to their overlap in the Iris feature space.

## Inspecting Results in the MLflow UI

```bash
D:/devel/mlflow/.venv/Scripts/mlflow.exe ui \
  --backend-store-uri sqlite:///D:/devel/mlflow/mlflow.db
```

Then open http://localhost:5000 in your browser.

## Known Issues

### `mode="mlflow"` not available in skore 0.13.1

The tutorial is based on a pre-release development build of skore (PR #2532), identifiable by the `/2532/` in the tutorial URL. The `mode="mlflow"` parameter is **not yet available** in the latest released version (0.13.1).

Running the script with skore 0.13.1 raises:

```
ValueError: `mode` must be "hub" or "local" (found mlflow)
```

**Resolution:** install from the PR branch — see the [Setup](#setup) section above for the exact commands.

## Notes

- **Serialization**: skore currently uses pickle to serialize reports in MLflow. Only load reports from sources you trust.
- **Experiment name**: the MLflow experiment is created automatically using the `PROJECT` name.
- **Run IDs**: use `pandas_summary.index` to retrieve `(experiment_id, run_id)` tuples for direct MLflow access.

## Files

```
.
├── .venv/                    # Python virtual environment
├── mlflow.db                 # SQLite tracking store (created on first run)
├── plot_mlflow_backend.py    # Main integration script
└── README.md                 # This file
```
