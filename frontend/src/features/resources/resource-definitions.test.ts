import { describe, expect, it } from "vitest";

import { resourceDefinitions } from "@/features/resources/resource-definitions";

describe("Markets route and operation inventory", () => {
  it("has unique site routes and list operation IDs", () => {
    const routes = resourceDefinitions.map((definition) => definition.listRoute);
    const operations = resourceDefinitions.map((definition) => definition.listOperationId);
    expect(new Set(routes).size).toBe(routes.length);
    expect(new Set(operations).size).toBe(operations.length);
  });

  it("uses only the accepted v1 API boundary", () => {
    for (const definition of resourceDefinitions) {
      expect(definition.listPath).toMatch(/^\/api\/v1\//);
      expect(definition.detailPath?.("example") ?? "/api/v1/example").toMatch(/^\/api\/v1\//);
    }
  });

  it("does not copy the dormant instruments surface", () => {
    expect(resourceDefinitions.some((definition) => definition.id === "instruments")).toBe(false);
  });

  it("keeps custom actions explicit and delegates bulk action availability to the backend", () => {
    const customActionCount = resourceDefinitions.reduce((count, definition) => (
      count
      + Number(Boolean(definition.create))
      + Number(Boolean(definition.update))
      + Number(Boolean(definition.remove))
      + (definition.actions?.length ?? 0)
    ), 0);
    const bulkDiscovery = resourceDefinitions
      .filter((definition) => definition.bulkActionsPath)
      .map((definition) => [definition.id, definition.bulkActionsPath]);

    expect(customActionCount).toBe(33);
    expect(bulkDiscovery).toEqual([
      ["asset-categories", "/api/v1/asset-category/bulk-actions/"],
      ["portfolios", "/api/v1/portfolio/bulk-actions/"],
      ["portfolio-groups", "/api/v1/portfolio-group/bulk-actions/"],
    ]);
  });
});
