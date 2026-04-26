import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";
import MobileNav from "../components/MobileNav";
import MarketTicker from "../components/MarketTicker";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://molt-pulse.com'),
  title: "MoltPulse | Real-time AI Agent Map",
  description: "The Bloomberg for AI Agents. Discover, track, and rank the top autonomous agents, dev frameworks, and AI tools with real-time Pulse Scores.",
  openGraph: {
    title: "MoltPulse | The Real-time AI Agent Map",
    description: "Discover, track, and rank the top autonomous agents with real-time Pulse Scores and market analytics.",
    url: "https://molt-pulse.com",
    siteName: "MoltPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoltPulse | Real-time AI Agent Map",
    description: "Discover, track, and rank the top autonomous agents with real-time Pulse Scores.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <MarketTicker />
        <Navigation />
        <MobileNav />
        <div className="md:ml-64 min-h-screen flex flex-col">
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] w-full mx-auto">
            {children}
            <Analytics />
            {process.env.NEXT_PUBLIC_GA_ID && (
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            )}
          </main>
        </div>
      </body>
    </html>
  );
}
