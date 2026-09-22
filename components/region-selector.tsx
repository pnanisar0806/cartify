"use client";

import { REGION_LIST, isValidRegion, type RegionCode } from "@/lib/regions";

/**
 * Compact region selector for the header.
 *
 * Persists the choice in a cookie and reports it upward so the page can swap
 * stores in place. It deliberately does not reload: a reload would discard a
 * recipe the visitor had already typed.
 */
export function RegionSelector({
  currentRegion,
  onRegionChange,
}: {
  currentRegion: RegionCode;
  onRegionChange: (region: RegionCode) => void;
}) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRegion = e.target.value;
    if (!isValidRegion(newRegion)) return;

    // Remember the choice for a year so the middleware stops re-detecting.
    document.cookie = `cartify-region=${newRegion};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    onRegionChange(newRegion);
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
          {region.name}
        </option>
      ))}
    </select>
  );
}
