import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helix Customer Dashboard",
  description: "Customer analytics dashboard for Helix",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-100 font-sans text-slate-900">
        <header className="border-b border-slate-800 bg-slate-900">
          <div className="mx-auto flex w-full max-w-5xl items-baseline gap-3 px-6 py-4 sm:px-8">
            <span className="text-lg font-semibold tracking-tight text-white">
              Helix
            </span>
            <span className="text-sm text-slate-400">
              Customer Analytics
            </span>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
