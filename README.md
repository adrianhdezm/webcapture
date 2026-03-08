# Webcapture

Minimal Express + TypeScript API (using `pnpm`) for browser rendering.

## Endpoints

- `POST /content` - Returns HTML as `value`
- `POST /screenshot` - Returns PNG image binary (`image/png`)

All endpoints require HTTP Basic Auth.

Both endpoints receive JSON body:

```json
{
  "url": "https://example.com"
}
```

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
