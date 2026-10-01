"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ui } from "../ui";

/** Shows a fresh invitation link once, with copy and WhatsApp share (O08). */
export function InviteLinkPanel({ link, intro, shareText }: { link: string; intro: string; shareText: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div role="status" data-testid="invite-link-panel" className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-success/40 bg-[#f1f9f4] p-4">
      <p className="text-sm text-ink">{intro}</p>
      <input readOnly value={link} dir="ltr" aria-label={t("copy")} data-testid="invite-link" className={`${ui.input} font-mono text-sm`} onFocus={(e) => e.currentTarget.select()} />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className={ui.buttonSecondary}>
          {copied ? t("copied") : t("copy")}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + link)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={ui.buttonSecondary}
        >
          {t("shareWhatsApp")}
        </a>
      </div>
    </div>
  );
}
