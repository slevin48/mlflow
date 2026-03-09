# Flow C - JupyterLab Notebook Setup Sessions

**JTBD**: "As a researcher starting a new experiment, I want to open JupyterLab, create a notebook, and write a skore+mlflow workflow from scratch so I can track a new model."

**Date**: 2026-03-09
**Target**: http://localhost:8888/lab

---

## Session 1: Priya Chandrasekaran (Junior Data Scientist)

```yaml
session_summary:
  persona: "Priya Chandrasekaran"
  flow: "C"
  task: "As a researcher starting a new experiment, I want to open JupyterLab, create a notebook, and write a skore+mlflow workflow from scratch so I can track a new model."
  outcome: "completed_with_difficulty"
  action_count: 10
  time_estimate: "8-12 minutes"
  emotional_arc: "curious -> confused -> cautious -> relieved -> mildly frustrated"
  critical_moments:
    - step: 1
      description: "Landing page shows Launcher with Python 3 and R kernels. No skore/mlflow template or getting-started wizard visible."
      emotion: "slight disappointment"
      ux_signal: "friction"
    - step: 3
      description: "New notebook created. Kernel status shows 'No Kernel | Initializing' briefly then auto-selects Python 3 (ipykernel)."
      emotion: "uncertain"
      ux_signal: "friction"
    - step: 4
      description: "No autocomplete or inline documentation for skore imports. Had to rely on external knowledge."
      emotion: "frustrated"
      ux_signal: "friction"
    - step: 5
      description: "Imports executed successfully. Cell shows [*] during execution, then [1]. Kernel status 'Connecting' visible."
      emotion: "relieved"
      ux_signal: "positive"
    - step: 9
      description: "MLflow integration cell executed. No link or button to navigate to MLflow UI. User must manually open a new browser tab."
      emotion: "mildly frustrated"
      ux_signal: "friction"
    - step: 10
      description: "Jupyter news notification popup persisted through entire session, partially covering lower-right content."
      emotion: "annoyed"
      ux_signal: "friction"
  screenshots:
    - "flowC-priya-01-landing.png"
    - "flowC-priya-02-filebrowser.png"
    - "flowC-priya-03-newnotebook.png"
    - "flowC-priya-04-imports.png"
    - "flowC-priya-05-run-imports.png"
    - "flowC-priya-06-workflow.png"
    - "flowC-priya-07-workflow-result.png"
    - "flowC-priya-08-mlflow-cell.png"
    - "flowC-priya-09-mlflow-result.png"
    - "flowC-priya-10-final.png"
  missing_affordances:
    - "No skore/mlflow template notebook or getting-started wizard"
    - "No autocomplete for skore API (CrossValidationReport, Project)"
    - "No inline documentation or tooltips for mode='mlflow' parameter"
    - "No link/button to navigate from notebook to MLflow UI after storing data"
    - "No empty-state guidance when starting a new notebook"
    - "Notification popup about Jupyter news has no keyboard shortcut to dismiss"
  think_aloud_log: |
    [THINK-ALOUD] Priya: "OK, let me open JupyterLab. I hope there is some getting started guide or a template notebook for skore+mlflow."
    [ACTION] Navigate to http://localhost:8888/lab
    [RESULT] JupyterLab loaded. Launcher tab visible with kernel options. File browser shows plot_mlflow_backend.py reference file.
    [THINK-ALOUD] Priya: "I see the Launcher. There are sections... Notebook, Console, Other. I see Python 3 (ipykernel). No skore template though."
    [EMOTION] curious -> slight disappointment

    [THINK-ALOUD] Priya: "The file browser shows plot_mlflow_backend.py - that might be a reference! But I want a notebook, not a script."
    [ACTION] Examine file browser
    [RESULT] No example notebooks found. Only .py files, mlflow.db, and config files.

    [THINK-ALOUD] Priya: "No example notebook visible. Let me create a new one by clicking Python 3 (ipykernel)."
    [ACTION] Click Python 3 (ipykernel) in Launcher
    [RESULT] New notebook opens (Untitled.ipynb). Empty cell ready. Status bar shows "No Kernel | Initializing" then switches to "Python 3 (ipykernel)".
    [THINK-ALOUD] Priya: "The kernel says 'No Kernel' at first - that's confusing. Oh wait, it changed to Python 3. OK."
    [EMOTION] uncertain -> cautious

    [THINK-ALOUD] Priya: "Now I need to figure out the imports. I remember from plot_mlflow_backend.py: CrossValidationReport and Project."
    [ACTION] Type import code in first cell
    [RESULT] Code typed without errors. No autocomplete suggestions appeared for skore modules.
    [THINK-ALOUD] Priya: "I wish there was autocomplete for 'from skore import...' to show me what's available."

    [ACTION] Press Shift+Enter to run imports
    [RESULT] Cell executed successfully. "Imports successful!" printed. Cell number shows [1].
    [EMOTION] cautious -> relieved

    [THINK-ALOUD] Priya: "Now the workflow: load data, create report, push to MLflow."
    [ACTION] Type and run data loading + report creation cell
    [RESULT] CrossValidationReport created successfully.

    [THINK-ALOUD] Priya: "Now the MLflow part: Project with mode='mlflow'. I need a tracking_uri."
    [ACTION] Type and run MLflow integration cell
    [RESULT] Cell executed. Kernel was busy for ~10 seconds. "Report stored in MLflow!" printed.
    [THINK-ALOUD] Priya: "It worked! But... where do I see this in MLflow? There's no link, no button. I'd have to open a new tab manually."
    [EMOTION] relieved -> mildly frustrated

    [THINK-ALOUD] Priya: "I completed the task but it required knowing the exact API beforehand. No in-notebook guidance at all."
```

---

## Session 2: Lena Kowalski (Postdoc Researcher, rage-clicker)

```yaml
session_summary:
  persona: "Lena Kowalski"
  flow: "C"
  task: "As a researcher starting a new experiment, I want to open JupyterLab, create a notebook, and write a skore+mlflow workflow from scratch so I can track a new model."
  outcome: "completed_with_difficulty"
  action_count: 8
  time_estimate: "5-7 minutes"
  emotional_arc: "impatient -> slightly relieved -> frustrated -> mildly annoyed"
  critical_moments:
    - step: 1
      description: "Notification popup appeared. Lena clicked 'No' without reading it."
      emotion: "annoyed"
      ux_signal: "friction"
    - step: 2
      description: "Rage-clicked Python 3 kernel card twice. JupyterLab handled it gracefully - did not create duplicate notebooks."
      emotion: "impatient"
      ux_signal: "positive (resilient UI)"
    - step: 3
      description: "Typed minimal imports (from skore import Project, import mlflow) - did not import CrossValidationReport initially."
      emotion: "impatient"
      ux_signal: "friction"
    - step: 4
      description: "Imports succeeded without errors - no ImportError for skore or mlflow."
      emotion: "slightly relieved"
      ux_signal: "positive"
    - step: 7
      description: "Kernel showed 'Unknown' status in status bar during execution. All cells show [*] for extended time."
      emotion: "frustrated"
      ux_signal: "friction"
    - step: 8
      description: "No link to MLflow UI. Lena rated the experience 3/10."
      emotion: "annoyed"
      ux_signal: "friction"
  screenshots:
    - "flowC-lena-01-landing.png"
    - "flowC-lena-02-notebook-created.png"
    - "flowC-lena-03-imports.png"
    - "flowC-lena-04-import-result.png"
    - "flowC-lena-05-workflow.png"
    - "flowC-lena-06-workflow-result.png"
    - "flowC-lena-07-mlflow-result.png"
    - "flowC-lena-08-final.png"
  missing_affordances:
    - "No feedback on kernel readiness - status showed 'Unknown' for extended time"
    - "No link to MLflow UI after project.put()"
    - "No inline API documentation or autocomplete for skore"
    - "No progress bar or ETA for long-running cells"
    - "Notification popup intrusive and unnecessary for workflow"
  think_aloud_log: |
    [THINK-ALOUD] Lena: "JupyterLab. I know this. Let me just get a notebook going quick."
    [ACTION] Navigate to http://localhost:8888/lab
    [RESULT] Loaded. Launcher visible. Notification popup appeared.
    [EMOTION] neutral -> impatient

    [THINK-ALOUD] Lena: "Some popup... No. Close it."
    [ACTION] Click 'No' on notification without reading
    [RESULT] Popup dismissed

    [THINK-ALOUD] Lena: "Python 3... there. Click click click."
    [ACTION] Double/triple-click Python 3 kernel card
    [RESULT] Single notebook created (Untitled.ipynb). JupyterLab handled rage-clicking gracefully.
    [THINK-ALOUD] Lena: "OK I have a notebook. Wait, did I open two? Whatever."
    [EMOTION] impatient

    [THINK-ALOUD] Lena: "from skore import Project... that should work right?"
    [ACTION] Type quick imports: from skore import Project, import mlflow
    [RESULT] Code typed. No autocomplete helped.

    [ACTION] Shift+Enter immediately
    [RESULT] Imports succeeded. No ImportError.
    [THINK-ALOUD] Lena: "OK that worked. Good."
    [EMOTION] impatient -> slightly relieved

    [ACTION] Type and run workflow cell (sklearn imports + CrossValidationReport)
    [RESULT] Executed. Kernel busy for several seconds.

    [ACTION] Type and run MLflow integration (Project with mode="mlflow")
    [RESULT] Cells show [*] for extended time. Kernel status: "Unknown". Eventually completed.
    [THINK-ALOUD] Lena: "Finally. Done. But how do I see this in MLflow? There is no link anywhere."
    [EMOTION] relieved -> mildly annoyed

    [THINK-ALOUD] Lena: "Task done but way harder than it should be. No inline help, no autocomplete, no link to MLflow. 3 out of 10."
```

---

## Session 3: David Okonkwo (ML Engineer, keyboard-only)

```yaml
session_summary:
  persona: "David Okonkwo"
  flow: "C"
  task: "As a researcher starting a new experiment, I want to open JupyterLab, create a notebook, and write a skore+mlflow workflow from scratch so I can track a new model."
  outcome: "completed_with_difficulty"
  action_count: 12
  tab_press_count: 34
  time_estimate: "10-15 minutes"
  emotional_arc: "methodical -> frustrated -> adapting -> concerned -> satisfied with reservations"
  critical_moments:
    - step: 2
      description: "Tab focus started at JP-BUTTON with NO visible focus ring. First element has no focus indicator."
      emotion: "concerned"
      ux_signal: "blocker (accessibility)"
    - step: 3
      description: "20 Tab presses to attempt reaching Python 3 Launcher card - NEVER reached it. Usability failure (>15 threshold)."
      emotion: "frustrated"
      ux_signal: "blocker (accessibility)"
    - step: 4
      description: "Tab order traverses: JP-BUTTON -> tab bar -> status bar -> notification popup -> body -> skip link -> menu bar -> sidebar. Launcher cards never receive Tab focus."
      emotion: "frustrated"
      ux_signal: "blocker (accessibility)"
    - step: 5
      description: "Notebook already open from previous sessions (Untitled.ipynb). David ended up editing existing notebook rather than creating new one."
      emotion: "adapting"
      ux_signal: "friction"
    - step: 6
      description: "IndentationError on imports cell - existing cell content caused indentation when new text was appended."
      emotion: "frustrated"
      ux_signal: "blocker"
    - step: 7
      description: "UserWarning about ipywidgets appeared multiple times: 'install ipywidgets for Jupyter support'. Confusing for users."
      emotion: "confused"
      ux_signal: "friction"
    - step: 8
      description: "JupyterLab command mode shortcuts (Escape, B for new cell below, Ctrl+S) all work correctly."
      emotion: "satisfied"
      ux_signal: "positive"
    - step: 9
      description: "Focus ring audit: 1/10 elements missing visible focus indicator (JP-BUTTON). Most status bar elements have proper outline."
      emotion: "cautiously satisfied"
      ux_signal: "positive with caveat"
    - step: 10
      description: "JupyterLab provides 'Skip to main panel' link at Tab position 14 - good accessibility pattern."
      emotion: "appreciative"
      ux_signal: "positive"
  accessibility_findings:
    tab_order_issues:
      - "Launcher cards are NOT in the Tab order - cannot be activated via keyboard"
      - "20 Tab presses cycled through status bar, notification, body, menu, sidebar - but never reached Launcher content"
      - "To create a new notebook, keyboard user must use File menu > New > Notebook instead of Launcher"
    focus_ring_issues:
      - "JP-BUTTON elements lack visible focus ring (outline: none)"
      - "Tab bar LI items show focus ring inconsistently"
      - "Most status bar elements have proper outline (auto/0.8px or solid/0.8px)"
    positive_findings:
      - "'Skip to main panel' link available at Tab position 14"
      - "Cell editing via Enter/Escape for edit/command mode works well"
      - "Shift+Enter to run cells works reliably"
      - "Command mode shortcuts (B for new cell, A for above, Ctrl+S to save) all functional"
      - "Status bar buttons have proper focus indicators"
    wcag_concerns:
      - "WCAG 2.4.7 Focus Visible: JP-BUTTON elements fail"
      - "WCAG 2.1.1 Keyboard: Launcher cards not keyboard operable"
      - "WCAG 2.4.3 Focus Order: Tab order is not intuitive (status bar before main content)"
  screenshots:
    - "flowC-david-01-landing.png"
    - "flowC-david-02-focus-test.png"
    - "flowC-david-03-tabbing.png"
    - "flowC-david-05-notebook-created.png"
    - "flowC-david-06-imports-typed.png"
    - "flowC-david-07-imports-run.png"
    - "flowC-david-08-workflow.png"
    - "flowC-david-09-result.png"
    - "flowC-david-10-command-mode.png"
    - "flowC-david-11-focus-audit.png"
    - "flowC-david-12-final.png"
  missing_affordances:
    - "Launcher cards not keyboard accessible - cannot Tab to them or activate with Enter"
    - "No keyboard shortcut to create new notebook directly (must use File menu)"
    - "JP-BUTTON elements missing visible focus ring"
    - "Tab order prioritizes status bar over main content area"
    - "Notification popup intercepts Tab focus before main content"
    - "No ARIA labels on Launcher cards for screen reader context"
    - "No link to MLflow UI (same as other personas)"
  think_aloud_log: |
    [THINK-ALOUD] David: "OK, JupyterLab. Let me see if I can navigate this entirely with keyboard."
    [ACTION] Navigate to http://localhost:8888/lab
    [RESULT] JupyterLab loaded. Launcher visible.

    [THINK-ALOUD] David: "Notification popup. Let me Tab to the No button."
    [ACTION] Press Tab (1x)
    [RESULT] Focus on JP-BUTTON - NO visible focus ring. Bad start.

    [ACTION] Press Tab (3x more)
    [RESULT] Focus traversed to various elements but not to notification buttons yet.

    [ACTION] Press Escape to dismiss notification
    [RESULT] Escape pressed. Notification may not have been dismissed.

    [THINK-ALOUD] David: "I need to create a new notebook. Let me Tab to the Python 3 card."
    [ACTION] Tab through interface (20 presses total)
    [RESULT] Tab order: JP-BUTTON(no ring) -> Untitled.ipynb tab -> empty tab -> Simple switch(ring) -> status buttons(rings) -> notification buttons(rings) -> body -> Skip to main panel -> File menu -> sidebar -> file browser -> cell
    CRITICAL: Launcher cards were NEVER in the Tab order. After 20 tabs, focus went to the cell editor of the existing Untitled.ipynb notebook.
    [THINK-ALOUD] David: "I've pressed Tab 20 times and never reached the Launcher cards. This is a major keyboard accessibility failure. I'll have to use the existing notebook."
    [EMOTION] frustrated

    [THINK-ALOUD] David: "Focus landed on the existing Untitled.ipynb cell. Let me press Enter to enter edit mode."
    [ACTION] Press Enter
    [RESULT] Entered edit mode in the cell.

    [ACTION] Type import code
    [RESULT] Code typed. However, existing cell content caused indentation issues.

    [ACTION] Shift+Enter to run
    [RESULT] IndentationError - "unexpected indent" on first line. Cell had pre-existing whitespace/content.
    [THINK-ALOUD] David: "IndentationError because I typed into a cell that already had content. This is a consequence of not being able to create a fresh notebook via keyboard."
    [EMOTION] frustrated -> adapting

    [ACTION] Type workflow in next cell, Shift+Enter
    [RESULT] Workflow executed. UserWarning about ipywidgets appeared 3 times: "install 'ipywidgets' for Jupyter support"
    [THINK-ALOUD] David: "What are these ipywidgets warnings? That's confusing. I didn't ask for widgets."

    [ACTION] Escape to command mode, B for new cell below
    [RESULT] Command mode shortcuts work perfectly.
    [EMOTION] adapting -> cautiously satisfied

    [ACTION] Focus ring audit (10 Tab presses)
    [RESULT] 1/10 elements missing visible focus indicator. JP-BUTTON elements have outline:none.
    Most status bar elements have proper outline (auto/0.8px).

    [THINK-ALOUD] David: "Overall: cell editing works great with keyboard. Command mode shortcuts are solid. BUT the Launcher is completely inaccessible to keyboard. I had to work in an existing notebook because I couldn't create a new one. JP-BUTTON elements need focus rings. Tab order needs work."
    [EMOTION] satisfied with reservations
```

---

## Cross-Persona Summary

### What Worked Well
1. **JupyterLab Launcher** is visually clear with labeled kernel cards (Priya, Lena)
2. **Resilient UI** - rage-clicking the Launcher didn't create duplicate notebooks (Lena)
3. **Shift+Enter to run cells** works reliably for all personas
4. **Imports succeeded** - skore, mlflow, sklearn all available without extra installation
5. **Command mode keyboard shortcuts** (B, A, Ctrl+S) work correctly (David)
6. **Skip to main panel** link exists for keyboard navigation (David)
7. **Kernel auto-selects** Python 3 (ipykernel) without manual selection

### Critical Missing Affordances (All Personas)
1. **No link from notebook to MLflow UI** after `project.put()` - all 3 personas noted this
2. **No skore/mlflow template notebook** or getting-started wizard
3. **No meaningful autocomplete** for skore API
4. **No inline documentation** for `mode="mlflow"` or `tracking_uri` parameters

### Accessibility Blockers (David)
1. **Launcher cards not keyboard accessible** - Tab never reaches them (WCAG 2.1.1 failure)
2. **JP-BUTTON elements lack focus rings** (WCAG 2.4.7 failure)
3. **Tab order unintuitive** - status bar before main content (WCAG 2.4.3 concern)
4. **Notification popup intercepts Tab navigation** before main content

### UX Friction Points
1. **Kernel status confusion** - shows "No Kernel | Initializing" then "Unknown" before "Idle"
2. **Notification popup** about Jupyter news persists and covers content
3. **ipywidgets UserWarning** appears multiple times during execution - confusing
4. **No progress indicator** for long-running cells beyond the [*] asterisk
5. **No empty-state guidance** when creating a new notebook for skore+mlflow workflow
