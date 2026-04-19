# Flow B — Run Comparison & Pre-MLOps Review: MLflow UI Sessions

**JTBD**: "As an ML practitioner doing pre-MLOps review, I want to compare runs in MLflow, understand what artifacts skore stored, and assess whether the tracking is rich enough to make a promotion decision."

**Target**: MLflow UI at http://localhost:5000
**Experiment**: `iris-hgb-project` (HistGradientBoostingClassifier, 5-fold CV on Iris)
**Date**: 2026-03-09

---

## Session 1: Marcus Delgado (Senior MLOps Engineer)

### Think-Aloud Transcript

**Step 1 — Training Runs List**

[THINK-ALOUD] Marcus: "For pre-MLOps review I need to compare runs. Let me get to the training runs list and try to select multiple runs."

[ACTION] Navigate directly to training runs: /#/experiments/1/runs?startTime=ALL

[RESULT] Training runs list with hgb-baseline and "6 matching runs". Only the parent run visible.

[THINK-ALOUD] Marcus: "I see one parent run. I need to see child runs to compare fold performance. In W&B I could just flatten the hierarchy. Let me try the Expand rows button or look for a way to show child runs."

[ACTION] Look for expand icon on the hgb-baseline row

[RESULT] No expand icon found in the ag-grid. Child runs are not expandable from the parent row in this view.

[EMOTION] frustrated

[MISSING AFFORDANCE] No way to expand parent run to see child folds in the training runs table. Cannot flatten hierarchy.

**Step 2 — Run Selection**

[THINK-ALOUD] Marcus: "Let me try selecting runs. I see checkboxes in the table."

[ACTION] Click checkbox next to hgb-baseline

[RESULT] Checkbox selected. **Compare button appeared** in the toolbar.

[THINK-ALOUD] Marcus: "OK, a Compare button appeared after selecting one run. But I can only select this one parent — the child runs are not visible to select. I would need multiple runs at the same level to do a meaningful comparison."

[EMOTION] slightly hopeful -> disappointed (only 1 selectable run)

**Step 3 — Run Detail Assessment**

[THINK-ALOUD] Marcus: "Let me look at the run in detail to assess if this is ready for promotion."

[ACTION] Navigate to run detail page

[RESULT] Full run detail: 12 metrics, 23 params, tags, child runs listed.

[THINK-ALOUD] Marcus: "Accuracy 0.946 +/- 0.065. For iris that is actually mediocre — this is a well-known easy dataset. The high variance (std 0.065) suggests something is off. roc_auc 0.991 is better. log_loss 0.282 is OK. I want to see if there is a model registry path."

**Step 4 — Model Registration Check**

[ACTION] Look for Register Model button

[RESULT] No "Register" button found on the run detail page. "Registered models: None" displayed. A logged model exists with "Ready" status but no direct path to register it.

[THINK-ALOUD] Marcus: "I see Registered models: None and a logged model. But there is no Register Model button visible on this page. In MLflow 1.x/2.x there was usually a registration path from the run. Maybe it is in a different workflow now."

[EMOTION] confused -> frustrated

[MISSING AFFORDANCE] No "Register Model" button on run detail page. No clear path from logged model to model registry.

**Step 5 — Artifacts for Promotion Decision**

[THINK-ALOUD] Marcus: "Checking artifacts to see if there is enough data for a promotion decision."

[ACTION] Click "Artifacts" tab

[RESULT] File tree: metrics_details/, data.analyze.html, metrics.confusion_matrix.png, metrics.csv, metrics.precision_recall.png, metrics.roc.png, report.pkl

[THINK-ALOUD] Marcus: "The artifact set is rich. data.analyze.html could be a full analysis report. metrics.csv is exportable. The PNGs provide visual evidence. report.pkl requires skore to interpret."

[ACTION] Click data.analyze.html

[RESULT] HTML file preview loaded (skore analysis report).

[THINK-ALOUD] Marcus: "For promotion, I would want: performance metrics (check), model artifact (check via logged model), dataset reference (check), and reproducibility info (source + params, check). Missing: model card, bias analysis, inference benchmarks."

[EMOTION] professional assessment

**Step 6 — Export Check**

[THINK-ALOUD] Marcus: "Can I export this data? Let me look for download or export buttons."

[ACTION] Search for Download/Export buttons on artifacts page

[RESULT] **No Download or Export buttons found** on the artifacts tab or run detail page.

[THINK-ALOUD] Marcus: "No obvious CSV export. Would have to use the REST API to get data out programmatically. The Share button on the experiment page is unclear what it does."

[EMOTION] resigned

[MISSING AFFORDANCE] No download button for individual artifacts. No export functionality for run data.

**Step 7 — REST API Assessment**

[THINK-ALOUD] Marcus: "I would normally open DevTools and check the network calls. The API is at /api/2.0/mlflow/. I know from experience that I can search runs, get metrics, and list artifacts programmatically. For a promotion decision I would script this rather than rely on the UI."

### Promotion Decision Assessment

Marcus's checklist:
- Performance metrics: **YES** — 12 metrics logged including CV means and stds
- Model artifact: **YES** — logged model with Ready status
- Dataset reference: **YES** — dataset (8f9eb48c) linked
- Reproducibility: **YES** — source file, git commit, full params, tags
- Comparison: **NO** — cannot compare multiple runs in table
- Model card: **NO** — not present
- Bias analysis: **NO** — not present
- Inference benchmarks: **PARTIAL** — predict_time logged but no throughput data
- Export: **NO** — no UI export, must use API

**Verdict**: "Enough data for a preliminary assessment, but the comparison and export workflow is severely lacking. I would use the REST API for the actual review."

### Session Summary

```yaml
session_summary:
  persona: "Marcus Delgado"
  flow: "B"
  task: "As an ML practitioner doing pre-MLOps review, I want to compare runs in MLflow, understand what artifacts skore stored, and assess whether the tracking is rich enough to make a promotion decision."
  outcome: "completed_with_difficulty"
  action_count: 8
  tab_press_count: null
  time_estimate: "5-7 minutes"
  emotional_arc: "focused -> frustrated (no expand) -> hopeful (compare button) -> disappointed (1 run) -> professional -> resigned (no export)"
  critical_moments:
    - step: 1
      description: "Cannot expand parent run to see child folds"
      emotion: "frustrated"
      ux_signal: "blocker"
    - step: 2
      description: "Compare button appears but only 1 run to select"
      emotion: "disappointed"
      ux_signal: "friction"
    - step: 4
      description: "No Register Model button on run page"
      emotion: "confused"
      ux_signal: "friction"
    - step: 5
      description: "Rich artifact set from skore (HTML, PNGs, CSV)"
      emotion: "impressed"
      ux_signal: "positive"
    - step: 6
      description: "No download/export buttons for artifacts"
      emotion: "resigned"
      ux_signal: "friction"
  screenshots:
    - "flowB-marcus-01-runlist.png"
    - "flowB-marcus-02-expanded.png"
    - "flowB-marcus-03-selection.png"
    - "flowB-marcus-04-rundetail.png"
    - "flowB-marcus-05-model.png"
    - "flowB-marcus-06-artifacts.png"
    - "flowB-marcus-06b-analyze.png"
    - "flowB-marcus-07-final.png"
  missing_affordances:
    - "Expand parent run to show child runs in table"
    - "Run comparison table with sortable metric columns"
    - "Register Model button on run detail page"
    - "Download button for individual artifacts"
    - "Export run data as CSV/JSON"
    - "Model card template or generation"
    - "Side-by-side diff view for run parameters"
```

---

## Session 2: Lena Kowalski (Postdoc Researcher, Rage-clicker)

### Think-Aloud Transcript

**Step 1 — Landing Page**

[THINK-ALOUD] Lena: "OK someone told me to use this MLflow thing. Where are my runs?"

[ACTION] Navigate to http://localhost:5000

[RESULT] Landing page with Welcome to MLflow.

[THINK-ALOUD] Lena: "Welcome to MLflow... Getting Started... I dont care about getting started, I need my data! *scrolls fast*"

[EMOTION] impatient

**Step 2 — Click Experiment**

[ACTION] Click iris-hgb-project quickly

[RESULT] Experiment overview with empty observability charts.

[THINK-ALOUD] Lena: "No data available? What?? I just ran this!"

[EMOTION] frustrated

**Step 3 — Random Clicks**

[ACTION] Click "Traces" in sidebar

[RESULT] Traces page — empty.

[ACTION] Click "Sessions" in sidebar

[RESULT] Sessions page — empty.

[THINK-ALOUD] Lena: "Traces? No data. Sessions? No data. What is this? None of these things are relevant to my sklearn experiment."

[EMOTION] very frustrated, rage-clicking

**Step 4 — Training Runs**

[THINK-ALOUD] Lena: "Training runs? FINALLY something that sounds right."

[ACTION] Click "Training runs"

[RESULT] Table with hgb-baseline, 6 matching runs.

[THINK-ALOUD] Lena: "One run? I thought there were 5 folds? Where is the compare button? I need to compare my cross-validation folds."

[EMOTION] confused -> frustrated

**Step 5 — Run Detail**

[ACTION] Click hgb-baseline quickly

[RESULT] Run detail page with metrics and parameters.

[THINK-ALOUD] Lena: "Metrics. accuracy 0.946. How do I compare folds? There is no compare button here. I see Child runs: split_0 through split_4. Can I click on them?"

**Step 6 — Child Run**

[ACTION] Click split_0 link

[RESULT] Child run page showing individual fold metrics: accuracy 1.0, log_loss 0.000749, recall 1.0, precision 1.0, roc_auc 1.0.

[THINK-ALOUD] Lena: "OK this shows one fold. accuracy 1.0? log_loss 0.000748? This fold was perfect. But I want to see ALL folds side by side! In a DataFrame! Where is the comparison table??"

[EMOTION] frustrated (wants DataFrame-like comparison)

[MISSING AFFORDANCE] No side-by-side fold comparison. Each fold must be visited individually. Lena expects a pandas DataFrame-like view.

**Step 7 — Back to Artifacts**

[ACTION] Go back, click Artifacts tab

[RESULT] File tree with metrics_details/, data.analyze.html, PNGs, CSV, report.pkl

[THINK-ALOUD] Lena: "metrics.csv! That is what I need! I can download that and load it in pandas."

[ACTION] Click metrics.csv

[RESULT] CSV content previewed inline.

[THINK-ALOUD] Lena: "It shows the CSV content... but where is the download button? I just want to download this file and load it in my notebook. Why is there no download button?"

[EMOTION] frustrated -> slightly relieved (found CSV) -> frustrated again (no obvious download)

[MISSING AFFORDANCE] No visible download button for artifact files. Lena expects a download icon or button.

**Step 8 — Near Abandonment**

[THINK-ALOUD] Lena: "I am going to just use the MLflow Python client to pull this data into my notebook. This UI is not designed for comparing cross-validation results. I would paste `!mlflow.search_runs(...)` in a notebook cell."

[EMOTION] resigned, would abandon UI

### Session Summary

```yaml
session_summary:
  persona: "Lena Kowalski"
  flow: "B"
  task: "As an ML practitioner doing pre-MLOps review, I want to compare runs in MLflow, understand what artifacts skore stored, and assess whether the tracking is rich enough to make a promotion decision."
  outcome: "abandoned"
  action_count: 9
  tab_press_count: null
  time_estimate: "3-4 minutes (gave up quickly)"
  emotional_arc: "impatient -> frustrated -> rage-clicking -> frustrated -> slightly relieved -> resigned -> abandoned"
  critical_moments:
    - step: 2
      description: "Experiment overview shows empty observability data"
      emotion: "frustrated"
      ux_signal: "blocker"
    - step: 3
      description: "Rage-clicking through Traces, Sessions — all empty"
      emotion: "very frustrated"
      ux_signal: "blocker"
    - step: 6
      description: "Can only view one fold at a time, no comparison table"
      emotion: "frustrated"
      ux_signal: "blocker"
    - step: 7
      description: "Found metrics.csv in artifacts"
      emotion: "slightly relieved"
      ux_signal: "positive"
    - step: 7
      description: "No download button for CSV artifact"
      emotion: "frustrated"
      ux_signal: "friction"
  screenshots:
    - "flowB-lena-01-landing.png"
    - "flowB-lena-02-experiment.png"
    - "flowB-lena-03-confusion.png"
    - "flowB-lena-04-runlist.png"
    - "flowB-lena-05-rundetail.png"
    - "flowB-lena-06-childrun.png"
    - "flowB-lena-07-artifacts.png"
    - "flowB-lena-08-csv.png"
    - "flowB-lena-09-final.png"
  missing_affordances:
    - "Side-by-side fold comparison table (DataFrame-like)"
    - "Download button for artifact files"
    - "Smart experiment overview that adapts to experiment type"
    - "One-click CSV export of all run metrics"
    - "Jupyter widget or notebook integration for quick viewing"
    - "Inline fold comparison without leaving the parent run page"
```

---

## Session 3: David Okonkwo (Keyboard-only ML Engineer)

### Think-Aloud Transcript

**Step 1 — Training Runs List**

[THINK-ALOUD] David: "For run comparison I need to get to the training runs list and try selecting multiple runs with keyboard."

[ACTION] Navigate directly to training runs page

[RESULT] Training runs list loaded.

**Step 2 — ag-Grid Keyboard Navigation**

[THINK-ALOUD] David: "Tabbing into the ag-grid table to try selecting runs..."

[ACTION] Tab through the page (30 presses)

[RESULT] Could not reliably reach the ag-grid table rows via Tab navigation. The grid uses custom DOM that does not follow standard keyboard patterns.

[THINK-ALOUD] David: "I have been Tabbing and the focus never lands on a selectable row in the grid. The ag-grid uses its own focus management that is not compatible with standard Tab navigation. Space and Enter do not reliably select rows."

[EMOTION] frustrated

[ACCESSIBILITY ISSUE] **BLOCKER** — ag-grid table does not support standard keyboard navigation for row selection. Cannot select runs for comparison via keyboard.

**Step 3 — Run Detail Tab Navigation**

[ACTION] Navigate directly to run detail page

[THINK-ALOUD] David: "Checking tab keyboard navigation on run detail..."

[ACTION] Tab to tab bar (4 presses)

[RESULT] Reached "Overview" tab after 4 Tab presses. Focus ring visible (outline present).

[ACTION] Press ArrowRight to switch between tabs

[RESULT] ArrowRight does NOT move focus between tabs. Focus stays on "Overview".

[THINK-ALOUD] David: "Same issue as in Flow A — the tabs have ARIA role='tab' but arrow key navigation does not work. I must Tab to each tab individually, which means passing through the entire tab bar."

[ACCESSIBILITY ISSUE] Arrow key navigation between tabs broken. Must use Tab for each tab.

**Step 4 — Artifacts via Keyboard**

[ACTION] Attempt to navigate to Artifacts tab and browse artifact tree

[RESULT] Could navigate to tab elements via Tab but arrow key switching did not work. Artifact tree items were partially reachable via Tab.

[THINK-ALOUD] David: "The artifact file tree is partially keyboard-navigable — I can Tab to individual items. But there is no tree keyboard pattern (ArrowUp/Down to move between items, ArrowRight to expand folders)."

**Step 5 — Overall Assessment**

[THINK-ALOUD] David: "Summary for Flow B keyboard accessibility: The ag-grid table in training runs does not follow WAI-ARIA grid patterns — cannot reliably select rows with Space or navigate with arrows. The run detail tabs DO have ARIA roles but arrow key navigation between tabs does not work. Artifact tree navigation via keyboard is possible but requires many Tab presses. No skip-nav links anywhere. Missing: keyboard shortcut for compare, screen reader labels for metrics table."

[THINK-ALOUD] David: "The comparison workflow is effectively blocked for keyboard-only users. I cannot select multiple runs via keyboard, which means I cannot use the Compare feature at all. This is a dealbreaker for my adoption of the tool."

### Session Summary

```yaml
session_summary:
  persona: "David Okonkwo"
  flow: "B"
  task: "As an ML practitioner doing pre-MLOps review, I want to compare runs in MLflow, understand what artifacts skore stored, and assess whether the tracking is rich enough to make a promotion decision."
  outcome: "abandoned"
  action_count: 5
  tab_press_count: 35
  time_estimate: "5-8 minutes (keyboard-only, gave up on comparison)"
  emotional_arc: "focused -> frustrated (grid blocker) -> partially relieved (tabs) -> concerned (arrows broken) -> dealbreaker"
  critical_moments:
    - step: 2
      description: "ag-grid table not keyboard-navigable — cannot select runs"
      emotion: "frustrated"
      ux_signal: "blocker"
    - step: 3
      description: "Tab ARIA roles present but arrow navigation broken"
      emotion: "concerned"
      ux_signal: "friction"
    - step: 5
      description: "Comparison workflow completely blocked for keyboard users"
      emotion: "dealbreaker"
      ux_signal: "blocker"
  screenshots:
    - "flowB-david-01-runlist.png"
    - "flowB-david-02-grid-nav.png"
    - "flowB-david-03-tabs.png"
    - "flowB-david-04-artifacts.png"
    - "flowB-david-05-artifact-selected.png"
    - "flowB-david-06-final.png"
  missing_affordances:
    - "WAI-ARIA grid pattern for ag-grid table"
    - "Keyboard row selection (Space) in runs table"
    - "Arrow key navigation between tabs"
    - "Keyboard-accessible Compare workflow"
    - "Skip-navigation links"
    - "Keyboard shortcuts for common actions (compare, export)"
    - "Screen reader announcements for dynamic content changes"
```
