import { useState } from "react";
import { cn } from "@/lib/cn";

/** One connectable app as the Apps catalog lists it. */
export interface ToolkitCard {
  slug: string;
  label: string;
  blurb: string;
  logo: string | null;
  noAuth?: boolean;
  domain: string | null;
  categories?: string[];
}

export function ServiceIcon({ card, className = "size-11" }: { card: Pick<ToolkitCard, "logo" | "label">; className?: string }) {
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const logo = card.logo;
  if (logo && logo !== failedLogo) {
    return (
      <img
        src={logo}
        alt=""
        loading="lazy"
        className={cn("rounded-xl object-contain", className)}
        onError={() => setFailedLogo(logo)}
      />
    );
  }
  return (
    <div className={cn("flex items-center justify-center rounded-xl bg-raised text-[15px] font-semibold text-ink-secondary", className)}>
      {card.label.slice(0, 1).toUpperCase()}
    </div>
  );
}
