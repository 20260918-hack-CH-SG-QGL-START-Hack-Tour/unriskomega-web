import { expect, test } from "bun:test";
import { allocationGaps } from "./allocation";

test("allocation gaps use the current portfolio value and preserve a real zero target", () => {
  const result = allocationGaps({
    totalValue: 120000,
    allocation: [
      { assetClass: "Equities", weight: 60, target: 50, min: 40, max: 60 },
      { assetClass: "Bonds", weight: 25, target: 40, min: 30, max: 50 },
      { assetClass: "Other", weight: 5, target: 0, min: null, max: null },
      { assetClass: "Cash", weight: 10, target: null, min: null, max: null },
    ],
  });
  expect(
    result.map(({ assetClass, amount }) => ({ assetClass, amount })),
  ).toEqual([
    { assetClass: "Equities", amount: -12000 },
    { assetClass: "Bonds", amount: 18000 },
    { assetClass: "Other", amount: -6000 },
  ]);
});

test("empty target templates and invalid mandates cannot imply a sell-all allocation", () => {
  const row = { assetClass: "Equities", weight: 97.9, min: null, max: null };
  for (const targets of [[0, 0], [60, 50], [101], [-1], [Number.NaN]]) {
    expect(
      allocationGaps({
        totalValue: 100000,
        allocation: targets.map((target) => ({ ...row, target })),
      }),
    ).toEqual([]);
  }
});
