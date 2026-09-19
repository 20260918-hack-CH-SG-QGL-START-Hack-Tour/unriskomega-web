"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { Brand } from "@/components/ui/navigation/Brand/Brand";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import styles from "./SignInStyles.module.css";
export function SignIn() {
  const { t } = usePreferences();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function signIn(demo: boolean, event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setPending(true);
    setError("");
    const form = event ? new FormData(event.currentTarget) : null;
    try {
      await api(demo ? "auth/demo" : "auth/login", {
        method: "POST",
        body: JSON.stringify(
          demo
            ? {}
            : { email: form?.get("email"), password: form?.get("password") },
        ),
      });
      router.push("/workspace");
    } catch {
      setError(t.loginError);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className={styles.page}>
      <header>
        <Brand />
        <Preferences />
      </header>
      <main>
        <div className={styles.art}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <h1>
            {t.heroFirst}
            <br />
            <em>{t.heroSecond}</em>
          </h1>
          <p>{t.heroBody}</p>
          <div className={styles.orbit} aria-hidden="true">
            <div />
            <div />
            <div />
            <span>
              <Icon name="spark" width="45" height="45" />
            </span>
          </div>
          <small>
            <Icon name="shield" width="17" />
            {t.humanControl}
          </small>
        </div>
        <section className={styles.formPanel}>
          <div className={styles.formInner}>
            <span className={styles.introIcon}>
              <Icon name="user" />
            </span>
            <h2>{t.welcome}</h2>
            <p>{t.loginBody}</p>
            <form onSubmit={(event) => void signIn(false, event)}>
              <label htmlFor="email">{t.email}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                placeholder="advisor@example.com"
              />
              <label htmlFor="password">{t.password}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={256}
              />
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className={styles.primary}
              >
                {pending ? t.signingIn : t.signIn}
                <Icon name="arrow" />
              </button>
            </form>
            <div className={styles.divider}>
              <span />
              {t.or}
              <span />
            </div>
            <button
              type="button"
              disabled={pending}
              className={styles.demoButton}
              onClick={() => void signIn(true)}
            >
              <Icon name="spark" />
              {t.demoAccount}
              <Icon name="arrow" />
            </button>
            <p className={styles.hint}>{t.demoLoginHint}</p>
            <div className={styles.privacy}>
              <Icon name="shield" width="14" />
              {t.demoDisclosure}
            </div>
          </div>
        </section>
      </main>
      <footer>
        <Link href="/">← {t.back}</Link>
        <span>{t.footer}</span>
      </footer>
    </div>
  );
}
