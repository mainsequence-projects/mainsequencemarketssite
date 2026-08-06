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
});
