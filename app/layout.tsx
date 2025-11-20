import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import { RootProvider } from "./rootProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Performance optimization: Use Next.js font loader instead of @import
const inter = Inter({ subsets: ["latin"] });
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap" // Prevents invisible text flash
});

export const metadata: Metadata = {
  title: "DareUP - Dare to Meet",
  description: "Personality quiz and social matching on Farcaster - Dare to find your perfect match!",
  viewport: "width=device-width, initial-scale=1",
  other: {
    "color-scheme": "light dark",
    "supported-color-schemes": "light dark",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${pressStart2P.variable}`}>
      <body className={`${inter.className} h-full retro-crt`}>
        <RootProvider>
          {children}
        </RootProvider>

        {/* Global Privacy Notice */}
        <footer className="mt-auto pt-4 pb-safe border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <span>🔒 Blockchain wallet authentication only. No personal data collected.</span>
              <a
                href="/privacy"
                className="text-primary hover:text-primary/80 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-sm">
            <a
              href="https://warpcast.com/4kittt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-primary"
            >
              Farcaster
            </a>
            <a
              href="https://x.com/4kittt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-primary"
            >
              X
            </a>
          </div>
        </footer>
        <SpeedInsights />
      </body>
    </html>
  );
}
