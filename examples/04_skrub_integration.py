"""
skrub + skore + MLflow integration demo.

Real tabular data is messy. ``skrub.tabular_pipeline`` handles the messiness,
skore's ``evaluate`` runs cross-validated evaluation, and an
``skore.Project(mode="mlflow")`` persists the resulting report to an MLflow
tracking store so the run shows up alongside any other MLflow experiment.

Dataset: ``skrub.datasets.fetch_employee_salaries`` (public, mixed-type,
realistically-dirty tabular regression).
"""

import os

import mlflow
import pandas as pd
import skrub
import skrub.datasets
from sklearn.ensemble import HistGradientBoostingRegressor

from skore import Project, evaluate

# Configuration - override via environment variables or edit directly
PROJECT = os.environ.get("PROJECT", "skrub-salaries-04")
TRACKING_URI = os.environ.get("TRACKING_URI", "sqlite:///mlflow.db")

# 1. Fetch a realistically-dirty tabular regression dataset
ds = skrub.datasets.fetch_employee_salaries()
X, y = ds.X, ds.y

# 2. Wrap the estimator in skrub's auto-preprocessing pipeline
pipeline = skrub.tabular_pipeline(HistGradientBoostingRegressor())

# 3. Evaluate with skore (5-fold cross-validation)
report = evaluate(pipeline, X, y, splitter=5)

# 4. Persist the report to MLflow through skore.Project
project = Project(
    PROJECT,
    mode="mlflow",
    tracking_uri=TRACKING_URI,
)
project.put("skrub-salaries", report)
print("Report stored in MLflow experiment:", PROJECT)

# 5. Access the skore summary
summary = project.summarize()
pandas_summary = pd.DataFrame(summary)
print(pandas_summary[["key", "report_type", "learner", "ml_task", "dataset"]])

# 6. Locate the MLflow run we just created
_, run_id = pandas_summary.index[0]
mlflow.set_tracking_uri(TRACKING_URI)
mlflow_run = mlflow.get_run(run_id)

# 7. Make sure the skrub preprocessing is visible in the MLflow run.
#    If skore's auto-logging didn't already capture skrub-specific metadata,
#    log it explicitly so the MLflow UI shows the pipeline composition.
_MLFLOW_META_KEYS = {
    "mlflow.source.name",
    "mlflow.source.type",
    "mlflow.source.git.commit",
    "mlflow.source.git.branch",
    "mlflow.runName",
    "mlflow.user",
    "mlflow.project.env",
    "mlflow.project.entryPoint",
    "mlflow.parentRunId",
}


def _has_skrub_evidence(run):
    """Return True if the run carries skrub-specific params or tags.

    MLflow's built-in metadata tags (source filename, runName, ...) are
    ignored so that the filename of this very script is not mistaken for
    evidence that skrub was actually used.
    """
    candidates = dict(run.data.params)
    for key, value in run.data.tags.items():
        if key in _MLFLOW_META_KEYS:
            continue
        candidates[key] = value
    for key, value in candidates.items():
        blob = f"{key} {value}".lower()
        if "skrub" in blob or "tabular_pipeline" in blob:
            return True
    return False


if not _has_skrub_evidence(mlflow_run):
    with mlflow.start_run(run_id=run_id):
        mlflow.log_param(
            "pipeline_steps",
            " -> ".join(name for name, _ in pipeline.steps),
        )
        mlflow.log_param("skrub_version", skrub.__version__)
        mlflow.set_tag("skrub_tabular_pipeline", "true")
    mlflow_run = mlflow.get_run(run_id)

# 8. Print the final report summary and surface the skrub evidence
print("\nReport metrics:")
print(report.metrics.summarize().frame())

def _is_skrub_match(key, value):
    blob = f"{key} {value}".lower()
    return "skrub" in blob or "tabular_pipeline" in blob


skrub_params = {
    k: v for k, v in mlflow_run.data.params.items() if _is_skrub_match(k, v)
}
skrub_tags = {
    k: v
    for k, v in mlflow_run.data.tags.items()
    if k not in _MLFLOW_META_KEYS and _is_skrub_match(k, v)
}
print("\nSkrub-related MLflow params:", skrub_params)
print("Skrub-related MLflow tags:", skrub_tags)
assert skrub_params or skrub_tags, "Expected skrub evidence on the MLflow run"
