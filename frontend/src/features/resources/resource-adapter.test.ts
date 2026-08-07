import { describe, expect, it, vi } from "vitest";

import {
  createMarketsResourceApplication,
} from "@/features/resources/resource-adapter";
import {
  assetCategoriesDefinition,
  calendarsDefinition,
  portfoliosDefinition,
} from "@/features/resources/resource-definitions";

describe("Markets SDK resource adapter", () => {
  it("normalizes list inputs and authoritative pagination without advertising unsupported sorting", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      count: 51,
      next: "https://markets.example.com/api/v1/asset-category/?limit=25&offset=50",
      previous: null,
      results: [{ uid: "category-1", display_name: "Rates" }],
    }), { status: 200, headers: { "content-type": "application/json" } }));
    const controller = new AbortController();
    const application = createMarketsResourceApplication(assetCategoriesDefinition);

    const result = await application.adapter.list({
      pageIndex: 1,
      pageSize: 25,
      search: "rates",
      filters: { source: "official" },
      sort: [{ key: "display_name", direction: "descending" }],
      signal: controller.signal,
    });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    const url = new URL(String(requestUrl));
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      limit: "25",
      offset: "25",
      response_format: "json",
      search: "rates",
      source: "official",
    });
    expect(requestInit?.signal).toBe(controller.signal);
    expect(result.pageInfo).toEqual({
      pageIndex: 1,
      pageSize: 25,
      totalItems: 51,
      hasNextPage: true,
      hasPreviousPage: false,
    });
    expect(result.controls?.search?.fields).toContain("display_name");
    expect(result.controls?.ordering).toEqual([]);
    expect(result.bulkActions).toBeUndefined();
    expect(application.columns.every((column) => column.sortableKey === undefined)).toBe(true);
    expect(url.searchParams.has("ordering")).toBe(false);
  });

  it("discovers, preflights, and executes backend-owned bulk actions through SDK contracts", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({
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
          options: [{
            key: "delete_dependents",
            type: "boolean",
            default: false,
            label: "Delete dependents",
            description: "Also delete dependent records.",
          }],
        }],
      }))
      .mockResolvedValueOnce(jsonResponse({
        allowed: true,
        detail: "The selected categories can be deleted.",
        matched_count: 2,
        blockers: [],
        warnings: [],
      }))
      .mockResolvedValueOnce(jsonResponse({ deleted: 2 }));
    const application = createMarketsResourceApplication(assetCategoriesDefinition);
    const controller = new AbortController();
    const [action] = await application.adapter.listBulkActions!({
      search: "rates",
      filters: { source: "official" },
    }, { signal: controller.signal });
    const input = {
      selection: { mode: "explicit", uids: ["category-1", "category-2"] },
      options: { delete_dependents: true },
      signal: controller.signal,
    } as const;
    const preflight = await application.adapter.preflightBulkAction!(action, input);
    await application.adapter.executeBulkAction!(action, input);

    const discoveryUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(discoveryUrl.pathname).toBe("/api/v1/asset-category/bulk-actions/");
    expect(Object.fromEntries(discoveryUrl.searchParams)).toEqual({
      source: "official",
      search: "rates",
    });
    expect(fetchMock.mock.calls.slice(1).map(([url, init]) => ({
      path: new URL(String(url)).pathname,
      method: init?.method,
      body: JSON.parse(String(init?.body)),
      signal: init?.signal,
    }))).toEqual([
      {
        path: "/api/v1/asset-category/bulk-delete/preflight/",
        method: "POST",
        body: {
          selection: { mode: "explicit", uids: ["category-1", "category-2"] },
          options: { delete_dependents: true },
        },
        signal: controller.signal,
      },
      {
        path: "/api/v1/asset-category/bulk-delete/",
        method: "POST",
        body: {
          selection: { mode: "explicit", uids: ["category-1", "category-2"] },
          options: { delete_dependents: true },
        },
        signal: controller.signal,
      },
    ]);
    expect(preflight).toMatchObject({ allowed: true, matchedCount: 2 });
  });

  it("preserves all-matching selection and normalized query scope when advertised", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({
        actions: [{
          id: "bulk-delete-portfolios",
          label: "Delete matching",
          endpoint: "/api/v1/portfolio/bulk-delete/",
          method: "POST",
          selection_modes: ["explicit", "all_matching"],
          options: [],
        }],
      }))
      .mockResolvedValueOnce(jsonResponse({ deleted: 8 }));
    const application = createMarketsResourceApplication(portfoliosDefinition);
    const [action] = await application.adapter.listBulkActions!({
      search: "income",
      filters: { calendar_uid: "calendar-1" },
    });

    await application.adapter.executeBulkAction!(action, {
      selection: {
        mode: "all_matching",
        query: { search: "income", filters: { calendar_uid: "calendar-1" } },
      },
      options: {},
    });

    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      selection: {
        mode: "all_matching",
        query: { search: "income", filters: { calendar_uid: "calendar-1" } },
      },
      options: {},
    });
  });

  it("normalizes blocked preflight results without discarding backend evidence", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({
        actions: [{
          id: "bulk-delete-asset-categories",
          label: "Delete selected",
          endpoint: "/api/v1/asset-category/bulk-delete/",
          preflight_endpoint: "/api/v1/asset-category/bulk-delete/preflight/",
          method: "POST",
          selection_modes: ["explicit"],
          options: [],
        }],
      }))
      .mockResolvedValueOnce(jsonResponse({
        allowed: false,
        detail: "One category is protected.",
        matched_count: 2,
        blockers: ["Protected categories cannot be deleted."],
        warnings: ["One category is used by an index."],
        protected_uids: ["category-1"],
      }));
    const application = createMarketsResourceApplication(assetCategoriesDefinition);
    const [action] = await application.adapter.listBulkActions!({ filters: {} });
    const preflight = await application.adapter.preflightBulkAction!(action, {
      selection: { mode: "explicit", uids: ["category-1", "category-2"] },
      options: {},
    });

    expect(preflight).toMatchObject({
      allowed: false,
      detail: "One category is protected.",
      matchedCount: 2,
      impacts: [
        { message: "Protected categories cannot be deleted.", tone: "danger" },
        { message: "One category is used by an index.", tone: "warning" },
      ],
      raw: { protected_uids: ["category-1"] },
    });
  });

  it("rejects invalid backend bulk-action discovery instead of trusting unsafe endpoints", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({
      actions: [{
        id: "unsafe",
        label: "Unsafe",
        endpoint: "https://attacker.example.com/delete",
        method: "POST",
        selection_modes: ["explicit"],
        options: [],
      }],
    }));
    const application = createMarketsResourceApplication(assetCategoriesDefinition);

    await expect(application.adapter.listBulkActions!({ filters: {} })).rejects.toThrow(
      /Unsafe bulk-action endpoint/,
    );
  });

  it("owns detail, create, update, and delete transport through the canonical adapter", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ uid: "category%2Fone", display_name: "Rates" }))
      .mockResolvedValueOnce(jsonResponse({ uid: "category-2", display_name: "Credit" }))
      .mockResolvedValueOnce(jsonResponse({ uid: "category-2", display_name: "Credit instruments" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const application = createMarketsResourceApplication(assetCategoriesDefinition);

    await application.adapter.get!("category/one");
    const created = await application.adapter.create!({ display_name: "Credit" });
    const updated = await application.adapter.update!("category-2", {
      display_name: "Credit instruments",
    });
    await application.adapter.delete!(["category-2"]);

    expect(created.uid).toBe("category-2");
    expect(updated.display_name).toBe("Credit instruments");
    expect(fetchMock.mock.calls.map(([url, init]) => ({
      method: init?.method,
      path: new URL(String(url)).pathname,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    }))).toEqual([
      { method: "GET", path: "/api/v1/asset-category/category%2Fone/", body: undefined },
      { method: "POST", path: "/api/v1/asset-category/", body: { display_name: "Credit" } },
      {
        method: "PATCH",
        path: "/api/v1/asset-category/category-2/",
        body: { display_name: "Credit instruments" },
      },
      { method: "DELETE", path: "/api/v1/asset-category/category-2/", body: undefined },
    ]);
  });

  it("executes declared detail actions through the adapter boundary", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({
      uid: "date-1",
      date: "2026-08-06",
    }));
    const application = createMarketsResourceApplication(calendarsDefinition);

    await application.adapter.executeAction!("createCalendarDate", {
      ids: ["calendar/one"],
      items: [{ uid: "calendar/one" }],
      payload: { date: "2026-08-06", is_business_day: true },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(new URL(String(url)).pathname).toBe("/api/v1/calendar/calendar%2Fone/dates/");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      date: "2026-08-06",
      is_business_day: true,
    });
  });
});

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
