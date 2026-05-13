import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InventoryRS — Premium Stock Management",
  description: "Enterprise-grade inventory reservation system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent/30 font-sans">
        <Toaster position="top-right" richColors theme="light" />
        <header className="border-b border-card-border bg-card-bg/80 backdrop-blur-md sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              InventoryRS
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
