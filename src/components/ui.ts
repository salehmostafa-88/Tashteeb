// Shared class names so every form control has the same size, focus ring and
// 44px minimum touch target.
export const ui = {
  card: "rounded-[var(--radius-card)] border border-line bg-surface",
  label: "text-sm font-semibold text-ink",
  help: "text-sm text-muted",
  input:
    "min-h-11 w-full rounded-[var(--radius-input)] border border-line bg-surface px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary aria-[invalid=true]:border-danger",
  buttonPrimary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-input)] bg-primary px-5 font-semibold text-white hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60",
  buttonSecondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-input)] border border-line bg-surface px-4 font-semibold text-ink hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60",
  buttonDanger:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-input)] border border-danger/40 bg-surface px-4 font-semibold text-danger hover:bg-[#fdeef0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:opacity-60",
  link: "font-semibold text-primary underline-offset-4 hover:underline",
} as const;
