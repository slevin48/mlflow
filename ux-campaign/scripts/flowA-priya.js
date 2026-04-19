const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 100 });
  const context = await browser.newContext({
    recordVideo: { dir: 'D:/devel/mlflow/ux-campaign/videos/', size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Helper: wait for content to appear
  async function waitForContent(text, timeout = 10000) {
    try {
      await page.waitForSelector(`text=${text}`, { timeout });
      return true;
    } catch { return false; }
  }

  // 01 - Landing page
  await page.goto('http://localhost:5000');
  await waitForContent('iris-hgb-project', 10000);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/flowA-priya-01-landing.png', fullPage: false });
  console.log('01-landing: captured');

  const landingText = await page.locator('body').innerText();
  console.log('=== LANDING (1200) ===');
  console.log(landingText.substring(0, 1200));

  // 02 - Click iris-hgb-project
  await page.locator('text=iris-hgb-project').first().click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/flowA-priya-02-experiment.png', fullPage: false });
  console.log('02-experiment: URL:', page.url());

  // Check page content
  let expText = await page.locator('body').innerText();
  console.log('=== EXP PAGE (2000) ===');
  console.log(expText.substring(0, 2000));

  // 03 - Navigate to Training runs if needed
  const trainingRuns = page.locator('text=Training runs').first();
  if (await trainingRuns.count() > 0) {
    await trainingRuns.click();
    await page.waitForTimeout(4000);
    console.log('Clicked Training runs');
  }

  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/flowA-priya-03-runlist.png', fullPage: false });
  console.log('03-runlist');

  expText = await page.locator('body').innerText();
  console.log('=== TRAINING RUNS PAGE (3000) ===');
  console.log(expText.substring(0, 3000));
  console.log('=== MORE (3000-5000) ===');
  console.log(expText.substring(3000, 5000));

  // Find run links
  const allAnchors = await page.locator('a[href*="runs"]').all();
  console.log('Anchors with runs href:', allAnchors.length);
  for (let i = 0; i < Math.min(allAnchors.length, 5); i++) {
    const href = await allAnchors[i].getAttribute('href');
    const txt = await allAnchors[i].innerText().catch(() => '');
    console.log(`  Link ${i}: href=${href} text=${txt.substring(0, 40)}`);
  }

  // Also check for any table/grid rows
  const tableRows = await page.locator('div[role="row"], tr').all();
  console.log('Table rows found:', tableRows.length);

  // Click on a run - try different approaches
  let navigatedToRun = false;

  // Approach 1: click an anchor with runs in href
  if (allAnchors.length > 0) {
    try {
      await allAnchors[0].click();
      await page.waitForTimeout(4000);
      navigatedToRun = true;
      console.log('Clicked first run anchor');
    } catch (e) {
      console.log('Run anchor click failed:', e.message);
    }
  }

  // Approach 2: direct navigation
  if (!navigatedToRun) {
    console.log('Direct navigation to run page');
    await page.goto('http://localhost:5000/#/experiments/1/runs/13b5fa1aa088442ebaf0fe0a81dde033');
    await page.waitForTimeout(5000);
  }

  // Wait for run content to load
  const loaded = await waitForContent('accuracy', 15000);
  console.log('Run page has accuracy:', loaded);
  if (!loaded) {
    // Try waiting more
    await page.waitForTimeout(5000);
  }

  // 04 - Run detail
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/flowA-priya-04-rundetail.png', fullPage: false });
  console.log('04-rundetail: URL:', page.url());

  let runText = await page.locator('body').innerText();
  console.log('=== RUN DETAIL (4000) ===');
  console.log(runText.substring(0, 4000));
  console.log('=== RUN DETAIL MORE (4000-7000) ===');
  console.log(runText.substring(4000, 7000));

  // 05 - Look for tabs/sections for metrics, params, artifacts
  // Scroll down to see full content
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/flowA-priya-05-metrics.png', fullPage: false });
  console.log('05-metrics');

  // Look for an Artifacts section/tab/link
  const artifactElements = await page.locator('text=Artifacts').all();
  console.log('Artifacts elements:', artifactElements.length);
  for (const el of artifactElements) {
    const tag = await el.evaluate(e => e.tagName);
    const role = await el.evaluate(e => e.getAttribute('role') || '');
    console.log(`  Artifact el: ${tag} role=${role}`);
  }

  // Click first clickable Artifacts element
  if (artifactElements.length > 0) {
    try {
      await artifactElements[0].click();
      await page.waitForTimeout(3000);
      console.log('Clicked Artifacts element');
    } catch(e) {
      console.log('Artifacts click error:', e.message);
    }
  }

  // 06 - Artifacts view
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/flowA-priya-06-artifacts.png', fullPage: false });
  console.log('06-artifacts');

  runText = await page.locator('body').innerText();
  console.log('=== AFTER ARTIFACTS (2000) ===');
  console.log(runText.substring(0, 2000));

  // Try scrolling more
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);

  // 07 - Final
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/flowA-priya-07-final.png', fullPage: false });
  console.log('07-final');

  // Get full page text for final analysis
  runText = await page.locator('body').innerText();
  console.log('=== FULL FINAL TEXT ===');
  console.log(runText);
  console.log('=== END ===');

  await context.close();
  await browser.close();
  console.log('Priya session complete');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
