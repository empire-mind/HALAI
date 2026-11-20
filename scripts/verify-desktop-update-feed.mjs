import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { HALAI_PRODUCT } from "../shared/halai-product.ts";

const repository = `${HALAI_PRODUCT.owner}/${HALAI_PRODUCT.repo}`;
const files = process.argv.slice(2);
if (files.length === 0) throw new Error("Expected at least one app-update.yml path");
if (process.env.GITHUB_REPOSITORY?.toLowerCase() !== repository.toLowerCase()) {
  throw new Error(`Desktop releases belong to ${repository}`);
}

for (const file of files) {
  const { provider, owner, repo, host = "github.com", protocol = "https", private: isPrivate = false } =
    parse(readFileSync(file, "utf8")) ?? {};
  const updaterRepository = `${owner}/${repo}`.toLowerCase();
  if (provider !== "github" || updaterRepository !== repository.toLowerCase()
    || host !== "github.com" || protocol !== "https" || isPrivate !== false) {
    throw new Error(`${file} must use the public HTTPS updater feed at ${repository}`);
  }
  console.log(`${file}: verified updater feed for ${repository}`);
}
