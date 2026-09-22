import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const title = "Cartify | From recipe to groceries";
const description =
  "Paste a recipe or a recipe link and get one-click grocery searches at the stores you shop, across India, the US and the UK.";

/**
 * Set NEXT_PUBLIC_SITE_URL to your own domain so shared links carry a correct
 * canonical URL and preview card. Without it, links posted to social platforms
 * and chat apps render bare.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Cartify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const adsensePubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        {adsensePubId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePubId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
