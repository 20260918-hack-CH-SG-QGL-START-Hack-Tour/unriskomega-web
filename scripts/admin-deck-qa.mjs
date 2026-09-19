import assert from "node:assert/strict";
export async function checkDeck(page, base, output, screenshot, check) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/deck/JO202609190900`);
  if (
    await page.getByRole("button", { name: "Light mode", exact: true }).count()
  )
    await page.getByRole("button", { name: "Light mode", exact: true }).click();
  for (const locale of ["en", "es", "de", "fr"]) {
    await page.locator("header select").selectOption(locale);
    const choices = page.locator("nav > div button");
    assert.equal(await choices.count(), 10);
    for (let index = 0; index < 10; index++) {
      await choices.nth(index).click();
      const slide = page.locator("main article");
      await slide.getByRole("heading", { level: 1 }).waitFor();
      const layout = await slide.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const footer = element.querySelector("footer").getBoundingClientRect();
        return {
          page: document.documentElement.scrollWidth <= innerWidth,
          inside: footer.bottom <= box.bottom + 1,
        };
      });
      assert.deepEqual(layout, { page: true, inside: true });
      for (const img of await slide.locator("img").all()) {
        await img.evaluate((element) => element.decode());
        assert.ok(
          await img.evaluate(
            (element) => element.complete && element.naturalWidth > 0,
          ),
        );
      }
      if (locale === "en" || index === 0 || index === 5)
        await screenshot(
          `deck-${locale}-${String(index + 1).padStart(2, "0")}`,
        );
    }
  }
  await page.locator("header select").selectOption("en");
  await page.locator("nav > div button").first().click();
  await page.locator("main").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("ArrowRight");
  await page.locator('main article[data-kind="problem"]').waitFor();
  const pdf = await page.pdf({
    path: `${output}/pitch-deck-en.pdf`,
    width: "16in",
    height: "9in",
    printBackground: true,
  });
  assert.equal(
    (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length,
    10,
  );
  await page.getByRole("button", { name: "Dark mode", exact: true }).click();
  await screenshot("deck-dark");
  await page.setViewportSize({ width: 390, height: 844 });
  for (let index = 0; index < 10; index++) {
    await page.locator("nav > div button").nth(index).click();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  await screenshot("deck-mobile");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Light mode", exact: true }).click();
  check(
    "all ten visual deck scenes render in EN ES DE FR, with loaded product captures, keyboard navigation, print export, dark mode and mobile reflow",
  );
}
