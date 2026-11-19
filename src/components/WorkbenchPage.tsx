import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronRight } from "lucide-react";
import { HALAI_PRODUCT } from "../../shared/halai-product";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useShowThreads } from "@/lib/thread-preferences";
import { useOwnerOrAdmin } from "@/lib/use-owner-or-admin";
import { openInbox, useInboxSupport, useInboxView } from "@/state/inbox";
import { openBot, useStore } from "@/state/store";
import { waitingCount } from "./inbox/inbox-view";
import { useTeamSideLists } from "./TeamSideSwitch";

const views = ["work", "agents", "review", "connections"] as const;
type WorkbenchView = typeof views[number];

const actionStyle = "inline-flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-hairline bg-card px-4 py-2 text-start text-sm font-semibold text-ink hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const rowStyle = "flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-hairline bg-card px-4 py-2 text-start text-ink hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function WorkbenchPage() {
  const { state, dispatch } = useStore();
  const [view, setView] = useState<WorkbenchView>("work");
  const instance = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const showThreads = useShowThreads();
  const inbox = useInboxView();
  const inboxSupport = useInboxSupport();
  const waiting = waitingCount(inbox);
  const canManage = useOwnerOrAdmin() === true;
  const listed = useTeamSideLists(state);
  const agents = listed.bots.filter((bot) => !bot.hidden);
  const room = listed.groups.find((group) => group.id === state.selectedId);
  const agent = agents.find((bot) => bot.id === state.selectedId) ?? agents[0];
  const conversationName = room?.name ?? agent?.name;

  useEffect(() => { heading.current?.focus(); }, []);

  const tabId = (key: WorkbenchView) => `${instance}-${key}-tab`;
  const panelId = (key: WorkbenchView) => `${instance}-${key}-panel`;

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let target: WorkbenchView | undefined;
    switch (event.key) {
      case "ArrowLeft": target = views[(index + views.length - 1) % views.length]; break;
      case "ArrowRight": target = views[(index + 1) % views.length]; break;
      case "Home": target = views[0]; break;
      case "End": target = views[views.length - 1]; break;
      default: return;
    }
    if (!target) return;
    event.preventDefault();
    setView(target);
    event.currentTarget.ownerDocument.getElementById(tabId(target))?.focus();
  }

  function resume() {
    if (room) dispatch({ type: "select", id: room.id });
    else if (agent) openBot(dispatch, agent, showThreads);
  }

  return (
    <main data-workbench="" aria-labelledby={`${instance}-heading`} className="min-w-0 flex-1 overflow-y-auto bg-app text-ink">
      <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-16 sm:px-8 md:pt-10">
        <h1 id={`${instance}-heading`} tabIndex={-1} ref={heading}
          className="flex flex-wrap items-baseline gap-x-2 text-3xl font-semibold tracking-tight focus:outline-none sm:text-4xl">
          <span>{HALAI_PRODUCT.name}</span> <span>{t("workbench.title")}</span>
        </h1>
        <div role="tablist" aria-label={t("workbench.title")} className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-hairline bg-panel p-1.5 sm:grid-cols-4">
          {views.map((key, index) => (
            <button key={key} type="button" id={tabId(key)} role="tab" aria-controls={panelId(key)}
              aria-selected={view === key} tabIndex={view === key ? 0 : -1}
              onClick={() => setView(key)} onKeyDown={(event) => moveTab(event, index)}
              className={cn("min-h-11 rounded-lg px-2 text-sm font-medium text-ink-secondary hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus",
                view === key && "bg-raised font-semibold text-ink")}>
              {t(`workbench.tab.${key}`)}
            </button>
          ))}
        </div>
        <section id={panelId("work")} role="tabpanel" aria-labelledby={tabId("work")} hidden={view !== "work"} tabIndex={0} className="mt-6">
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <section className="rounded-xl border border-hairline bg-panel p-5">
              <h2 className="text-lg font-semibold">{t("workbench.currentConversation")}</h2>
              {conversationName ? (
                <>
                  <p dir="auto" className="mt-2 break-words text-base text-ink-secondary">{conversationName}</p>
                  <button type="button" className={cn(actionStyle, "mt-4")} onClick={resume}>
                    {t("workbench.resumeConversation")} <ChevronRight size={16} aria-hidden="true" className="shrink-0 rtl:rotate-180" />
                  </button>
                </>
              ) : <p role="status" className="mt-2 text-sm text-ink-secondary">{t(state.hydrated ? "workbench.noConversations" : "workbench.loading")}</p>}
            </section>
            {listed.groups.length > 0 && (
              <section>
                <h2 className="mb-2 text-lg font-semibold">{t("workbench.rooms")}</h2>
                <ul className="space-y-2">
                  {listed.groups.map((group) => (
                    <li key={group.id}>
                      <button type="button" className={rowStyle} onClick={() => dispatch({ type: "select", id: group.id })}>
                        <span dir="auto" className="min-w-0 break-words">{group.name}</span>
                        <ChevronRight size={16} aria-hidden="true" className="shrink-0 rtl:rotate-180" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </section>
        <section id={panelId("agents")} role="tabpanel" aria-labelledby={tabId("agents")} hidden={view !== "agents"} tabIndex={0} className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">{t("workbench.workspaceAgents")}</h2>
          {agents.length ? (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {agents.map((bot) => (
                <li key={bot.id}>
                  <button type="button" className={rowStyle} onClick={() => openBot(dispatch, bot, showThreads)}>
                    <span className="min-w-0 break-words">
                      <span dir="auto" className="block font-medium">{bot.name}</span>
                      {bot.title && <span dir="auto" className="block text-sm text-ink-secondary">{bot.title}</span>}
                    </span>
                    <ChevronRight size={16} aria-hidden="true" className="shrink-0 rtl:rotate-180" />
                  </button>
                </li>
              ))}
            </ul>
          ) : <p role="status" className="text-sm text-ink-secondary">{t(state.hydrated ? "workbench.noAgents" : "workbench.loading")}</p>}
        </section>
        <section id={panelId("review")} role="tabpanel" aria-labelledby={tabId("review")} hidden={view !== "review"} tabIndex={0} className="mt-6 rounded-xl border border-hairline bg-panel p-5">
          <h2 className="text-lg font-semibold">{t("inbox.panel.title")}</h2>
          {inbox ? (
            <>
              {waiting > 0 && <p className="mt-2 text-sm text-ink-secondary">{t("inbox.row.count", { count: waiting })}</p>}
              {inbox.rows.length === 0 && <p className="mt-2 text-sm text-ink-secondary">{t("inbox.empty")}</p>}
              <button type="button" className={cn(actionStyle, "mt-4")} onClick={() => openInbox()}>{t("workbench.openInbox")}</button>
            </>
          ) : <p role="status" className="mt-2 text-sm text-ink-secondary">{t(inboxSupport === "no" ? "workbench.noInbox" : "workbench.loading")}</p>}
        </section>
        <section id={panelId("connections")} role="tabpanel" aria-labelledby={tabId("connections")} hidden={view !== "connections"} tabIndex={0} className="mt-6 rounded-xl border border-hairline bg-panel p-5">
          <h2 className="text-lg font-semibold">{t("workbench.tab.connections")}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {canManage && <button type="button" className={actionStyle}
              onClick={() => dispatch({ type: "toggleAppSettings", open: true, section: "engines" })}>
              {t("settings.engines.title")}
            </button>}
            <button type="button" className={actionStyle} onClick={() => dispatch({ type: "togglePlugins", open: true, surface: "apps" })}>
              {t("sidebar.nav.connectedApps")}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
