import type { AppState } from "./store";

const destinations = {
  showWorkbench: "workbench",
  showTeamMap: "team-map",
  showFiles: "files",
  showWebPanel: "web-panel",
  showPublishedApps: "published-apps",
  showTeamFiles: "team-files",
  showAnnouncements: "announcements",
} as const satisfies Record<string, AppState["activeView"]>;

export type WorkspaceViewAction =
  | { type: Exclude<keyof typeof destinations, "showFiles" | "showWebPanel"> }
  | { type: "showFiles"; suggest?: string[] }
  | { type: "showWebPanel"; id: string };

export function reduceWorkspaceView(state: AppState, action: WorkspaceViewAction): AppState {
  return {
    ...state,
    activeView: destinations[action.type],
    filesSuggest: action.type === "showFiles" && action.suggest?.length ? action.suggest : null,
    webPanelId: action.type === "showWebPanel" ? action.id : state.webPanelId,
    forkPanel: action.type === "showWorkbench" ? null : state.forkPanel,
    settingsOpen: false,
    computerOpen: false,
    inspectorOpen: false,
    activityOpen: false,
    appSettingsOpen: false,
    pluginsOpen: false,
  };
}
