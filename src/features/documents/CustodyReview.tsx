"use client";
import { useState } from "react";
import { usePreferences } from "@/features/preferences/Preferences";
import { api, record, string } from "@/lib/api/client";
import styles from "./DocumentStyles";
import { documentMessages } from "./messages";
import { type LibraryDocument, reconciliation } from "./model";

export function CustodyReview({
  document,
  onImported,
}: {
  document: LibraryDocument;
  onImported: (id: string) => void;
}) {
  const { locale } = usePreferences();
  const t = documentMessages[locale];
  const e = document.extraction;
  const [name, setName] = useState(e.title || document.filename);
  const [date, setDate] = useState(e.asOf?.slice(0, 10) ?? "");
  const [currency, setCurrency] = useState(e.currency ?? "");
  const [total, setTotal] = useState(e.totalValue ?? "");
  const [holdings, setHoldings] = useState(e.holdings);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const totals = reconciliation(holdings, total);
  function change(index: number, key: string, value: string) {
    setConfirmed(false);
    setHoldings((rows) =>
      rows.map((row, i) =>
        i === index
          ? { ...row, [key]: key === "sourcePage" ? Number(value) : value }
          : row,
      ),
    );
  }
  async function importPortfolio() {
    setBusy(true);
    setError("");
    try {
      const result = record(
        await api(`documents/${document.id}/import`, {
          method: "POST",
          body: JSON.stringify({
            confirmed,
            name,
            asOf: date,
            currency,
            totalValue: total,
            holdings,
          }),
        }),
      );
      onImported(string(result.id));
    } catch (error) {
      setError(error instanceof Error ? error.message : t.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.review} aria-label={t.review}>
      <h3>{t.review}</h3>
      <p>{t.candidate}</p>
      <div className={styles.fields}>
        <label>
          {t.name}
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setConfirmed(false);
            }}
            maxLength={100}
          />
        </label>
        <label>
          {t.date}
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setConfirmed(false);
            }}
          />
        </label>
        <label>
          {t.currency}
          <input
            value={currency}
            maxLength={3}
            onChange={(e) => {
              setCurrency(e.target.value.toUpperCase());
              setConfirmed(false);
            }}
            placeholder="CHF"
          />
        </label>
        <label>
          {t.total}
          <input
            value={total}
            inputMode="decimal"
            onChange={(e) => {
              setTotal(e.target.value);
              setConfirmed(false);
            }}
          />
        </label>
      </div>
      <div className={styles.tableScroll}>
        <table>
          <thead>
            <tr>
              <th>{t.holdings}</th>
              <th>{t.asset}</th>
              <th>{t.currency}</th>
              <th>{t.value}</th>
              <th>{t.page}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => (
              <tr key={`${document.id}-${i}`}>
                <td>
                  <input
                    aria-label={`${t.holdings} ${i + 1}`}
                    value={h.name}
                    onChange={(e) => change(i, "name", e.target.value)}
                  />
                  <small>{h.isin}</small>
                </td>
                <td>
                  <input
                    aria-label={`${t.asset} ${i + 1}`}
                    value={h.assetClass}
                    onChange={(e) => change(i, "assetClass", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label={`${t.currency} ${i + 1}`}
                    value={h.currency}
                    maxLength={3}
                    onChange={(e) =>
                      change(i, "currency", e.target.value.toUpperCase())
                    }
                  />
                </td>
                <td>
                  <input
                    aria-label={`${t.value} ${i + 1}`}
                    value={h.marketValue}
                    inputMode="decimal"
                    onChange={(e) => change(i, "marketValue", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label={`${t.page} ${i + 1}`}
                    value={h.sourcePage}
                    type="number"
                    min={1}
                    onChange={(e) => change(i, "sourcePage", e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    aria-label={`${t.remove} ${i + 1}`}
                    onClick={() => {
                      setHoldings((rows) => rows.filter((_, n) => i !== n));
                      setConfirmed(false);
                    }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.reviewTotals}>
        <button
          type="button"
          onClick={() => {
            setHoldings((rows) => [
              ...rows,
              {
                name: "",
                isin: null,
                assetClass: "Unclassified",
                currency,
                quantity: null,
                marketValue: "0",
                sourcePage: 1,
              },
            ]);
            setConfirmed(false);
          }}
        >
          {t.addRow}
        </button>
        <strong>
          {t.sum}: {totals.sum.toLocaleString(locale)} {currency}
        </strong>
      </div>
      {!totals.valid && (
        <output className={styles.warning}>{t.mismatch}</output>
      )}
      <label className={styles.confirm}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span>{t.confirm}</span>
      </label>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <button
        type="button"
        className={styles.primary}
        disabled={
          busy || !confirmed || !totals.valid || !date || currency.length !== 3
        }
        onClick={() => void importPortfolio()}
      >
        {busy ? t.importing : t.import}
      </button>
    </section>
  );
}
