import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AnswerText } from "./AnswerText";

it("renders readable Markdown while leaving HTML and unsafe links inert", () => {
  const html = renderToStaticMarkup(
    <AnswerText
      text={
        "## Evidence\n\n- **Cash** is `0`\n- <script>alert(1)</script>\n\n[click](javascript:alert(1))"
      }
    />,
  );
  expect(html).toContain("<h4>");
  expect(html).toContain("<strong>Cash</strong>");
  expect(html).toContain("<code>0</code>");
  expect(html).toContain("&lt;script&gt;");
  expect(html).not.toContain("<script>");
  expect(html).not.toContain("href=");
});
