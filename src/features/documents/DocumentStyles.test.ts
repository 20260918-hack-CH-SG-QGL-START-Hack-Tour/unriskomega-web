import { expect, test } from "bun:test";
import { mergeStyles } from "./DocumentStyles";

test("review module cannot discard library layout and input styles sharing the same local class name", () => {
  expect(
    mergeStyles(
      { library: "library-base", heading: "heading" },
      { library: "library-review", fields: "fields" },
    ),
  ).toEqual({
    library: "library-base library-review",
    heading: "heading",
    fields: "fields",
  });
});
