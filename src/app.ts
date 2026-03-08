import express, { NextFunction, Request, Response } from 'express';
import compression from 'compression';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { z, ZodError } from 'zod';
import { BrowserService } from './browser.js';
import { logger } from './logger.js';
import { parseBasicAuthHeader, requestOptionsSchema, safeEqual } from './utils.js';

class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}


export function createApp(browserService: BrowserService): express.Express {
  const authUser = process.env.BASIC_AUTH_USER;
  const authPassword = process.env.BASIC_AUTH_PASSWORD;
  if (!authUser || !authPassword) {
    throw new Error('BASIC_AUTH_USER and BASIC_AUTH_PASSWORD must be set in environment.');
  }

  const app = express();
  app.locals.browser = browserService;
  app.disable('x-powered-by');

  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(
    pinoHttp({
      logger
    })
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    try {
      const credentials = parseBasicAuthHeader(req.headers.authorization);
      if (!credentials) {
        throw new HttpError(401, 'Unauthorized');
      }

      const userMatches = safeEqual(credentials.username, authUser);
      const passwordMatches = safeEqual(credentials.password, authPassword);
      if (!userMatches || !passwordMatches) {
        throw new HttpError(401, 'Unauthorized');
      }

      next();
    } catch (error) {
      next(error);
    }
  });

  app.post('/content', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestOptions = requestOptionsSchema.parse(req.body);
      const browser = req.app.locals.browser;
     
      const result = await browser.getContent(requestOptions);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post('/screenshot', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestOptions = requestOptionsSchema.parse(req.body);
      const browser = req.app.locals.browser;
     
      const screenshot = await browser.getScreenshot(requestOptions);

      res.type('image/png').send(screenshot);
    } catch (error) {
      next(error);
    }
  });

  app.post('/snapshot', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestOptions = requestOptionsSchema.parse(req.body);
      const browser = req.app.locals.browser;

      const snapshot = await browser.getSnapshot(requestOptions);

      res.json(snapshot);
    } catch (error) {
      next(error);
    }
  });

  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
  });

  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    const statusCode = error instanceof HttpError ? error.statusCode : error instanceof ZodError ? 400 : 500;

    const message =
      error instanceof ZodError
        ? (error.issues[0]?.message ?? 'Invalid request body.')
        : error instanceof Error
          ? error.message
          : 'Internal server error';

    req.log.error({ err: error }, 'Unhandled error');
    res.status(statusCode).json({ error: message });
  });

  return app;
}
