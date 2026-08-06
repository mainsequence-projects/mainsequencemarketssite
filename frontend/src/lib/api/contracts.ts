import type { operations, paths } from "@/lib/api/generated";

export type MarketsOperationId = keyof operations;
export type MarketsApiPath = keyof paths;

export type OperationResponse<Operation extends MarketsOperationId> =
  operations[Operation] extends { responses: infer Responses } ? Responses : never;
