import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("http://127.0.0.1:2030/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/v1/asset/") {
      await route.fulfill({
        contentType: "application/json",
        json: {
          count: 2,
          next: null,
          previous: null,
          results: [
            { uid: "asset-1", unique_identifier: "US91282CJL63", asset_type: "Bond" },
            { uid: "asset-2", unique_identifier: "MX0MGO0000D8", asset_type: "Bond" },
          ],
        },
      });
      return;
    }
    if (url.pathname === "/api/v1/pricing/market_data/") {
      await route.fulfill({
        contentType: "application/json",
        json: { status: "ready", set_count: 2, binding_count: 4 },
      });
      return;
    }
    if (url.pathname === "/api/v1/pricing/market_data/sets/") {
      await route.fulfill({
        contentType: "application/json",
        json: {
          count: 1,
          next: null,
          previous: null,
          results: [{ uid: "set-1", display_name: "Production", set_key: "production", status: "active" }],
        },
      });
      return;
    }
    if (url.pathname === "/api/v1/settings/") {
      await route.fulfill({
        contentType: "application/json",
        json: { service: "markets", contract_version: "apps/v1" },
      });
      return;
    }
    if (url.pathname === "/api/v1/calendar/calendar-1/") {
      await route.fulfill({
        contentType: "application/json",
        json: {
          uid: "calendar-1",
          display_name: "Vienna Exchange",
          calendar_type: "exchange",
          timezone: "Europe/Vienna",
        },
      });
      return;
    }
    if (url.pathname === "/api/v1/calendar/calendar-1/dates/") {
      await route.fulfill({
        contentType: "application/json",
        json: {
          count: 1,
          next: null,
          previous: null,
          results: [{
            uid: "date-1",
            local_date: "2026-08-06",
            is_business_day: true,
            is_holiday: false,
          }],
        },
      });
      return;
    }
    await route.fulfill({ contentType: "application/json", json: {} });
  });
});

test("renders the standalone Markets shell and asset registry", async ({ page }) => {
  await page.goto("/assets");
  await expect(page.getByRole("heading", { name: "Assets", exact: true, level: 1 })).toBeVisible();
  await expect(page.getByText("US91282CJL63")).toBeVisible();
  await expect(page.getByText("MX0MGO0000D8")).toBeVisible();
  await expect(page.getByText("2 assets")).toBeVisible();
});

test("supports direct deep-route navigation", async ({ page }) => {
  await page.goto("/portfolios/portfolio-1");
  await expect(page.getByRole("button", { name: "Portfolios" })).toBeVisible();
  await expect(page.getByText("getPortfolio", { exact: true })).toBeVisible();
});

test("normalizes pricing overview and its embedded resource collections", async ({ page }) => {
  await page.goto("/pricing-market-data");
  await expect(page.getByRole("heading", { name: "Pricing Market Data", level: 2 })).toBeVisible();
  await expect(page.getByRole("code").filter({ hasText: "getPricingMarketDataCard" })).toBeVisible();

  await page.getByRole("tab", { name: "Market Data Sets" }).click();
  await expect(page.getByRole("heading", { name: "Market Data Sets", exact: true })).toBeVisible();
  await expect(page.getByText("Production", { exact: true })).toBeVisible();
});

test("normalizes settings as a detail experience with runtime and metadata tabs", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings", level: 2 })).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: "http://127.0.0.1:2030" })).toBeVisible();

  await page.getByRole("tab", { name: "Public Metadata" }).click();
  await expect(page.getByText("getApiSettings", { exact: true })).toBeVisible();
  await expect(page.getByText("apps/v1", { exact: true })).toBeVisible();
});

test("renders related collections through an embedded SDK resource list", async ({ page }) => {
  await page.goto("/calendars/calendar-1");
  await expect(page.getByRole("heading", { name: "Vienna Exchange", level: 2 })).toBeVisible();

  await page.getByRole("tab", { name: "Dates" }).click();
  await expect(page.getByRole("tab", { name: "Dates" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("2026-08-06", { exact: true })).toBeVisible();
});

test("receives SDK static-site context from an exact-origin iframe host", async ({ page }) => {
  await page.route("http://127.0.0.1:3100/__iframe-host", (route) => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html>
      <html><body>
        <iframe title="Markets" src="/assets"></iframe>
        <script>
          window.addEventListener("message", (event) => {
            const frame = document.querySelector("iframe");
            if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
            if (event.data?.channel !== "mainsequence.markets" || event.data?.type !== "ready") return;
            event.source.postMessage({
              channel: "mainsequence.markets",
              version: 1,
              type: "initialize",
              payload: { theme: "light", themeId: "quartz-light", user: null },
            }, location.origin);
          });
        </script>
      </body></html>`,
  }));

  await page.goto("/__iframe-host");
  const markets = page.frameLocator('iframe[title="Markets"]');
  await expect(markets.getByRole("heading", { name: "Assets", level: 1 })).toBeVisible();
  await expect(markets.locator("html")).toHaveAttribute("data-theme", "quartz-light");
});
