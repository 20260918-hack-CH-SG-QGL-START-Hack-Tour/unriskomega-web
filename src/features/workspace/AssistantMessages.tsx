"use client";
import { useEffect, useRef } from "react";
import { AnswerBlocks } from "@/components/ui/data-display/AnswerBlocks/AnswerBlocks";
import { AnswerText } from "@/components/ui/data-display/AnswerText/AnswerText";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import { chatMessages, chatNotice } from "@/lib/i18n/chat";
import type { ChatMessage } from "@/lib/models/chat";
import responseStyles from "./AssistantResponseStyles.module.css";
import styles from "./AssistantStyles.module.css";
import { ChatImage } from "./ChatImage";

export function AssistantMessages({
  messages,
  onPrompt,
  disabled,
}: {
  messages: ChatMessage[];
  onPrompt: (prompt: string) => void;
  disabled: boolean;
}) {
  const { t, locale } = usePreferences();
  const copy = chatMessages[locale];
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messages.length && scroll.current)
      scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [messages.length]);
  return (
    <div
      className={styles.messages}
      ref={scroll}
      aria-live="polite"
      aria-relevant="additions"
    >
      {!messages.length ? (
        <div className={styles.welcome}>
          <span className={styles.largeIcon}>
            <Icon name="spark" width="32" height="32" />
          </span>
          <h3>{t.askPortfolio}</h3>
          <p>{copy.intro}</p>
          <div className={styles.suggestions}>
            {[
              [copy.chart, copy.chartPrompt],
              [copy.table, copy.tablePrompt],
              [copy.diagram, copy.diagramPrompt],
            ].map(([label, prompt]) => (
              <button
                type="button"
                key={label}
                onClick={() => onPrompt(prompt)}
                disabled={disabled}
              >
                {label}
                <Icon name="arrow" width="15" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? styles.userMessage
                : styles.assistantMessage
            }
          >
            <span>
              <Icon
                name={message.role === "assistant" ? "spark" : "user"}
                width="16"
              />
            </span>
            <div>
              <AnswerText text={message.text} />
              {!!message.warnings?.length && (
                <ul className={responseStyles.warnings}>
                  {message.warnings.map((warning, index) => (
                    <li key={`${index}-${warning}`}>
                      {chatNotice(warning, copy)}
                    </li>
                  ))}
                </ul>
              )}
              {!!message.components?.length && (
                <AnswerBlocks
                  components={message.components}
                  evidence={message.evidence ?? []}
                  locale={locale}
                  copy={copy}
                />
              )}
              {message.image && (
                <ChatImage image={message.image} id={message.id} />
              )}
              {!!message.evidence?.length && (
                <details className={responseStyles.answerEvidence}>
                  <summary>
                    {copy.sources} · {message.evidence.length}
                  </summary>
                  <p>{copy.evidenceHelp}</p>
                  <dl>
                    {message.evidence.map((source) => (
                      <div key={source.id}>
                        <dt>
                          {source.id} · {source.label}
                        </dt>
                        <dd>{source.locator}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
              {message.outcome && (
                <details className={responseStyles.answerEvidence}>
                  <summary>
                    {message.outcome.status === "accepted"
                      ? copy.verified
                      : copy.review}
                  </summary>
                  <p>{copy.evidenceHelp}</p>
                  <ul>
                    {[
                      ...message.outcome.verification.checks,
                      ...message.outcome.warnings,
                    ].map((check, index) => (
                      <li key={`${index}-${check}`}>
                        {chatNotice(check, copy)}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {message.model && <small>{message.model}</small>}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
