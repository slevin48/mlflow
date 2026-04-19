"""
Model bake-off: compare several estimators on the same dataset.

Runs 5-fold cross-validation on the Digits dataset for three scikit-learn
classifiers, logs each as its own MLflow run via ``skore.Project``, and
prints a ranking that surfaces the stability-vs-mean tradeoff — the
highest-mean model is not always the most stable across folds.

Run:

    uv run python examples/01_bakeoff.py

Override defaults via environment variables:

    PROJECT=my-bakeoff TRACKING_URI=http://localhost:5000 \
        uv run python examples/01_bakeoff.py
"""

import os

from sklearn.datasets import load_digits
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from skore import Project, compare, evaluate

# Configuration — override via environment variables or edit directly
PROJECT = os.environ.get("PROJECT", "bakeoff-01")
TRACKING_URI = os.environ.get("TRACKING_URI", "sqlite:///mlflow.db")

# Metric used for the ranking punchline (must appear in the summarize() output)
METRIC = "Accuracy"


def build_estimators():
    """Return a dict of slug -> scikit-learn estimator for the bake-off."""
    return {
        "hgb": HistGradientBoostingClassifier(random_state=0),
        "logreg": Pipeline(
            [
                ("scaler", StandardScaler()),
                ("clf", LogisticRegression(max_iter=1000, random_state=0)),
            ]
        ),
        "rf": RandomForestClassifier(random_state=0),
    }


def per_fold_accuracy(report):
    """Return the per-fold accuracy values from a CrossValidationReport."""
    # accuracy(aggregate=None) returns a DataFrame with one row (Accuracy)
    # and one column per fold under a model-name top level.
    frame = report.metrics.accuracy(aggregate=None)
    return frame.iloc[0].astype(float).to_numpy()


def main():
    # 1. Load the dataset
    X, y = load_digits(return_X_y=True, as_frame=True)

    # 2. Open the MLflow-backed skore project
    project = Project(PROJECT, mode="mlflow", tracking_uri=TRACKING_URI)

    # 3. Evaluate each estimator with 5-fold CV and persist as its own run
    estimators = build_estimators()
    reports = {}
    for slug, estimator in estimators.items():
        print(f"Evaluating {slug}...")
        report = evaluate(estimator, X, y, splitter=5)
        project.put(slug, report)
        reports[slug] = report

    # 4. Build a ComparisonReport to surface per-fold metric distributions
    comparison = compare(reports)
    print("\n=== ComparisonReport: aggregated metrics ===")
    print(comparison.metrics.summarize().frame())

    # 5. Rank by (mean, std) on the chosen metric
    stats = {}
    for slug, report in reports.items():
        folds = per_fold_accuracy(report)
        stats[slug] = (float(folds.mean()), float(folds.std(ddof=1)))

    ranked = sorted(stats.items(), key=lambda kv: kv[1][0], reverse=True)

    print(f"\n=== Ranking by mean {METRIC} (5-fold CV) ===")
    print(f"{'rank':<5}{'model':<10}{'mean':>10}{'std':>10}")
    for i, (slug, (mean, std)) in enumerate(ranked, start=1):
        print(f"{i:<5}{slug:<10}{mean:>10.4f}{std:>10.4f}")

    # 6. Stability-vs-mean punchline
    top_slug, (top_mean, top_std) = ranked[0]
    most_stable_slug, (stable_mean, stable_std) = min(
        stats.items(), key=lambda kv: kv[1][1]
    )
    if most_stable_slug != top_slug and stable_std > 0:
        ratio = top_std / stable_std
        print(
            f"\nNote: {top_slug} has the top mean {METRIC.lower()} "
            f"({top_mean:.4f}) but {most_stable_slug} has ~{ratio:.1f}x "
            f"tighter per-fold spread (std {stable_std:.4f} vs {top_std:.4f})."
        )
    else:
        print(
            f"\nNote: {top_slug} leads on both mean ({top_mean:.4f}) "
            f"and per-fold stability (std {top_std:.4f}) for this run."
        )

    # 7. Confirm the MLflow runs that were logged
    summary = project.summarize()
    print(f"\nLogged {len(summary)} MLflow run(s) in experiment '{PROJECT}'.")
    print(summary[["key", "report_type", "learner", "ml_task", "dataset"]])


if __name__ == "__main__":
    main()
