import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const temporaryDirectory = mkdtempSync(join(tmpdir(), "markets-openapi-"));
const generatedPath = join(temporaryDirectory, "generated.ts");
const command = process.platform === "win32" ? "openapi-typescript.cmd" : "openapi-typescript";
const result = spawnSync(
  join("node_modules", ".bin", command),
  ["docs/technical/contracts/mainsequencemarkets-openapi.json", "-o", generatedPath],
  { cwd: process.cwd(), encoding: "utf8" },
);

try {
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "OpenAPI generation failed.");
  }
  const committed = readFileSync("src/lib/api/generated.ts", "utf8");
  const generated = readFileSync(generatedPath, "utf8");
  if (committed !== generated) {
    throw new Error("Generated API types are stale. Run npm run api:generate.");
  }
  console.log("Generated API types match the pinned OpenAPI contract.");
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
