"use client";
import { useId, useRef } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import { conversationMessages } from "@/lib/i18n/conversation";
import type { GeneratedImage } from "@/lib/models/chat";
import styles from "./ChatImageStyles.module.css";
import { ImageFacts } from "./ImageFacts";

export function ChatImage({
  image,
  id,
}: {
  image: GeneratedImage;
  id: string;
}) {
  const { t, locale } = usePreferences();
  const copy = conversationMessages[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const extension = image.src.startsWith("data:image/jpeg;")
    ? "jpg"
    : image.src.startsWith("data:image/webp;")
      ? "webp"
      : "png";
  return (
    <figure className={styles.figure}>
      <button
        type="button"
        className={styles.preview}
        aria-label={copy.preview}
        onClick={() => dialog.current?.showModal()}
      >
        {/* biome-ignore lint/performance/noImgElement: Validated data images need native rendering without Next Image's CSP-blocked inline style. */}
        <img
          src={image.src}
          alt={t.imageLabel}
          width={1024}
          height={1024}
          decoding="async"
        />
        <span>
          <Icon name="image" width="16" />
          {copy.preview}
        </span>
      </button>
      <figcaption>
        {t.imageLabel} · {image.model}
      </figcaption>
      {image.briefing && <ImageFacts briefing={image.briefing} />}
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={title}>
        <header>
          <h3 id={title}>{t.imageLabel}</h3>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={copy.closePreview}
          >
            <Icon name="close" />
          </button>
        </header>
        {/* biome-ignore lint/performance/noImgElement: Keep the full data image preview compatible with nonce-only style CSP. */}
        <img
          src={image.src}
          alt={copy.fullImage}
          width={1024}
          height={1024}
          decoding="async"
        />
        <footer>
          <p>{t.imageHint}</p>
          <a
            href={image.src}
            download={`unriskomega-illustration-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}.${extension}`}
          >
            <Icon name="arrow" width="16" />
            {copy.download}
          </a>
        </footer>
      </dialog>
    </figure>
  );
}
