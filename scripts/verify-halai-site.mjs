import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Window } from "happy-dom";
import { openHeadlessChrome } from "./testing/headless-chrome.ts";

const [originInput, revision, inventoryPath, scope = "all"] = process.argv.slice(2);
assert.ok(
  originInput && /^[0-9a-f]{40}$/.test(revision) && inventoryPath && ["all", "docs", "marketing"].includes(scope),
  "Usage: node scripts/verify-halai-site.mjs <origin> <full-commit-sha> <approved-sitemap.xml> [all|docs|marketing]",
);
const target = new URL(originInput);
const local = target.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
assert.ok(
  (target.protocol === "https:" || local) && !target.username && !target.password
    && target.pathname === "/" && !target.search && !target.hash,
  "Use the authorised HTTPS origin or an isolated HTTP loopback origin",
);
const origin = target.origin;
const parserWindow = new Window({ settings: { disableJavaScriptFileLoading: true } });
const parser = new parserWindow.DOMParser();
const viewports = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];

function surface(path) {
  return path === "/docs" || path.startsWith("/docs/") ? "docs" : "marketing";
}

function sitemapRoutes(xml) {
  const document = parser.parseFromString(xml, "application/xml");
  assert.equal(document.documentElement?.namespaceURI, "http://www.sitemaps.org/schemas/sitemap/0.9");
  assert.equal(document.documentElement?.localName, "urlset");
  const routes = new Map();
  const entries = document.querySelectorAll("urlset > url");
  let sitemapOrigin;
  for (const entry of entries) {
    const locations = entry.querySelectorAll(":scope > loc");
    assert.equal(locations.length, 1, "A sitemap entry must provide one loc");
    const href = locations[0].textContent.trim();
    const url = new URL(href);
    sitemapOrigin ??= url.origin;
    assert.ok(
      ["https:", "http:"].includes(url.protocol) && url.origin === sitemapOrigin
        && !url.username && !url.password && !url.search && !url.hash,
      "A sitemap must list clean URLs on one origin",
    );
    assert.ok(!routes.has(url.pathname), "Duplicate sitemap path " + url.pathname);
    routes.set(url.pathname, href);
  }
  assert.ok(routes.size, "The sitemap is empty");
  return { origin: sitemapOrigin, routes };
}

async function get(path, mimeTypes) {
  const response = await fetch(origin + path, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, path);
  const type = response.headers.get("content-type")?.split(";")[0].toLowerCase();
  assert.ok(mimeTypes.includes(type), path + " served " + type);
  return Buffer.from(await response.arrayBuffer());
}

function hash(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function skipFragment(document) {
  const landmarks = document.querySelectorAll("main");
  assert.equal(landmarks.length, 1, "Expected one main landmark");
  const id = landmarks[0].id;
  assert.ok(id, "Main needs an ID");
  assert.equal(Array.from(document.querySelectorAll("[id]")).filter((element) => element.id === id).length, 1, "Duplicate main ID");
  const fragment = "#" + id;
  const anchors = Array.from(document.querySelectorAll('a[href^="#"]')).filter((link) => link.getAttribute("href") === fragment);
  assert.equal(anchors.length, 1, "Expected one in-page link to main");
  return fragment;
}

function visibleFocusedLink(fragment) {
  const element = document.activeElement;
  if (!element?.matches("a") || element.getAttribute("href") !== fragment) return false;
  const box = element.getBoundingClientRect();
  if (box.width <= 0 || box.height <= 0 || !element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
  const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
  return hit === element || element.contains(hit);
}

async function press(page, key, code) {
  const params = { key, code: key, windowsVirtualKeyCode: code };
  await page.send("Input.dispatchKeyEvent", { type: "keyDown", ...params });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...params });
}

async function checkSkip(page, href, fragment, viewport) {
  const url = new URL(href);
  await page.send("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1, mobile: false });
  await page.send("Page.navigate", { url: "about:blank" });
  await page.until('location.href === "about:blank" && document.readyState === "complete"', 8_000);
  await page.send("Page.navigate", { url: href });
  await page.until("location.href === " + JSON.stringify(url.href) + ' && document.readyState === "complete"', 12_000);
  await press(page, "Tab", 9);
  const focusProbe = "(" + visibleFocusedLink.toString() + ")(" + JSON.stringify(fragment) + ")";
  await page.until(focusProbe, 3_000);
  await press(page, "Enter", 13);
  await page.until(
    'document.activeElement?.tagName === "MAIN" && document.activeElement.id === ' + JSON.stringify(fragment.slice(1))
      + " && location.hash === " + JSON.stringify(fragment),
    3_000,
  );
}

const rows = [];
let profile;
let page;
try {
  const manifestBytes = await get("/release.json", ["application/json"]);
  const manifest = JSON.parse(manifestBytes);
  assert.equal(manifest.product, "HALAI");
  assert.equal(manifest.origin, origin);
  assert.equal(manifest.revision, revision, "Delivered revision differs from the approved commit");
  const sitemapBytes = await get("/sitemap.xml", ["application/xml", "text/xml"]);
  const delivered = sitemapRoutes(sitemapBytes.toString("utf8"));
  assert.equal(delivered.origin, origin);
  const expected = sitemapRoutes(await readFile(inventoryPath, "utf8")).routes;
  const include = ([path]) => scope === "all" || surface(path) === scope;
  const claimed = Array.from(delivered.routes).filter(include);
  const required = Array.from(expected).filter(include);
  assert.ok(required.length, "The approved inventory does not cover the selected surface");
  assert.deepEqual(
    claimed.map(([path]) => path).sort(),
    required.map(([path]) => path).sort(),
    "Delivered routes differ from the approved inventory",
  );

  if (claimed.some(([path]) => surface(path) === "marketing")) {
    profile = await mkdtemp(join(tmpdir(), "halai-site-qa-"));
    page = await openHeadlessChrome(profile);
    await page.send("Page.enable");
    await page.send("Network.enable");
    await page.send("Network.setBypassServiceWorker", { bypass: true });
    await page.send("Network.setCacheDisabled", { cacheDisabled: true });
    page.onRequestPaused(({ requestId, request }) => {
      const allowed = URL.canParse(request.url) && new URL(request.url).origin === origin
        && ["GET", "HEAD"].includes(request.method);
      void page.send(
        allowed ? "Fetch.continueRequest" : "Fetch.failRequest",
        allowed ? { requestId } : { requestId, errorReason: "BlockedByClient" },
      ).catch(() => {});
    });
    await page.send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  }

  for (const [path, href] of claimed) {
    const row = { url: href, surface: surface(path), passed: false, canonical: null, skip: null, widths: [] };
    rows.push(row);
    try {
      const html = await get(path, ["text/html"]);
      const document = parser.parseFromString(html.toString("utf8"), "text/html");
      if (row.surface === "docs") {
        const links = document.querySelectorAll('head link[rel~="canonical"]');
        row.canonical = Array.from(links).map((link) => link.getAttribute("href"));
        assert.deepEqual(row.canonical, [href], "Expected one exact canonical in the document head");
      } else {
        row.skip = skipFragment(document);
        for (const viewport of viewports) {
          await checkSkip(page, href, row.skip, viewport);
          row.widths.push(viewport.width);
        }
      }
      row.passed = true;
    } catch (error) {
      row.error = error.message;
    }
  }
  assert.equal(hash(await get("/release.json", ["application/json"])), hash(manifestBytes), "Release metadata changed during the check");
  assert.equal(hash(await get("/sitemap.xml", ["application/xml", "text/xml"])), hash(sitemapBytes), "Sitemap changed during the check");
  console.log(JSON.stringify({ origin, revision, scope, sitemapSha256: hash(sitemapBytes), rows }, null, 2));
  if (rows.some((row) => !row.passed)) process.exitCode = 1;
} finally {
  page?.close();
  if (profile) await rm(profile, { recursive: true, force: true, maxRetries: 5 });
  await parserWindow.happyDOM.close();
}
