import Link from "next/link";
import styles from "./BrandStyles.module.css";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={styles.brand} aria-label="Unriskomega home">
      <span className={styles.mark} aria-hidden="true">
        u<span>ω</span>
      </span>
      {!compact && (
        <span>
          unrisk<span className={styles.omega}>omega</span>
          <small>ADVISOR INTELLIGENCE</small>
        </span>
      )}
    </Link>
  );
}
