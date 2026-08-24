import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contractPath = resolve(
  projectRoot,
  "docs/technical/contracts/mainsequencemarkets-openapi.json",
);
const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const methods = new Set(["get", "post", "put", "patch", "delete"]);
const operations = [];

for (const [path, pathItem] of Object.entries(contract.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (methods.has(method)) {
      operations.push({ method, operation, path });
    }
  }
}

const missingDocumentation = operations.filter(
  ({ operation }) =>
    !operation.operationId ||
    !operation.summary?.trim() ||
    !operation.description?.trim() ||
    !operation.tags?.length,
);
if (missingDocumentation.length > 0) {
  throw new Error(
    `OpenAPI operations missing id, summary, description, or tag:\n${missingDocumentation
      .map(({ method, path }) => `${method.toUpperCase()} ${path}`)
      .join("\n")}`,
  );
}

const declaredTags = new Set((contract.tags ?? []).map((tag) => tag.name));
const usedTags = new Set(operations.flatMap(({ operation }) => operation.tags));
const undeclaredTags = [...usedTags].filter((tag) => !declaredTags.has(tag));
if (undeclaredTags.length > 0) {
  throw new Error(`OpenAPI uses undeclared tags: ${undeclaredTags.join(", ")}`);
}

const groupedTags = new Set((contract["x-tagGroups"] ?? []).flatMap((group) => group.tags ?? []));
const ungroupedTags = [...usedTags].filter((tag) => !groupedTags.has(tag));
if (ungroupedTags.length > 0) {
  throw new Error(`OpenAPI uses tags missing from x-tagGroups: ${ungroupedTags.join(", ")}`);
}

const repositoryUrl = contract.externalDocs?.url;
if (repositoryUrl !== "https://github.com/mainsequence-projects/MainSequenceMarkets") {
  throw new Error(`OpenAPI externalDocs must link the canonical API repository, got ${repositoryUrl}`);
}

console.log(
  `OpenAPI documentation check passed for ${operations.length} operations and ${declaredTags.size} tags.`,
);
