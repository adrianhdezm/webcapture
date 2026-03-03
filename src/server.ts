import http from 'node:http';
import { createTerminus } from '@godaddy/terminus';

import { createApp } from './app.js';
import { BrowserService } from './browser.js';
import { logger } from './logger.js';

try {
  const PORT = Number(process.env.PORT ?? '3000');
  const browserService = new BrowserService();
  await browserService.initialize();

  const app = createApp(browserService);
  const server = http.createServer(app);

  const options = {
    signals: ['SIGINT', 'SIGTERM'],
    healthChecks: {
      '/health': async () => ({ status: 'ok' })
    },
    onSignal: async () => {
      await browserService.close();
    },
    onShutdown: async () => {
      logger.info('Shutdown complete');
    },
    logger: (message: string, error?: unknown) => {
      if (error) {
        logger.error({ err: error }, message);
        return;
      }
      logger.info(message);
    }
  };

  createTerminus(server, options);

  server.listen(PORT || 3000, () => {
    logger.info({ port: PORT || 3000 }, 'browser-rendering-api listening');
  });
} catch (error) {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
}
