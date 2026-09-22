"use client";

import { useEffect, useRef } from "react";

type AdSlot = "sidebar" | "banner-top" | "banner-bottom";

/**
 * Reusable Google AdSense ad unit.
 * Renders nothing when the publisher ID env var is not configured.
 * Replace the data-ad-slot values with real slot IDs from your AdSense dashboard.
 */
export function AdUnit({ slot }: { slot: AdSlot }) {
  const pushed = useRef(false);
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  useEffect(() => {
    if (!pubId || pushed.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet — safe to ignore
    }
  }, [pubId]);

  if (!pubId) return null;

  const isSidebar = slot === "sidebar";

  return (
    <div className={`ad-container ${isSidebar ? "ad-sidebar" : ""}`}>
      <ins
        className="adsbygoogle"
        style={
          isSidebar
            ? { display: "block", width: 160, height: 600 }
            : { display: "block", width: "100%", height: 90 }
        }
        data-ad-client={pubId}
        data-ad-slot="YOUR_AD_SLOT_ID" /* Replace with your AdSense slot ID */
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
