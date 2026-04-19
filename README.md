# MLflow + skore Integration

Connect skore's cross-validation reports to an MLflow backend for experiment tracking and persistence.

Based on: https://skoredoc.eks.probabl.dev/auto_examples/technical_details/plot_mlflow_backend.html

## Requirements

- Python >= 3.11
- [`uv`](https://docs.astral.sh/uv/) for environment and dependency management (recommended)

## Setup

Clone the repo, then sync dependencies with `uv`:

```bash
uv sync
```

This creates `.venv/` and installs everything declared in `pyproject.toml` — notably `skore[mlflow]`, `scikit-learn`, `pandas`, and `mlflow`.

As an alternative to `uv sync`, you can install the skore MLflow extra directly into any venv:

```bash
uv pip install "skore[mlflow]"
```

## Running the Example

```bash
uv run python plot_mlflow_backend.py
```

By default this uses a local SQLite database (`mlflow.db`) as the tracking store. No server required.

### Using a remote MLflow server

Set environment variables to override the defaults:

```bash
PROJECT=my-project TRACKING_URI=http://localhost:5000 \
  uv run python plot_mlflow_backend.py
```

| Variable | Default | Description |
|---|---|---|
| `PROJECT` | `iris-hgb-project` | MLflow experiment name |
| `TRACKING_URI` | `sqlite:///mlflow.db` | MLflow tracking store URI |

## What the Script Does

1. **Build a report** — trains a `HistGradientBoostingClassifier` on the Iris dataset using `skore.evaluate(estimator, X, y, splitter=5)`, which returns a `CrossValidationReport`
2. **Push to MLflow** — initializes a `skore.Project` in `mode="mlflow"` and stores the report with `project.put()`
3. **Summarize** — retrieves a summary DataFrame with columns: `key`, `report_type`, `learner`, `ml_task`, `dataset`
4. **Access run metadata** — fetches the MLflow run and its logged metrics via `mlflow.get_run(run_id)`
5. **Load back** — retrieves the stored report from MLflow with `project.get(run_id)` and prints its metrics

## Results

The script was run on 2026-04-19 against the Iris dataset using a `HistGradientBoostingClassifier` with 5-fold cross-validation. Results retrieved from MLflow:

### MLflow Run Summary

| Field | Value |
|---|---|
| Experiment | `iris-hgb-project` |
| Run ID | `8527b63ba35d4f919be12ee93fcea65a` |
| Key | `hgb-baseline` |

### Metrics (logged to MLflow)

| Metric | Mean | Std |
|---|---|---|
| Accuracy | 0.9467 | 0.0650 |
| Precision (macro) | 0.9467 | 0.0650 |
| Recall (macro) | 0.9467 | 0.0650 |
| ROC AUC | 0.9913 | 0.0099 |
| Log loss | 0.2823 | 0.2432 |
| Fit time (s) | 0.0976 | — |
| Predict time (s) | 0.0053 | — |

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
uv run mlflow ui --backend-store-uri sqlite:///mlflow.db
```

Then open http://localhost:5000 in your browser.

## Notes

- **Experiment name**: the MLflow experiment is created automatically using the `PROJECT` name.
- **Run IDs**: use `pandas_summary.index` to retrieve `(experiment_id, run_id)` tuples for direct MLflow access.
- **Serialization**: see the next section for how reports are persisted and the security implications.

## Serialization and audit-readiness

As of skore 0.15, `project.put(key, report)` serializes `CrossValidationReport` instances as pickle objects inside the MLflow artifact store. Loading a pickle runs arbitrary Python code on import, so retrieved reports should only come from sources you trust. MLflow 3.10 and later support [skops](https://skops.readthedocs.io/) as a scikit-learn-aware, pickle-free alternative for model artifacts, and MLflow surfaces a warning pointing to it whenever a pickle path is used. Teams evaluating this stack for audit-ready or regulated-industry workflows may want to track whether skore adopts a non-pickle serializer before relying on stored reports for downstream signing, provenance, or long-term archival.

## Files

```
.
├── pyproject.toml            # Project dependencies (skore[mlflow], scikit-learn, pandas, mlflow, skrub)
├── uv.lock                   # Locked dependency versions (created by `uv sync`)
├── mlflow.db                 # SQLite tracking store (created on first run; gitignored)
├── mlruns/                   # MLflow artifact store (created on first run; gitignored)
├── plot_mlflow_backend.py    # Main integration script
└── README.md                 # This file
```

## Historical

Earlier UX exploration work lived under `ux-campaign/`. It is archived, unchanged, on branch [`ux-campaign-archive`](https://github.com/slevin48/mlflow/tree/ux-campaign-archive).
