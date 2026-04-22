import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CortexDecor } from "@/components/CortexDecor";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RedshellLogo } from "@/components/RedshellLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Firma y asistencia",
  description: "Registro de asistencia con firma",
};

const THEME_BOOT = `(function(){try{var s=localStorage.getItem('firma-theme');var dark=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="relative min-h-dvh font-sans text-slate-900 antialiased dark:text-slate-100">
        <Script id="theme-boot" strategy="beforeInteractive">
          {THEME_BOOT}
        </Script>
        <ThemeProvider>
          <CortexDecor />
          <div
            className="pointer-events-none fixed inset-0 -z-10 opacity-[0.18] mix-blend-soft-light dark:opacity-40"
            aria-hidden
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.04%22/%3E%3C/svg%3E')]" />
          </div>
          <div className="fixed right-4 top-4 z-[100] flex justify-end sm:right-6 sm:top-6">
            <ThemeToggle />
          </div>
          <RedshellLogo />
          <div className="relative z-[2] isolate text-slate-900 dark:text-slate-100">
            <SessionProvider>{children}</SessionProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
