import { execFileSync } from "node:child_process";
import { constants, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [target] = process.argv.slice(2);
if (!target?.endsWith(".tar.gz")) {
  console.error("Usage: node scripts/archive-halai-core.mjs path/to/HALAI-core.tar.gz");
  process.exit(2);
}

const checkout = fileURLToPath(new URL("..", import.meta.url));
const destination = resolve(target);
const git = (...args) => execFileSync("git", args, { cwd: checkout, encoding: "utf8" });
const revision = git("rev-parse", "HEAD").trim();
const paths = git("ls-tree", "-z", "--name-only", revision).split("\0").filter(name => name && name !== "enterprise");
if (!paths.includes("LICENSE") || !paths.includes("NOTICE")) throw new Error("HALAI core requires LICENSE and NOTICE");

const temporary = mkdtempSync(join(dirname(destination), ".halai-export-"));
try {
  const archive = join(temporary, "core.tar.gz");
  git("archive", "--format=tar.gz", "--prefix=HALAI/", `--output=${archive}`, revision, "--", ...paths);
  copyFileSync(archive, destination, constants.COPYFILE_EXCL);
  console.log(`HALAI core ${revision} -> ${destination}`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
