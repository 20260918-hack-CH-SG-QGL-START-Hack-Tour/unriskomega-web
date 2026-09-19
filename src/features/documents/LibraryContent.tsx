"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import type { DocumentLibraryProps } from "./DocumentLibrary";
import { DocumentPreview } from "./DocumentPreview";
import styles from "./DocumentStyles";
import { documentMessages } from "./messages";
import { inFolder, type LibraryDocument, parseDocuments } from "./model";
import { useUploads } from "./useUploads";
export function LibraryContent({
  clientId,
  portfolioId,
  chatSessionId,
  onImported,
  onUpdated,
}: DocumentLibraryProps) {
  const { locale } = usePreferences();
  const t = documentMessages[locale];
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [folder, setFolder] = useState("all");
  const [scope, setScope] = useState(chatSessionId ? "chat" : "portfolio");
  const [kind, setKind] = useState("custody");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const uploadInput = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const uploads = useUploads(
    { clientId, portfolioId, chatSessionId, scope, kind, locale },
    async (results) => {
      const version = generation.current;
      onUpdated?.();
      try {
        const loaded = parseDocuments(
          await api(`documents?clientId=${encodeURIComponent(clientId)}`),
        );
        if (version !== generation.current) return;
        setDocuments(loaded);
        const first = results.find((result) => result.clientId === clientId);
        setSelected(first?.documentId ?? "");
        setFolder("all");
      } catch (error) {
        if (version !== generation.current) return;
        setError(error instanceof Error ? error.message : t.error);
      }
    },
  );
  const busy = uploads.busy;
  function upload(files: File[], retryId?: string) {
    if (files.length > 20) {
      setError(t.batchLimit);
      return;
    }
    setError("");
    void uploads.upload(files, retryId);
    if (uploadInput.current) uploadInput.current.value = "";
  }
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
            disabled={busy}
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
            disabled={busy}
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
          accept=".pdf,.json,.txt,.csv,.md"
          multiple
          aria-label={t.drop}
          onChange={(e) => {
            upload(Array.from(e.target.files ?? []));
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
      <button
        type="button"
        className={styles.dropZone}
        disabled={busy}
        onClick={() => uploadInput.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!busy) upload(Array.from(event.dataTransfer.files));
        }}
      >
        <Icon name="book" width="25" />
        <div>
          <strong>{t.dropTitle}</strong>
          <p>{t.limit}</p>
        </div>
        <span>{t.batchHint}</span>
      </button>
      <p className={styles.hint}>{t.previewOnly}</p>
      {uploads.items.length > 0 && (
        <section
          className={styles.uploadResults}
          aria-label={t.uploadResults}
          aria-live="polite"
        >
          <header>
            <strong>{t.uploadResults}</strong>
            <span>
              {
                uploads.items.filter((item) =>
                  ["saved", "review", "imported", "failed"].includes(
                    item.state,
                  ),
                ).length
              }{" "}
              / {uploads.items.length}
            </span>
          </header>
          <progress
            max={uploads.items.length}
            value={
              uploads.items.filter((item) =>
                ["saved", "review", "imported", "failed"].includes(item.state),
              ).length
            }
            aria-label={t.uploadResults}
          />
          <ul>
            {uploads.items.map((item) => (
              <li key={item.id} data-state={item.state}>
                <Icon
                  name={
                    item.state === "failed"
                      ? "info"
                      : ["saved", "review", "imported"].includes(item.state)
                        ? "check"
                        : "clock"
                  }
                  width="18"
                />
                <div>
                  <strong>{item.file.name}</strong>
                  <p>
                    {t[item.state]} ·{" "}
                    {(item.file.size / 1024).toLocaleString(locale, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    KB
                  </p>
                  {item.error && <p className={styles.error}>{item.error}</p>}
                </div>
                {item.result?.imported && item.result.portfolioId && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onImported(
                        item.result?.portfolioId ?? "",
                        item.result?.clientId,
                      )
                    }
                  >
                    {t.openImported}
                  </button>
                )}
                {item.result?.review && item.result.clientId === clientId && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setSelected(item.result?.documentId ?? "")}
                  >
                    {t.review}
                  </button>
                )}
                {item.state === "failed" && !busy && (
                  <button
                    type="button"
                    onClick={() => upload([item.file], item.id)}
                  >
                    {t.retry}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
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
                <span>
                  {doc.status === "superseded"
                    ? t.superseded
                    : doc.status === "imported"
                      ? t.reviewed
                      : t.ready}
                </span>
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
