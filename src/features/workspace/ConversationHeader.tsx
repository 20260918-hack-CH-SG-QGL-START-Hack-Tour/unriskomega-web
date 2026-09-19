"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { Tooltip } from "@/components/ui/overlays/Tooltip/Tooltip";
import { usePreferences } from "@/features/preferences/Preferences";
import { conversationMessages } from "@/lib/i18n/conversation";
import styles from "./ConversationHeaderStyles.module.css";

export function ConversationHeader({
  clientAlias,
  portfolioName,
  sessionId,
}: {
  clientAlias: string;
  portfolioName: string;
  sessionId: string;
}) {
  const { t, locale } = usePreferences();
  const copy = conversationMessages[locale];
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copyId() {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }
  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <Icon name="spark" />
        <div>
          <h2>{t.assistant}</h2>
          <small>{t.humanControl}</small>
        </div>
      </div>
      <dl aria-label={copy.selectedContext}>
        <div>
          <dt>{copy.client}</dt>
          <dd>{clientAlias}</dd>
        </div>
        <div>
          <dt>{copy.portfolio}</dt>
          <dd>{portfolioName}</dd>
        </div>
      </dl>
      <Tooltip label={copy.sessionHint} align="end">
        <button
          type="button"
          onClick={() => void copyId()}
          disabled={!sessionId}
          aria-label={copied ? copy.copiedSession : copy.copySession}
        >
          <Icon name={copied ? "check" : "book"} width="15" />
          <span>
            {copy.session}
            <code>{sessionId || "—"}</code>
          </span>
        </button>
      </Tooltip>
      {failed && <p role="alert">{t.error}</p>}
    </header>
  );
}
