import type { SVGProps } from "react";

const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
  sun: "M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 1.5 1.5m9.8 9.8 1.5 1.5M5.6 18.4l1.5-1.5m9.8-9.8 1.5-1.5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20 13a8 8 0 0 1-9-9 8 8 0 1 0 9 9",
  grid: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  wallet: "M3 7h17v13H3zM3 7V4h14v3m0 5h4v4h-4z",
  spark: "m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z",
  shield: "M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6zM8 12l3 3 5-6",
  book: "M4 4h7l1 2 1-2h7v16h-7l-1 1-1-1H4zM12 6v15",
  chat: "M4 4h16v12H9l-5 4z",
  mic: "M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0zM5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-3 0h6",
  image: "M3 3h18v18H3zM3 17l5-5 4 4 3-3 6 6M15 7h.01",
  send: "m3 3 18 9-18 9 4-9zM7 12h14",
  logOut: "M9 4H4v16h5m6-4 4-4-4-4m-7 4h11",
  trend: "m3 17 6-6 4 4 8-10m-7 0h7v7",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2",
  info: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 11v6m0-10h.01",
  menu: "M4 6h16M4 12h16M4 18h16",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3a16 16 0 0 1 0 18 16 16 0 0 1 0-18",
  expand: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  stop: "M6 6h12v12H6z",
  layers: "m12 3 10 5-10 5L2 8zm-10 9 10 5 10-5M2 16l10 5 10-5",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2",
  refresh: "M20 7V3l-3 3A8 8 0 1 0 20 15M20 7h-5",
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
