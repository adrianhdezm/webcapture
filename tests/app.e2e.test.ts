import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { BrowserService } from "../src/browser.js";

describe("app e2e", { timeout: 60_000 }, () => {
  let browserService: BrowserService | undefined;
  const authUser = "test-user";
  const authPassword = "test-pass";

  beforeAll(async () => {
    process.env.BASIC_AUTH_USER = authUser;
    process.env.BASIC_AUTH_PASSWORD = authPassword;
    browserService = new BrowserService();
    await browserService.initialize();
  }, 60_000);

  afterAll(async () => {
    if (browserService) {
      await browserService.close();
    }
  });

  it("returns rendered html from /content", async () => {
    const app = createApp(browserService as BrowserService);

    const response = await request(app)
      .post("/content")
      .auth(authUser, authPassword)
      .send({ url: "https://example.com" });

    expect(response.status).toBe(200);
    expect(response.body.url).toContain("https://example.com");
    expect(response.body.value).toContain("Example Domain");
  });

  it("returns png bytes from /screenshot", async () => {
    const app = createApp(browserService as BrowserService);

    const response = await request(app)
      .post("/screenshot")
      .auth(authUser, authPassword)
      .send({ url: "https://example.com" })
      .buffer(true)
      .parse((res, callback: (error: Error | null, body: Buffer) => void) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => callback(null, Buffer.concat(chunks)));
        res.on("error", (error: Error) =>
          callback(error as Error, Buffer.alloc(0)),
        );
      });

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/image\/png/);
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(
      (response.body as Buffer)
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe(true);
  });

  it("returns 400 for invalid url payload", async () => {
    const app = createApp(browserService as BrowserService);
    const response = await request(app)
      .post("/content")
      .auth(authUser, authPassword)
      .send({ url: "nope" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
  });

  it("returns 404 for unknown route", async () => {
    const app = createApp(browserService as BrowserService);
    const response = await request(app)
      .get("/not-found")
      .auth(authUser, authPassword);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Route not found: GET /not-found",
    });
  });

  it("returns 401 when auth is missing", async () => {
    const app = createApp(browserService as BrowserService);
    const response = await request(app)
      .post("/content")
      .send({ url: "https://example.com" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });
});
