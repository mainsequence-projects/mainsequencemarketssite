import { describe, expect, it } from "vitest";

import { resourceDiscoveryPath } from "@/features/resources/resource-adapter";
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

  it("keeps custom actions explicit and delegates every list presentation to discovery", () => {
    const customActionCount = resourceDefinitions.reduce((count, definition) => (
      count
      + Number(Boolean(definition.create))
      + Number(Boolean(definition.update))
      + Number(Boolean(definition.remove))
      + (definition.actions?.length ?? 0)
    ), 0);
    const discoveryPaths = resourceDefinitions.map((definition) => (
      resourceDiscoveryPath(definition.listPath)
    ));

    expect(customActionCount).toBe(33);
    expect(discoveryPaths).toHaveLength(resourceDefinitions.length);
    expect(discoveryPaths.every((path) => path.endsWith("/discovery/"))).toBe(true);
    expect(new Set(discoveryPaths).size).toBe(discoveryPaths.length);
  });

  it("uses canonical row details separately from application summaries", () => {
    const accounts = resourceDefinitions.find((definition) => definition.id === "accounts");
    const curves = resourceDefinitions.find((definition) => definition.id === "pricing-curves");

    expect(accounts?.detailOperationId).toBe("getAccount");
    expect(accounts?.details?.some((detail) => detail.operationId === "getAccountSummary")).toBe(true);
    expect(curves?.detailOperationId).toBe("getPricingCurve");
    expect(curves?.details?.some((detail) => detail.operationId === "getPricingCurveSummary")).toBe(true);
  });
});
