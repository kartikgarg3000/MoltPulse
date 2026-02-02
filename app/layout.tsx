
import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoltPulse | Real-time AI Agent Map",
  description: "The real-time map of AI agents.",
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
        <Navigation />
        <main className="md:ml-64 p-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
