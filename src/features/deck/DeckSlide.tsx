import type { DeckLabels, Slide } from "./content";
import { DeckVisual } from "./DeckVisuals";
import styles from "./PitchDeckStyles.module.css";
export function DeckSlide({
  slide,
  index,
  total,
  labels,
}: {
  slide: Slide;
  index: number;
  total: number;
  labels: DeckLabels;
}) {
  const showPoints = [
    "hero",
    "briefing",
    "conversation",
    "evidence",
    "custody",
    "closing",
  ].includes(slide.kind);
  return (
    <article
      className={`${styles.slide} ${slide.accent ? styles.accent : ""}`}
      data-kind={slide.kind}
      aria-label={`${index + 1} / ${total}`}
    >
      <div className={styles.slideTop}>
        <span>{slide.label}</span>
        <span>
          unriskomega<span className={styles.brandDot}>◦</span>
        </span>
      </div>
      <div className={styles.slideMain}>
        <div className={styles.story}>
          <h1>{slide.title}</h1>
          <p>{slide.body}</p>
          {showPoints && (
            <ul>
              {slide.points.map((point, i) => (
                <li key={point}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.visual}>
          <DeckVisual slide={slide} labels={labels} />
        </div>
      </div>
      <footer>
        <p>{slide.footnote}</p>
        <span>
          {String(index + 1).padStart(2, "0")}{" "}
          <b>/ {String(total).padStart(2, "0")}</b>
        </span>
      </footer>
    </article>
  );
}
