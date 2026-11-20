import { useEffect, useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { engineReady } from "@/components/EngineLibrary";
import { brand, productName } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { aiChoices, aiWorks, firstAis, type FirstAiKind } from "@/lib/onboarding";
import { useStore, type InstanceInfo } from "@/state/store";
import { freeFallback } from "../../../shared/ai-ranking";
import { HALAI_PRODUCT } from "../../../shared/halai-product";
import { ConnectAiDialog } from "./ConnectAi";
import { PILL, SignInPill, useSignInPill } from "./SignInPill";
import { aiRuns, useWelcomeAi } from "./welcome-ai";

export function MeetScreen({ hosted, onNext }: { hosted: boolean; onNext: () => void }) {
  const { state } = useStore();
  const [chosen, setChosen] = useState<string | null>(null);
  const tested = useWelcomeAi(state.instances, !hosted, chosen);
  const ready = aiWorks(tested);
  const known = state.instances.length > 0;
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!hosted && known && !ready && tested?.state !== "testing") setAsking(true);
  }, [hosted, known, ready, tested?.state]);
  const works = (instance: InstanceInfo) => aiRuns(instance) && !freeFallback(instance);
  const first = firstAis(state.instances, works).filter(({ instance }) => !works(instance) && (instance.install || engineReady(instance)));
  const { recommended } = aiChoices(state.instances.filter((instance) => instance.install && !engineReady(instance)));
  const option = (kind: FirstAiKind) => first.find((entry) => entry.kind === kind)?.instance;
  const fallback = first.length ? undefined : recommended;
  const pills = {
    claude: useSignInPill(option("claude") ?? fallback),
    chatgpt: useSignInPill(option("chatgpt")),
    opencode: useSignInPill(option("opencode")),
  };
  const shown = first.length ? first : [{ kind: "claude" as const, instance: fallback }];
  const [dialog, setDialog] = useState(false);
  const logo = brand().logo ?? HALAI_PRODUCT.mark;
  const testing = tested?.state === "testing" ? tested.instance.instanceId : null;
  const testingPill = shown.some(({ instance }) => instance?.instanceId === testing) ? testing : shown[0]?.instance?.instanceId;
  const failure = shown.map(({ kind }) => pills[kind].error).find(Boolean)
    ?? (tested?.state === "failed" ? tested.error ?? t("onboarding.engines.noAnswer", { name: tested.instance.displayName }) : null);
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
            <div data-first-ais="" className="flex w-full flex-col items-center gap-2">
              {shown.map(({ kind, instance }, index) => {
                const settling = Boolean(instance && instance.instanceId === chosen && engineReady(instance) && !aiRuns(instance));
                return (
                  <SignInPill key={kind} pill={pills[kind]} instance={instance} quiet={index > 0}
                    name={kind === "chatgpt" ? t("cloudSignIn.codex") : undefined}
                    setUp={kind === "chatgpt" && instance?.snapshot.state !== "available"}
                    waiting={settling || (testing !== null && instance?.instanceId === testingPill)}
                    onDialog={() => setDialog(true)} onPick={instance && (() => setChosen(instance.instanceId))} />
                );
              })}
            </div>
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
      {dialog && <ConnectAiDialog hosted={hosted} tested={tested} onChoose={setChosen} onClose={() => setDialog(false)} />}
    </div>
  );
}
