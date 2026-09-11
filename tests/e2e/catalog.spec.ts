import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./#catalog');
});

async function createDemoQuote(page: Page) {
  await page.getByRole('button', { name: 'Load demo catalog' }).click();
  await page.getByRole('button', { name: 'Add to quote' }).first().click();
  await page.getByRole('button', { name: /Quotes/ }).click();
}

test('registers the installable app shell', async ({ page }) => {
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest\.webmanifest/);
  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    return { active: Boolean(ready.active), scriptURL: ready.active?.scriptURL ?? '' };
  });
  expect(registration.active).toBe(true);
  expect(registration.scriptURL).toContain('/PWA-Product-Catalog/sw.js');
});

test('supports the five locale settings with English as the default', async ({ page }) => {
  await page.goto('./#settings');
  const language = page.locator('select[name="language"]');
  await expect(language).toHaveValue('en');
  await expect(language.locator('option')).toHaveCount(5);
  const locales = [
    ['en', 'Save settings', 'Catalog'],
    ['zh-Hans', '保存设置', '产品目录'],
    ['ms', 'Simpan tetapan', 'Katalog'],
    ['vi', 'Lưu cài đặt', 'Danh mục'],
    ['ja', '設定を保存', 'カタログ'],
  ] as const;
  let renderedSaveLabel = 'Save settings';
  for (const [locale, saveLabel, catalogLabel] of locales) {
    await language.selectOption(locale);
    await page.getByRole('button', { name: renderedSaveLabel }).click();
    await expect(page.getByRole('navigation').getByRole('button').first()).toContainText(catalogLabel);
    renderedSaveLabel = saveLabel;
  }
});

test('supports first run, demo catalog search, and quote creation', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Your catalog is empty' })).toBeVisible();
  await page.getByRole('button', { name: 'Load demo catalog' }).click();
  await expect(page.getByText('6 products')).toBeVisible();
  await page.getByRole('textbox', { name: 'Search by product name or SKU' }).fill('PUMP-100');
  await expect(page.getByRole('heading', { name: 'Stainless Steel Transfer Pump' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to quote' }).click();
  await page.getByRole('button', { name: /Quotes/ }).click();
  await expect(page.getByText('$129.00').first()).toBeVisible();
  await expect(page.getByText('Saved locally')).toBeVisible();
});

test('imports a CSV through the mapping and validation flow', async ({ page }) => {
  await page.goto('./#settings');
  await page.locator('input[name="catalog-file"]').setInputFiles('tests/fixtures/catalog.csv');
  await expect(page.getByText('2 valid products')).toBeVisible();
  await page.getByRole('button', { name: 'Commit catalog' }).click();
  await page.getByRole('navigation').getByRole('button', { name: /Catalog/ }).click();
  await expect(page.locator('.screen-heading').getByText(/2 products/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Test Brass Coupling' })).toBeVisible();
});

test('reloads the warmed catalog offline', async ({ page, context }) => {
  await page.getByRole('button', { name: 'Load demo catalog' }).click();
  await expect(page.getByText('6 products')).toBeVisible();
  await page.reload();
  await expect(page.getByText('6 products')).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Stainless Steel Transfer Pump' })).toBeVisible();
  await expect(page.getByText('6 products')).toBeVisible();
});

test('exports a quote PDF and returns a valid PDF file', async ({ page }) => {
  await page.getByRole('button', { name: 'Load demo catalog' }).click();
  await page.getByRole('button', { name: 'Add to quote' }).first().click();
  await page.getByRole('button', { name: /Quotes/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Q-.*\.pdf$/);
  const path = await download.path();
  expect(path).toBeTruthy();
  const pdfBytes = await readFile(path!);
  expect(pdfBytes.subarray(0, 5).toString()).toBe('%PDF-');
});

test('downloads a PDF when Web Share is unavailable', async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined });
  });
  await createDemoQuote(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Share PDF' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Q-.*\.pdf$/);
  await expect(page.getByRole('status')).toContainText('Sharing is unavailable; the PDF was downloaded.');
});

test('uses Web Share when file sharing is supported', async ({ page }) => {
  await page.evaluate(() => {
    const testWindow = window as Window & { shareInvocations: number };
    testWindow.shareInvocations = 0;
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { testWindow.shareInvocations += 1; } });
  });
  await createDemoQuote(page);
  await expect(page.getByRole('status')).toBeHidden({ timeout: 6000 });
  await page.getByRole('button', { name: 'Share PDF' }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { shareInvocations: number }).shareInvocations), { timeout: 20000 }).toBe(1);
  await expect(page.getByRole('status')).toContainText('Share PDF');
});

test('preserves a draft when Web Share is cancelled', async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new DOMException('Cancelled', 'AbortError'); } });
  });
  await createDemoQuote(page);
  await expect(page.getByRole('status')).toBeHidden({ timeout: 6000 });
  await page.getByRole('button', { name: 'Share PDF' }).click();
  await expect(page.locator('.history-row').first()).toContainText('Draft');
  await expect(page.getByRole('status')).not.toBeVisible();
});

test('exports quote PDFs through all supported locale paths', async ({ page }) => {
  test.setTimeout(120000);
  await createDemoQuote(page);
  await expect(page.getByRole('status')).toBeHidden({ timeout: 6000 });
  const locales = [
    ['en', 'Save settings', 'Export PDF'],
    ['zh-Hans', '保存设置', '导出 PDF'],
    ['ms', 'Simpan tetapan', 'Eksport PDF'],
    ['vi', 'Lưu cài đặt', 'Xuất PDF'],
    ['ja', '設定を保存', 'PDF を出力'],
  ] as const;
  const navigation = page.getByRole('navigation').getByRole('button');
  let renderedSaveLabel = 'Save settings';
  for (const [locale, saveLabel, exportLabel] of locales) {
    await navigation.nth(2).click();
    await page.locator('select[name="language"]').selectOption(locale);
    await page.getByRole('button', { name: renderedSaveLabel }).click();
    renderedSaveLabel = saveLabel;
    await navigation.nth(1).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: exportLabel }).click();
    const download = await downloadPromise;
    const path = await download.path();
    const pdfBytes = await readFile(path!);
    expect(pdfBytes.subarray(0, 5).toString()).toBe('%PDF-');
  }
});

test('places long quote line items across multiple PDF pages', async ({ page }) => {
  await page.goto('./#settings');
  const rows = Array.from({ length: 28 }, (_, index) => `LONG-${index + 1},Long industrial component ${index + 1} with a deliberately verbose description,${index + 10}.00,Long components,each,Extended specification text for page wrapping`);
  const csv = `sku,name,price,category,unit,description\n${rows.join('\n')}`;
  await page.locator('input[name="catalog-file"]').setInputFiles({ name: 'long-catalog.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.getByText('28 valid products')).toBeVisible();
  await page.getByRole('button', { name: 'Commit catalog' }).click();
  await page.getByRole('navigation').getByRole('button', { name: /Catalog/ }).click();
  const addButtons = page.getByRole('button', { name: 'Add to quote' });
  for (let index = 0; index < 28; index += 1) await addButtons.nth(index).click();
  await page.getByRole('button', { name: /Quotes/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const pdfBytes = await readFile(path!);
  const pageCount = (pdfBytes.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
  expect(pageCount).toBeGreaterThan(1);
});

test('interacts with search clear, persistent bottom quote bar, and quantity stepper', async ({ page }) => {
  await page.getByRole('button', { name: 'Load demo catalog' }).click();
  const searchInput = page.getByRole('textbox', { name: 'Search by product name or SKU' });
  await searchInput.fill('PUMP');
  await expect(page.getByRole('heading', { name: 'Stainless Steel Transfer Pump' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(searchInput).toHaveValue('');

  await page.getByRole('button', { name: 'Add to quote' }).first().click();
  const floatingBar = page.locator('.floating-quote-bar');
  await expect(floatingBar).toBeVisible();
  await expect(floatingBar).toContainText('1');
  await page.getByRole('button', { name: 'View quote' }).click();
  await expect(page).toHaveURL(/#quotes/);

  const increaseBtn = page.getByRole('button', { name: 'Increase quantity' });
  await increaseBtn.click();
  await expect(page.locator('input[name^="quantity-"]')).toHaveValue('2');
  const decreaseBtn = page.getByRole('button', { name: 'Decrease quantity' });
  await decreaseBtn.click();
  await expect(page.locator('input[name^="quantity-"]')).toHaveValue('1');
});
