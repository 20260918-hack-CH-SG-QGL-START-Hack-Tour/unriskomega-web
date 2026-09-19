"use client";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/data-display/Icon/Icon";
import { Brand } from "@/components/ui/navigation/Brand/Brand";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import styles from "./LandingStyles";

function Preview() {
  const { t } = usePreferences();
  return (
    <div className={styles.preview}>
      <div className={styles.previewBar}>
        <span className={styles.previewDots}>
          <i />
          <i />
          <i />
        </span>
        <span>unriskomega / {t.workspace.toLowerCase()}</span>
        <Icon name="shield" width="15" />
      </div>
      <div className={styles.previewContent}>
        <div className={styles.previewContext}>
          <span>{t.preview}</span>
          <span>
            <i />
            {t.humanReview}
          </span>
        </div>
        <div className={styles.previewHeading}>
          <div>
            <p>{t.portfolioOverview}</p>
            <h3>{t.morningBrief}</h3>
          </div>
          <span className={styles.roundIcon}>
            <Icon name="spark" />
          </span>
        </div>
        <div className={styles.previewGrid}>
          <div className={styles.previewAllocation}>
            <span>{t.allocation}</span>
            <svg viewBox="0 0 180 180" aria-label={t.preview} role="img">
              <circle
                cx="90"
                cy="90"
                r="64"
                fill="none"
                stroke="var(--surface-soft)"
                strokeWidth="22"
              />
              <circle
                cx="90"
                cy="90"
                r="64"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="22"
                strokeDasharray="181 402"
                transform="rotate(-90 90 90)"
              />
              <circle
                cx="90"
                cy="90"
                r="64"
                fill="none"
                stroke="var(--blue)"
                strokeWidth="22"
                strokeDasharray="117 402"
                strokeDashoffset="-189"
                transform="rotate(-90 90 90)"
              />
              <circle
                cx="90"
                cy="90"
                r="64"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="22"
                strokeDasharray="73 402"
                strokeDashoffset="-314"
                transform="rotate(-90 90 90)"
              />
              <text
                x="90"
                y="88"
                textAnchor="middle"
                fill="var(--text)"
                fontSize="22"
              >
                3
              </text>
              <text
                x="90"
                y="107"
                textAnchor="middle"
                fill="var(--muted)"
                fontSize="10"
              >
                {t.assetClass}
              </text>
            </svg>
            <div className={styles.legend}>
              <span>
                <i />
                {t.assetEquity}
              </span>
              <span>
                <i />
                {t.assetBond}
              </span>
              <span>
                <i />
                {t.assetOther}
              </span>
            </div>
          </div>
          <div className={styles.previewBrief}>
            <span className={styles.previewLabel}>
              <Icon name="spark" width="16" />
              {t.briefing}
            </span>
            <h4>{t.previewLine}</h4>
            <p>{t.previewDetail}</p>
            {[t.performance, t.health, t.outlook].map((label, index) => (
              <div className={styles.previewRow} key={label}>
                <span>0{index + 1}</span>
                {label}
                <Icon name="check" width="15" />
              </div>
            ))}
            <span className={styles.previewSource}>
              <Icon name="book" width="14" />
              {t.sourcesFirst}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.floatingNote}>
        <span className={styles.noteIcon}>
          <Icon name="shield" />
        </span>
        <div>
          <strong>{t.humanControl}</strong>
          <small>{t.noTrading}</small>
        </div>
        <Icon name="check" />
      </div>
    </div>
  );
}
export function Landing() {
  const { t } = usePreferences();
  const features: [IconName, string, string][] = [
    ["book", t.sourcesFirst, t.sourcesBody],
    ["spark", t.oneFlow, t.flowBody],
    ["shield", t.yourJudgment, t.judgmentBody],
  ];
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main">
        {t.skip}
      </a>
      <header className={styles.header}>
        <Brand />
        <nav aria-label={t.platform}>
          <Link href="#platform">{t.platform}</Link>
          <Link href="#approach">{t.approach}</Link>
          <Link href="/deck/JO202609190900">{t.deck}</Link>
        </nav>
        <div className={styles.headerActions}>
          <Preferences />
          <Link className={styles.signIn} href="/login">
            {t.signIn}
            <Icon name="arrow" width="17" />
          </Link>
        </div>
      </header>
      <main id="main">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <i />
              {t.eyebrow}
            </span>
            <h1>
              {t.heroFirst}
              <br />
              <em>{t.heroSecond}</em>
            </h1>
            <p>{t.heroBody}</p>
            <div className={styles.heroActions}>
              <Link href="/login" className={styles.primary}>
                {t.openDemo}
                <Icon name="arrow" />
              </Link>
              <a href="#approach" className={styles.secondary}>
                {t.seeHow}
                <Icon name="down" width="17" />
              </a>
            </div>
            <div className={styles.trustLine}>
              <Icon name="shield" width="16" />
              {t.humanControl}
              <span />
              EN · DE · FR · ES
            </div>
          </div>
          <Preview />
        </section>
        <div className={styles.contextStrip}>
          <span>{t.demoDisclosure}</span>
          <strong>
            START HACK <span>TOUR ST. GALLEN</span>
          </strong>
          <span>18—19 SEP 2026</span>
        </div>
        <section id="platform" className={styles.features}>
          <div className={styles.sectionIntro}>
            <span className={styles.eyebrow}>{t.product}</span>
            <h2>{t.gettingStarted}</h2>
            <p>{t.fourLanguages}</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map(([icon, title, description]) => (
              <article key={title} className={styles.feature}>
                <span className={styles.featureIcon}>
                  <Icon name={icon} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="approach" className={styles.approach}>
          <div>
            <span className={styles.eyebrow}>{t.approach}</span>
            <h2>{t.morningBrief}</h2>
            <Link href="/login" className={styles.primary}>
              {t.openDemo}
              <Icon name="arrow" />
            </Link>
          </div>
          <ol>
            {[t.stepOne, t.stepTwo, t.stepThree].map((step, index) => (
              <li key={step}>
                <span>0{index + 1}</span>
                <strong>{step}</strong>
                <Icon name="arrow" />
              </li>
            ))}
          </ol>
        </section>
      </main>
      <footer className={styles.footer}>
        <Brand />
        <p>{t.footer}</p>
        <Link href="/deck/JO202609190900">
          {t.deck}
          <Icon name="arrow" width="16" />
        </Link>
      </footer>
    </div>
  );
}
