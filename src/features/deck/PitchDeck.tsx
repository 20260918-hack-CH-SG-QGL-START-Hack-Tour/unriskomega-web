"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { Brand } from "@/components/ui/navigation/Brand/Brand";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import { deckContent, deckLabels } from "./content";
import { DeckSlide } from "./DeckSlide";
import styles from "./PitchDeckStyles.module.css";

export function PitchDeck() {
  const { locale, t } = usePreferences();
  const [index, setIndex] = useState(0);
  const slides = deckContent[locale];
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLButtonElement ||
        event.target instanceof HTMLAnchorElement
      )
        return;
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        setIndex((value) => Math.min(value + 1, slides.length - 1));
      }
      if (event.key === "ArrowLeft")
        setIndex((value) => Math.max(value - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Brand />
        <div>
          <Preferences />
          <button
            type="button"
            onClick={() =>
              void document.documentElement
                .requestFullscreen()
                .catch(() => undefined)
            }
            aria-label={t.fullscreen}
            title={t.fullscreen}
          >
            <Icon name="expand" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label={t.print}
            title={t.print}
          >
            <Icon name="download" />
          </button>
        </div>
      </header>
      <main className={styles.active}>
        <DeckSlide
          slide={slides[index]}
          index={index}
          total={slides.length}
          labels={deckLabels[locale]}
        />
      </main>
      <div className={styles.print}>
        {slides.map((slide, i) => (
          <DeckSlide
            key={slide.label}
            slide={slide}
            index={i}
            total={slides.length}
            labels={deckLabels[locale]}
          />
        ))}
      </div>
      <nav className={styles.controls} aria-label={t.deck}>
        <button
          type="button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
          aria-label={t.previous}
        >
          ←
        </button>
        <div>
          {slides.map((slide, i) => (
            <button
              key={slide.label}
              type="button"
              aria-label={`${t.slide} ${i + 1}`}
              aria-current={index === i ? "step" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setIndex((value) => Math.min(slides.length - 1, value + 1))
          }
          disabled={index === slides.length - 1}
          aria-label={t.next}
        >
          →
        </button>
        <Link href="/login">
          {t.openDemo}
          <Icon name="arrow" width="17" />
        </Link>
      </nav>
    </div>
  );
}
