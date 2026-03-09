const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Go to training runs
  await page.goto('http://localhost:5000/#/experiments/1/runs?startTime=ALL');
  await page.waitForTimeout(5000);

  // Try selecting checkboxes
  const checkboxes = await page.locator('input[type="checkbox"], [role="checkbox"]').all();
  console.log('Checkboxes:', checkboxes.length);

  // Click first checkbox
  if (checkboxes.length > 0) {
    await checkboxes[0].click();
    await page.waitForTimeout(1000);
    console.log('Clicked first checkbox');

    let text = await page.locator('body').innerText();
    // Check if Compare button appeared
    const compareNow = await page.locator('text=Compare').count();
    console.log('Compare buttons after 1 check:', compareNow);
    await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-1-selected.png' });
  }

  // Click second checkbox
  if (checkboxes.length > 1) {
    await checkboxes[1].click();
    await page.waitForTimeout(1000);
    console.log('Clicked second checkbox');

    const compareNow = await page.locator('text=Compare').count();
    console.log('Compare buttons after 2 checks:', compareNow);

    let text = await page.locator('body').innerText();
    console.log('=== AFTER 2 SELECTED ===');
    console.log(text.substring(0, 3000));
    await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-2-selected.png' });
  }

  // Try clicking Compare if it appeared
  const compareBtn = page.locator('button:has-text("Compare")').first();
  if (await compareBtn.count() > 0) {
    await compareBtn.click();
    await page.waitForTimeout(3000);
    console.log('Clicked Compare');

    let text = await page.locator('body').innerText();
    console.log('=== COMPARE VIEW ===');
    console.log(text.substring(0, 5000));
    await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-compare-view.png' });
  }

  // Also check: click on hgb-baseline to see child runs
  await page.goto('http://localhost:5000/#/experiments/1/runs/54f0b2c1b0ac4f32acd194dfb8cf4d57');
  await page.waitForTimeout(5000);

  // Click on a child run link
  const childRun = page.locator('text=split_0').first();
  if (await childRun.count() > 0) {
    await childRun.click();
    await page.waitForTimeout(3000);
    let text = await page.locator('body').innerText();
    console.log('=== CHILD RUN ===');
    console.log(text.substring(0, 3000));
    await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-child-run.png' });
  }

  // Check the Artifacts tab on the main run for skore artifacts
  await page.goto('http://localhost:5000/#/experiments/1/runs/54f0b2c1b0ac4f32acd194dfb8cf4d57');
  await page.waitForTimeout(5000);

  const artifactsTab = page.locator('[role="tab"]:has-text("Artifacts")');
  await artifactsTab.click();
  await page.waitForTimeout(3000);

  // Click on report.pkl
  const reportPkl = page.locator('text=report.pkl').first();
  if (await reportPkl.count() > 0) {
    await reportPkl.click();
    await page.waitForTimeout(2000);
    let text = await page.locator('body').innerText();
    console.log('=== REPORT.PKL SELECTED ===');
    console.log(text.substring(0, 3000));
    await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-report-pkl.png' });
  }

  // Click on data.analyze.html
  const analyzeHtml = page.locator('text=data.analyze.html').first();
  if (await analyzeHtml.count() > 0) {
    await analyzeHtml.click();
    await page.waitForTimeout(2000);
    let text = await page.locator('body').innerText();
    console.log('=== DATA.ANALYZE.HTML SELECTED ===');
    console.log(text.substring(0, 2000));
    await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-analyze-html.png' });
  }

  // Click on metrics.csv
  const metricsCsv = page.locator('text=metrics.csv').first();
  if (await metricsCsv.count() > 0) {
    await metricsCsv.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-metrics-csv.png' });
    let text = await page.locator('body').innerText();
    console.log('=== METRICS.CSV SELECTED ===');
    console.log(text.substring(0, 2000));
  }

  // Click on a PNG artifact
  const confusionPng = page.locator('text=metrics.confusion_matrix.png').first();
  if (await confusionPng.count() > 0) {
    await confusionPng.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-confusion-matrix.png' });
    console.log('Confusion matrix PNG preview captured');
  }

  await browser.close();
})().catch(e => console.error(e.message));
