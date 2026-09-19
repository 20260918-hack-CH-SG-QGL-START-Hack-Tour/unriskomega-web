import Image from "next/image";
import Link from "next/link";
import type { DeckLabels, Slide } from "./content";
import styles from "./DeckVisualsStyles.module.css";
export function DeckVisual({
  slide,
  labels,
}: {
  slide: Slide;
  labels: DeckLabels;
}) {
  if (["hero", "briefing", "conversation", "evidence"].includes(slide.kind)) {
    const name = slide.kind === "hero" ? "workspace" : slide.kind;
    return (
      <figure
        className={`${styles.product} ${slide.kind === "hero" ? styles.heroProduct : ""}`}
      >
        <div className={styles.window}>
          <span />
          <span />
          <span />
          <small>unriskomega / {name}</small>
        </div>
        <div className={styles.capture}>
          <Image
            src={`/deck/${name}.webp`}
            alt={labels.screenshot}
            width={1440}
            height={1100}
            unoptimized
            priority={slide.kind === "hero"}
          />
        </div>
        <figcaption>{labels.screenshot}</figcaption>
      </figure>
    );
  }
  if (slide.kind === "problem")
    return (
      <figure className={styles.problem} aria-label={labels.diagram}>
        <div className={styles.sourceInputs}>
          {slide.points.map((point, index) => (
            <div key={point}>
              <span>0{index + 1}</span>
              <strong>{point}</strong>
              <small>{index === 0 ? labels.source : labels.unavailable}</small>
            </div>
          ))}
        </div>
        <div className={styles.reading}>
          <strong>
            60<span>s</span>
          </strong>
          <p>{labels.reading}</p>
        </div>
      </figure>
    );
  if (slide.kind === "custody")
    return (
      <figure className={styles.custody} aria-label={labels.diagram}>
        {[
          labels.pdf,
          labels.extract,
          labels.review,
          labels.virtual,
          labels.result,
        ].map((step, index) => (
          <div key={step} className={index === 3 ? styles.virtual : ""}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
            {index < 4 && <b aria-hidden="true">↓</b>}
          </div>
        ))}
      </figure>
    );
  if (slide.kind === "architecture")
    return (
      <figure className={styles.architecture} aria-label={labels.diagram}>
        {slide.points.map((step, index) => (
          <div key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
            {index < 3 && <b aria-hidden="true">↓</b>}
          </div>
        ))}
      </figure>
    );
  if (slide.kind === "business")
    return (
      <div className={styles.business}>
        <section>
          <span>{labels.user}</span>
          <h2>{slide.points[0]}</h2>
        </section>
        <section>
          <span>{labels.buyer}</span>
          <h2>{slide.points[1]}</h2>
        </section>
        <p>
          <strong>{labels.pilot}</strong>
          {slide.points[2]}
        </p>
      </div>
    );
  if (slide.kind === "roadmap")
    return (
      <div className={styles.roadmap}>
        <div className={styles.counts}>
          <span>
            <strong>47</strong>
            {labels.sourceCount}
          </span>
          <span>
            <strong>57</strong>
            {labels.portfolioCount}
          </span>
          <span>
            <strong>4</strong>
            {labels.languages}
          </span>
        </div>
        <section>
          <span>{labels.now}</span>
          <h2>{slide.points[0]}</h2>
          <p>{slide.points[1]}</p>
        </section>
        <section>
          <span>{labels.next}</span>
          <h2>{slide.points[2]}</h2>
          <p>{slide.points[3]}</p>
        </section>
      </div>
    );
  return (
    <div className={styles.closing}>
      <span aria-hidden="true">→</span>
      <Link href="/login">
        {labels.live} <span aria-hidden="true">↗</span>
      </Link>
      <p>{labels.team}</p>
    </div>
  );
}
