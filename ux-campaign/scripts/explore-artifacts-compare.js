const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Go to run detail
  await page.goto('http://localhost:5000/#/experiments/1/runs/54f0b2c1b0ac4f32acd194dfb8cf4d57');
  await page.waitForTimeout(5000);

  // Click Artifacts tab
  const artifactsTab = page.locator('[role="tab"]:has-text("Artifacts")');
  await artifactsTab.click();
  await page.waitForTimeout(3000);

  let text = await page.locator('body').innerText();
  console.log('=== ARTIFACTS TAB ===');
  console.log(text.substring(0, 5000));
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-artifacts-tab.png' });

  // Click Model metrics tab
  const modelMetricsTab = page.locator('[role="tab"]:has-text("Model metrics")');
  await modelMetricsTab.click();
  await page.waitForTimeout(3000);

  text = await page.locator('body').innerText();
  console.log('=== MODEL METRICS TAB ===');
  console.log(text.substring(0, 3000));
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-model-metrics-tab.png' });

  // Go to training runs list - check comparison features
  await page.goto('http://localhost:5000/#/experiments/1/runs?startTime=ALL');
  await page.waitForTimeout(5000);

  text = await page.locator('body').innerText();
  console.log('=== TRAINING RUNS LIST ===');
  console.log(text.substring(0, 5000));
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-training-runs.png' });

  // Look for checkboxes or selection mechanisms
  const checkboxes = await page.locator('input[type="checkbox"], [role="checkbox"]').all();
  console.log('Checkboxes found:', checkboxes.length);

  // Look for Compare button
  const compareBtn = await page.locator('text=Compare').count();
  console.log('Compare button found:', compareBtn);

  // Look for column headers
  const headers = await page.locator('th, [role="columnheader"]').allTextContents();
  console.log('Column headers:', headers);

  // Expand rows if possible
  const expandBtn = page.locator('text=Expand rows').first();
  if (await expandBtn.count() > 0) {
    await expandBtn.click();
    await page.waitForTimeout(2000);
    console.log('Clicked Expand rows');
    text = await page.locator('body').innerText();
    console.log('=== EXPANDED ===');
    console.log(text.substring(0, 4000));
    await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-expanded-runs.png' });
  }

  await browser.close();
})().catch(e => console.error(e.message));
