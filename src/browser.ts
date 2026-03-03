import { Browser, chromium } from 'playwright';

const browserContextOptions = {
  viewport: { width: 1024, height: 1280 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  locale: 'en-US'
};

export class BrowserService {
  private browser!: Browser;

  constructor() {}

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
  }

  async getContent(url: string): Promise<{ url: string; value: string }> {
    const context = await this.browser.newContext(browserContextOptions);
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.mouse.wheel(0, 2000);
      await page.waitForTimeout(2000);

      const html = await page.content();
      return { url: page.url(), value: html };
    } finally {
      await context.close();
    }
  }

  async getScreenshot(url: string): Promise<Buffer> {
    const context = await this.browser.newContext(browserContextOptions);
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.mouse.wheel(0, 2000);
      await page.waitForTimeout(2000);

      const screenshot = await page.screenshot({ type: 'png', fullPage: true });
      return screenshot;
    } finally {
      await context.close();
    }
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}
