import { describe, expect, it } from "bun:test";
import { adminMessages, adminViews, isAdminView } from "./messages";
import { registryLabel } from "./registryLabels";

describe("admin navigation and languages", () => {
  it("has complete translations for every route and safety disclosure", () => {
    const expected = Object.keys(adminMessages.en).sort();
    for (const [locale, messages] of Object.entries(adminMessages)) {
      expect(Object.keys(messages).sort()).toEqual(expected);
      expect(
        Object.values(messages).every((value) => value.trim().length > 0),
      ).toBe(true);
      for (const view of adminViews)
        expect(messages[view].length).toBeGreaterThan(0);
      expect(messages.disclosure.length).toBeGreaterThan(80);
      expect(
        registryLabel("manager", locale as "en" | "es" | "de" | "fr"),
      ).not.toBe("manager");
    }
  });
  it("rejects unknown admin routes", () => {
    expect(isAdminView("overview")).toBe(true);
    expect(isAdminView("delete-database")).toBe(false);
    expect(isAdminView("../workspace")).toBe(false);
  });
});

import { runtimeCopy } from "./runtime-copy";

it("localizes every shipped registry description, skill interface and workflow step", () => {
  for (const locale of ["es", "de", "fr"] as const) {
    const copy = runtimeCopy[locale];
    expect(Object.keys(copy.agents).sort()).toEqual(
      Object.keys(runtimeCopy.en.agents).sort(),
    );
    expect(Object.keys(copy.skills).sort()).toEqual(
      Object.keys(runtimeCopy.en.skills).sort(),
    );
    expect(Object.keys(copy.steps).sort()).toEqual(
      Object.keys(runtimeCopy.en.steps).sort(),
    );
    for (const [id, text] of Object.entries(copy.agents))
      expect(text).not.toBe(runtimeCopy.en.agents[id]);
    for (const [id, text] of Object.entries(copy.steps))
      expect(text).not.toBe(runtimeCopy.en.steps[id]);
    for (const [id, values] of Object.entries(copy.skills))
      for (const [index, text] of values.entries())
        expect(text).not.toBe(runtimeCopy.en.skills[id][index]);
  }
});
