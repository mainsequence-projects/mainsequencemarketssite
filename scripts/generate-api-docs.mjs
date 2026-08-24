import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const documentationRoot = join(projectRoot, "documentation");
const generatedRoot = join(projectRoot, "docs", "technical", "api-reference");
const contractPath = join(
  projectRoot,
  "docs",
  "technical",
  "contracts",
  "mainsequencemarkets-openapi.json",
);
const docusaurusBinary = join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "docusaurus.cmd" : "docusaurus",
);

if (!existsSync(contractPath)) {
  throw new Error(`Pinned OpenAPI contract is missing: ${contractPath}`);
}
if (!existsSync(docusaurusBinary)) {
  throw new Error("Docusaurus is not installed. Run npm install before generating API docs.");
}

rmSync(generatedRoot, { force: true, recursive: true });
const result = spawnSync(docusaurusBinary, ["gen-api-docs", "markets"], {
  cwd: documentationRoot,
  encoding: "utf8",
  env: { ...process.env, NO_UPDATE_NOTIFIER: "1" },
});

if (result.status !== 0) {
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  process.exit(result.status ?? 1);
}

const generatedFiles = readdirSync(generatedRoot, { recursive: true, withFileTypes: true });
const operationPages = generatedFiles.filter(
  (entry) => entry.isFile() && entry.name.endsWith(".api.mdx"),
).length;
const schemaPages = generatedFiles.filter(
  (entry) => entry.isFile() && entry.name.endsWith(".schema.mdx"),
).length;

if (!existsSync(join(generatedRoot, "sidebar.ts")) || operationPages === 0) {
  throw new Error("OpenAPI generation did not produce the expected sidebar and operation pages.");
}

console.log(`Generated ${operationPages} operation pages and ${schemaPages} schema pages.`);
