import type { Portfolio } from "./portfolio";

export function allocationGaps(
  portfolio: Pick<Portfolio, "allocation" | "totalValue">,
) {
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
