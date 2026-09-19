import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { locales } from "@/lib/i18n";
import { deckContent, deckLabels } from "./content";
import { DeckVisual } from "./DeckVisuals";

test("all localized product captures render without CSP-blocked inline styles", () => {
  for (const locale of locales) {
    const captures = deckContent[locale].filter((slide) =>
      ["hero", "briefing", "conversation", "evidence"].includes(slide.kind),
    );
    expect(captures).toHaveLength(4);
    for (const slide of captures) {
      const html = renderToStaticMarkup(
        <DeckVisual slide={slide} labels={deckLabels[locale]} />,
      );
      expect(html).not.toContain(" style=");
      expect(html).toContain('width="1440" height="1100"');
      expect(html).toContain('src="/deck/');
      expect(html).toContain('decoding="async"');
    }
  }
});
