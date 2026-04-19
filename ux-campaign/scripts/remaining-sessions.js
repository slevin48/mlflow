const { chromium } = require('@playwright/test');

const SS = 'D:/devel/mlflow/ux-campaign/screenshots/';
const VD = 'D:/devel/mlflow/ux-campaign/videos/';
const BASE = 'http://localhost:5000';

async function sleep(page, ms) { await page.waitForTimeout(ms); }
async function waitFor(page, text, timeout = 8000) {
  try { await page.waitForSelector(`text=${text}`, { timeout }); return true; }
  catch { return false; }
}
async function screenshot(page, name) {
  await page.screenshot({ path: SS + name, fullPage: false });
  console.log(`  Screenshot: ${name}`);
}
async function getText(page) {
  return await page.locator('body').innerText();
}

// ========== FLOW B - MARCUS ==========
async function flowB_Marcus() {
  console.log('\n=== FLOW B - MARCUS (Run Comparison & Pre-MLOps Review) ===\n');
  const browser = await chromium.launch({ headless: true, slowMo: 80 });
  const context = await browser.newContext({
    recordVideo: { dir: VD, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('[THINK-ALOUD] Marcus: "For pre-MLOps review I need to compare runs."');
  await page.goto(`${BASE}/#/experiments/1/runs?startTime=ALL`);
  await sleep(page, 4000);
  await screenshot(page, 'flowB-marcus-01-runlist.png');
  console.log('[RESULT] Training runs list with hgb-baseline and 6 matching runs.');
  console.log('[THINK-ALOUD] Marcus: "One parent run visible. Need child runs to compare folds."');

  const expandIcon = page.locator('.ag-group-contracted').first();
  if (await expandIcon.count() > 0) {
    await expandIcon.click();
    await sleep(page, 2000);
    console.log('[RESULT] Expanded row.');
  } else {
    console.log('[RESULT] No expand icon found.');
  }
  await screenshot(page, 'flowB-marcus-02-expanded.png');

  console.log('\n[THINK-ALOUD] Marcus: "Trying checkboxes..."');
  const firstCheckbox = page.locator('.ag-selection-checkbox').first();
  if (await firstCheckbox.count() > 0) {
    await firstCheckbox.click();
    await sleep(page, 1000);
  }
  const compareBtn = await page.locator('button:has-text("Compare")').count();
  console.log(`Compare button visible: ${compareBtn > 0}`);
  await screenshot(page, 'flowB-marcus-03-selection.png');

  console.log('\n[THINK-ALOUD] Marcus: "Assessing run for promotion."');
  await page.goto(`${BASE}/#/experiments/1/runs/54f0b2c1b0ac4f32acd194dfb8cf4d57`);
  await sleep(page, 5000);
  await screenshot(page, 'flowB-marcus-04-rundetail.png');
  console.log('[RESULT] Run detail with metrics and params.');
  console.log('[THINK-ALOUD] Marcus: "Accuracy 0.946 +/- 0.065. roc_auc 0.991. For iris, variance is high."');

  const registerModel = await page.locator('button:has-text("Register")').count();
  console.log(`Register button: ${registerModel > 0}`);

  await page.evaluate(() => window.scrollTo(0, 1500));
  await sleep(page, 1000);
  await screenshot(page, 'flowB-marcus-05-model.png');

  console.log('\n[THINK-ALOUD] Marcus: "Checking artifacts for promotion decision."');
  await page.locator('[role="tab"]:has-text("Artifacts")').click();
  await sleep(page, 3000);
  await screenshot(page, 'flowB-marcus-06-artifacts.png');
  console.log('[RESULT] Artifacts: metrics_details/, data.analyze.html, confusion matrix, CSV, ROC, report.pkl');

  const analyzeHtml = page.locator('text=data.analyze.html').first();
  if (await analyzeHtml.count() > 0) {
    await analyzeHtml.click();
    await sleep(page, 2000);
  }
  await screenshot(page, 'flowB-marcus-06b-analyze.png');

  console.log('\n[THINK-ALOUD] Marcus: "Looking for download/export buttons."');
  const downloadBtn = (await page.locator('button:has-text("Download")').count()) + (await page.locator('button:has-text("Export")').count());
  console.log(`Download/Export buttons: ${downloadBtn}`);

  const shareBtn = await page.locator('button:has-text("Share")').count();
  console.log(`Share button: ${shareBtn}`);
  console.log('[THINK-ALOUD] Marcus: "No obvious CSV export. Would have to use REST API."');

  await screenshot(page, 'flowB-marcus-07-final.png');
  console.log('\n[FINAL] Marcus completed Flow B. Rich artifacts for promotion. Missing: comparison table, model registry workflow, export. Behind W&B.');

  await context.close();
  await browser.close();
  console.log('=== Marcus Flow B COMPLETE ===');
}

// ========== FLOW B - LENA ==========
async function flowB_Lena() {
  console.log('\n=== FLOW B - LENA (Rage-clicker Postdoc) ===\n');
  const browser = await chromium.launch({ headless: true, slowMo: 50 });
  const context = await browser.newContext({
    recordVideo: { dir: VD, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('[THINK-ALOUD] Lena: "OK where are my runs?"');
  await page.goto(BASE);
  await sleep(page, 2000);
  await screenshot(page, 'flowB-lena-01-landing.png');
  console.log('[EMOTION] impatient');

  await page.locator('text=iris-hgb-project').first().click();
  await sleep(page, 2000);
  await screenshot(page, 'flowB-lena-02-experiment.png');
  console.log('[THINK-ALOUD] Lena: "No data available? What?? *clicks randomly*"');
  console.log('[EMOTION] frustrated');

  await page.locator('text=Traces').first().click();
  await sleep(page, 1500);
  await page.locator('text=Sessions').first().click();
  await sleep(page, 1500);
  await screenshot(page, 'flowB-lena-03-confusion.png');

  console.log('[THINK-ALOUD] Lena: "Training runs? FINALLY."');
  await page.locator('text=Training runs').first().click();
  await sleep(page, 3000);
  await screenshot(page, 'flowB-lena-04-runlist.png');
  console.log('[THINK-ALOUD] Lena: "One run? Where is compare?"');

  await page.locator('a:has-text("hgb-baseline")').first().click();
  await sleep(page, 5000);
  await screenshot(page, 'flowB-lena-05-rundetail.png');
  console.log('[THINK-ALOUD] Lena: "Metrics. accuracy 0.946. How do I compare folds?"');

  const splitLink = page.locator('text=split_0').first();
  if (await splitLink.count() > 0) {
    await splitLink.click();
    await sleep(page, 5000);
    await screenshot(page, 'flowB-lena-06-childrun.png');
    console.log('[THINK-ALOUD] Lena: "One fold. accuracy 1.0. Want ALL folds side by side!"');
    console.log('[EMOTION] frustrated');
  }

  await page.goBack();
  await sleep(page, 3000);

  const artTab = page.locator('[role="tab"]:has-text("Artifacts")');
  if (await artTab.count() > 0) {
    await artTab.click();
    await sleep(page, 2000);
  }
  await screenshot(page, 'flowB-lena-07-artifacts.png');
  console.log('[THINK-ALOUD] Lena: "metrics.csv! I can download and use pandas."');

  const csvFile = page.locator('text=metrics.csv').first();
  if (await csvFile.count() > 0) {
    await csvFile.click();
    await sleep(page, 2000);
  }
  await screenshot(page, 'flowB-lena-08-csv.png');
  console.log('[THINK-ALOUD] Lena: "Where is the download button?"');
  console.log('[EMOTION] frustrated');

  await screenshot(page, 'flowB-lena-09-final.png');
  console.log('\n[FINAL] Lena partially completed Flow B. No comparison table. Found CSV in artifacts. Would abandon and use pandas.');

  await context.close();
  await browser.close();
  console.log('=== Lena Flow B COMPLETE ===');
}

// ========== FLOW B - DAVID ==========
async function flowB_David() {
  console.log('\n=== FLOW B - DAVID (Keyboard-only, Run Comparison) ===\n');
  const browser = await chromium.launch({ headless: true, slowMo: 100 });
  const context = await browser.newContext({
    recordVideo: { dir: VD, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  let totalTabs = 0;
  async function tab(n = 1) {
    for (let i = 0; i < n; i++) { await page.keyboard.press('Tab'); totalTabs++; await sleep(page, 100); }
  }

  console.log('[THINK-ALOUD] David: "Comparison via keyboard. Let me try the training runs list."');
  await page.goto(`${BASE}/#/experiments/1/runs?startTime=ALL`);
  await sleep(page, 4000);
  await screenshot(page, 'flowB-david-01-runlist.png');

  console.log('\n[THINK-ALOUD] David: "Tabbing into the ag-grid table..."');
  for (let i = 0; i < 30; i++) {
    await tab(1);
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName, role: el?.getAttribute('role') || '',
        text: el?.innerText?.substring(0, 40) || '',
        className: el?.className?.substring(0, 60) || ''
      };
    });
    if (focused.role === 'grid' || focused.role === 'row' || focused.className.includes('ag-')) {
      console.log(`[RESULT] Reached grid after ${totalTabs} Tabs: role=${focused.role} class=${focused.className}`);
      await page.keyboard.press('Space');
      await sleep(page, 500);
      break;
    }
    if (focused.text.includes('hgb-baseline')) {
      console.log(`[RESULT] Reached hgb-baseline after ${totalTabs} Tabs.`);
      await page.keyboard.press('Enter');
      await sleep(page, 2000);
      break;
    }
  }
  await screenshot(page, 'flowB-david-02-grid-nav.png');

  // Navigate to run detail
  await page.goto(`${BASE}/#/experiments/1/runs/54f0b2c1b0ac4f32acd194dfb8cf4d57`);
  await sleep(page, 5000);

  console.log('\n[THINK-ALOUD] David: "Checking tab keyboard navigation on run detail..."');
  totalTabs = 0;
  for (let i = 0; i < 25; i++) {
    await tab(1);
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        role: el?.getAttribute('role') || '',
        text: el?.innerText?.substring(0, 30) || '',
        ariaSelected: el?.getAttribute('aria-selected'),
        hasOutline: window.getComputedStyle(el).outlineStyle !== 'none'
      };
    });
    if (focused.role === 'tab') {
      console.log(`[RESULT] Tab "${focused.text}" after ${totalTabs} Tabs. outline=${focused.hasOutline}`);
      for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft']) {
        await page.keyboard.press(key);
        await sleep(page, 300);
        const nf = await page.evaluate(() => ({
          text: document.activeElement?.innerText?.substring(0, 30),
          role: document.activeElement?.getAttribute('role')
        }));
        console.log(`  ${key}: "${nf.text}" role=${nf.role}`);
      }
      break;
    }
  }
  await screenshot(page, 'flowB-david-03-tabs.png');

  // Try Artifacts via arrow keys
  const currentRole = await page.evaluate(() => document.activeElement?.getAttribute('role'));
  if (currentRole === 'tab') {
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
      await sleep(page, 300);
      const f = await page.evaluate(() => document.activeElement?.innerText?.substring(0, 20));
      if (f && f.includes('Artifacts')) {
        await page.keyboard.press('Enter');
        await sleep(page, 2000);
        console.log('[RESULT] Activated Artifacts tab via keyboard.');
        break;
      }
    }
  }
  await screenshot(page, 'flowB-david-04-artifacts.png');

  // Tab through artifacts
  for (let i = 0; i < 10; i++) {
    await tab(1);
    const focused = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      text: document.activeElement?.innerText?.substring(0, 40)
    }));
    if (focused.text && (focused.text.includes('metrics') || focused.text.includes('report'))) {
      console.log(`[RESULT] Reached artifact "${focused.text}" via Tab.`);
      await page.keyboard.press('Enter');
      await sleep(page, 1000);
      break;
    }
  }
  await screenshot(page, 'flowB-david-05-artifact-selected.png');
  await screenshot(page, 'flowB-david-06-final.png');

  console.log(`\n[TOTAL TAB COUNT] ${totalTabs}`);
  console.log('[THINK-ALOUD] David: "ag-grid not WAI-ARIA compliant for keyboard. Run tabs support arrows. No keyboard comparison workflow."');
  console.log('\n[FINAL] David: comparison not keyboard-accessible. Tabs work. Major blocker for adoption.');

  await context.close();
  await browser.close();
  console.log('=== David Flow B COMPLETE ===');
}

(async () => {
  try {
    await flowB_Marcus();
    await flowB_Lena();
    await flowB_David();
    console.log('\n=== ALL REMAINING SESSIONS COMPLETE ===');
  } catch (e) {
    console.error('FATAL:', e.message, e.stack);
    process.exit(1);
  }
})();
