"""
Shift-left methodology vignette: shuffled KFold vs. TimeSeriesSplit.

This example contrasts two cross-validation strategies on a synthetic dataset
whose target class balance drifts over time:

  * Run 1 — ``KFold(n_splits=5, shuffle=True)``: methodologically wrong for
    temporally-ordered data. Shuffling mixes late-period rows into the train
    fold and early-period rows into the test fold (and vice versa), leaking
    future information into past predictions. Under vanilla sklearn this is
    silent. We still wrap the call in ``warnings.catch_warnings(record=True)``
    to surface any methodology warning skore may emit via the standard
    ``warnings`` module.
  * Run 2 — ``TimeSeriesSplit(n_splits=5)``: respects temporal ordering.

Both runs are persisted to the same MLflow experiment. The final block prints
a side-by-side comparison of mean accuracy / std and highlights the gap, which
is the practical signature of look-ahead leakage on this dataset.
"""

import os
import warnings

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import KFold, TimeSeriesSplit

from skore import Project, evaluate

# Configuration — override via environment variables or edit directly
PROJECT = os.environ.get("PROJECT", "shift-left-02")
TRACKING_URI = os.environ.get("TRACKING_URI", "sqlite:///mlflow.db")


def make_temporal_dataset(n: int = 1000, seed: int = 0):
    """Synthetic binary classification with a time-drifting target.

    * ``timestamp`` is monotonic (0, 1, ..., n-1).
    * ``p_positive`` rises smoothly from ~0 at early timestamps to ~1 at late
      timestamps via a logistic curve centered at n/2. Early rows are mostly
      class 0, late rows mostly class 1.
    * Two independent Gaussian noise features carry no real signal — the only
      predictive feature is the timestamp itself.

    Shuffled CV will train on late-period rows (mostly class 1) and evaluate on
    early-period rows (mostly class 0), and vice versa — an over-optimistic
    setup that ``TimeSeriesSplit`` correctly forbids.
    """
    rng = np.random.default_rng(seed)
    timestamp = np.arange(n).astype(float)
    # Smooth enough drift (scale=200) that every TimeSeriesSplit fold sees
    # both classes — sklearn's log_loss refuses folds with a single label.
    p_positive = 1.0 / (1.0 + np.exp(-(timestamp - n / 2) / 200.0))
    y = (rng.random(n) < p_positive).astype(int)
    noise1 = rng.normal(size=n)
    noise2 = rng.normal(size=n)
    X = np.column_stack([timestamp, noise1, noise2])
    return X, y


def extract_accuracy(report) -> tuple[float, float]:
    """Return (mean, std) accuracy across CV folds from a skore report."""
    frame = report.metrics.accuracy()
    # MultiIndex rows (Metric, ...) x columns (estimator, stat). Flatten.
    row = frame.loc["Accuracy"]
    # row is a Series (or 1-row DataFrame); find mean/std regardless of estimator label
    flat = row.squeeze()
    mean = float(flat.xs("mean", level=-1).iloc[0] if hasattr(flat, "xs") else flat["mean"])
    std = float(flat.xs("std", level=-1).iloc[0] if hasattr(flat, "xs") else flat["std"])
    return mean, std


def main() -> None:
    X, y = make_temporal_dataset()
    estimator = LogisticRegression(max_iter=1000)

    # --- Run 1: shuffled KFold on temporally-ordered data (wrong) ------------
    print("=== Run 1: KFold(shuffle=True) — methodologically wrong ===")
    with warnings.catch_warnings(record=True) as captured:
        warnings.simplefilter("always")
        shuffled_report = evaluate(
            estimator,
            X,
            y,
            splitter=KFold(n_splits=5, shuffle=True, random_state=0),
        )

    if captured:
        for item in captured:
            print(f"METHODOLOGICAL WARNING: {item.message}")
    else:
        print(
            "(no warning captured via the `warnings` module — "
            "skore 0.15 surfaces methodology warnings from `train_test_split` "
            "via rich-rendered stdout panels, not from `evaluate`. "
            "The numeric gap below is the real evidence of leakage.)"
        )

    # --- Run 2: TimeSeriesSplit (correct) ------------------------------------
    print("\n=== Run 2: TimeSeriesSplit — correct ===")
    tss_report = evaluate(
        estimator,
        X,
        y,
        splitter=TimeSeriesSplit(n_splits=5),
    )

    # --- Persist both reports to MLflow in the same experiment ---------------
    project = Project(PROJECT, mode="mlflow", tracking_uri=TRACKING_URI)
    project.put("shuffled-kfold-wrong", shuffled_report)
    project.put("time-series-split-correct", tss_report)
    print(f"\nBoth reports stored in MLflow experiment: {PROJECT}")

    # --- Side-by-side comparison --------------------------------------------
    shuf_mean, shuf_std = extract_accuracy(shuffled_report)
    tss_mean, tss_std = extract_accuracy(tss_report)

    print("\n=== Side-by-side comparison ===")
    header = f"{'run':<30} {'mean accuracy':>15} {'std':>10}"
    print(header)
    print("-" * len(header))
    print(f"{'shuffled-kfold-wrong':<30} {shuf_mean:>15.4f} {shuf_std:>10.4f}")
    print(f"{'time-series-split-correct':<30} {tss_mean:>15.4f} {tss_std:>10.4f}")

    gap = (shuf_mean - tss_mean) * 100.0
    if gap > 0:
        print(
            f"\nShuffled CV over-reports accuracy by {gap:.2f} pts — "
            "classic look-ahead leakage."
        )
    else:
        print(
            f"\nShuffled CV does NOT over-report on this draw (gap = {gap:.2f} pts). "
            "Rerun with a different seed or a stronger drift to reproduce leakage."
        )


if __name__ == "__main__":
    main()
