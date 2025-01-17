"use client";

import { Geist } from "next/font/google";
import "./globals.css";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import { Toaster } from 'sonner';
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";
import { TREASURY_CONTRACT_ADDRESS } from "./constants/constants";

const geist = Geist({
  subsets: ["latin"],
});

const treasuryConfig = {
  treasury: TREASURY_CONTRACT_ADDRESS,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} bg-gray-900 text-white antialiased`}>
        <AbstraxionProvider config={treasuryConfig}>
          {children}
          <Toaster theme="dark" />
        </AbstraxionProvider>
      </body>
    </html>
  );
}
