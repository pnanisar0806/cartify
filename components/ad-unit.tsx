"use client";

import { useEffect, useRef } from "react";

type AdSlot = "sidebar" | "banner-top" | "banner-bottom";

/**
 * Reusable Google AdSense ad unit.
 *
 * Renders nothing unless BOTH your publisher ID and the slot ID for this
 * position are configured, so an unconfigured deployment shows no empty boxes.
 *
 * Create each ad unit in the AdSense dashboard under Ads > By ad unit, then put
 * its numeric slot ID in the matching environment variable:
 *
 *   NEXT_PUBLIC_ADSENSE_PUB_ID            ca-pub-XXXXXXXXXXXXXXXX
 *   NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR      the vertical unit beside the results
 *   NEXT_PUBLIC_ADSENSE_SLOT_BANNER_TOP   the banner above the form
 *   NEXT_PUBLIC_ADSENSE_SLOT_BANNER_BOTTOM the banner below the results
 *
 * Each variable must be read literally, because Next.js inlines NEXT_PUBLIC_*
 * values at build time by static analysis. Change one and redeploy for it to
 * take effect.
 */
function slotId(slot: AdSlot): string | undefined {
  switch (slot) {
    case "sidebar":
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;
    case "banner-top":
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER_TOP;
    case "banner-bottom":
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER_BOTTOM;
    default:
      return undefined;
  }
}

export function AdUnit({ slot }: { slot: AdSlot }) {
  const pushed = useRef(false);
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID?.trim();
  const adSlot = slotId(slot)?.trim();
  const configured = Boolean(pubId && adSlot);

  useEffect(() => {
    if (!configured || pushed.current) return;
    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense script has not loaded yet — safe to ignore.
    }
  }, [configured]);

  if (!configured) return null;

  const isSidebar = slot === "sidebar";

  return (
    // The wrapper reserves the ad's height so the page does not shift when the
    // unit fills, which would otherwise hurt Cumulative Layout Shift.
    <div
      className={`ad-container ${isSidebar ? "ad-sidebar" : ""}`}
      style={isSidebar ? { minHeight: 600, width: 160 } : { minHeight: 90, width: "100%" }}
    >
      <ins
        className="adsbygoogle"
        style={
          isSidebar
            ? { display: "block", width: 160, height: 600 }
            : { display: "block", width: "100%", height: 90 }
        }
        data-ad-client={pubId}
        data-ad-slot={adSlot}
        data-ad-format={isSidebar ? "vertical" : "horizontal"}
        data-full-width-responsive={isSidebar ? "false" : "true"}
      />
    </div>
  );
}
