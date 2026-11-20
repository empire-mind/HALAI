// @vitest-environment happy-dom
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setInboxSupport, setInboxView } from "@/state/inbox";
import { initialState, reducer, type Action, type AppState, type Bot } from "@/state/store";
import { WorkbenchPage } from "./WorkbenchPage";

const fixture = vi.hoisted(() => ({
  dispatch: vi.fn(),
  inbox: vi.fn(),
  admin: false,
}));
const mainAgent = { id: "agent", threadId: "thread", name: "Mira", title: "Handover", hidden: false } as Bot;
const hiddenAgent = { ...mainAgent, id: "hidden", threadId: "hidden-thread", name: "Hidden bot", hidden: true };
const original: AppState = { ...initialState, bots: [hiddenAgent, mainAgent], selectedId: "agent", hydrated: true, connected: true };

vi.mock("@/state/store", async (load) => ({
  ...await load<typeof import("@/state/store")>(),
  useStore: () => ({ state: original, dispatch: fixture.dispatch }),
}));
vi.mock("@/state/inbox", async (load) => ({
  ...await load<typeof import("@/state/inbox")>(),
  openInbox: () => fixture.inbox(),
}));
vi.mock("@/lib/use-owner-or-admin", () => ({ useOwnerOrAdmin: () => fixture.admin }));

let container: HTMLDivElement;
let stop: (() => void) | undefined;

function mount() {
  container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  flushSync(() => root.render(createElement(WorkbenchPage)));
  stop = () => { root.unmount(); container.remove(); };
}

function button(name: string): HTMLButtonElement | undefined {
  return [...container.querySelectorAll("button")].find((element) => element.textContent?.trim() === name);
}

function click(name: string) {
  const element = button(name);
  expect(element).toBeDefined();
  flushSync(() => element!.click());
}

beforeEach(() => {
  fixture.dispatch.mockReset();
  fixture.inbox.mockReset();
  fixture.admin = false;
  setInboxView(null);
});
afterEach(() => {
  stop?.();
  stop = undefined;
});

describe("HALAI Workbench", () => {
  it("enters from a primary view without replacing the selected conversation", () => {
    let state = reducer({ ...original, computerOpen: true, inspectorOpen: true }, { type: "showWorkbench" });
    expect(state).toMatchObject({ activeView: "workbench", selectedId: mainAgent.id, computerOpen: false, inspectorOpen: false });
    state = reducer(state, { type: "select", id: mainAgent.id });
    expect(state).toMatchObject({ activeView: "chat", selectedId: mainAgent.id });
  });

  it("uses the normal conversation action and keeps hidden agents out of the view", () => {
    mount();
    expect(container.querySelector("main h1")?.textContent).toBe("HALAI Workbench");
    click("Resume conversation");
    expect(fixture.dispatch).toHaveBeenCalledWith({ type: "select", id: mainAgent.id } satisfies Action);
    click("Agents");
    expect(container.textContent).not.toContain("Hidden bot");
    expect(container.querySelector('[role="tabpanel"]:not([hidden])')?.textContent).toContain("Mira");
  });

  it("moves keyboard focus and the visible panel together", () => {
    mount();
    const work = button("Work")!;
    work.focus();
    flushSync(() => work.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(document.activeElement).toBe(button("Agents"));
    expect(button("Agents")?.getAttribute("aria-selected")).toBe("true");
    expect(container.querySelectorAll('[role="tabpanel"]:not([hidden])')).toHaveLength(1);
  });

  it("opens the existing Inbox only when that view is available", () => {
    setInboxSupport("no");
    mount();
    click("Review");
    expect(button("Open Inbox")).toBeUndefined();
    expect(container.querySelector('[role="tabpanel"]:not([hidden])')?.textContent).toContain("Inbox is unavailable");
    flushSync(() => setInboxView({ botId: null, threadId: null, anchor: null, rows: [] }));
    click("Open Inbox");
    expect(fixture.inbox).toHaveBeenCalledOnce();
    expect(fixture.dispatch).not.toHaveBeenCalled();
  });

  it("keeps provider settings behind the existing admin check", () => {
    mount();
    click("Connections");
    expect(button("Model providers and accounts")).toBeUndefined();
    click("Connected apps");
    expect(fixture.dispatch).toHaveBeenCalledWith({ type: "togglePlugins", open: true, surface: "apps" } satisfies Action);
  });
});
