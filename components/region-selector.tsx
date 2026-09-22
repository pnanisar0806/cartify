"use client";

import { REGION_LIST, type RegionCode } from "@/lib/regions";

/**
 * Compact region selector dropdown for the header.
 * Shows flag + region name, sets a cookie on change and reloads.
 */
export function RegionSelector({ currentRegion }: { currentRegion: RegionCode }) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRegion = e.target.value;
    // Set cookie (1 year expiry)
    document.cookie = `cartify-region=${newRegion};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    // Reload to re-render with new region's stores
    window.location.reload();
  }

  return (
    <select
      value={currentRegion}
      onChange={handleChange}
      aria-label="Select your region"
      className="rounded-lg border border-green-900/10 bg-white px-2.5 py-1.5 text-sm font-medium text-ink shadow-xs outline-none transition-all hover:border-green-900/20 focus:ring-2 focus:ring-primary/20"
    >
      {REGION_LIST.map((region) => (
        <option key={region.code} value={region.code}>
          {region.flag} {region.name}
        </option>
      ))}
    </select>
  );
}
