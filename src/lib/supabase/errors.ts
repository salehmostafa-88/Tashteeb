// Maps database command errors to stable codes the UI translates. Raw database
// messages, SQL and hints are never shown to users.

export const COMMAND_ERROR_CODES = [
  "NOT_AUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "CONFLICT",
  "VERSION_CONFLICT",
  "LAST_OWNER",
  "INVITATION_INVALID",
  "INVITATION_EXPIRED",
  "INVITATION_EMAIL_MISMATCH",
  "ALREADY_MEMBER",
  "UNKNOWN",
] as const;

export type CommandErrorCode = (typeof COMMAND_ERROR_CODES)[number];

export class CommandError extends Error {
  constructor(
    readonly code: CommandErrorCode,
    readonly field?: string,
  ) {
    super(field ? `${code}:${field}` : code);
    this.name = "CommandError";
  }
}

const KNOWN = new Set<string>(COMMAND_ERROR_CODES);

export function toCommandError(error: { message?: string; code?: string } | null | undefined): CommandError {
  const message = error?.message ?? "";
  const [head, field] = message.split(":", 2);
  if (head && KNOWN.has(head)) return new CommandError(head as CommandErrorCode, field || undefined);
  if (error?.code === "23514" || error?.code === "22023" || error?.code === "22P02") {
    return new CommandError("VALIDATION_ERROR");
  }
  if (error?.code === "23505") return new CommandError("CONFLICT");
  if (error?.code === "42501") return new CommandError("FORBIDDEN");
  return new CommandError("UNKNOWN");
}
