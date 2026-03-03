import type { BrowserService } from './browser.js';

declare global {
  namespace Express {
    interface Locals {
      browser: BrowserService;
    }
  }
}
