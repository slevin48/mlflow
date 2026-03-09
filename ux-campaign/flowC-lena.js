// Flow C - Lena Kowalski - Postdoc Researcher, rage-clicker
// Behavioral: clicks rapidly, no reading, abandons on ImportError, no terminal, LOW patience
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({
    recordVideo: { dir: 'D:/devel/mlflow/ux-campaign/videos/', size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const ss = async (name) => {
    await page.waitForTimeout(300);
    await page.screenshot({ path: `D:/devel/mlflow/ux-campaign/screenshots/${name}` });
    console.log(`Screenshot: ${name}`);
  };

  // Step 1: Navigate to JupyterLab - impatient
  console.log('[THINK-ALOUD] Lena: "JupyterLab. I know this. Let me just get a notebook going quick."');
  await page.goto('http://localhost:8888/lab', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(2000);
  await ss('flowC-lena-01-landing.png');
  console.log('[RESULT] JupyterLab loaded. Launcher visible.');
  console.log('[EMOTION] neutral -> impatient');

  // Step 2: Dismiss notification popup quickly without reading
  console.log('[THINK-ALOUD] Lena: "Some popup... No. Close it."');
  const noBtn = page.locator('button:has-text("No")').first();
  if (await noBtn.count() > 0) {
    await noBtn.click();
  }
  // Also try to close any X buttons
  const closeBtn = page.locator('.jp-Dialog-close, [aria-label="Close"]').first();
  if (await closeBtn.count() > 0) {
    try { await closeBtn.click({ timeout: 1000 }); } catch(e) {}
  }

  // Step 3: Rapidly click Python 3 to create notebook - double/triple click
  console.log('[THINK-ALOUD] Lena: "Python 3... there. Click click click."');
  const pyCard = page.locator('div.jp-LauncherCard').filter({ hasText: /Python 3/ }).first();
  if (await pyCard.count() > 0) {
    await pyCard.click();
    await page.waitForTimeout(200);
    // Rage: try clicking again on launcher if still visible
    try {
      const pyCard2 = page.locator('div.jp-LauncherCard').filter({ hasText: /Python 3/ }).first();
      if (await pyCard2.isVisible({ timeout: 500 })) {
        await pyCard2.click();
      }
    } catch(e) {}
  }
  await page.waitForTimeout(3000);
  await ss('flowC-lena-02-notebook-created.png');
  console.log('[RESULT] Notebook(s) created. Lena may have opened two notebooks from rage-clicking.');
  console.log('[THINK-ALOUD] Lena: "OK I have a notebook. Wait, did I open two? Whatever. Let me just type."');

  // Step 4: Type imports immediately without thinking
  console.log('[THINK-ALOUD] Lena: "from skore import Project... that should work right? Let me just go."');
  const cell = page.locator('.jp-Cell .jp-InputArea-editor').first();
  await cell.click();
  await page.waitForTimeout(300);

  // Lena types fast, doesn't look up exact imports
  const lenaImports = `from skore import Project
import mlflow`;

  await page.keyboard.type(lenaImports, { delay: 15 });
  await page.waitForTimeout(300);
  await ss('flowC-lena-03-imports.png');

  // Step 5: Run immediately - Shift+Enter
  console.log('[THINK-ALOUD] Lena: "Shift+Enter. Go go go."');
  await page.keyboard.press('Shift+Enter');
  await page.waitForTimeout(6000);
  await ss('flowC-lena-04-import-result.png');

  // Check if there's an error
  const outputText = await page.locator('.jp-OutputArea-output').first().textContent().catch(() => '');
  console.log('[RESULT] Output: ' + outputText.substring(0, 200));

  if (outputText.includes('ImportError') || outputText.includes('ModuleNotFoundError')) {
    console.log('[THINK-ALOUD] Lena: "ImportError?! Are you kidding me? This should just work! I installed everything! FORGET IT."');
    console.log('[EMOTION] impatient -> ANGRY -> ABANDONED');
    await ss('flowC-lena-05-abandon.png');
    console.log('[RESULT] Lena ABANDONS the session due to ImportError. Session over.');
  } else {
    console.log('[THINK-ALOUD] Lena: "OK that worked. Good. Now let me actually do something useful."');
    console.log('[EMOTION] impatient -> slightly relieved');

    // Step 6: Type workflow quickly
    const lenaWorkflow = `from sklearn.datasets import load_iris
from sklearn.ensemble import HistGradientBoostingClassifier
from skore import CrossValidationReport

X, y = load_iris(return_X_y=True, as_frame=True)
report = CrossValidationReport(HistGradientBoostingClassifier(), X, y)
print(report)`;

    await page.keyboard.type(lenaWorkflow, { delay: 12 });
    await ss('flowC-lena-05-workflow.png');

    // Run
    console.log('[THINK-ALOUD] Lena: "Run it. Come on."');
    await page.keyboard.press('Shift+Enter');
    await page.waitForTimeout(8000);
    await ss('flowC-lena-06-workflow-result.png');
    console.log('[RESULT] Workflow cell executed.');

    // Step 7: MLflow integration - Lena is impatient, types fast
    console.log('[THINK-ALOUD] Lena: "OK now the mlflow part. Project with mode=mlflow. Where do I put the tracking URI? Whatever, let me just try."');

    const lenaMlflow = `project = Project("lena-exp", mode="mlflow", tracking_uri="sqlite:///D:/devel/mlflow/mlflow.db")
project.put("my-model", report)
print("Done!")`;

    await page.keyboard.type(lenaMlflow, { delay: 12 });
    await page.keyboard.press('Shift+Enter');
    await page.waitForTimeout(10000);
    await ss('flowC-lena-07-mlflow-result.png');

    // Check for errors
    const mlflowOutput = await page.locator('.jp-OutputArea-output').last().textContent().catch(() => '');
    if (mlflowOutput.includes('Error')) {
      console.log('[THINK-ALOUD] Lena: "Another error?! This is ridiculous. Where is the documentation? Why is this so hard?"');
      console.log('[EMOTION] frustrated -> angry');
      await ss('flowC-lena-08-error.png');
    } else {
      console.log('[THINK-ALOUD] Lena: "Finally. Done. But how do I see this in MLflow? There is no link anywhere. Do I have to open another browser tab? That is terrible UX."');
      console.log('[EMOTION] relieved -> mildly annoyed at no MLflow link');
    }

    await ss('flowC-lena-08-final.png');
    console.log('[THINK-ALOUD] Lena: "Task done but this was way harder than it should be. No inline help, no autocomplete that matters, no link to MLflow. 3 out of 10."');
  }

  await context.close();
  await browser.close();
  console.log('Lena session complete.');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
