import type { Metadata } from "next";
import { Inter, Rajdhani, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const rajdhani = Rajdhani({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-display" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "WoW Guild Sync",
  description: "Real-time World of Warcraft guild member synchronization",
};

// Inline script to prevent flash of wrong theme - only uses static string, no user input
const themeScript = `(function(){var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme:dark)").matches;if(d)document.documentElement.classList.add("dark")})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} ${rajdhani.variable} ${jetbrainsMono.variable} min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased`}>
        <Providers>
          {children}
          <Toaster theme="system" />
        </Providers>
      </body>
    </html>
  );
}
