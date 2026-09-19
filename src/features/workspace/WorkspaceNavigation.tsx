"use client";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/data-display/Icon/Icon";
import { Brand } from "@/components/ui/navigation/Brand/Brand";
import { adminMessages } from "@/features/admin/messages";
import { usePreferences } from "@/features/preferences/Preferences";
import styles from "./WorkspaceStyles";
export type Tab =
  | "overview"
  | "portfolios"
  | "assistant"
  | "evidence"
  | "documents";
export function WorkspaceNavigation({
  menu,
  tab,
  nav,
  onNavigate,
  user,
  signOut,
}: {
  menu: boolean;
  tab: Tab;
  nav: [Tab, IconName, string][];
  onNavigate: (tab: Tab) => void;
  user: string;
  signOut: () => Promise<void>;
}) {
  const { t, locale } = usePreferences();
  const admin = adminMessages[locale];
  return (
    <aside className={`${styles.sidebar} ${menu ? styles.sidebarOpen : ""}`}>
      <div className={styles.sideBrand}>
        <Brand />
      </div>
      <div className={styles.workspaceLabel}>
        <span className={styles.workspaceMark}>U</span>
        <div>
          <strong>{t.product}</strong>
          <small>{t.demoDisclosure}</small>
        </div>
      </div>
      <nav aria-label={t.workspace}>
        {nav.map(([id, icon, label]) => (
          <button
            type="button"
            key={id}
            className={tab === id ? styles.activeNav : ""}
            onClick={() => {
              onNavigate(id);
            }}
            aria-current={tab === id ? "page" : undefined}
          >
            <Icon name={icon} width="18" />
            {label}
            {id === "assistant" && <span>AI</span>}
          </button>
        ))}
      </nav>
      <div className={styles.sidebarBottom}>
        <div className={styles.sideNote}>
          <Icon name="shield" />
          <strong>{t.yourJudgment}</strong>
          <p>{t.noTrading}</p>
        </div>
        <Link href="/ai/overview" title={admin.adminHint}>
          <Icon name="grid" width="18" />
          {admin.adminView}
          <Icon name="arrow" width="15" />
        </Link>
        <Link href="/deck/JO202609190900">
          <Icon name="layers" width="18" />
          {t.deck}
          <Icon name="arrow" width="15" />
        </Link>
        <button type="button" onClick={() => void signOut()}>
          <Icon name="logOut" width="18" />
          {t.signOut}
        </button>
        <div className={styles.profile}>
          <span>JO</span>
          <div>
            <strong>{user || t.demoAccount}</strong>
            <small>{t.demoAccount}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
