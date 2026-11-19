import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { runHeadlessCommand } from "./main.ts";

const url = "http://127.0.0.1:19711";
const bots = [{
  id: "bot-a", name: "Scout", section: "Research", computer: "cloud", threadId: "thread-a",
  autoApprove: false, modelSelection: { instanceId: "codex", model: "fixture-model", privateNote: "fixture-private-note" },
  privateNote: "fixture-private-note",
  tasks: [{ threadId: "thread-a", title: "Review", busy: true, createdAt: 123, messages: ["fixture-private-note"] }],
}];

function workspace(overrides: Record<string, unknown> = {}) {
  const data: Record<string, unknown> = {
    "/api/bots?messages=0": { bots },
    "/api/paused": { heldBots: ["bot-a"] },
    "/.well-known/openmausbot/environment": { label: "HALAI QA", version: "fixture" },
    "/api/computers/inventory": { instances: [{ ownerBotId: "bot-a", state: "awake", name: "worker", address: "fixture-private-note" }] },
    ...overrides,
  };
  const request = vi.fn(async (path: string, init?: RequestInit, base?: string) => {
    expect(base).toBe(url);
    expect(init?.method ?? "GET").toBe("GET");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer fixture-token");
    expect(data).toHaveProperty([path]);
    const value = data[path];
    if (value instanceof Error) throw value;
    return value;
  });
  const run = (...args: string[]) => runHeadlessCommand([...args, "--url", url], { env: { OPENMAUSBOT_TOKEN: "fixture-token" }, request });
  return { request, run };
}

describe("read-only workspace commands", () => {
  it("reports a named workspace and its paused bots", async () => {
    const { request, run } = workspace();
    expect(await run("status")).toEqual({
      server: { label: "HALAI QA", version: "fixture", url },
      pausedKnown: true,
      bots: [{ id: "bot-a", name: "Scout", team: "Research", state: "paused", computer: "cloud", working: 1 }],
    });
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("shows bot, thread and computer summaries without copying private fields", async () => {
    const { run } = workspace();
    const results = await Promise.all([
      run("bots", "get", "scout"), run("threads", "list", "bot-a"), run("computers", "list"),
    ]);
    expect(results[0]).toMatchObject({ id: "bot-a", model: { instanceId: "codex", model: "fixture-model" }, threadCount: 1, approvals: "ask" });
    expect(results[1]).toEqual({ bot: { id: "bot-a", name: "Scout" }, threads: [{ id: "thread-a", title: "Review", busy: true, active: true, createdAt: 123 }] });
    expect(results[2]).toEqual({ bots: [{ id: "bot-a", name: "Scout", computer: "cloud", cloud: { state: "awake", name: "worker" } }], cloudKnown: true });
    expect(JSON.stringify(results)).not.toContain("fixture-private-note");
  });

  it("keeps unavailable cloud information distinct from an empty inventory", async () => {
    const incomplete = workspace({ "/api/computers/inventory": Object.assign(new Error("administrator scope required"), { status: 403 }) });
    expect(await incomplete.run("computers", "list")).toMatchObject({
      cloudKnown: false, bots: [{ id: "bot-a", cloud: null }],
    });
    expect(await workspace({ "/api/computers/inventory": { instances: [] } }).run("computers", "list")).toMatchObject({ cloudKnown: true });
    expect(await workspace({ "/api/computers/inventory": { configured: true, available: false, instances: [] } })
      .run("computers", "list")).toMatchObject({ cloudKnown: false });
  });

  it("asks for a unique bot id when names collide", async () => {
    const { run } = workspace({ "/api/bots?messages=0": { bots: [...bots, { ...bots[0], id: "bot-b", name: "scout" }] } });
    await expect(run("bots", "get", "Scout")).rejects.toThrow("names 2 bots");
    expect(await run("bots", "get", "bot-b")).toMatchObject({ id: "bot-b" });
  });

  it("routes explicit workspace status through the published command", () => {
    const entry = join(import.meta.dirname, "..", "openmausbot.ts");
    const help = spawnSync(process.execPath, ["--experimental-strip-types", entry, "status", "--url", url, "--help"], { encoding: "utf8" });
    expect(help.status).toBe(0);
    expect(help.stdout).toContain("Read workspace status");
  });
});
