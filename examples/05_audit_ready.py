"""
Audit-ready demo: produce an EU AI Act article-style model card from a skore +
MLflow workflow.

Article-style audits of machine learning systems increasingly require a
traceable paper trail: which dataset, which metrics (including per-class and
per-group breakdowns), what methodological caveats were surfaced, the intended
use, and a stable run identifier. This example shows how to emit a Markdown
model card as an MLflow artifact attached to a skore-backed run, so the full
audit trail lives on the tracking store rather than on a developer laptop.

The dataset (UCI Adult Income, via OpenML) is a public tabular benchmark with
an existing demographic column (`sex`) suitable for a simple per-group
accuracy breakdown. It is used here purely to illustrate the audit flow; the
resulting model is NOT suitable for any real decisioning task.
"""

from __future__ import annotations

import importlib.metadata
import os
import tempfile
import warnings
from pathlib import Path

import mlflow
import pandas as pd
from sklearn.datasets import fetch_openml
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score
from skrub import tabular_pipeline

from skore import Project, evaluate

# ---------------------------------------------------------------------------
# Configuration — override via environment variables or edit directly
# ---------------------------------------------------------------------------
PROJECT = os.environ.get("PROJECT", "audit-ready-05")
TRACKING_URI = os.environ.get("TRACKING_URI", "sqlite:///mlflow.db")
EVAL_DATE = "2026-04-19"


# ---------------------------------------------------------------------------
# 1. Load a public tabular dataset
# ---------------------------------------------------------------------------
def _load_dataset() -> tuple[pd.DataFrame, pd.Series, str, str, str]:
    """Return (X, y, title, dataset_name, group_column).

    Prefers UCI Adult (OpenML id `adult`, v2). Falls back to credit-g if the
    network is not available.
    """
    try:
        bunch = fetch_openml("adult", version=2, as_frame=True)
        title = "Model Card: Adult Income Classifier (demo)"
        dataset_name = "UCI Adult Income (OpenML `adult`, v2)"
        group_column = "sex"
        return bunch.data, bunch.target, title, dataset_name, group_column
    except Exception as exc:  # pragma: no cover - network-dependent fallback
        warnings.warn(f"Adult dataset unavailable ({exc!r}); falling back to credit-g.")
        bunch = fetch_openml("credit-g", version=1, as_frame=True)
        title = "Model Card: German Credit Classifier (demo)"
        dataset_name = "German Credit (OpenML `credit-g`, v1)"
        # credit-g has a `personal_status` column that encodes sex+marital
        # status; use it if present, else pick any categorical column.
        candidates = [
            c for c in ("personal_status", "foreign_worker", "housing")
            if c in bunch.data.columns
        ]
        group_column = candidates[0] if candidates else bunch.data.columns[0]
        return bunch.data, bunch.target, title, dataset_name, group_column


X, y, card_title, dataset_name, group_column = _load_dataset()
n_samples, n_features = X.shape
target_dtype = "binary classification" if y.nunique() == 2 else "multiclass classification"

print(f"Dataset: {dataset_name}")
print(f"  n_samples = {n_samples}, n_features = {n_features}")
print(f"  target    = {y.name!r} ({target_dtype}, classes={sorted(y.unique().tolist())})")
print(f"  group column = {group_column!r}")


# ---------------------------------------------------------------------------
# 2. Build a 5-fold CrossValidationReport with skore
# ---------------------------------------------------------------------------
# HistGradientBoostingClassifier wrapped in skrub's tabular_pipeline handles
# the heterogeneous Adult schema (numeric + categorical, a few NaNs) with no
# manual preprocessing.
estimator = tabular_pipeline(HistGradientBoostingClassifier(random_state=0))

# skore may emit methodological warnings during fitting / scoring. Capture
# them so they can be surfaced in the model card rather than lost to stderr.
captured_warnings: list[str] = []
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    report = evaluate(estimator, X, y, splitter=5)
    for w in caught:
        captured_warnings.append(f"{w.category.__name__}: {w.message}")


# ---------------------------------------------------------------------------
# 3. Push the report to the MLflow-backed skore project
# ---------------------------------------------------------------------------
project = Project(PROJECT, mode="mlflow", tracking_uri=TRACKING_URI)
project.put("adult-census-audit", report)

summary = pd.DataFrame(project.summarize())
experiment_id, run_id = summary.index[0]
print(f"\nMLflow run created: experiment={PROJECT!r} run_id={run_id}")


# ---------------------------------------------------------------------------
# 4. Overall + per-class metrics
# ---------------------------------------------------------------------------
metrics_frame = report.metrics.summarize().frame()
print("\nOverall cross-validation metrics (skore):")
print(metrics_frame)

precision_per_class = report.metrics.precision(average=None)
recall_per_class = report.metrics.recall(average=None)
print("\nPer-class precision:")
print(precision_per_class)
print("\nPer-class recall:")
print(recall_per_class)


# ---------------------------------------------------------------------------
# 5. Per-group breakdown on a single held-out split (last CV fold)
# ---------------------------------------------------------------------------
last_fold = report.estimator_reports_[-1]
X_test = last_fold.X_test
y_test = last_fold.y_test
y_pred = last_fold.estimator_.predict(X_test)

group_values = X_test[group_column]
per_group_rows: list[dict[str, object]] = []
for g in sorted(group_values.dropna().unique().tolist()):
    mask = (group_values == g).to_numpy()
    if mask.sum() == 0:
        continue
    per_group_rows.append(
        {
            "group": str(g),
            "n": int(mask.sum()),
            "accuracy": float(accuracy_score(y_test[mask], y_pred[mask])),
        }
    )
per_group_df = pd.DataFrame(per_group_rows)
print(f"\nPer-group accuracy on held-out split (column={group_column!r}):")
print(per_group_df.to_string(index=False))


# ---------------------------------------------------------------------------
# 6. Build the Markdown model card
# ---------------------------------------------------------------------------
def _format_per_class_table(
    precision_frame: pd.DataFrame, recall_frame: pd.DataFrame
) -> str:
    """Return a Markdown table with per-class precision and recall."""
    # Both frames share the same (Metric, Label / Average) MultiIndex; pull
    # the class labels from the precision frame.
    classes = [idx[1] for idx in precision_frame.index]
    learner_col = precision_frame.columns.get_level_values(0)[0]
    lines = ["| Class | Precision (mean ± std) | Recall (mean ± std) |",
             "| --- | --- | --- |"]
    for cls in classes:
        p_mean = precision_frame.loc[("Precision", cls), (learner_col, "mean")]
        p_std = precision_frame.loc[("Precision", cls), (learner_col, "std")]
        r_mean = recall_frame.loc[("Recall", cls), (learner_col, "mean")]
        r_std = recall_frame.loc[("Recall", cls), (learner_col, "std")]
        lines.append(
            f"| {cls} | {p_mean:.3f} ± {p_std:.3f} | {r_mean:.3f} ± {r_std:.3f} |"
        )
    return "\n".join(lines)


_PER_CLASS_METRICS = {"Precision", "Recall"}


def _format_overall_metrics(frame: pd.DataFrame) -> str:
    """Return a Markdown table with aggregate (non-per-class) metrics.

    Per-class Precision / Recall rows are skipped here because they appear
    in the dedicated per-class table. Aggregate metrics (Accuracy, Log loss,
    Brier score, ROC AUC, timings, ...) that have no per-class breakdown
    have an empty-ish label — None, NaN, or ``""``.
    """
    learner_col = frame.columns.get_level_values(0)[0]
    lines = ["| Metric | Mean | Std |", "| --- | --- | --- |"]
    # skore uses the literal string "None" for metrics with no per-class
    # breakdown; treat that (plus empty / NaN / actual None) as aggregate.
    aggregate_labels = {"", "None", "nan"}
    for (metric, label), row in frame.iterrows():
        if metric in _PER_CLASS_METRICS:
            continue
        label_str = "" if label is None else str(label)
        if label_str not in aggregate_labels and not pd.isna(label):
            continue
        mean = row[(learner_col, "mean")]
        std = row[(learner_col, "std")]
        lines.append(f"| {metric} | {mean:.3f} | {std:.3f} |")
    return "\n".join(lines)


def _format_per_group_table(per_group_df: pd.DataFrame, group_column: str) -> str:
    lines = [f"| `{group_column}` | n | Accuracy |", "| --- | --- | --- |"]
    for row in per_group_df.itertuples(index=False):
        lines.append(f"| {row.group} | {row.n} | {row.accuracy:.3f} |")
    return "\n".join(lines)


warnings_section = (
    "\n".join(f"- {w}" for w in captured_warnings)
    if captured_warnings
    else "- None captured during this run."
)

try:
    skore_version = importlib.metadata.version("skore")
except importlib.metadata.PackageNotFoundError:  # pragma: no cover
    skore_version = "unknown"


def _final_estimator_name(est: object) -> str:
    """Return the final classifier's class name, unwrapping Pipelines."""
    inner = getattr(est, "_final_estimator", est)
    return type(inner).__name__


model_class = (
    f"{_final_estimator_name(report.estimator)} "
    f"(wrapped by {type(report.estimator).__name__})"
)

model_card = f"""# {card_title}

## Dataset summary

- Dataset: {dataset_name}
- n_samples: {n_samples}
- n_features: {n_features}
- Target: `{y.name}` ({target_dtype}; classes = {sorted(y.unique().tolist())})
- Caveats: public benchmark used for illustration only; contains demographic
  attributes (e.g. `{group_column}`) that make any naive decisioning use
  inappropriate.

## Evaluation metrics

Overall metrics (5-fold cross-validation, skore `CrossValidationReport`):

{_format_overall_metrics(metrics_frame)}

Per-class precision and recall:

{_format_per_class_table(precision_per_class, recall_per_class)}

## Per-group breakdown

Accuracy computed on the held-out test split of the last cross-validation
fold, grouped by `{group_column}`:

{_format_per_group_table(per_group_df, group_column)}

## Methodological warnings encountered

{warnings_section}

## Intended use / out-of-scope uses

This is a DEMO MODEL for illustrating the skore + MLflow audit flow. It is
NOT suitable for production decisioning, hiring, lending, or any decision
affecting real individuals. The Adult Income dataset is a public benchmark
with known fairness concerns and is used here purely to exercise the
reporting pipeline — per-class metrics, per-group breakdown, methodological
warnings, and a Markdown model card attached to the run.

## Traceability

| Field | Value |
| --- | --- |
| MLflow run ID | `{run_id}` |
| MLflow experiment | `{PROJECT}` |
| MLflow tracking URI | `{TRACKING_URI}` |
| skore version | `{skore_version}` |
| Model class | `{model_class}` |
| Evaluation date | {EVAL_DATE} |
"""


# ---------------------------------------------------------------------------
# 7. Write model card to a tempdir and log it as an MLflow artifact
# ---------------------------------------------------------------------------
mlflow.set_tracking_uri(TRACKING_URI)
with tempfile.TemporaryDirectory() as tmp_dir:
    card_path = Path(tmp_dir) / "model_card.md"
    card_path.write_text(model_card, encoding="utf-8")
    with mlflow.start_run(run_id=run_id):
        mlflow.log_artifact(str(card_path))

run_info = mlflow.get_run(run_id).info
print(f"\nArtifact URI: {run_info.artifact_uri}")
print("Model card logged as 'model_card.md' on the MLflow run above.")
