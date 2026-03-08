# Webcapture

Minimal Express + TypeScript API (using `pnpm`) for browser rendering.

## Endpoints

- `POST /content` - Returns HTML as `value`
- `POST /screenshot` - Returns PNG image binary (`image/png`)
- `POST /snapshot` - Returns JSON with `url`, `html`, and `screenshotBase64`

All endpoints require HTTP Basic Auth.

Both endpoints receive JSON body:

```json
{
  "url": "https://example.com",
  "gotoOptions": {
    "timeout": 30000,
    "waitUntil": "domcontentloaded"
  },
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "viewport": {
    "height": 1080,
    "width": 1920
  },
  "waitForSelector": {
    "selector": "main",
    "visible": true,
    "timeout": 30000
  },
  "waitForTimeout": 1000
}
```

All request options except `url` are optional. Timeout limits:
- `gotoOptions.timeout`: max `60000` (default `30000`)
- `waitForSelector.timeout`: max `120000`
- `waitForTimeout`: max `120000`

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Install Playwright browser binaries:

```bash
pnpm exec playwright install chromium
```

3. Configure environment:

```bash
cp .env.example .env
```

4. Start development server:

```bash
pnpm dev
```

This uses Node's native env loading via `node --env-file=.env`.

## Usage

Fetch HTML:

```bash
curl -u admin:change-me -X POST http://localhost:3000/content \
  -H "content-type: application/json" \
  -d '{"url":"https://example.com"}'
```

Capture screenshot:

```bash
curl -u admin:change-me -X POST http://localhost:3000/screenshot \
  -H "content-type: application/json" \
  -d '{"url":"https://example.com"}' \
  --output screenshot.png
```

Capture snapshot (HTML + base64 screenshot):

```bash
curl -u admin:change-me -X POST http://localhost:3000/snapshot \
  -H "content-type: application/json" \
  -d '{"url":"https://example.com"}'
```

Production run:

```bash
pnpm build
pnpm start
```

## Errors

Validation and runtime errors are returned as JSON:

```json
{
  "error": "message"
}
```
