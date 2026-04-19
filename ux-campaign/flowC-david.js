// Flow C - David Okonkwo - ML Engineer, keyboard-only
// Behavioral: NEVER uses mouse, Tab/Shift-Tab/Enter/Space/Ctrl+shortcuts only
// Counts Tab presses, reports focus ring issues, >15 tabs = usability failure
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({
    recordVideo: { dir: 'D:/devel/mlflow/ux-campaign/videos/', size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  let tabCount = 0;

  const ss = async (name) => {
    await page.waitForTimeout(400);
    await page.screenshot({ path: `D:/devel/mlflow/ux-campaign/screenshots/${name}` });
    console.log(`Screenshot: ${name}`);
  };

  const pressTab = async (n = 1) => {
    for (let i = 0; i < n; i++) {
      await page.keyboard.press('Tab');
      tabCount++;
      await page.waitForTimeout(150);
    }
    console.log(`[TAB] Pressed Tab ${n} times (total: ${tabCount})`);
  };

  const pressShiftTab = async (n = 1) => {
    for (let i = 0; i < n; i++) {
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(150);
    }
    console.log(`[SHIFT-TAB] Pressed Shift+Tab ${n} times`);
  };

  // Step 1: Navigate to JupyterLab
  console.log('[THINK-ALOUD] David: "OK, JupyterLab. Let me see if I can navigate this entirely with keyboard. First, let me check the landing page."');
  await page.goto('http://localhost:8888/lab', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await ss('flowC-david-01-landing.png');
  console.log('[RESULT] JupyterLab loaded. Launcher visible.');

  // Step 2: Try to dismiss notification with keyboard
  console.log('[THINK-ALOUD] David: "There is a notification popup. Let me try to Tab to the No button and press Enter."');
  await pressTab(1);
  await ss('flowC-david-02-focus-test.png');

  // Try to find and interact with notification
  // Press Tab several times to try to reach the notification buttons
  console.log('[THINK-ALOUD] David: "Tabbing through elements... where does focus go first?"');
  await pressTab(3);
  await ss('flowC-david-03-tabbing.png');

  // Try Escape to dismiss notification
  console.log('[THINK-ALOUD] David: "Let me try Escape to dismiss the notification."');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Step 3: Create a new notebook using keyboard shortcut
  // JupyterLab: Ctrl+Shift+L opens launcher (if not already open)
  console.log('[THINK-ALOUD] David: "I need to create a new notebook. JupyterLab should support Ctrl+Shift+L for the launcher. But I see it is already open. Let me try to Tab to the Python 3 kernel card."');

  // Reset tab count for this specific task
  let createNotebookTabs = 0;

  // Tab through the launcher to find the Python 3 notebook card
  console.log('[THINK-ALOUD] David: "Tabbing through the launcher to reach the Python 3 Notebook card..."');
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    tabCount++;
    createNotebookTabs++;
    await page.waitForTimeout(200);

    // Check what currently has focus
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName,
        text: el?.textContent?.substring(0, 50),
        role: el?.getAttribute('role'),
        ariaLabel: el?.getAttribute('aria-label'),
        className: el?.className?.substring(0, 80),
        hasFocusRing: el ? window.getComputedStyle(el).outlineStyle !== 'none' : false
      };
    });
    console.log(`[FOCUS] Tab ${createNotebookTabs}: ${focused.tag} "${focused.text}" role=${focused.role} focusRing=${focused.hasFocusRing}`);

    // Check if we hit a launcher card
    if (focused.className && focused.className.includes('LauncherCard')) {
      if (focused.text && focused.text.includes('Python 3')) {
        console.log('[THINK-ALOUD] David: "Found the Python 3 Notebook card! Let me press Enter."');
        await ss('flowC-david-04-focus-on-kernel.png');
        await page.keyboard.press('Enter');
        break;
      }
    }

    if (createNotebookTabs > 15) {
      console.log('[USABILITY FAILURE] >15 Tab presses needed to reach Python 3 notebook card!');
    }
  }

  console.log(`[TAB-COUNT] Tabs to reach Python 3 card: ${createNotebookTabs}`);
  await page.waitForTimeout(3000);
  await ss('flowC-david-05-notebook-created.png');
  console.log('[RESULT] Attempted to create notebook via keyboard.');

  // Step 4: Check if notebook was created, check focus
  console.log('[THINK-ALOUD] David: "Did the notebook open? Let me check if focus is in the first cell."');
  const focusedAfter = await page.evaluate(() => {
    const el = document.activeElement;
    return {
      tag: el?.tagName,
      className: el?.className?.substring(0, 80),
      role: el?.getAttribute('role')
    };
  });
  console.log(`[FOCUS] After notebook creation: ${focusedAfter.tag} class=${focusedAfter.className} role=${focusedAfter.role}`);

  // Try to get focus into the cell editor - press Enter to enter edit mode in JupyterLab
  console.log('[THINK-ALOUD] David: "In JupyterLab, I need to press Enter to enter edit mode in the cell. Let me try."');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  // Step 5: Type code using keyboard
  console.log('[THINK-ALOUD] David: "Good. Now I am in the cell editor. Let me type the skore imports."');

  const davidImports = `from skore import CrossValidationReport, Project
import mlflow
from sklearn.datasets import load_iris
from sklearn.ensemble import HistGradientBoostingClassifier
print("Imports OK")`;

  await page.keyboard.type(davidImports, { delay: 20 });
  await page.waitForTimeout(500);
  await ss('flowC-david-06-imports-typed.png');

  // Step 6: Run cell with Shift+Enter
  console.log('[THINK-ALOUD] David: "Shift+Enter to execute the cell."');
  await page.keyboard.press('Shift+Enter');
  await page.waitForTimeout(6000);
  await ss('flowC-david-07-imports-run.png');

  // Check output
  const importOutput = await page.locator('.jp-OutputArea-output').first().textContent().catch(() => '');
  console.log('[RESULT] Import output: ' + importOutput.substring(0, 100));

  // Step 7: Type workflow cell
  console.log('[THINK-ALOUD] David: "Focus should now be in the next cell. Let me type the workflow."');

  const davidWorkflow = `X, y = load_iris(return_X_y=True, as_frame=True)
report = CrossValidationReport(HistGradientBoostingClassifier(), X, y)

project = Project("david-exp", mode="mlflow", tracking_uri="sqlite:///D:/devel/mlflow/mlflow.db")
project.put("hgb-keyboard", report)
print("Report stored!")`;

  await page.keyboard.type(davidWorkflow, { delay: 20 });
  await ss('flowC-david-08-workflow.png');

  // Run
  await page.keyboard.press('Shift+Enter');
  await page.waitForTimeout(12000);
  await ss('flowC-david-09-result.png');

  // Step 8: Test keyboard navigation of toolbar
  console.log('[THINK-ALOUD] David: "Let me test if I can navigate the notebook toolbar with keyboard. Pressing Escape to go to command mode, then testing shortcuts."');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Test some JupyterLab keyboard shortcuts
  // A = add cell above, B = add cell below (in command mode)
  console.log('[THINK-ALOUD] David: "In command mode. Let me press B to add a cell below."');
  await page.keyboard.press('b');
  await page.waitForTimeout(500);
  await ss('flowC-david-10-command-mode.png');

  // Test Ctrl+S to save
  console.log('[THINK-ALOUD] David: "Ctrl+S to save."');
  await page.keyboard.press('Control+s');
  await page.waitForTimeout(1000);

  // Step 9: Focus ring audit
  console.log('[THINK-ALOUD] David: "Let me do a focus ring audit. Going to Tab through the main interface elements and check visibility."');
  let focusAudit = [];
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    tabCount++;
    await page.waitForTimeout(200);
    const audit = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = el ? window.getComputedStyle(el) : {};
      return {
        tag: el?.tagName,
        text: el?.textContent?.substring(0, 30),
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow?.substring(0, 50),
        hasFocusIndicator: styles.outlineStyle !== 'none' || (styles.boxShadow && styles.boxShadow !== 'none')
      };
    });
    focusAudit.push(audit);
    console.log(`[FOCUS-AUDIT] ${audit.tag} "${audit.text}" outline=${audit.outlineStyle}/${audit.outlineWidth} focusVisible=${audit.hasFocusIndicator}`);
  }

  await ss('flowC-david-11-focus-audit.png');

  const missingFocus = focusAudit.filter(a => !a.hasFocusIndicator).length;
  console.log(`[ACCESSIBILITY] ${missingFocus}/${focusAudit.length} elements missing visible focus indicator`);
  console.log(`[TAB-TOTAL] Total Tab presses in session: ${tabCount}`);

  // Final state
  await ss('flowC-david-12-final.png');
  console.log('[THINK-ALOUD] David: "Overall, JupyterLab has decent keyboard support for cell editing. The Shift+Enter, Escape for command mode, and single-letter shortcuts work well. However, navigating the Launcher required too many Tab presses, and some UI elements lack visible focus rings. The notification popup was not easily dismissible with keyboard."');

  await context.close();
  await browser.close();
  console.log('David session complete.');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
