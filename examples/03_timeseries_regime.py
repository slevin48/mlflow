"""
Time-series forecasting demo with per-fold metric surfacing.

Targeted at time-series practitioners and quantitative researchers working
with non-stationary data: the mean metric across folds hides exactly what
they need to see, which fold broke.

In regime-shifting data, the mean metric across folds is misleading; the
fold-level distribution is what matters. This demo runs a
``TimeSeriesSplit`` cross-validation on a synthetic non-stationary series
(trend + seasonality + a variance regime shift halfway through) and:

1. prints the aggregated summary (mean / std across folds),
2. prints the per-fold table (one row per fold),
3. logs per-fold metrics back to the MLflow run created by
   ``skore.Project(mode="mlflow")`` using step-indexed
   ``mlflow.log_metric`` calls.

The synthetic dataset is generated with a fixed seed so the script runs
offline and reproducibly. Airline passengers via
``pd.read_csv("https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv")``
is a drop-in real-data alternative but requires network access.
"""

import os

import mlflow
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import TimeSeriesSplit

from skore import Project, evaluate

# Configuration -- override via environment variables or edit directly
PROJECT = os.environ.get("PROJECT", "timeseries-regime-03")
TRACKING_URI = os.environ.get("TRACKING_URI", "sqlite:///mlflow.db")

# Show every fold column when printing the per-fold table.
pd.set_option("display.width", 200)
pd.set_option("display.max_columns", 20)


def build_non_stationary_series(n_points: int = 500) -> pd.Series:
    """Generate a synthetic non-stationary series with a regime shift."""
    rng = np.random.default_rng(0)
    t = np.arange(n_points)
    trend = 0.02 * t
    seasonal = np.sin(2 * np.pi * t / 24)
    # Variance doubles in the second half -- a volatility regime shift.
    noise_scale = np.where(t < n_points // 2, 0.3, 0.6)
    noise = rng.normal(loc=0.0, scale=noise_scale)
    return pd.Series(trend + seasonal + noise, name="y")


def make_lagged_features(series: pd.Series, lags: int = 3) -> tuple[pd.DataFrame, pd.Series]:
    """Turn a univariate series into a supervised regression problem."""
    frame = pd.DataFrame({"y": series})
    for lag in range(1, lags + 1):
        frame[f"y_lag_{lag}"] = frame["y"].shift(lag)
    frame = frame.dropna().reset_index(drop=True)
    y = frame["y"]
    X = frame.drop(columns=["y"])
    return X, y


# 1. Build a non-stationary series and lagged features
series = build_non_stationary_series()
X, y = make_lagged_features(series, lags=3)

# 2. Run TimeSeriesSplit CV via skore's `evaluate`
regressor = HistGradientBoostingRegressor(random_state=0)
report = evaluate(regressor, X, y, splitter=TimeSeriesSplit(n_splits=5))

# 3. Push the report to the MLflow backend
project = Project(
    PROJECT,
    mode="mlflow",
    tracking_uri=TRACKING_URI,
)
project.put("hgb-timeseries", report)
print("Report stored in MLflow experiment:", PROJECT)

# 4. Aggregated summary -- what you'd normally look at
metrics_display = report.metrics.summarize()
aggregated = metrics_display.frame()
print("\n=== Aggregated summary (mean / std across folds) ===")
print(aggregated)

# 5. Per-fold table -- the point of this demo
per_fold = metrics_display.frame(aggregate=None)
print("\n=== Per-fold metrics (one row per fold) ===")
print(per_fold)

# 6. Log per-fold metrics back to the MLflow run.
# In regime-shifting data the mean metric across folds is misleading; we
# reopen the run skore just created and attach step-indexed scalars so the
# fold-level distribution is retrievable from MLflow's metric history, not
# just from the aggregated run metrics.
summary = project.summarize()
experiment_id, run_id = summary.index[0]

# Flatten the per-fold frame to (metric_name, fold_idx, value) triples.
# The frame is indexed by metric name and has one column per split.
with mlflow.start_run(run_id=run_id, experiment_id=experiment_id):
    for metric_label, row in per_fold.iterrows():
        # `metric_label` can be a tuple (e.g. ("RMSE", "test")) or a string
        # depending on skore's column conventions; normalize to a safe key.
        if isinstance(metric_label, tuple):
            key = "_".join(str(part) for part in metric_label if part)
        else:
            key = str(metric_label)
        key = key.lower().replace(" ", "_").replace("(", "").replace(")", "")
        for fold_idx, value in enumerate(row.to_list()):
            if pd.isna(value):
                continue
            try:
                mlflow.log_metric(key, float(value), step=fold_idx)
            except (TypeError, ValueError):
                # Non-numeric rows (e.g. fit time labels) are skipped.
                continue

# 7. Confirm step-indexed metrics landed on the run
client = mlflow.MlflowClient(tracking_uri=TRACKING_URI)
print("\n=== MLflow per-fold history (retrieved from the run) ===")
fetched = mlflow.get_run(run_id).data.metrics
for metric_key in sorted(fetched):
    history = client.get_metric_history(run_id, metric_key)
    if len(history) <= 1:
        continue
    steps = [(m.step, m.value) for m in history]
    print(f"{metric_key}: {steps}")
