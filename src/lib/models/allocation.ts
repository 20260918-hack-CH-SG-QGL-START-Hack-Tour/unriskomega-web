import type { Portfolio } from "./portfolio";

export function allocationGaps(
  portfolio: Pick<Portfolio, "allocation" | "totalValue">,
) {
  const targets = portfolio.allocation.flatMap((item) =>
    item.target === null ? [] : [item.target],
  );
  const total = targets.reduce((sum, value) => sum + value, 0);
  if (
    !targets.length ||
    !targets.every(
      (value) => Number.isFinite(value) && value >= 0 && value <= 100,
    ) ||
    total <= 0 ||
    total > 100.000001
  )
    return [];
  return portfolio.allocation.flatMap((allocation) => {
    if (allocation.target === null) return [];
    const percentagePoints = allocation.target - allocation.weight;
    return [
      {
        ...allocation,
        target: allocation.target,
        percentagePoints,
        amount: (portfolio.totalValue * percentagePoints) / 100,
      },
    ];
  });
}
