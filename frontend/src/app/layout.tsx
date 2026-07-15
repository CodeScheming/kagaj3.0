import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import SolanaProvider from "@/components/SolanaProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kagaj Ko Katha — A Home for Nepali Literature",
  description: "Read and publish poems, stories, essays, and articles. A platform built for Nepali writers, with blockchain-verified proof of authorship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SolanaProvider>
          <AuthProvider>
            <Navbar />
            <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
              {children}
            </main>
          </AuthProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
