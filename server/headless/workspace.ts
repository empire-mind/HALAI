import { HALAI_PRODUCT } from "../../shared/halai-product.ts";
import { EXIT, HeadlessError, usageError } from "./args.ts";
import type { HeadlessClient } from "./client.ts";
import type { VerbContext, VerbOutcome } from "./context.ts";

interface WorkspaceThread {
  threadId: string;
  title?: string;
  busy?: boolean;
  createdAt?: number;
}

interface WorkspaceBot {
  id: string;
  name: string;
  title?: string;
  section?: string;
  threadId?: string;
  busy?: boolean;
  activity?: string;
  waitingForTeammates?: boolean;
  computer?: string;
  cloudBackend?: string;
  modelSelection?: { instanceId: string; model?: string };
  approvalMode?: string;
  autoApprove?: boolean;
  tasks?: WorkspaceThread[];
}

interface CloudComputer {
  ownerBotId?: string;
  state?: string;
  name?: string;
}

const botsIn = async (client: HeadlessClient): Promise<WorkspaceBot[]> =>
  (await client.json<{ bots?: WorkspaceBot[] }>("/api/bots?messages=0")).bots ?? [];

async function pausedIn(client: HeadlessClient): Promise<ReadonlySet<string> | null> {
  const report = await client.json<{ heldBots?: string[] }>("/api/paused").catch(() => null);
  return Array.isArray(report?.heldBots) ? new Set(report.heldBots) : null;
}

function namedBot(bots: readonly WorkspaceBot[], name: string): WorkspaceBot {
  const byId = bots.find((bot) => bot.id === name);
  if (byId) return byId;
  const named = bots.filter((bot) => bot.name.trim().toLowerCase() === name.toLowerCase());
  if (named.length === 1) return named[0]!;
  if (named.length > 1) throw usageError(`"${name}" names ${named.length} bots`, "use the bot id shown by openmausbot bots");
  throw new HeadlessError(`no bot named "${name}"`, EXIT.notFound, "list the workspace bots with openmausbot bots");
}

async function selectedBot(ctx: VerbContext): Promise<{ client: HeadlessClient; bot: WorkspaceBot }> {
  const name = ctx.positionals[0]?.trim();
  if (!name) throw usageError("name a bot", `openmausbot ${ctx.verb} BOT`);
  const client = await ctx.client();
  return { client, bot: namedBot(await botsIn(client), name) };
}

function computerLabel(bot: WorkspaceBot): string {
  switch (bot.computer) {
    case "off": return "none";
    case "cloud": return bot.cloudBackend === "vps" ? "cloud (VPS)" : "cloud";
    case "vm": return "local VM";
    case "local": return "this computer";
    default: return bot.computer ?? "auto";
  }
}

function botState(bot: WorkspaceBot, held: ReadonlySet<string> | null): string {
  if (held?.has(bot.id)) return "paused";
  if (bot.activity === "dead" || bot.activity === "no-signal") return "failed";
  if (bot.activity === "waiting-on-you") return "waiting on you";
  if (bot.busy || bot.activity === "working") return "working";
  return bot.waitingForTeammates ? "waiting on teammates" : "idle";
}

function botSummary(bot: WorkspaceBot, held: ReadonlySet<string> | null) {
  return {
    id: bot.id,
    name: bot.name,
    team: bot.section ?? null,
    state: botState(bot, held),
    computer: computerLabel(bot),
    working: (bot.tasks ?? []).filter((thread) => thread.busy).length,
  };
}

export async function workspaceStatus(ctx: VerbContext): Promise<VerbOutcome> {
  const client = await ctx.client();
  const [bots, held, environment] = await Promise.all([
    botsIn(client), pausedIn(client),
    client.json<{ label?: string; version?: string }>("/.well-known/openmausbot/environment").catch(() => null),
  ]);
  const rows = bots.map((bot) => botSummary(bot, held));
  const server = { url: client.baseUrl, label: environment?.label ?? null, version: environment?.version ?? null };
  return {
    result: { server, pausedKnown: held !== null, bots: rows },
    exitCode: EXIT.done,
    human: [
      `${server.label ?? HALAI_PRODUCT.name} · ${server.url}`,
      ...(rows.length ? rows.map((row) => `${row.name} · ${row.state} · ${row.computer} · id ${row.id}`) : ["No bots yet."]),
    ],
  };
}

export async function botDetails(ctx: VerbContext): Promise<VerbOutcome> {
  const { client, bot } = await selectedBot(ctx);
  const row = botSummary(bot, await pausedIn(client));
  const model = bot.modelSelection ? { instanceId: bot.modelSelection.instanceId, model: bot.modelSelection.model ?? null } : null;
  const approvals = bot.approvalMode ?? (typeof bot.autoApprove === "boolean" ? (bot.autoApprove ? "auto" : "ask") : null);
  return {
    result: { ...row, title: bot.title ?? null, model, approvals, threadCount: bot.tasks?.length ?? 0 },
    exitCode: EXIT.done,
    human: [`${row.name} · ${row.state} · ${row.computer} · id ${row.id}`, `Approvals ${approvals ?? "unknown"} · ${bot.tasks?.length ?? 0} conversations`],
  };
}

export async function listThreads(ctx: VerbContext): Promise<VerbOutcome> {
  const { bot } = await selectedBot(ctx);
  const threads = (bot.tasks ?? []).map((task) => ({
    id: task.threadId, title: task.title ?? null, busy: Boolean(task.busy), active: task.threadId === bot.threadId, createdAt: task.createdAt ?? null,
  }));
  return {
    result: { bot: { id: bot.id, name: bot.name }, threads },
    exitCode: EXIT.done,
    human: threads.length
      ? threads.map((task) => `${task.active ? "* " : ""}${task.title ?? "Untitled"} · ${task.busy ? "working" : "idle"} · id ${task.id}`)
      : [`${bot.name} has no conversations.`],
  };
}

export async function listComputers(ctx: VerbContext): Promise<VerbOutcome> {
  const client = await ctx.client();
  const [bots, inventory] = await Promise.all([
    botsIn(client), client.json<{ instances?: CloudComputer[] }>("/api/computers/boxes").catch(() => null),
  ]);
  const boxes = new Map((inventory?.instances ?? []).map((box) => [box.ownerBotId, box]));
  const rows = bots.map((bot) => {
    const box = boxes.get(bot.id);
    return { id: bot.id, name: bot.name, computer: computerLabel(bot), cloud: box ? { state: box.state ?? null, name: box.name ?? null } : null };
  });
  return {
    result: { bots: rows, cloudKnown: inventory !== null },
    exitCode: EXIT.done,
    human: rows.length ? rows.map((row) => `${row.name} · ${row.computer}${row.cloud?.state ? ` · ${row.cloud.state}` : ""}`) : ["No bots yet."],
  };
}
