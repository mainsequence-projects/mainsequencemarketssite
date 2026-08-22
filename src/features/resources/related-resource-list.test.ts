import { describe, expect, it } from "vitest";

import {
  isRelatedCollection,
  relatedApplicationId,
} from "@/features/resources/related-resource-list";

describe("related resource collections", () => {
  it("creates collision-safe SDK identifiers for arbitrary parent UIDs", () => {
    const identifier = relatedApplicationId("calendar-dates", "Calendar/Ö-1");

    expect(identifier).toBe("calendar-dates.instance.43-61-6c-65-6e-64-61-72-2f-d6-2d-31");
    expect(identifier).toMatch(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/);
    expect(identifier).not.toBe(relatedApplicationId("calendar-dates", "calendar-o-1"));
  });

  it("declares every embedded list against the shared canonical resource boundary", () => {
    const operations = [
      "listAssetRelatedMetaTables",
      "listIndexRelatedMetaTables",
      "listIndexFormulas",
      "listIndexDatasets",
      "listCalendarDates",
      "listCalendarSessions",
      "listCalendarEvents",
      "listPortfoliosInGroup",
      "listPricingMarketDataSetBindings",
      "listPricingCurveSelections",
    ] as const;

    expect(operations.every(isRelatedCollection)).toBe(true);
  });
});
