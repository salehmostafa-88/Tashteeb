import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { publicEnv } from "@/lib/env";

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <span className="text-lg font-bold text-ink">{publicEnv.NEXT_PUBLIC_PRODUCT_NAME}</span>
        <LocaleSwitcher />
      </header>
      <main id="content" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
        <section className="flex flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {children}
        </section>
      </main>
    </div>
  );
}
