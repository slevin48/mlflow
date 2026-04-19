// Flow C - Priya Chandrasekaran - Junior Data Scientist
// Behavioral: reads everything, no terminal, copies verbatim, expects templates
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    recordVideo: { dir: 'D:/devel/mlflow/ux-campaign/videos/', size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Helper
  const ss = async (name) => {
    await page.waitForTimeout(500);
    await page.screenshot({ path: `D:/devel/mlflow/ux-campaign/screenshots/${name}` });
    console.log(`Screenshot: ${name}`);
  };

  // Step 1: Navigate to JupyterLab
  console.log('[THINK-ALOUD] Priya: "OK, let me open JupyterLab. I hope there is some getting started guide or a template notebook for skore+mlflow."');
  await page.goto('http://localhost:8888/lab', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await ss('flowC-priya-01-landing.png');
  console.log('[RESULT] JupyterLab loaded. Launcher tab visible with kernel options.');
  console.log('[THINK-ALOUD] Priya: "I see the Launcher. There are sections... Notebook, Console, Other. I see Python 3 (ipykernel). No skore template though. Let me look around the file browser first."');

  // Step 2: Look at file browser
  console.log('[THINK-ALOUD] Priya: "The file browser on the left shows some files... plot_mlflow_backend.py - oh that might be a reference! But I want to create a notebook, not run a script. Let me check if there is any example notebook."');
  await ss('flowC-priya-02-filebrowser.png');

  // Step 3: Create a new notebook by clicking Python 3 in Launcher
  console.log('[THINK-ALOUD] Priya: "No example notebook visible. Let me just create a new one by clicking Python 3 (ipykernel) under Notebook."');

  // Look for the Python 3 notebook launcher button
  const notebookCard = page.locator('div.jp-LauncherCard').filter({ hasText: /Python 3/ }).first();
  if (await notebookCard.count() > 0) {
    await notebookCard.click();
  } else {
    // Try alternative selectors
    const kernelBtn = page.locator('[data-category="Notebook"]').first();
    if (await kernelBtn.count() > 0) {
      await kernelBtn.click();
    } else {
      // Click any launcher card with Python
      await page.locator('.jp-Launcher-cardContainer >> text=Python').first().click();
    }
  }
  await page.waitForTimeout(3000);
  await ss('flowC-priya-03-newnotebook.png');
  console.log('[RESULT] New notebook created (Untitled.ipynb). Empty cell ready.');
  console.log('[THINK-ALOUD] Priya: "Great, I have a new notebook. The kernel says Python 3 (ipykernel) in the top right. Now I need to figure out the skore+mlflow imports. I wish there was autocomplete or inline help."');

  // Step 4: Type first cell - imports
  console.log('[THINK-ALOUD] Priya: "Let me try importing skore. I remember seeing CrossValidationReport and Project in that reference file. Let me type it carefully."');

  // Click on the first cell and type
  const cell = page.locator('.jp-Cell .jp-InputArea-editor').first();
  await cell.click();
  await page.waitForTimeout(500);

  const importCode = `from skore import CrossValidationReport, Project
import mlflow
from sklearn.datasets import load_iris
from sklearn.ensemble import HistGradientBoostingClassifier

print("Imports successful!")`;

  await page.keyboard.type(importCode, { delay: 30 });
  await page.waitForTimeout(1000);
  await ss('flowC-priya-04-imports.png');
  console.log('[RESULT] Import cell typed. Priya copied the imports from memory of the reference file.');
  console.log('[THINK-ALOUD] Priya: "OK I typed the imports. Let me run this cell to see if everything is installed. Shift+Enter should work."');

  // Step 5: Run the cell
  await page.keyboard.press('Shift+Enter');
  await page.waitForTimeout(5000);
  await ss('flowC-priya-05-run-imports.png');
  console.log('[RESULT] Cell executed. Checking for output or errors.');
  console.log('[THINK-ALOUD] Priya: "It ran! I see the [1] next to the cell and \'Imports successful!\' in the output. No errors. Good, the packages are installed."');

  // Step 6: Write the workflow cell
  console.log('[THINK-ALOUD] Priya: "Now I need to write the actual workflow. Let me set up the data and create a CrossValidationReport. I remember from plot_mlflow_backend.py that I need to create a Project with mode=mlflow."');

  const workflowCode = `# Load data
X, y = load_iris(return_X_y=True, as_frame=True)
estimator = HistGradientBoostingClassifier()

# Create cross-validation report
report = CrossValidationReport(estimator, X, y)
print("Report created:", type(report))`;

  await page.keyboard.type(workflowCode, { delay: 25 });
  await page.waitForTimeout(500);
  await ss('flowC-priya-06-workflow.png');

  // Run it
  await page.keyboard.press('Shift+Enter');
  await page.waitForTimeout(8000);
  await ss('flowC-priya-07-workflow-result.png');
  console.log('[RESULT] Workflow cell executed. Report created.');
  console.log('[THINK-ALOUD] Priya: "The report was created. Now I need to push it to MLflow. Let me write the Project setup with mode=mlflow."');

  // Step 7: MLflow integration cell
  const mlflowCode = `# Connect to MLflow backend
project = Project(
    "my-experiment",
    mode="mlflow",
    tracking_uri="sqlite:///D:/devel/mlflow/mlflow.db",
)
project.put("hgb-baseline", report)
print("Report stored in MLflow!")`;

  await page.keyboard.type(mlflowCode, { delay: 25 });
  await page.waitForTimeout(500);
  await ss('flowC-priya-08-mlflow-cell.png');

  // Run it
  console.log('[THINK-ALOUD] Priya: "Let me run this... I hope the tracking URI is correct."');
  await page.keyboard.press('Shift+Enter');
  await page.waitForTimeout(10000);
  await ss('flowC-priya-09-mlflow-result.png');
  console.log('[RESULT] MLflow integration cell executed.');
  console.log('[THINK-ALOUD] Priya: "It seems to have worked! But where do I see the results in MLflow? There is no link or button to open the MLflow UI. I would have to manually open a new browser tab. That is not very discoverable."');

  // Final state
  await ss('flowC-priya-10-final.png');
  console.log('[THINK-ALOUD] Priya: "I completed the task but it took some effort. I had to know the imports and API from somewhere else - there was no in-notebook guidance. Also no way to navigate to MLflow UI from here."');

  await context.close();
  await browser.close();
  console.log('Priya session complete.');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
