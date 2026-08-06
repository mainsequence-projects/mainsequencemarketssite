import { describe, expect, it, vi } from "vitest";

import {
  createMarketsResourceApplication,
  normalizeMarketsCollection,
} from "@/features/resources/resource-adapter";
import {
  assetCategoriesDefinition,
  calendarsDefinition,
} from "@/features/resources/resource-definitions";

describe("Markets SDK resource adapter", () => {
  it("normalizes list inputs, authoritative pagination, controls, and bulk actions", async () => {
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
      ordering: "-display_name",
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
    expect(result.bulkActions?.[0]).toMatchObject({
      id: "bulk-delete-asset-categories",
      selection_modes: ["explicit"],
      tone: "danger",
    });
  });

  it("serializes explicit bulk selection without inventing all-matching semantics", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ deleted: 2 }),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    const application = createMarketsResourceApplication(assetCategoriesDefinition);
    const listResult = normalizeMarketsCollection(
      { count: 0, next: null, previous: null, results: [] },
      { pageIndex: 0, pageSize: 25 },
      undefined,
      [{
        id: "bulk-delete-asset-categories",
        label: "Delete selected",
        endpoint: "/api/v1/asset-category/bulk-delete/",
        method: "POST",
        selection_modes: ["explicit"],
        options: [],
      }],
    );
    const action = listResult.bulkActions![0];

    await application.adapter.executeBulkAction!(action, {
      selection: { mode: "explicit", uids: ["category-1", "category-2"] },
      options: {},
    });

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit?.method).toBe("POST");
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      uids: ["category-1", "category-2"],
    });
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
