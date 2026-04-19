const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Go directly to the known run
  await page.goto('http://localhost:5000/#/experiments/1/runs/54f0b2c1b0ac4f32acd194dfb8cf4d57');
  await page.waitForTimeout(5000);

  let text = await page.locator('body').innerText();
  console.log('=== RUN PAGE (full) ===');
  console.log(text);
  console.log('=== END ===');

  // Take screenshot
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-run-detail.png' });

  // Check for tabs
  const tabs = await page.locator('[role="tab"]').all();
  console.log('Tabs found:', tabs.length);
  for (const tab of tabs) {
    console.log('  Tab:', await tab.innerText().catch(() => 'N/A'));
  }

  // Look for expandable sections
  const buttons = await page.locator('button').all();
  console.log('Buttons:', buttons.length);
  for (const btn of buttons.slice(0, 20)) {
    const txt = await btn.innerText().catch(() => '');
    if (txt.trim()) console.log('  Button:', txt.substring(0, 60));
  }

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'D:/devel/mlflow/ux-campaign/screenshots/explore-run-scrolled.png' });

  text = await page.locator('body').innerText();
  console.log('=== AFTER SCROLL ===');
  console.log(text.substring(text.length - 3000));

  await browser.close();
})().catch(e => console.error(e.message));
