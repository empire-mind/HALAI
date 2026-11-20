import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { closeInbox } from "@/state/inbox";
import { useStoreDispatch } from "@/state/store-select";
import { SidebarInboxRow } from "./SidebarInboxRow";
import { TeamSideSwitch } from "./TeamSideSwitch";

export function SidebarPrimaryRows({ icons, large, phone, workbench, running, onClose }: {
  icons: boolean;
  large: boolean;
  phone: boolean;
  workbench: boolean;
  running: boolean;
  onClose: () => void;
}) {
  const dispatch = useStoreDispatch();
  const title = t("workbench.title");
  function openWorkbench() {
    closeInbox();
    dispatch({ type: "showWorkbench" });
    if (phone) onClose();
  }
  return (
    <>
      <div className={cn("pb-1", !icons && "px-3")}>
        <button type="button" data-sidebar-workbench="" aria-label={title}
          aria-current={workbench ? "page" : undefined} title={title} onClick={openWorkbench}
          className={cn(
            "flex min-h-11 items-center gap-2.5 rounded-lg text-ink hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus",
            icons ? "mx-auto w-[46px] justify-center" : "w-full px-2 text-start",
            workbench && "bg-raised",
          )}>
          <LayoutDashboard size={18} className="shrink-0 text-ink-secondary" aria-hidden="true" />
          {!icons && <span className="min-w-0 truncate text-sm font-medium">{title}</span>}
        </button>
      </div>
      <TeamSideSwitch compact={icons} listOnly={phone} />
      <SidebarInboxRow icons={icons} large={large} running={running} onOpened={phone ? onClose : undefined} />
    </>
  );
}
