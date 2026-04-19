"""
Connect MLflow to skore.

Trains a HistGradientBoostingClassifier on the Iris dataset with 5-fold
cross-validation via skore's `evaluate`, then stores the resulting report in
an MLflow backend through `skore.Project(mode="mlflow")`.
"""

import os

import mlflow
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.ensemble import HistGradientBoostingClassifier

from skore import Project, evaluate

# Configuration — override via environment variables or edit directly
PROJECT = os.environ.get("PROJECT", "iris-hgb-project")
TRACKING_URI = os.environ.get("TRACKING_URI", "sqlite:///mlflow.db")

# 1. Build a report
X, y = load_iris(return_X_y=True, as_frame=True)
estimator = HistGradientBoostingClassifier()
report = evaluate(estimator, X, y, splitter=5)

# 2. Push the report to MLflow backend
project = Project(
    PROJECT,
    mode="mlflow",
    tracking_uri=TRACKING_URI,
)

project.put("hgb-baseline", report)
print("Report stored in MLflow experiment:", PROJECT)

# 3. Access the summary
summary = project.summarize()
pandas_summary = pd.DataFrame(summary)
print(pandas_summary[["key", "report_type", "learner", "ml_task", "dataset"]])

# 4. Access MLflow run metadata
_, run_id = pandas_summary.index[0]
mlflow_run = mlflow.get_run(run_id)
print("\nMLflow run metrics:", mlflow_run.data.metrics)

# 5. Load the report back from MLflow
loaded_report = project.get(run_id)
print("\nLoaded report metrics:")
print(loaded_report.metrics.summarize().frame())
