// Writes .env.local from the running local Supabase stack (`supabase start`).
// Local development only: these are the CLI's well-known local keys, never production.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const out = execFileSync("pnpm", ["exec", "supabase", "status", "-o", "env"], { encoding: "utf8" });
const env = Object.fromEntries(
  out
    .split("\n")
    .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
if (!env.API_URL || !env.PUBLISHABLE_KEY) {
  console.error("Local Supabase is not running. Start it with `pnpm db:start`.");
  process.exit(1);
}
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
writeFileSync(
  ".env.local",
  [
    `NEXT_PUBLIC_APP_URL=${appUrl}`,
    `NEXT_PUBLIC_SUPABASE_URL=${env.API_URL}`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${env.PUBLISHABLE_KEY}`,
    "",
  ].join("\n"),
);
console.log(`Wrote .env.local for ${env.API_URL} (app ${appUrl}).`);
