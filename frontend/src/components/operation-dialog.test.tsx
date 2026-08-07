import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperationDialog } from "@/components/operation-dialog";

describe("OperationDialog", () => {
  it("presents input-driven GET operations as operations rather than mutations", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <OperationDialog
        open
        title="Load discount curve"
        description="Resolve curve nodes."
        operationId="getPricingDiscountCurve"
        operationKind="query"
        initialValue={{ valuation_date: "2026-08-07" }}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText("API operation")).toBeVisible();
    expect(screen.getByText("JSON operation input")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Run operation" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      valuation_date: "2026-08-07",
    }));
  });

  it("requires an explicit dialog confirmation for a destructive operation", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <OperationDialog
        open
        title="Delete asset"
        description="Delete this asset."
        operationId="deleteAsset"
        destructive
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText(/cannot be undone/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Delete asset" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(undefined));
  });
});
