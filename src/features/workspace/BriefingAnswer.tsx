"use client";
import { AnswerBlocks } from "@/components/ui/data-display/AnswerBlocks/AnswerBlocks";
import { AnswerText } from "@/components/ui/data-display/AnswerText/AnswerText";
import { usePreferences } from "@/features/preferences/Preferences";
import { chatMessages, chatNotice } from "@/lib/i18n/chat";
import type { ChatAnswer } from "@/lib/models/chat";
import styles from "./AssistantResponseStyles.module.css";

export function BriefingAnswer({ answer }: { answer: ChatAnswer }) {
  const { locale } = usePreferences();
  const copy = chatMessages[locale];
  return (
    <div>
      <AnswerText text={answer.text} />
      {!!answer.warnings.length && (
        <ul className={styles.warnings}>
          {answer.warnings.map((warning, index) => (
            <li key={`${index}-${warning}`}>{chatNotice(warning, copy)}</li>
          ))}
        </ul>
      )}
      <AnswerBlocks
        components={answer.components}
        evidence={answer.evidence}
        locale={locale}
        copy={copy}
      />
      {!!answer.evidence.length && (
        <details className={styles.answerEvidence}>
          <summary>
            {copy.sources} · {answer.evidence.length}
          </summary>
          <dl>
            {answer.evidence.map((source) => (
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
      {answer.outcome && (
        <p>
          {answer.outcome.status === "accepted" ? copy.verified : copy.review}
        </p>
      )}
    </div>
  );
}
