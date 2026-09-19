import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Tooltip } from "./Tooltip";

it("preserves the trigger's accessible name and keeps the explanatory tooltip initially hidden", () => {
  const html = renderToStaticMarkup(
    <Tooltip label="Creates an illustrative image">
      <button type="button" aria-label="Create image">
        +
      </button>
    </Tooltip>,
  );
  expect(html).toContain('aria-label="Create image"');
  expect(html).toContain('role="tooltip" hidden=""');
  expect(html).toContain("Creates an illustrative image");
  expect(html).not.toContain("tabindex");
});
