"use client";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import {
  dictionaries,
  isLocale,
  type Locale,
  locales,
  type Messages,
} from "@/lib/i18n";
import styles from "./PreferencesStyles.module.css";

type PreferenceContext = {
  locale: Locale;
  t: Messages;
  theme: "light" | "dark";
  setLocale: (locale: Locale) => void;
  toggleTheme: () => void;
};
const Context = createContext<PreferenceContext | null>(null);
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLanguage] = useState<Locale>("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = localStorage.getItem("uro-locale");
    if (isLocale(saved)) setLanguage(saved);
    const savedTheme = localStorage.getItem("uro-theme");
    setTheme(
      savedTheme === "dark" ||
        (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light",
    );
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => console.warn("Offline shell registration unavailable"));
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);
  const setLocale = (value: Locale) => {
    setLanguage(value);
    localStorage.setItem("uro-locale", value);
  };
  const toggleTheme = () => {
    const value = theme === "dark" ? "light" : "dark";
    setTheme(value);
    localStorage.setItem("uro-theme", value);
  };
  return (
    <Context
      value={{ locale, t: dictionaries[locale], theme, setLocale, toggleTheme }}
    >
      {children}
    </Context>
  );
}
export function usePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("Preferences provider missing");
  return value;
}
export function Preferences() {
  const { locale, t, theme, setLocale, toggleTheme } = usePreferences();
  return (
    <div className={styles.controls}>
      <select
        aria-label={t.language}
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) setLocale(event.target.value);
        }}
      >
        {locales.map((value) => (
          <option value={value} key={value}>
            {value.toUpperCase()}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={styles.theme}
        onClick={toggleTheme}
        aria-label={theme === "dark" ? t.light : t.dark}
        title={theme === "dark" ? t.light : t.dark}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} />
      </button>
    </div>
  );
}
