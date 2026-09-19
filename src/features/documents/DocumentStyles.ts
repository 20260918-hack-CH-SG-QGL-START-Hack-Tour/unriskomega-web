import review from "./DocumentReviewStyles.module.css";
import library from "./DocumentStyles.module.css";
export function mergeStyles(...modules: Record<string, string>[]) {
  return Object.fromEntries(
    [...new Set(modules.flatMap((module) => Object.keys(module)))].map(
      (key) => [
        key,
        modules
          .map((module) => module[key])
          .filter(Boolean)
          .join(" "),
      ],
    ),
  );
}
export default mergeStyles(library, review);
