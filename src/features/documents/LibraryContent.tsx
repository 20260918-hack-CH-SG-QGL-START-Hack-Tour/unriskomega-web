"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import { api, record, string } from "@/lib/api/client";
import type { DocumentLibraryProps } from "./DocumentLibrary";
import { DocumentPreview } from "./DocumentPreview";
import styles from "./DocumentStyles";
import { documentMessages } from "./messages";
import {
  filePayload,
  inFolder,
  type LibraryDocument,
  parseDocuments,
} from "./model";
export function LibraryContent({
  clientId,
  portfolioId,
  chatSessionId,
  onImported,
}: DocumentLibraryProps) {
  const { locale } = usePreferences();
  const t = documentMessages[locale];
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [folder, setFolder] = useState("all");
  const [scope, setScope] = useState(chatSessionId ? "chat" : "portfolio");
  const [kind, setKind] = useState("document");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const uploadInput = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  useEffect(() => {
    const version = ++generation.current;
    setDocuments([]);
    setSelected("");
    setError("");
    api(`documents?clientId=${encodeURIComponent(clientId)}`)
      .then((r) => {
        if (version === generation.current) setDocuments(parseDocuments(r));
      })
      .catch((e) => {
        if (version === generation.current) setError(e.message);
      });
    return () => {
      generation.current++;
    };
  }, [clientId]);
  async function upload(file: File) {
    const version = generation.current;
    setBusy(true);
    setError("");
    try {
      const payload = await filePayload(file);
      const result = record(
        await api("documents", {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            clientId,
            portfolioId,
            chatSessionId,
            scope,
            kind,
            locale,
          }),
        }),
      );
      const loaded = parseDocuments(
        await api(`documents?clientId=${encodeURIComponent(clientId)}`),
      );
      if (version === generation.current) {
        setDocuments(loaded);
        setSelected(string(result.id));
        setFolder("all");
      }
    } catch (e) {
      if (version === generation.current)
        setError(e instanceof Error ? e.message : t.error);
    } finally {
      if (version === generation.current) setBusy(false);
      if (uploadInput.current) uploadInput.current.value = "";
    }
  }
  const shown = documents.filter(
    (d) =>
      inFolder(d, folder, portfolioId, chatSessionId) &&
      `${d.filename} ${d.extraction.title}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const active = documents.find((d) => d.id === selected);
  const folders: [
    [string, string],
    [string, string],
    [string, string],
    [string, string],
  ] = [
    ["all", t.all],
    ["client", t.client],
    ["portfolio", t.portfolio],
    ["chat", t.chat],
  ];
  return (
    <section className={styles.library}>
      <div className={styles.heading}>
        <div>
          <small>{t.subtitle}</small>
          <h2>{t.title}</h2>
        </div>
        <span className={styles.count}>{documents.length}</span>
      </div>
      <div className={styles.uploadBar}>
        <label>
          {t.scope}
          <select
            aria-label={t.scope}
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="client">{t.client}</option>
            <option value="portfolio">{t.portfolio}</option>
            {chatSessionId && <option value="chat">{t.chat}</option>}
          </select>
        </label>
        <label>
          {t.kind}
          <select
            aria-label={t.kind}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="document">{t.document}</option>
            <option value="custody">{t.custody}</option>
            <option value="house-view">{t.houseView}</option>
            <option value="news">{t.news}</option>
            <option value="client-note">{t.clientNote}</option>
          </select>
        </label>
        <input
          ref={uploadInput}
          type="file"
          className={styles.fileInput}
          accept=".pdf,.txt,.csv,.md"
          aria-label={t.drop}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
          disabled={busy}
        />
        <button
          type="button"
          className={styles.primary}
          disabled={busy}
          onClick={() => uploadInput.current?.click()}
        >
          <Icon name="book" width="16" />
          {t.upload}
        </button>
      </div>
      <p className={styles.hint}>{t.limit}</p>
      <p className={styles.hint}>{t.previewOnly}</p>
      {busy && (
        <output className={styles.progress}>
          <span />
          {t.uploading}
        </output>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.filters}>
        <nav aria-label={t.title}>
          {folders
            .filter(([key]) => key !== "chat" || chatSessionId)
            .map(([key, label]) => (
              <button
                type="button"
                key={key}
                aria-pressed={folder === key}
                onClick={() => setFolder(key)}
              >
                {label}
              </button>
            ))}
        </nav>
        <input
          type="search"
          placeholder={t.search}
          aria-label={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {!shown.length ? (
        <div className={styles.empty}>
          <Icon name="book" width="36" />
          <h3>{t.empty}</h3>
          <p>{t.emptyBody}</p>
        </div>
      ) : (
        <div className={styles.fileGrid}>
          {shown.map((doc) => (
            <button
              className={styles.fileCard}
              type="button"
              key={doc.id}
              aria-pressed={selected === doc.id}
              onClick={() => setSelected(doc.id)}
            >
              <span className={styles.fileIcon}>
                <Icon name="book" width="23" />
              </span>
              <strong>{doc.filename}</strong>
              <p>{doc.extraction.title}</p>
              {doc.kind === "custody" && (
                <small>
                  {t.holdings}: {doc.holdingCount}
                </small>
              )}
              <footer>
                <span>
                  {doc.chatSessionId
                    ? t.chat
                    : doc.portfolioId
                      ? t.portfolio
                      : t.client}
                </span>
                <span>{doc.status === "imported" ? t.reviewed : t.ready}</span>
              </footer>
            </button>
          ))}
        </div>
      )}
      {active && (
        <DocumentPreview
          document={active}
          clientId={clientId}
          onImported={onImported}
        />
      )}
    </section>
  );
}
