import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Cartify | From recipe to groceries", description: "Turn recipe ingredients into shopping links for Swiggy Instamart and Blinkit." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
