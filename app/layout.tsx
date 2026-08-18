import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";
import MobileNav from "../components/MobileNav";
import MarketTicker from "../components/MarketTicker";
import { Analytics } from "@vercel/analytics/next";
import GoogleAnalytics from "../components/GoogleAnalytics";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.molt-pulse.com'),
  alternates: {
    canonical: "/",
  },
  title: "MoltPulse | Real-time AI Agent Map",
  description: "The Bloomberg for AI Agents. Discover, track, and rank the top autonomous agents, dev frameworks, and AI tools with real-time Pulse Scores.",
  keywords: ["moltpulse", "molt pulse", "ai agents", "autonomous agents", "ai directory", "crypto agents", "agent economy"],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "MoltPulse | The Real-time AI Agent Map",
    description: "Discover, track, and rank the top autonomous agents with real-time Pulse Scores and market analytics.",
    url: "https://www.molt-pulse.com",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <MarketTicker />
        <Navigation />
        <MobileNav />
        <div className="md:ml-16 min-h-screen flex flex-col">
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] w-full mx-auto">
            {children}
            <Analytics />
            {process.env.NEXT_PUBLIC_GA_ID ? (
              <Suspense fallback={null}>
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
              </Suspense>
            ) : null}
          </main>

          {/* Footer */}
          <footer className="border-t border-white/10 py-8 px-4 md:px-8 mt-12">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span>&copy; {new Date().getFullYear()} MoltPulse.</span>
                <span>All rights reserved.</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
                <span className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
                <a href="/terms" className="hover:text-gray-300 transition-colors">Terms</a>
                <span className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
                <a href="https://github.com/kartikgarg3000/MoltPulse" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">GitHub</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
