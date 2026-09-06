// provision.ts — create or repair an admin-surface account in Supabase Auth
// (Blueprint P3). Nobody types a password here: the person receives an
// emailed link to /admin/set-password and chooses their own.
//
//   new user     → auth user + role claim + INVITE link (emailed via Resend)
//   existing user→ role claim re-asserted + RECOVERY link (emailed via Resend)
//
// Run from webapp/ (needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// RESEND_API_KEY, NEXT_PUBLIC_SITE_URL in the environment — point
// NEXT_PUBLIC_SITE_URL at the PREVIEW alias while testing a branch):
//   set -a; . ./.env.local; set +a
//   node --import ./scripts/ts-resolve.mjs --experimental-strip-types \
//     tools/auth/provision.ts --email dilip.sahu@gmail.com --role admin --name "Dilip Sahu"
//
// Flags: --email <addr> (required) · --role admin|blogger (required)
//        --name "<display name>" · --no-email (don't send) · --print-link
//        (echo the one-time link to stdout — it IS a credential)
//
// Imports stay alias-free ("@/…") on purpose: this runs under node's
// strip-types loader, not Next's bundler.

import { Resend } from "resend";
import { createInvite, createRecovery, findAuthUserIdByEmail } from "../../lib/auth/adminAuth.ts";
import { bloggerInviteTemplate } from "../../lib/email-templates.ts";

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
const printLink = flag("print-link");

if (!email || (role !== "admin" && role !== "blogger")) {
  console.error('usage: provision.ts --email <addr> --role admin|blogger [--name "…"] [--no-email] [--print-link]');
  process.exit(2);
}

const existingId = await findAuthUserIdByEmail(email);
const kind: "invite" | "recovery" = existingId ? "recovery" : "invite";
const { userId, url } = existingId
  ? await createRecovery({ email, role, name })
  : await createInvite({ email, name, role });

console.log(`${kind === "invite" ? "created" : "found"} auth user ${userId} (${email}) role=${role}`);
if (printLink || !sendEmail) console.log(`${kind} link: ${url}`);

if (sendEmail) {
  const from = (process.env.RESEND_FROM_NOREPLY || "noreply@saralprivacy.com").trim();
  const { subject, html } = bloggerInviteTemplate({ email, name, inviteUrl: url, role, kind });
  const { error } = await new Resend((process.env.RESEND_API_KEY || "").trim()).emails.send({
    from, to: email, subject, html,
  });
  console.log(error ? `email FAILED: ${error.message} — re-run with --print-link and share manually` : `${kind} email sent to ${email} via Resend`);
}
