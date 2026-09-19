"use client";
import { usePreferences } from "@/features/preferences/Preferences";
import styles from "./ModelSelectorStyles.module.css";
import { modelMessages } from "./modelMessages";
import type { ModelSelection } from "./useModelSelection";

export function ModelSelector({
  id,
  selection,
  explain = false,
}: {
  id: string;
  selection: ModelSelection;
  explain?: boolean;
}) {
  const { locale } = usePreferences();
  const copy = modelMessages[locale];
  const unavailable =
    selection.model &&
    !selection.models.some((model) => model.id === selection.model);
  return (
    <div className={styles.control}>
      <label htmlFor={id}>{copy.label}</label>
      <select
        id={id}
        value={selection.model ?? ""}
        onChange={(event) => selection.select(event.target.value)}
        disabled={!selection.models.length}
        aria-describedby={explain ? `${id}-help` : undefined}
        aria-busy={selection.loading}
      >
        {!selection.model && (
          <option value="">
            {selection.loading ? copy.loading : copy.serverDefault}
          </option>
        )}
        {unavailable && (
          <option value={selection.model} disabled>
            {selection.model} · {copy.unavailableChoice}
          </option>
        )}
        {selection.models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.label}
          </option>
        ))}
      </select>
      {explain && (
        <p id={`${id}-help`}>
          {copy.next} {copy.modalities}
        </p>
      )}
      {selection.error && (
        <div className={styles.error}>
          <output>{copy.unavailable}</output>
          <button
            type="button"
            onClick={selection.reload}
            disabled={selection.loading}
          >
            {copy.retry}
          </button>
        </div>
      )}
    </div>
  );
}
