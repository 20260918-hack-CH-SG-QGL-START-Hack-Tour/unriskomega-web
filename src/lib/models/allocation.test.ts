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
