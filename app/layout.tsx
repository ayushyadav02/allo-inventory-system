import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventory Reservation System",
  description:
    "A concurrency-safe inventory reservation system built with Next.js, Prisma, and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-card-border bg-card-bg/80 backdrop-blur-sm sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-accent"
            >
              📦 InventoryRS
            </Link>
            <div className="flex gap-6 text-sm font-medium text-muted">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Products
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-card-border py-6 text-center text-sm text-muted">
          Built with Next.js + Prisma + Supabase
        </footer>
      </body>
    </html>
  );
}
