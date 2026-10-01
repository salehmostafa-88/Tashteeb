// Content Security Policy with a per-request nonce (Next.js CSP guide). Scripts must
// carry the nonce; inline style attributes are allowed because components set
// runtime widths and the tenant accent colour.
export function buildCsp(nonce: string, options: { dev: boolean; supabaseUrl?: string }): string {
  const connect = ["'self'"];
  if (options.supabaseUrl) connect.push(options.supabaseUrl);
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${options.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src ${connect.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
