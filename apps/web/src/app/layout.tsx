import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrimeStock | Inventory workspace",
  description: "Manage stock, sales, purchasing and branches from one workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
