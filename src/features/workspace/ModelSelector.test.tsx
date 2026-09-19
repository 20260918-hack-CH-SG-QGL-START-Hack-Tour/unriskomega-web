import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PreferencesProvider } from "@/features/preferences/Preferences";
import { ModelSelector } from "./ModelSelector";
import type { ModelSelection } from "./useModelSelection";

const selection: ModelSelection = {
  model: "server-b",
  models: [
    { id: "server-a", label: "Server A" },
    { id: "server-b", label: "<script>Server B</script>" },
  ],
  error: false,
  loading: false,
  select() {},
  reload() {},
};
test("model selector uses an accessible native field and treats catalogue labels as inert text", () => {
  const markup = renderToStaticMarkup(
    <PreferencesProvider>
      <ModelSelector id="analysis" selection={selection} explain />
    </PreferencesProvider>,
  );
  expect(markup).toContain('for="analysis"');
  expect(markup).toContain('aria-describedby="analysis-help"');
  expect(markup).toContain('value="server-b" selected=""');
  expect(markup).toContain("&lt;script&gt;Server B&lt;/script&gt;");
  expect(markup).not.toContain("<script>");
  expect(markup).toContain("dedicated models");
});
test("catalogue failure keeps an explicit choice instead of silently replacing it with the default", () => {
  const markup = renderToStaticMarkup(
    <PreferencesProvider>
      <ModelSelector
        id="analysis"
        selection={{ ...selection, models: [], error: true }}
      />
    </PreferencesProvider>,
  );
  expect(markup).toContain('value="server-b"');
  expect(markup).toContain("Unavailable");
  expect(markup).toContain("Reload models");
  expect(markup).not.toContain('value=""');
});
