"use client";
import { useRef } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import styles from "./DocumentStyles";
import { LibraryContent } from "./LibraryContent";
import { documentMessages } from "./messages";

export type DocumentLibraryProps = {
  clientId: string;
  portfolioId: string;
  chatSessionId: string;
  onImported: (id: string, clientId?: string) => void;
  onUpdated?: () => void;
  compact?: boolean;
};
export function DocumentLibrary(props: DocumentLibraryProps) {
  const { locale } = usePreferences();
  const t = documentMessages[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  if (props.compact)
    return (
      <>
        <button
          type="button"
          className={styles.attach}
          onClick={() => dialog.current?.showModal()}
        >
          <Icon name="book" width="16" />
          {t.attach}
        </button>
        <dialog ref={dialog} className={styles.dialog} aria-label={t.title}>
          <header className={styles.dialogHeader}>
            <strong>{t.title}</strong>
            <button
              type="button"
              aria-label={t.close}
              onClick={() => dialog.current?.close()}
            >
              ×
            </button>
          </header>
          <LibraryContent
            {...props}
            onImported={(id, clientId) => {
              dialog.current?.close();
              props.onImported(id, clientId);
            }}
          />
        </dialog>
      </>
    );
  return <LibraryContent {...props} />;
}
