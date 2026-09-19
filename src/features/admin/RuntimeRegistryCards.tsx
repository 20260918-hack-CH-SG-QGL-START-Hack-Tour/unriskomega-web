import type { Locale } from "@/lib/i18n";
import type {
  RuntimeAgent,
  RuntimeRegistry,
  RuntimeSkill,
} from "@/lib/models/admin";
import styles from "./AdminStyles";
import type { AdminMessages } from "./messages";
import { registryLabel } from "./registryLabels";
import { runtimeCopy } from "./runtime-copy";

type Props = { runtime: RuntimeRegistry; t: AdminMessages; locale: Locale };
export function AgentCards({ runtime, t, locale }: Props) {
  return (
    <div className={styles.cards}>
      {runtime.agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} t={t} locale={locale} />
      ))}
    </div>
  );
}
function AgentCard({
  agent,
  t,
  locale,
}: {
  agent: RuntimeAgent;
  t: AdminMessages;
  locale: Locale;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h2>{registryLabel(agent.id, locale, agent.name)}</h2>
        <span className={styles.badge}>
          {agent.mode === "model" ? t.model : t.deterministic}
        </span>
      </div>
      <p>{runtimeCopy[locale].agents[agent.id] ?? agent.description}</p>
      <AgentDetails agent={agent} t={t} locale={locale} />
    </section>
  );
}
function AgentDetails({
  agent,
  t,
  locale,
}: {
  agent: RuntimeAgent;
  t: AdminMessages;
  locale: Locale;
}) {
  return (
    <>
      <div className={styles.tagList}>
        {agent.skillIds.map((id) => (
          <span className={styles.tag} key={id} title={t.skills}>
            {registryLabel(id, locale)}
          </span>
        ))}
      </div>
      <details className={styles.details}>
        <summary>{t.detail}</summary>
        <p className={styles.code}>
          {agent.id} · {agent.role}
        </p>
        <p className={styles.muted}>{t.rawMetadata}</p>
      </details>
    </>
  );
}
export function SkillCards({ runtime, t, locale }: Props) {
  return (
    <div className={styles.stack}>
      <p className={styles.muted}>{t.rawMetadata}</p>
      <div className={styles.cards}>
        {runtime.skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} t={t} locale={locale} />
        ))}
      </div>
    </div>
  );
}
function SkillCard({
  skill,
  t,
  locale,
}: {
  skill: RuntimeSkill;
  t: AdminMessages;
  locale: Locale;
}) {
  const prose = runtimeCopy[locale].skills[skill.id] ?? [
    skill.description,
    skill.input,
    skill.output,
  ];
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeader}>
        <h2>{registryLabel(skill.id, locale, skill.name)}</h2>
        <span className={styles.badge}>
          {skill.status === "active" ? t.active : skill.status}
        </span>
      </div>
      <p>{prose[0]}</p>
      <dl className={styles.definition}>
        <dt>{t.input}</dt>
        <dd>{prose[1]}</dd>
        <dt>{t.output}</dt>
        <dd>{prose[2]}</dd>
      </dl>
      <SkillSources skill={skill} t={t} />
    </section>
  );
}
function SkillSources({ skill, t }: { skill: RuntimeSkill; t: AdminMessages }) {
  return (
    <details className={styles.details}>
      <summary>{t.evidence}</summary>
      <ul className={styles.list}>
        {skill.sourceReferences.map((reference) => (
          <li className={styles.code} key={reference}>
            {reference}
          </li>
        ))}
      </ul>
    </details>
  );
}
