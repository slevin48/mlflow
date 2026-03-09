# MLflow + skore Integration

Connect skore's `CrossValidationReport` to an MLflow backend for experiment tracking and persistence.

Based on: https://skoredoc.eks.probabl.dev/2532/auto_examples/technical_details/plot_mlflow_backend.html

## Requirements

- Python 3.x
- Virtual environment at `.venv/`
- MLflow 3.10.1 (already installed)
- skore (install below)

## Setup

```bash
# Install skore into the existing venv
D:/devel/mlflow/.venv/Scripts/pip install skore
```

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

## Inspecting Results in the MLflow UI

```bash
D:/devel/mlflow/.venv/Scripts/mlflow.exe ui \
  --backend-store-uri sqlite:///D:/devel/mlflow/mlflow.db
```

Then open http://localhost:5000 in your browser.

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
