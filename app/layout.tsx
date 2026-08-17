import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Underline Employee Store", description: "Private merchandise portal for Underline employees" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
