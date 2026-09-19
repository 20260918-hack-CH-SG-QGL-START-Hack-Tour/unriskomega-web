import styles from "./AnswerTextStyles.module.css";

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    const key = `${index}-${part}`;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={key}>{part.slice(1, -1)}</code>;
    return <span key={key}>{part}</span>;
  });
}
/** A small, text-only Markdown subset. Model text never becomes HTML or a URL. */
export function AnswerText({ text }: { text: string }) {
  return (
    <div className={styles.text}>
      {text
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((block, index) => {
          const key = `${index}-${block.slice(0, 20)}`;
          const lines = block.trim().split("\n");
          if (lines.every((line) => /^[-*]\s+/.test(line)))
            return (
              <ul key={key}>
                {lines.map((line, i) => (
                  <li key={`${i}-${line}`}>
                    {inline(line.replace(/^[-*]\s+/, ""))}
                  </li>
                ))}
              </ul>
            );
          if (lines.every((line) => /^\d+\.\s+/.test(line)))
            return (
              <ol key={key}>
                {lines.map((line, i) => (
                  <li key={`${i}-${line}`}>
                    {inline(line.replace(/^\d+\.\s+/, ""))}
                  </li>
                ))}
              </ol>
            );
          if (/^#{1,4}\s+[^\n]+$/.test(block))
            return <h4 key={key}>{inline(block.replace(/^#{1,4}\s+/, ""))}</h4>;
          return <p key={key}>{inline(block)}</p>;
        })}
    </div>
  );
}
