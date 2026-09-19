import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PreferencesProvider } from "@/features/preferences/Preferences";
import { ChatImage } from "./ChatImage";

it("provides a native preview dialog and raster download without duplicating the inline image label", () => {
  const src = "data:image/png;base64,iVBORw==";
  const html = renderToStaticMarkup(
    <PreferencesProvider>
      <ChatImage id="voice:turn/1" image={{ src, model: "image-provider" }} />
    </PreferencesProvider>,
  );
  expect(html).toContain("<dialog");
  expect(html).toContain('aria-label="Open image preview"');
  expect(html).toContain('aria-label="Close image preview"');
  expect(html).toContain(
    'download="unriskomega-illustration-voice-turn-1.png"',
  );
  expect(html).toContain('alt="Full-size illustration"');
  expect(html.match(/alt="AI-generated illustration"/g)).toHaveLength(1);
});
