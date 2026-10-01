import { resolveAccent } from "@/lib/brand/contrast";

/** Tenant brand mark. Without an uploaded logo, a clean monogram is shown, never a broken image. */
export function OrganizationBrand({ name, accent }: { name: string; accent: string | null }) {
  const { accent: safeAccent } = resolveAccent(accent);
  const initial = Array.from(name.trim())[0] ?? "?";
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-[10px] text-lg font-bold text-white"
        style={{ backgroundColor: safeAccent }}
      >
        {initial}
      </span>
      <span className="truncate text-base font-semibold text-ink">{name}</span>
    </div>
  );
}
