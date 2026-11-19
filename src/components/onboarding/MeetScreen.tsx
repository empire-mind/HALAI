import { useEffect, useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { engineReady } from "@/components/EngineLibrary";
import { brand, productName } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { aiChoices, aiWorks } from "@/lib/onboarding";
import { useStore } from "@/state/store";
import { HALAI_PRODUCT } from "../../../shared/halai-product";
import { ConnectAiDialog } from "./ConnectAi";
import { PILL, SignInPill, useSignInPill } from "./SignInPill";
import { useWelcomeAi } from "./welcome-ai";

export function MeetScreen({ hosted, onNext }: { hosted: boolean; onNext: () => void }) {
  const { state } = useStore();
  // An AI counts once it answered a test message (or cannot be sent one); OpenCode's free model never does.
  const tested = useWelcomeAi(state.instances, !hosted);
  const ready = aiWorks(tested);
  const known = state.instances.length > 0;
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!hosted && known && !ready && tested?.state !== "testing") setAsking(true);
  }, [hosted, known, ready, tested?.state]);
  const { recommended } = aiChoices(state.instances.filter((instance) => instance.install && !engineReady(instance)));
  const pill = useSignInPill(recommended);
  const [dialog, setDialog] = useState(false);
  const logo = brand().logo ?? HALAI_PRODUCT.mark;
  const failure = pill.error ?? (tested?.state === "failed" ? tested.error ?? t("onboarding.engines.noAnswer", { name: tested.instance.displayName }) : null);
  const signingIn = asking && !ready;
  return (
    <div className="my-auto flex w-full flex-col items-center px-4 py-8 text-center sm:px-6">
      <div className="flex w-full max-w-[420px] flex-col items-center rounded-xl border border-hairline bg-panel px-5 py-6 sm:px-8 sm:py-8">
        <img src={logo} alt="" width={64} height={64} className="size-16 object-contain" />
        <h1 id="welcome-title" className="mt-4 text-[20px] font-semibold tracking-[-0.01em] text-ink">
          {t("onboarding.meet.title", { app: productName() })}
        </h1>
        <div data-demo-composer="" className="mt-4 flex w-full items-start gap-2.5 rounded-lg bg-inset px-3 py-3 text-start text-[13px] leading-[18px] text-ink-secondary">
          <MessageSquare size={16} className="mt-px shrink-0" aria-hidden="true" />
          <p className="min-w-0 break-words">{t("onboarding.meet.demo")}</p>
        </div>
        {hosted && <p className="mt-3 text-[13px] leading-[18px] text-ink-secondary">{t("onboarding.hosted.intro")}</p>}
        <div className="mt-5 flex w-full flex-col items-center">
          {asking && ready && tested && (
            <p role="status" data-ai-connected="" className="mb-2 flex items-center gap-1.5 text-[13px] leading-[18px] text-success">
              <Check size={14} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />{t("onboarding.meet.connected", { name: tested.instance.displayName })}
            </p>
          )}
          {signingIn ? (
            <SignInPill pill={pill} instance={recommended} waiting={tested?.state === "testing"} onDialog={() => setDialog(true)} />
          ) : (
            <button type="button" data-primary="" onClick={onNext} className={cn(PILL, asking && "animate-fade-in [animation-duration:150ms]")}>
              {t("onboarding.meet.next")}
            </button>
          )}
          {signingIn && (
            <p className="mt-3 text-[13px] leading-[18px] text-ink-secondary">
              <button type="button" onClick={() => setDialog(true)} className="rounded transition-colors hover:text-ink">{t("onboarding.meet.otherWays")}</button>
              <span aria-hidden="true"> · </span>
              <button type="button" data-welcome-later="" onClick={onNext} className="rounded transition-colors hover:text-ink">{t("onboarding.meet.setupLater")}</button>
            </p>
          )}
          {signingIn && failure && <p role="alert" className="mt-2 break-words text-[13px] leading-[18px] text-danger">{failure}</p>}
        </div>
      </div>
      {dialog && <ConnectAiDialog hosted={hosted} tested={tested} onClose={() => setDialog(false)} />}
    </div>
  );
}
