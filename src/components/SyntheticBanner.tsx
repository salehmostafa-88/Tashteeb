import { getTranslations } from "next-intl/server";

export async function SyntheticBanner() {
  const t = await getTranslations("common");
  return (
    <p
      role="note"
      data-testid="synthetic-banner"
      className="border-b border-line bg-[#fff7e6] px-4 py-2 text-center text-sm text-warning"
    >
      {t("syntheticBanner")}
    </p>
  );
}
