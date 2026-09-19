import type { Metadata, Viewport } from "next";
import { PreferencesProvider } from "@/features/preferences/Preferences";
import "@/styles/globals.css";
export const metadata: Metadata = {
  title: {
    default: "Unriskomega · Advisor intelligence",
    template: "%s · Unriskomega",
  },
  description:
    "Source-backed portfolio briefings for more considered client conversations.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Unriskomega",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#101c18" },
  ],
};
export const dynamic = "force-dynamic";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
