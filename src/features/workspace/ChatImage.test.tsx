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

it("renders the exact source facts beside an illustrative image", () => {
  const html = renderToStaticMarkup(
    <PreferencesProvider>
      <ChatImage
        id="image-2"
        image={{
          src: "data:image/png;base64,iVBORw==",
          model: "image-provider",
          briefing: {
            title: "Portfolio briefing",
            selectedClient: "Client 28",
            selectedPortfolio: "Portfolio 01",
            asOf: "2026-09-03",
            facts: [
              { label: "AUM", value: "171713.24", unit: "CHF", source: "/aum" },
              {
                label: "Shares",
                value: "0.979",
                unit: "fraction",
                source: "/allocation/0/weight",
              },
            ],
            warnings: [
              "Illustrative image; accompanying values are source facts.",
            ],
          },
        }}
      />
    </PreferencesProvider>,
  );
  expect(html).toContain("Client 28 · Portfolio 01 · 2026-09-03");
  expect(html).toContain("171713.24 CHF");
  expect(html).toContain("97.9%");
  expect(html).toContain("/allocation/0/weight");
});

it("image preview and dialog retain CSP-safe markup and format-specific downloads", () => {
  for (const [mime, extension] of [
    ["image/png", "png"],
    ["image/jpeg", "jpg"],
    ["image/webp", "webp"],
  ]) {
    const html = renderToStaticMarkup(
      <PreferencesProvider>
        <ChatImage
          id="image/01"
          image={{ src: `data:${mime};base64,aW1hZ2U=`, model: "fixture" }}
        />
      </PreferencesProvider>,
    );
    expect(html).not.toContain(" style=");
    expect(html.match(/<img /g)).toHaveLength(2);
    expect(html.match(/width="1024" height="1024"/g)).toHaveLength(2);
    expect(html).toContain("<dialog");
    expect(html).toContain(
      `download="unriskomega-illustration-image-01.${extension}"`,
    );
  }
});
