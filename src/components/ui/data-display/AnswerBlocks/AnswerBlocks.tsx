import type { Locale } from "@/lib/i18n";
import type { ChatCopy } from "@/lib/i18n/chat";
import type { ChatComponent, Evidence } from "@/lib/models/chatComponents";
import styles from "./AnswerBlocksStyles.module.css";
import { AnswerChart, AnswerDiagram, ProjectionPlot } from "./AnswerPlots";

function SourceReferences({
  sourceIds,
  evidence,
  copy,
}: {
  sourceIds: string[];
  evidence: Evidence[];
  copy: ChatCopy;
}) {
  if (!sourceIds.length) return null;
  return (
    <details className={styles.sources}>
      <summary>
        {copy.sources} <span>{sourceIds.join(" · ")}</span>
      </summary>
      <dl>
        {sourceIds.map((id) => {
          const source = evidence.find((item) => item.id === id);
          return source ? (
            <div key={id}>
              <dt>
                {source.id} · {source.label}
              </dt>
              <dd>{source.locator}</dd>
            </div>
          ) : null;
        })}
      </dl>
    </details>
  );
}
function BlockContent({
  component,
  locale,
  copy,
}: {
  component: ChatComponent;
  locale: Locale;
  copy: ChatCopy;
}) {
  switch (component.type) {
    case "metric":
      return (
        <>
          <strong className={styles.metric}>{component.value}</strong>
          {component.detail && <p>{component.detail}</p>}
        </>
      );
    case "chart":
      return <AnswerChart {...component} locale={locale} />;
    case "table":
      return (
        <div className={styles.tableScroll}>
          <table>
            <caption>{component.title}</caption>
            <thead>
              <tr>
                {component.columns.map((column, index) => (
                  <th scope="col" key={`${index}-${column}`}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {component.rows.map((row, index) => (
                <tr key={`${index}-${row.join("-")}`}>
                  {row.map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th scope="row" key={`${cellIndex}-${cell}`}>
                        {cell}
                      </th>
                    ) : (
                      <td key={`${cellIndex}-${cell}`}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "evidence":
      return (
        <dl className={styles.evidence}>
          {component.items.map((item, index) => (
            <div key={`${index}-${item.label}`}>
              <dt>{item.label}</dt>
              <dd>
                {item.detail}
                {item.source && <small>{item.source}</small>}
              </dd>
            </div>
          ))}
        </dl>
      );
    case "diagram":
      return <AnswerDiagram component={component} copy={copy} />;
    case "projection":
      return (
        <ProjectionPlot component={component} locale={locale} copy={copy} />
      );
  }
}
export function AnswerBlocks({
  components,
  evidence,
  locale,
  copy,
}: {
  components: ChatComponent[];
  evidence: Evidence[];
  locale: Locale;
  copy: ChatCopy;
}) {
  return (
    <div className={styles.blocks}>
      {components.map((component, index) => (
        <section
          className={styles.card}
          key={`${index}-${component.type}`}
          data-component-type={component.type}
        >
          <h4>
            {component.type === "metric" ? component.label : component.title}
          </h4>
          <BlockContent component={component} locale={locale} copy={copy} />
          <SourceReferences
            sourceIds={component.sourceIds}
            evidence={evidence}
            copy={copy}
          />
        </section>
      ))}
    </div>
  );
}
