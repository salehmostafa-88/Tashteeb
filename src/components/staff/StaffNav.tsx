"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function StaffNav({ orgId, isOwner }: { orgId: string; isOwner: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const items = [
    { href: `/app/${orgId}/projects`, label: t("projects") },
    ...(isOwner
      ? [
          { href: `/app/${orgId}/members`, label: t("members") },
          { href: `/app/${orgId}/settings`, label: t("settings") },
        ]
      : []),
  ];
  return (
    <nav aria-label={t("label")}>
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-[var(--radius-input)] px-3 font-semibold whitespace-nowrap ${
                  active ? "bg-accent-soft text-primary" : "text-ink hover:bg-canvas"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
