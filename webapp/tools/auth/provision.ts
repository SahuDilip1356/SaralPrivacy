// provision.ts — create or repair an admin-surface account in Supabase Auth
// (Blueprint P3). Nobody types a password here: the person receives an
// emailed link to /admin/set-password and chooses their own.
//
//   new user     → auth user + role claim + INVITE link (emailed via Resend)
//   existing user→ role claim re-asserted + RECOVERY link (emailed via Resend)
//
// Run from webapp/ (needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// RESEND_API_KEY, NEXT_PUBLIC_SITE_URL in the environment):
//   set -a; . ./.env.local; set +a
//   node --import ./scripts/ts-resolve.mjs --experimental-strip-types \
//     tools/auth/provision.ts --email dilip.sahu@gmail.com --role admin --name "Dilip Sahu"
//
// Flags: --email <addr> (required) · --role admin|blogger (required)
//        --name "<display name>" · --no-email (print the link, don't send)
//
// The link printed to stdout IS a one-time credential — treat the terminal
// output accordingly.

import { createInvite, createRecovery, findAuthUserIdByEmail } from "../../lib/auth/adminAuth.ts";
import { sendBloggerInvite } from "../../lib/email.ts";

// .env.local values pulled from Vercel carry literal "\n" suffixes (standing law).
for (const k of Object.keys(process.env)) {
  const v = process.env[k];
  if (typeof v === "string" && v.includes("\\n")) process.env[k] = v.replace(/\\n/g, "").trim();
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

const email = (arg("email") || "").trim().toLowerCase();
const role = arg("role");
const name = (arg("name") || email.split("@")[0]).trim();
const sendEmail = !flag("no-email");

if (!email || (role !== "admin" && role !== "blogger")) {
  console.error("usage: provision.ts --email <addr> --role admin|blogger [--name \"…\"] [--no-email]");
  process.exit(2);
}

const existingId = await findAuthUserIdByEmail(email);
const kind: "invite" | "recovery" = existingId ? "recovery" : "invite";
const { userId, url } = existingId
  ? await createRecovery({ email, role, name })
  : await createInvite({ email, name, role });

console.log(`${kind === "invite" ? "created" : "found"} auth user ${userId} (${email}) role=${role}`);
console.log(`${kind} link: ${url}`);

if (sendEmail) {
  const result = await sendBloggerInvite({ email, name, inviteUrl: url, role, kind });
  console.log(result.success ? "email sent via Resend" : `email FAILED: ${result.error} — share the link manually`);
}
