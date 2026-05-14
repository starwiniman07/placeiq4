import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PlaceIQ | AI Placement Preparation Ecosystem",
  description: "The ultimate 11-phase AI platform for placement success.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-white min-h-screen flex`}>
        <Providers>
          {/* Main App Layout */}
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
