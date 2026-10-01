"use client";

import { useActionState } from "react";
import type { FormState } from "@/modules/identity/actions";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

/** A single-button form (remove, revoke, cancel) with confirmation and inline errors. */
export function ActionButtonForm({
  action,
  fields,
  label,
  pendingLabel,
  confirmText,
  variant = "danger",
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fields: Record<string, string>;
  label: string;
  pendingLabel: string;
  confirmText?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const [state, formAction] = useActionState(action, { status: "idle" } as FormState);
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmText && !window.confirm(confirmText)) event.preventDefault();
      }}
      className="flex flex-col items-start gap-1"
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton pendingLabel={pendingLabel} variant={variant}>
        {label}
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
