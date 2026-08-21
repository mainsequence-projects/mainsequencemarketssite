import { expect, test, type Locator } from "@playwright/test";

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
    if (url.pathname === "/api/v1/asset-category/") {
      await route.fulfill({
        contentType: "application/json",
        json: {
          count: 2,
          next: null,
          previous: null,
          results: [
            { uid: "category-1", display_name: "Rates", unique_identifier: "rates" },
            { uid: "category-2", display_name: "Credit", unique_identifier: "credit" },
          ],
        },
      });
      return;
    }
    if (url.pathname === "/api/v1/asset-category/bulk-actions/") {
      await route.fulfill({
        contentType: "application/json",
        json: {
          actions: [{
            id: "bulk-delete-asset-categories",
            label: "Delete selected",
            endpoint: "/api/v1/asset-category/bulk-delete/",
            preflight_endpoint: "/api/v1/asset-category/bulk-delete/preflight/",
            method: "POST",
            tone: "danger",
            selection_modes: ["explicit"],
            confirmation: {
              title: "Delete asset categories",
              word: "DELETE",
              button_label: "Delete selected",
              warning: "Deleted categories cannot be restored.",
            },
            options: [],
          }],
        },
      });
      return;
    }
    if (url.pathname === "/api/v1/asset-category/bulk-delete/preflight/") {
      await route.fulfill({
        contentType: "application/json",
        json: {
          allowed: true,
          detail: "The selected categories can be deleted.",
          matched_count: 2,
          blockers: [],
          warnings: [],
        },
      });
      return;
    }
    if (url.pathname === "/api/v1/asset-category/bulk-delete/") {
      await route.fulfill({ contentType: "application/json", json: { deleted: 2 } });
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
      if (route.request().method() === "POST") {
        await route.fulfill({
          contentType: "application/json",
          json: { uid: "date-2", local_date: "2026-08-07", is_business_day: true },
        });
        return;
      }
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
  const sectionRail = page.locator("[data-cc-navigation-rail]");
  await expect(sectionRail).toBeVisible();
  await expect(sectionRail.locator("[data-cc-navigation-application]")).toHaveCount(5);
  for (const section of ["Assets", "Portfolios", "Managed Accounts", "Pricing", "Platform"]) {
    await expect(sectionRail.getByRole("button", { name: section, exact: true })).toBeVisible();
  }
  await expect(sectionRail.getByRole("button", { name: "Assets", exact: true }))
    .toHaveAttribute("aria-current", "page");
  await expect(page.locator("[data-app-navigation-panel]")).toBeVisible();
  await expect(page.getByText("Reference Data", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Master List", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Assets", exact: true, level: 1 })).toBeVisible();
  await expect(page.getByText("US91282CJL63")).toBeVisible();
  await expect(page.getByText("MX0MGO0000D8")).toBeVisible();
  await expect(page.getByText("2 assets")).toBeVisible();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "main-sequence-space");
  const navigationTheme = await readNavigationTheme(page.locator("[data-cc-navigation-rail]"));
  expect(navigationTheme.background).toBe(navigationTheme.backgroundToken);
  expect(navigationTheme.color).toBe(navigationTheme.colorToken);
  await expect(page.getByRole("button", { name: "Toggle color theme" })).toHaveCount(0);
  await expect(page.getByText("Gateway session", { exact: true })).toHaveCount(0);

  await sectionRail.getByRole("button", { name: "Portfolios", exact: true }).click();
  await expect(page.getByText("Portfolio Management", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Portfolio Groups", exact: true })).toBeVisible();
  await sectionRail.getByRole("button", { name: "Assets", exact: true }).click();
  await page.getByRole("button", { name: "Asset Categories", exact: true }).click();
  await expect(page).toHaveURL(/\/asset-categories$/);
  await expect(page.getByRole("heading", { name: "Asset Categories", exact: true, level: 1 })).toBeVisible();
});

test("supports direct deep-route navigation", async ({ page }) => {
  await page.goto("/portfolios/portfolio-1");
  await expect(page.getByLabel("Breadcrumb").getByRole("button", { name: "Portfolios" })).toBeVisible();
  await expect(page.locator("[data-cc-navigation-destination]", { hasText: "Portfolios" }))
    .toHaveAttribute("aria-current", "page");
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

test("normalizes API diagnostics as a detail experience with runtime and metadata tabs", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "API Diagnostics", level: 2 })).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: "http://127.0.0.1:2030" })).toBeVisible();

  await page.getByRole("tab", { name: "Public Metadata" }).click();
  await expect(page.getByText("getApiSettings", { exact: true })).toBeVisible();
  await expect(page.getByText("apps/v1", { exact: true })).toBeVisible();
});

test("uses discovered bulk actions with preflight, confirmation, refresh, and cleanup", async ({ page }) => {
  await page.goto("/asset-categories");
  await expect(page.getByText("Rates", { exact: true })).toBeVisible();

  await page.getByRole("checkbox", { name: "Select all visible rows" }).check();
  await expect(page.getByText("2 selected on this page.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "Delete selected" }).click();

  const dialog = page.getByRole("dialog", { name: "Delete asset categories" });
  await expect(dialog.getByText("The selected categories can be deleted.")).toBeVisible();
  await dialog.getByRole("textbox", { name: "Confirmation word" }).fill("DELETE");
  const execution = page.waitForResponse((response) => (
    response.request().method() === "POST"
    && new URL(response.url()).pathname === "/api/v1/asset-category/bulk-delete/"
  ));
  await dialog.getByRole("button", { name: "Delete selected" }).click();

  expect((await execution).ok()).toBe(true);
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("2 selected on this page.", { exact: true })).toHaveCount(0);
});

test("renders related collections through an embedded SDK resource list", async ({ page }) => {
  await page.goto("/calendars/calendar-1");
  await expect(page.getByRole("heading", { name: "Vienna Exchange", level: 2 })).toBeVisible();

  await page.getByRole("tab", { name: "Dates" }).click();
  await expect(page.getByRole("tab", { name: "Dates" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("2026-08-06", { exact: true })).toBeVisible();
});

test("places a custom domain action in the detail header and refreshes detail content", async ({ page }) => {
  await page.goto("/calendars/calendar-1");
  await page.getByRole("button", { name: "Add date" }).click();

  const dialog = page.getByRole("dialog", { name: "Add date" });
  await expect(dialog.getByText("createCalendarDate", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Add date" }).click();

  await expect(page.getByRole("tab", { name: "Operation result" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("date-2", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Dates" }).click();
  await expect(page.getByText("2026-08-06", { exact: true })).toBeVisible();
});

test("receives SDK static-site context from an exact-origin iframe host", async ({ page }) => {
  await page.goto("/__iframe-host");
  await expect(page.getByText("Host handshake ready")).toBeVisible();
  const frame = page.locator('iframe[title="Markets SDK test host"]');
  await expect(frame).toHaveAttribute("sandbox", "allow-forms allow-same-origin allow-scripts");
  const markets = page.frameLocator('iframe[title="Markets SDK test host"]');
  await expect(markets.getByRole("heading", { name: "Assets", level: 1 })).toBeVisible();
  await expect(markets.getByText("US91282CJL63", { exact: true })).toBeVisible();
  await expect(markets.locator("html")).toHaveAttribute("data-theme", "quartz-light");
  const lightComputedTheme = await markets.locator(".embedded-app").evaluate((element) => {
    const root = document.documentElement;
    const resolveToken = (property: "backgroundColor" | "color" | "fontFamily", token: string) => {
      const probe = document.createElement("span");
      probe.style[property] = `var(${token})`;
      root.append(probe);
      const value = getComputedStyle(probe)[property];
      probe.remove();
      return value;
    };
    const computed = getComputedStyle(element);
    return {
      background: computed.backgroundColor,
      backgroundToken: resolveToken("backgroundColor", "--background"),
      color: computed.color,
      colorToken: resolveToken("color", "--foreground"),
      fontFamily: getComputedStyle(document.body).fontFamily,
      fontToken: resolveToken("fontFamily", "--font-sans"),
    };
  });
  expect(lightComputedTheme.background).toBe(lightComputedTheme.backgroundToken);
  expect(lightComputedTheme.color).toBe(lightComputedTheme.colorToken);
  expect(lightComputedTheme.fontFamily).toBe(lightComputedTheme.fontToken);
  await expect(markets.getByRole("navigation")).toHaveCount(0);
  await expect(markets.locator(".topbar")).toHaveCount(0);
  await expect(markets.getByText("MainSequence", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Switch host theme" }).click();
  await expect(markets.locator("html")).toHaveAttribute("data-theme", "main-sequence-space");
  await expect(markets.locator("html")).toHaveAttribute("data-theme-mode", "dark");
  const darkComputedTheme = await markets.locator(".embedded-app").evaluate((element) => {
    const root = document.documentElement;
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--background)";
    root.append(probe);
    const backgroundToken = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      background: getComputedStyle(element).backgroundColor,
      backgroundToken,
    };
  });
  expect(darkComputedTheme.background).toBe(darkComputedTheme.backgroundToken);
  expect(darkComputedTheme.background).not.toBe(lightComputedTheme.background);
});

async function readNavigationTheme(locator: Locator) {
  return locator.evaluate((element) => {
    const root = document.documentElement;
    const resolveToken = (property: "backgroundColor" | "color", token: string) => {
      const probe = document.createElement("span");
      probe.style[property] = `var(${token})`;
      root.append(probe);
      const value = getComputedStyle(probe)[property];
      probe.remove();
      return value;
    };
    const computed = getComputedStyle(element);
    return {
      background: computed.backgroundColor,
      backgroundToken: resolveToken("backgroundColor", "--sidebar"),
      color: computed.color,
      colorToken: resolveToken("color", "--sidebar-foreground"),
    };
  });
}
