/**
 * resendClient.ts — the one lazily-constructed Resend client.
 *
 * resend >= 6.18 throws from its constructor when RESEND_API_KEY is absent, so
 * a module-scope `new Resend(...)` crashes `next build` while it collects route
 * metadata (no .env.local in CI/worktree builds). Same failure mode, and same
 * remedy, as the Appwrite proxy in lib/appwrite.ts: defer construction to the
 * first property access so call sites like `resend.emails.send(...)` are
 * unchanged but nothing is instantiated at import time.
 *
 * It is also the single client: lib/email.ts and the three routes that send
 * directly (templates/download, cron/briefing-send, cron/outreach-send) all
 * import this, so key handling lives in one place instead of four.
 */

import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const inst = getResend() as unknown as Record<string | symbol, unknown>;
    const value = inst[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(inst)
      : value;
  },
});
