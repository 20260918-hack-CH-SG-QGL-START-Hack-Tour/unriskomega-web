"use client";
import { usePreferences } from "@/features/preferences/Preferences";
import { CustodyReview } from "./CustodyReview";
import styles from "./DocumentStyles";
import { documentMessages } from "./messages";
import type { LibraryDocument } from "./model";
import { useDocumentDetail } from "./useDocumentDetail";

export function DocumentPreview({
  document,
  clientId,
  onImported,
}: {
  document: LibraryDocument;
  clientId: string;
  onImported: (id: string) => void;
}) {
  const { locale } = usePreferences();
  const t = documentMessages[locale];
  const detail = useDocumentDetail(document.id, clientId);
  const active = detail.document;
  return (
    <section
      className={styles.preview}
      aria-label={t.preview}
      aria-busy={detail.loading}
    >
      <header>
        <div>
          <small>{t.preview}</small>
          <h3>{document.filename}</h3>
        </div>
        <a
          href={`/api/v1/documents/${document.id}/content`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.original} ↗
        </a>
      </header>
      {detail.loading && (
        <output className={styles.progress}>
          <span />
          {t.loadingDetail}
        </output>
      )}
      {detail.error && (
        <div role="alert">
          <p className={styles.error}>{t.detailError}</p>
          <button
            type="button"
            className={styles.primary}
            onClick={detail.retry}
          >
            {t.retry}
          </button>
        </div>
      )}
      {active && (
        <>
          <p>{active.extraction.summary}</p>
          {active.extraction.warnings.length > 0 && (
            <details>
              <summary>{t.warnings}</summary>
              <ul>
                {active.extraction.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </details>
          )}
          {active.kind === "custody" &&
            (active.virtualPortfolioId ? (
              <button
                className={styles.primary}
                type="button"
                onClick={() => onImported(active.virtualPortfolioId)}
              >
                {t.imported}
              </button>
            ) : (
              <CustodyReview
                key={active.id}
                document={active}
                onImported={onImported}
              />
            ))}
          <details>
            <summary>{t.extract}</summary>
            <pre>{active.extraction.extractedText}</pre>
          </details>
        </>
      )}
    </section>
  );
}
