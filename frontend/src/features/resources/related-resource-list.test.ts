import { describe, expect, it } from "vitest";

import {
  normalizeRelatedCollection,
  relatedApplicationId,
} from "@/features/resources/related-resource-list";

describe("related resource collection normalization", () => {
  it("normalizes finite array collections without fabricating pagination", () => {
    const result = normalizeRelatedCollection(
      [{ uid: "formula-1" }, { uid: "formula-2" }, "invalid-row"],
      { pageIndex: 0, pageSize: 10 },
    );

    expect(result.items).toEqual([{ uid: "formula-1" }, { uid: "formula-2" }]);
    expect(result.pageInfo).toEqual({
      pageIndex: 0,
      pageSize: 10,
      totalItems: 2,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    expect(result.controls?.search).toBeNull();
  });

  it("preserves authoritative page links and count from paginated responses", () => {
    const result = normalizeRelatedCollection({
      count: 23,
      next: "/api/v1/calendar/calendar-1/dates/?limit=10&offset=20",
      previous: "/api/v1/calendar/calendar-1/dates/?limit=10",
      results: [{ uid: "date-11", local_date: "2026-08-06" }],
    }, {
      pageIndex: 1,
      pageSize: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.pageInfo).toEqual({
      pageIndex: 1,
      pageSize: 10,
      totalItems: 23,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("creates collision-safe SDK identifiers for arbitrary parent UIDs", () => {
    const identifier = relatedApplicationId("calendar-dates", "Calendar/Ö-1");

    expect(identifier).toBe("calendar-dates.instance.43-61-6c-65-6e-64-61-72-2f-d6-2d-31");
    expect(identifier).toMatch(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/);
    expect(identifier).not.toBe(relatedApplicationId("calendar-dates", "calendar-o-1"));
  });
});
