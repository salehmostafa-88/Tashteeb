"use client";

import { useFormStatus } from "react-dom";
import { ui } from "../ui";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const style = variant === "primary" ? ui.buttonPrimary : variant === "danger" ? ui.buttonDanger : ui.buttonSecondary;
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={`${style} ${className}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
