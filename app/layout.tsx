import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Neighbourly",
  description: "Rent driveways and tools from your neighbours, locally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-gray-900 bg-gray-50 overflow-x-hidden min-h-[100dvh] relative`}
      >
        <main className="h-[100dvh] pb-20 overflow-y-auto scrollbar-hide">
          {children}
        </main>
        <MobileBottomNav />
      </body>
    </html>
  );
}
