import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { ConditionalShell } from "@/components/public/ConditionalShell";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "ZYLO BRAINS",
    template: "%s · ZYLO BRAINS",
  },
  description:
    "Enterprise operations platform for jobs, orders, and review workflows.",
  applicationName: "ZYLO BRAINS",
  authors: [{ name: "ZYLO BRAINS" }],
};

export const viewport: Viewport = {
  themeColor: "#1C5BA7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink-soft">
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
