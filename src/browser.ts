import { Browser, chromium } from 'playwright';
import { RequestOptions } from './utils.js';

type SnapshotResult = {
  url: string;
  html: string;
  screenshotBase64: string;
};

export class BrowserService {
  private browser!: Browser;

  constructor() {}

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
  }

  async getContent(requestOptions: RequestOptions): Promise<{ url: string; value: string }> {
    const { url, userAgent, viewport, locale, gotoOptions, waitForSelector, waitForTimeout } = requestOptions;
    const context = await this.browser.newContext({ userAgent, viewport, locale });

    const page = await context.newPage();

    try {
      await page.goto(url, gotoOptions);

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector.selector, {
          state: waitForSelector.hidden ? 'hidden' : 'visible',
          timeout: waitForSelector.timeout
        });
      }
      if (typeof waitForTimeout === 'number') {
        await page.waitForTimeout(waitForTimeout);
      }

      const html = await page.content();
      return { url: page.url(), value: html };
    } finally {
      await context.close();
    }
  }

  async getScreenshot(requestOptions: RequestOptions): Promise<Buffer> {
     const { url, userAgent, viewport, locale, gotoOptions, waitForSelector, waitForTimeout } = requestOptions;
    const context = await this.browser.newContext({ userAgent, viewport, locale });

    const page = await context.newPage();

    try {
      await page.goto(url, gotoOptions);

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector.selector, {
          state: waitForSelector.hidden ? 'hidden' : 'visible',
          timeout: waitForSelector.timeout
        });
      }
      if (typeof waitForTimeout === 'number') {
        await page.waitForTimeout(waitForTimeout);
      }


      const screenshot = await page.screenshot({ type: 'png', fullPage: true });
      return screenshot;
    } finally {
      await context.close();
    }
  }

  async getSnapshot(requestOptions: RequestOptions): Promise<SnapshotResult> {
    const { url, userAgent, viewport, locale, gotoOptions, waitForSelector, waitForTimeout } = requestOptions;
    const context = await this.browser.newContext({ userAgent, viewport, locale });

    const page = await context.newPage();

    try {
      await page.goto(url, gotoOptions);

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector.selector, {
          state: waitForSelector.hidden ? 'hidden' : 'visible',
          timeout: waitForSelector.timeout
        });
      }
      if (typeof waitForTimeout === 'number') {
        await page.waitForTimeout(waitForTimeout);
      }

      const html = await page.content();
      const screenshot = await page.screenshot({ type: 'png', fullPage: true });

      return {
        url: page.url(),
        html,
        screenshotBase64: screenshot.toString('base64')
      };
    } finally {
      await context.close();
    }
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}
