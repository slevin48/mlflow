# Flow A — Experiment Discovery: MLflow UI Sessions

**JTBD**: "As a data scientist who just ran a skore CrossValidationReport, I want to browse the MLflow UI to find my experiment, inspect the logged metrics, and understand what skore captured automatically."

**Target**: MLflow UI at http://localhost:5000
**Experiment**: `iris-hgb-project` (HistGradientBoostingClassifier, 5-fold CV on Iris)
**Date**: 2026-03-09

---

## Session 1: Priya Chandrasekaran (Junior Data Scientist)

### Think-Aloud Transcript

**Step 1 — Landing Page**

[THINK-ALOUD] Priya: "OK, my colleague told me to open localhost:5000. Let me see what MLflow looks like..."

[ACTION] Navigate to http://localhost:5000

[RESULT] Landing page shows "Welcome to MLflow" with a Getting Started section, Start Demo button, feature cards (Tracing, Evaluation, Prompts, AI Gateway, Model Training), and "Recent Experiments" table at the bottom listing iris-hgb-project, Default.

[THINK-ALOUD] Priya: "Hmm, there is a lot here. Getting Started, Tracing, Evaluation, Prompts, AI Gateway... I expected something simpler, like a table of my experiments. Oh wait, at the bottom I see Recent Experiments! And there is iris-hgb-project!"

[EMOTION] neutral -> slightly overwhelmed -> relieved (found experiment)

[MISSING AFFORDANCE] No getting-started wizard for classical ML users. The landing page is GenAI-focused. Expected a simple list of experiments as first thing visible.

**Step 2 — Click Experiment**

[THINK-ALOUD] Priya: "Let me click on iris-hgb-project. That is the one from the script my colleague gave me."

[ACTION] Click "iris-hgb-project" in Recent Experiments table

[RESULT] Experiment overview page at `/#/experiments/1/overview`. Shows sidebar with Overview, Training runs, Observability sections. Main area shows Usage/Quality/Tool calls charts — all empty ("No data available for the selected time range").

[THINK-ALOUD] Priya: "Umm, everything says No data available? Where are my runs? I see an Overview tab and... Training runs? The Overview shows traces and latency stuff, which seems like it is for LLM apps, not my sklearn model. Let me try Training runs."

[EMOTION] confused -> uncertain

[MISSING AFFORDANCE] Experiment overview defaults to observability/trace metrics which are irrelevant for classical ML training experiments. Expected to see runs immediately.

**Step 3 — Training Runs List**

[THINK-ALOUD] Priya: "OK clicking Training runs in the left sidebar..."

[ACTION] Click "Training runs" in sidebar

[RESULT] Training runs table shows one row: "hgb-baseline", created 4 hours ago, dataset (8f9eb48c), 2.5min duration, source plot_mlflow_backend.py, model icon. Footer: "6 matching runs".

[THINK-ALOUD] Priya: "OK there is one row called hgb-baseline. 6 matching runs? But I only see one row. Maybe the other 5 are the cross-validation folds? My colleague said there were 5 folds. Let me click on hgb-baseline to see more."

[EMOTION] slightly confused about "6 matching runs" vs 1 visible row

[MISSING AFFORDANCE] Child runs (folds) are hidden inside the parent. No visual indication of how to expand the hierarchy. The count "6 matching runs" is ambiguous.

**Step 4 — Run Detail Page**

[THINK-ALOUD] Priya: "Clicking on hgb-baseline..."

[ACTION] Click "hgb-baseline" run link

[RESULT] Run detail page with 5 tabs: Overview, Model metrics, System metrics, Traces, Artifacts. Overview tab shows:
- Metrics (12): accuracy 0.947, accuracy_std 0.065, log_loss 0.282, log_loss_std 0.243, recall 0.947, recall_std 0.065, precision 0.947, precision_std 0.065, roc_auc 0.991, roc_auc_std 0.010, fit_time 0.604, predict_time 0.018
- Parameters (23): all HistGradientBoostingClassifier hyperparams + cv_splitter.class=StratifiedKFold, cv_splitter.n_splits=5
- Logged models (1): model, Ready status
- About this run: Created 03/09/2026, Status Finished, Duration 2.5min, Child runs: split_0-4, Source: plot_mlflow_backend.py
- Tags: skore_status=completed, skore_version=0.0.0+unknown, report_type=cross-validation, ml_task=multiclass-classification, learner=HistGradientBoostingClassifier
- Registered models: None

[THINK-ALOUD] Priya: "OK! Now I can see a lot! There are Metrics (12) — accuracy 0.946, log_loss 0.282, recall 0.946, precision 0.946, roc_auc 0.991. Those are the cross-validation averages! And accuracy_std, log_loss_std... those are the standard deviations across folds. That makes sense with 5-fold CV."

[THINK-ALOUD] Priya: "Parameters (23)! That is a lot of parameters. learning_rate 0.1, max_iter 100, cv_splitter.n_splits 5... it logged the splitter too. And there are Child runs: split_0 through split_4. So those are the individual fold results."

[EMOTION] confused -> satisfied (seeing clear metrics and parameters)

**Step 5 — Model Metrics Tab**

[THINK-ALOUD] Priya: "There is a Model metrics tab. Let me click that to see charts."

[ACTION] Click "Model metrics" tab

[RESULT] 12 individual bar/line charts, one per metric. Each shows a single data point for hgb-baseline. Charts: accuracy (0.95), accuracy_std (0.06), fit_time (0.60), log_loss (0.28), log_loss_std (0.24), precision (0.95), etc.

[THINK-ALOUD] Priya: "The charts show one dot each. That makes sense since there is just one parent run. But I wish I could see the per-fold values in a line chart or something. Still, accuracy 0.95 and roc_auc 0.99 look good!"

[EMOTION] satisfied

**Step 6 — Artifacts Tab**

[THINK-ALOUD] Priya: "Now let me check Artifacts to see the skore report."

[ACTION] Click "Artifacts" tab

[RESULT] File tree showing:
- metrics_details/ (folder)
- data.analyze.html
- metrics.confusion_matrix.png
- metrics.csv
- metrics.precision_recall.png
- metrics.roc.png
- report.pkl
Message: "Select a file to preview. Supported formats: image, text, html, pdf, audio, video, geojson files"

[THINK-ALOUD] Priya: "Oh nice! There are actual files here. metrics.confusion_matrix.png, metrics.roc.png — those sound useful. data.analyze.html... metrics.csv... And report.pkl — that must be the pickled skore report. But what is a .pkl file? I cannot preview it I think. Let me click on a PNG to see if it shows the plot."

[ACTION] Click "metrics.confusion_matrix.png"

[RESULT] Inline image preview of the confusion matrix rendered in the browser.

[THINK-ALOUD] Priya: "It shows the confusion matrix right here in the browser! That is really nice. I can see the model gets most predictions right."

[EMOTION] satisfied -> delighted

**Step 7 — Tags**

[THINK-ALOUD] Priya: "Going back to Overview to check the Tags section..."

[ACTION] Click Overview tab, scroll down to Tags

[RESULT] Tags visible: skore_status: completed, skore_version: 0.0.0+unknown, report_type: cross-validation, ml_task: multiclass-classification, learner: HistGradientBoostingClassifier

[THINK-ALOUD] Priya: "Tags show skore_status completed, report_type cross-validation, ml_task multiclass-classification, learner HistGradientBoostingClassifier. These are useful metadata! But skore_version 0.0.0+unknown is a bit odd — is that the actual version? And what does artifact URI mean? I see a Run ID that is a long hex string... I would not know what to do with that."

[EMOTION] mostly satisfied but confused by some jargon (artifact URI, Run ID)

### Session Summary

```yaml
session_summary:
  persona: "Priya Chandrasekaran"
  flow: "A"
  task: "As a data scientist who just ran a skore CrossValidationReport, I want to browse the MLflow UI to find my experiment, inspect the logged metrics, and understand what skore captured automatically."
  outcome: "completed_with_difficulty"
  action_count: 8
  tab_press_count: null
  time_estimate: "4-6 minutes"
  emotional_arc: "neutral -> overwhelmed -> confused -> satisfied -> delighted -> confused by jargon -> mostly satisfied"
  critical_moments:
    - step: 1
      description: "Landing page is GenAI-focused, experiments buried at bottom"
      emotion: "overwhelmed"
      ux_signal: "friction"
    - step: 2
      description: "Experiment overview shows empty observability charts, not runs"
      emotion: "confused"
      ux_signal: "friction"
    - step: 3
      description: "'6 matching runs' but only 1 visible row — child runs hidden"
      emotion: "confused"
      ux_signal: "friction"
    - step: 4
      description: "Run detail page shows rich metrics and parameters"
      emotion: "satisfied"
      ux_signal: "positive"
    - step: 6
      description: "Artifact preview renders confusion matrix PNG inline"
      emotion: "delighted"
      ux_signal: "positive"
    - step: 7
      description: "Tags show useful skore metadata but some jargon confusing"
      emotion: "mixed"
      ux_signal: "friction"
  screenshots:
    - "flowA-priya-01-landing.png"
    - "flowA-priya-02-experiment.png"
    - "flowA-priya-03-runlist.png"
    - "flowA-priya-04-rundetail.png"
    - "flowA-priya-05-metrics.png"
    - "flowA-priya-06-artifacts.png"
    - "flowA-priya-06b-confusion-matrix.png"
    - "flowA-priya-07-tags.png"
    - "flowA-priya-08-final.png"
  missing_affordances:
    - "Getting-started wizard for classical ML users"
    - "Experiment overview should default to training runs for non-LLM experiments"
    - "Visual indicator for expandable child runs in run list"
    - "Explanation of what .pkl files are and how to use them"
    - "Glossary or tooltips for MLflow jargon (artifact URI, Run ID)"
```

---

## Session 2: Marcus Delgado (Senior MLOps Engineer)

### Think-Aloud Transcript

**Step 1 — Landing Page**

[THINK-ALOUD] Marcus: "Alright, localhost:5000. MLflow 3.10 — they really went all-in on GenAI huh. Let me find my experiment fast."

[ACTION] Navigate to http://localhost:5000

[RESULT] Landing page — Welcome to MLflow with GenAI-first layout.

[THINK-ALOUD] Marcus: "GenAI, Model training toggle at top. Tracing, Evaluation, Prompts, AI Gateway... this is clearly an LLM-first UI now. In W&B this would just show me my projects. Where is my experiment? *scrolls* Oh, Recent Experiments at the bottom. iris-hgb-project. Let me get in there."

[EMOTION] impatient -> mildly annoyed (LLM-first landing page)

**Step 2 — Experiment Overview**

[THINK-ALOUD] Marcus: "Clicking iris-hgb-project..."

[ACTION] Click experiment

[RESULT] Experiment overview with empty observability charts (traces, latency, errors — all "No data available").

[THINK-ALOUD] Marcus: "Overview tab shows traces, latency, errors... all empty because this is a training experiment, not an LLM app. This default Overview is useless for classical ML. In W&B, clicking a project immediately shows runs. I need to click Training runs."

[EMOTION] frustrated -> dismissive

**Step 3 — Training Runs List**

[ACTION] Click "Training runs" in sidebar

[RESULT] Table: hgb-baseline, 6 matching runs (parent only visible). Columns: Run Name, Created, Dataset, Duration, Source, Models.

[THINK-ALOUD] Marcus: "One parent run, 5 child folds. Classic nested run pattern. But I only see Run Name, Created, Dataset, Duration, Source, Models columns. Where are my metrics? In W&B I would see metric columns right in the table. Let me check Columns button... also only 6 runs, but the child runs are hidden. I need to expand to see fold-level data."

[EMOTION] frustrated (no metrics in table view)

[MISSING AFFORDANCE] No metric columns visible in the runs table by default. In W&B, metrics appear as sortable columns.

**Step 4 — Run Detail**

[THINK-ALOUD] Marcus: "Fine, let me click into the parent run."

[ACTION] Click hgb-baseline

[RESULT] Full run detail with 12 metrics, 23 params, tags, child runs.

[THINK-ALOUD] Marcus: "OK, now we are talking. 12 metrics including _std variants — that is skore computing CV stats automatically. Parameters are all the estimator hyperparams plus cv_splitter info. Tags show skore metadata: report_type cross-validation, ml_task multiclass-classification, learner HistGradientBoostingClassifier. That is useful for querying."

[THINK-ALOUD] Marcus: "But skore_version 0.0.0+unknown? That is a dev build. Not great for reproducibility. Also, accuracy 0.946 with std 0.065 — that variance is a bit high for iris. I would want to see the per-fold breakdown."

[EMOTION] professional assessment -> noting issues

**Step 5 — Model Metrics Tab**

[THINK-ALOUD] Marcus: "Checking Model metrics tab..."

[ACTION] Click "Model metrics" tab

[RESULT] 12 individual charts with single data points each.

[THINK-ALOUD] Marcus: "These charts are useless for a single run. One dot per chart? In W&B I would get parallel coordinates or a proper comparison view. This Model metrics tab is designed for tracking across epochs, not for CV results. The skore integration does not map well to MLflow's metric model here."

[EMOTION] dismissive

**Step 6 — Artifacts**

[THINK-ALOUD] Marcus: "Let me check what skore dumped in artifacts..."

[ACTION] Click "Artifacts" tab

[RESULT] File tree: metrics_details/, data.analyze.html, metrics.confusion_matrix.png, metrics.csv, metrics.precision_recall.png, metrics.roc.png, report.pkl

[THINK-ALOUD] Marcus: "Now this is interesting. skore logged structured artifacts: confusion matrix plot, ROC curve, precision-recall curve, a CSV of metrics, an HTML analysis report, and the pickled report object. That is more than most sklearn logging setups provide out of the box."

[THINK-ALOUD] Marcus: "But report.pkl? That is only useful if you have skore installed and know how to load it. Not great for a reviewer who just wants to see results. The HTML and PNGs are more universally accessible."

[ACTION] Click "metrics.roc.png"

[RESULT] ROC curve rendered inline in the browser.

[THINK-ALOUD] Marcus: "ROC curve renders right in the browser. That is clean. AUC looks great. But I would want per-class ROC in a multiclass setting."

[EMOTION] impressed by artifact richness -> skeptical about pkl format

### Session Summary

```yaml
session_summary:
  persona: "Marcus Delgado"
  flow: "A"
  task: "As a data scientist who just ran a skore CrossValidationReport, I want to browse the MLflow UI to find my experiment, inspect the logged metrics, and understand what skore captured automatically."
  outcome: "completed"
  action_count: 7
  tab_press_count: null
  time_estimate: "2-3 minutes (expert user)"
  emotional_arc: "impatient -> annoyed -> frustrated -> professional assessment -> impressed/skeptical"
  critical_moments:
    - step: 1
      description: "Landing page is GenAI-first, experiments buried"
      emotion: "annoyed"
      ux_signal: "friction"
    - step: 2
      description: "Experiment overview defaults to empty observability view"
      emotion: "frustrated"
      ux_signal: "friction"
    - step: 3
      description: "No metric columns in runs table — unlike W&B"
      emotion: "frustrated"
      ux_signal: "friction"
    - step: 5
      description: "Model metrics charts useless for single-run CV display"
      emotion: "dismissive"
      ux_signal: "friction"
    - step: 6
      description: "Rich artifact set from skore with inline previews"
      emotion: "impressed"
      ux_signal: "positive"
  screenshots:
    - "flowA-marcus-01-landing.png"
    - "flowA-marcus-02-experiment.png"
    - "flowA-marcus-03-runlist.png"
    - "flowA-marcus-04-rundetail.png"
    - "flowA-marcus-05-metrics.png"
    - "flowA-marcus-06-artifacts.png"
    - "flowA-marcus-06b-roc.png"
    - "flowA-marcus-07-final.png"
  missing_affordances:
    - "Experiment overview should detect ML training and default to runs view"
    - "Metric columns in runs table (sortable, filterable)"
    - "Parallel coordinates or comparison view for CV metrics"
    - "Per-class ROC curves for multiclass problems"
    - "W&B-style project overview with key metrics aggregated"
```

---

## Session 3: David Okonkwo (Keyboard-only ML Engineer)

### Think-Aloud Transcript

**Step 1 — Landing Page**

[THINK-ALOUD] David: "Opening MLflow. I will navigate entirely with keyboard. Let me see how many Tabs it takes to reach the experiment."

[ACTION] Navigate to http://localhost:5000, begin Tab navigation

[RESULT] Landing page loaded. Begin counting Tab presses.

- Tab 10: focused on "Docs" link
- Tab 20: focused on "Model Training — Track experiments" link
- Tab 30: focused on INPUT element (search?)
- Tab 37: focused on "iris-hgb-project" link

[RESULT] Found iris-hgb-project after **37 Tab presses**.

[THINK-ALOUD] David: "37 Tab presses to reach the experiment link. That is well above the 15-press threshold I consider acceptable. There is no skip-nav link to jump past the sidebar and hero content. The sidebar alone consumed about 10 Tab stops."

[EMOTION] patient but noting issues

[ACCESSIBILITY ISSUE] **37 Tab presses** to reach primary content. No skip-navigation link. Sidebar navigation consumes many Tab stops before main content.

**Step 2 — Experiment Page**

[ACTION] Press Enter on iris-hgb-project

[RESULT] Experiment overview page loaded.

**Step 3 — Find Training Runs**

[THINK-ALOUD] David: "Now I need to find Training runs..."

[ACTION] Continue Tabbing

[RESULT] Found "Training runs" after **20 additional Tab presses**.

[THINK-ALOUD] David: "Good, Training runs link is reachable. Pressing Enter."

[ACTION] Press Enter

[RESULT] Training runs list visible.

**Step 4 — Navigate to Run**

[THINK-ALOUD] David: "Now tabbing to find the hgb-baseline run link..."

[ACTION] Tab through the runs table

[RESULT] **Could NOT reach the run link after 40 Tab presses.** The ag-grid table does not expose run links in a keyboard-navigable way.

[THINK-ALOUD] David: "I have been Tabbing for 40 presses and cannot reach the run link inside the ag-grid table. This is a critical accessibility blocker. The grid uses custom rendering that breaks standard Tab navigation."

[EMOTION] frustrated

[ACCESSIBILITY ISSUE] **BLOCKER** — ag-grid run table is not keyboard-navigable. Cannot reach run links via Tab. No WAI-ARIA grid pattern (Arrow keys do not navigate cells).

[FALLBACK] David would need to use the browser address bar to navigate directly.

**Step 5 — Run Detail Tabs**

[ACTION] Navigate directly to run page (workaround)

[RESULT] Run detail page loaded.

[THINK-ALOUD] David: "Now checking if the tabs on this run page are keyboard navigable..."

[ACTION] Tab to reach tab bar

[RESULT] Reached "Overview" tab after **4 Tab presses** from top of page. Focus ring visible (outline present).

[ACTION] Test ArrowRight for tab switching

[RESULT] ArrowRight does NOT move between tabs. Focus stays on "Overview".

[THINK-ALOUD] David: "The tabs have proper ARIA role='tab' attributes and visible focus rings, which is good. However, ArrowRight does not move between tabs as expected by WAI-ARIA Authoring Practices. This is a partial implementation."

[ACCESSIBILITY ISSUE] Tab elements have correct ARIA roles but ArrowRight/ArrowLeft do not navigate between tabs as per WAI-ARIA tab pattern.

**Step 6 — Total Assessment**

[TOTAL TAB COUNT] ~165 across the entire session

[THINK-ALOUD] David: "Summary: the navigation requires many Tab presses to reach key elements. The sidebar has many links that must be tabbed through before reaching content. No skip-nav link detected. Tab focus on the ag-grid table is not intuitive. The run detail tabs appear to have proper ARIA roles but arrow key navigation between tabs does not work."

### Session Summary

```yaml
session_summary:
  persona: "David Okonkwo"
  flow: "A"
  task: "As a data scientist who just ran a skore CrossValidationReport, I want to browse the MLflow UI to find my experiment, inspect the logged metrics, and understand what skore captured automatically."
  outcome: "completed_with_difficulty"
  action_count: 6
  tab_press_count: 165
  time_estimate: "8-12 minutes (keyboard-only adds significant overhead)"
  emotional_arc: "patient -> noting issues -> frustrated (ag-grid blocker) -> partially relieved (tab ARIA roles) -> concerned"
  critical_moments:
    - step: 1
      description: "37 Tab presses to reach iris-hgb-project — no skip-nav"
      emotion: "patient but concerned"
      ux_signal: "blocker"
    - step: 3
      description: "20 more Tabs to reach Training runs link"
      emotion: "noting issue"
      ux_signal: "friction"
    - step: 4
      description: "Cannot reach run links in ag-grid table via keyboard"
      emotion: "frustrated"
      ux_signal: "blocker"
    - step: 5
      description: "Tab ARIA roles present but arrow navigation broken"
      emotion: "mixed"
      ux_signal: "friction"
  screenshots:
    - "flowA-david-01-landing.png"
    - "flowA-david-02-found-experiment.png"
    - "flowA-david-03-experiment-page.png"
    - "flowA-david-04-runlist.png"
    - "flowA-david-05-rundetail.png"
    - "flowA-david-06-tabs.png"
    - "flowA-david-07-final.png"
  missing_affordances:
    - "Skip-navigation link to bypass sidebar"
    - "Keyboard-navigable ag-grid table (WAI-ARIA grid pattern)"
    - "Arrow key navigation between tabs"
    - "Keyboard shortcut to jump to search/filter"
    - "Screen reader labels for metrics table"
    - "Focus management after page navigation"
```
