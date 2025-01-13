import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import { AuthProvider } from './lib/auth/AuthContext';
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'TrustPool - A Social Savings Club with Privacy',
    template: '%s | TrustPool'
  },
  description: 'A decentralized social savings club with built-in privacy features for secure group savings.',
  keywords: ['savings', 'group savings', 'privacy', 'blockchain', 'decentralized finance'],
  authors: [{ name: 'TrustPool Team' }],
  openGraph: {
    title: 'TrustPool - A Social Savings Club with Privacy',
    description: 'A decentralized social savings club with built-in privacy features for secure group savings.',
    url: 'https://trustpool.app',
    siteName: 'TrustPool',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TrustPool'
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrustPool - A Social Savings Club with Privacy',
    description: 'A decentralized social savings club with built-in privacy features for secure group savings.',
    images: ['/twitter-image.png'],
  },
};

const treasuryConfig = {
  treasury: "YOUR_TREASURY_CONTRACT_ADDRESS_HERE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AbstraxionProvider config={treasuryConfig}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AbstraxionProvider>
      </body>
    </html>
  );
}
