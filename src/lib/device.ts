// Per-browser device identifier recorded on audit events (ADR 0003). Random, not a
// fingerprint; lets the product later detect one account used on many devices.
export const DEVICE_COOKIE = "sp_device";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isDeviceId(value: string | undefined | null): value is string {
  return typeof value === "string" && UUID.test(value);
}
