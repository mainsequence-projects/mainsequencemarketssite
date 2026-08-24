import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import process from "node:process";

const repositoryRoot = process.cwd();
const docsRoot = resolve(repositoryRoot, "docs");
const summaryPath = resolve(docsRoot, "SUMMARY.md");
const errors = [];

for (const directory of ["surfaces", "technical"]) {
  const target = resolve(docsRoot, directory);
  if (!existsSync(target)) errors.push(`Missing documentation section: docs/${directory}/`);
}

if (!existsSync(summaryPath)) errors.push("Missing documentation map: docs/SUMMARY.md");

const rootMarkdown = existsSync(docsRoot)
  ? readdirSync(docsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".md")
    .map((entry) => entry.name)
  : [];

for (const file of rootMarkdown) {
  if (file !== "SUMMARY.md") errors.push(`Markdown file must be classified under surfaces/ or technical/: docs/${file}`);
}

const documentationPages = ["surfaces", "technical"]
  .flatMap((directory) => collectMarkdown(resolve(docsRoot, directory)));
const filesToCheck = [resolve(repositoryRoot, "README.md"), summaryPath, ...documentationPages]
  .filter(existsSync);

for (const file of filesToCheck) validateLocalLinks(file);

if (existsSync(summaryPath)) {
  const summaryTargets = collectLocalTargets(summaryPath);
  for (const page of documentationPages) {
    if (!summaryTargets.has(page)) {
      errors.push(`Documentation page is missing from docs/SUMMARY.md: ${relative(repositoryRoot, page)}`);
    }
  }
}

if (errors.length) {
  process.stderr.write(`${errors.map((error) => `- ${error}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(
  `Documentation validation passed for ${documentationPages.length} classified Markdown pages.\n`,
);

function collectMarkdown(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdown(target);
    return entry.isFile() && extname(entry.name).toLowerCase() === ".md" ? [target] : [];
  });
}

function validateLocalLinks(file) {
  for (const rawTarget of markdownTargets(readFileSync(file, "utf8"))) {
    const target = resolveLocalTarget(file, rawTarget);
    if (target && !existsSync(target)) {
      errors.push(`Broken local link in ${relative(repositoryRoot, file)}: ${rawTarget}`);
    }
  }
}

function collectLocalTargets(file) {
  return new Set(
    markdownTargets(readFileSync(file, "utf8"))
      .map((target) => resolveLocalTarget(file, target))
      .filter(Boolean),
  );
}

function markdownTargets(markdown) {
  return Array.from(markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g), (match) => match[1].trim());
}

function resolveLocalTarget(sourceFile, rawTarget) {
  const unwrapped = rawTarget.replace(/^<|>$/g, "");
  if (!unwrapped || unwrapped.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(unwrapped)) return null;
  const withoutFragment = unwrapped.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment) return null;
  try {
    const decodedTarget = decodeURIComponent(withoutFragment);
    const target = decodedTarget.startsWith("/docs/")
      ? resolve(docsRoot, decodedTarget.slice("/docs/".length))
      : resolve(dirname(sourceFile), decodedTarget);
    return resolveDocumentationTarget(target);
  } catch {
    errors.push(`Invalid encoded local link in ${relative(repositoryRoot, sourceFile)}: ${rawTarget}`);
    return null;
  }
}

function resolveDocumentationTarget(target) {
  const candidates = [
    target,
    `${target}.md`,
    `${target}.mdx`,
    `${target}.api.mdx`,
    `${target}.tag.mdx`,
    resolve(target, "index.md"),
    resolve(target, "index.mdx"),
  ];
  return candidates.find(existsSync) ?? target;
}
