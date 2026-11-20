// A self-hosted server cannot replace itself, so this only says whether a newer version exists and how this install is updated.
import { existsSync } from "node:fs";
import { join, sep } from "node:path";
import { HALAI_PRODUCT } from "../shared/halai-product.ts";

export const LATEST_RELEASE_URL = `https://api.github.com/repos/${HALAI_PRODUCT.owner}/${HALAI_PRODUCT.repo}/releases/latest`;
export const STABLE_CHANNEL_URL = `https://raw.githubusercontent.com/${HALAI_PRODUCT.owner}/${HALAI_PRODUCT.repo}/channels/stable.json`;
const CACHE_MS = 60 * 60_000;
/** How long the last answer stands in when the channel cannot be read: an outage of GitHub is no reason to say nothing. */
const STALE_MS = 24 * 60 * 60_000;

/** "managed" is a hosted or Cloud server that is updated for its owner. "podman" is deploy/podman's Compose recipe;
 * "podman-service" the rootless service deploy/podman/install.sh writes, whose unit sets OMB_PODMAN_SERVICE. */
export type InstallKind = "desktop" | "managed" | "docker" | "podman" | "podman-service" | "npm" | "git" | "unknown";

/** `stable` follows the promoted version; `newest` follows every release, as soon as it is published. */
export type UpdateChannel = "stable" | "newest";

/** OMB_UPDATE_CHANNEL: `newest` to hear of every release; anything else is `stable`. */
export function updateChannel(env: NodeJS.ProcessEnv = process.env): UpdateChannel {
  return env.OMB_UPDATE_CHANNEL?.trim().toLowerCase() === "newest" ? "newest" : "stable";
}

export function updateCommand(install: InstallKind): { command: string; restart: boolean } | undefined {
  return install === "git" ? { command: "git pull && pnpm install", restart: true } : undefined;
}

export function installKind(input: {
  desktopManaged: boolean;
  managed: boolean;
  serverRoot: string;
  exists?: (path: string) => boolean;
  env?: NodeJS.ProcessEnv;
}): InstallKind {
  const exists = input.exists ?? existsSync;
  if (input.desktopManaged) return "desktop";
  if (input.managed) return "managed";
  if ((input.env ?? process.env).OMB_PODMAN_SERVICE?.trim()) return "podman-service";
  if (exists("/.dockerenv")) return "docker";
  if (exists("/run/.containerenv")) return "podman";
  if (input.serverRoot.split(sep).includes("node_modules")) return "npm";
  if (exists(join(input.serverRoot, "..", ".git"))) return "git";
  return "unknown";
}

/** Semver order on tags such as "v0.1.92"; a prerelease sorts before its release, and anything unparseable is never an update. */
export function isNewerVersion(latest: string, current: string): boolean {
  const parse = (version: string) => {
    const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(version.trim());
    return match ? { core: match.slice(1, 4).map(Number), pre: match[4]?.split(".") ?? [] } : null;
  };
  const a = parse(latest);
  const b = parse(current);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) {
    if (a.core[i]! !== b.core[i]!) return a.core[i]! > b.core[i]!;
  }
  if (!a.pre.length || !b.pre.length) return !a.pre.length && b.pre.length > 0;
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    const x = a.pre[i];
    const y = b.pre[i];
    if (x === undefined || y === undefined) return y === undefined;
    if (x === y) continue;
    const xn = /^\d+$/.test(x);
    const yn = /^\d+$/.test(y);
    if (xn && yn) return Number(x) > Number(y);
    if (xn !== yn) return yn;
    return x > y;
  }
  return false;
}

export interface UpdateCheck {
  current: string;
  install: InstallKind;
  /** Where `latest` came from. `stable` falls back to `newest` until a first version has been promoted. */
  channel?: UpdateChannel;
  latest?: string;
  available: boolean;
  releaseUrl?: string;
  command?: string;
  restart?: boolean;
}

type Found = { version: string; releaseUrl?: string };

/** One cached lookup an hour, shared by every caller. */
export function createUpdateChecker(options: {
  current: string;
  install: InstallKind;
  channel?: UpdateChannel;
  fetch?: typeof fetch;
  now?: () => number;
}) {
  const fetchJson = options.fetch ?? fetch;
  const now = options.now ?? Date.now;
  const channel = options.channel ?? "stable";
  let cached: { at: number; result: UpdateCheck } | undefined;
  /** The last answer that was read, kept past the hour for a channel that cannot be read for a while. */
  let lastGood: { at: number; result: UpdateCheck } | undefined;
  let inflight: Promise<UpdateCheck> | undefined;
  const base = (): UpdateCheck => ({
    current: options.current,
    install: options.install,
    available: false,
    ...updateCommand(options.install),
  });
  const ask = (url: string) => fetchJson(url, {
    headers: { accept: "application/vnd.github+json", "user-agent": "halai-update-check" },
    signal: AbortSignal.timeout(8_000),
  });

  /** Null until a first version has been promoted: the record does not exist yet. */
  async function stable(): Promise<Found | null> {
    const response = await ask(STABLE_CHANNEL_URL);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`The stable channel answered ${response.status}`);
    const record = await response.json() as { version?: unknown; releaseUrl?: unknown };
    if (typeof record.version !== "string" || !/^\d+\.\d+\.\d+$/.test(record.version)) throw new Error("The stable channel named no version");
    return { version: record.version, ...(typeof record.releaseUrl === "string" ? { releaseUrl: record.releaseUrl } : {}) };
  }

  async function newest(): Promise<Found> {
    const response = await ask(LATEST_RELEASE_URL);
    if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
    const release = await response.json() as { tag_name?: unknown; html_url?: unknown };
    if (typeof release.tag_name !== "string") throw new Error("GitHub sent no release tag");
    return { version: release.tag_name.replace(/^v/, ""), ...(typeof release.html_url === "string" ? { releaseUrl: release.html_url } : {}) };
  }

  return async function check(): Promise<UpdateCheck> {
    if (options.install === "desktop" || options.install === "managed") return base();
    if (cached && now() - cached.at < CACHE_MS) return cached.result;
    inflight ??= (async () => {
      try {
        const promoted = channel === "stable" ? await stable() : null;
        const found = promoted ?? await newest();
        const result: UpdateCheck = {
          ...base(),
          channel: promoted ? "stable" : "newest",
          latest: found.version,
          available: isNewerVersion(found.version, options.current),
          ...(found.releaseUrl ? { releaseUrl: found.releaseUrl } : {}),
        };
        cached = lastGood = { at: now(), result };
        return result;
      } catch (error) {
        // Never a fall back to the newest release, which the stable channel has not taken yet: the last answer it gave,
        // when there is one from the last day, else the error.
        if (lastGood && now() - lastGood.at < STALE_MS) return lastGood.result;
        throw error;
      } finally {
        inflight = undefined;
      }
    })();
    return inflight;
  };
}
