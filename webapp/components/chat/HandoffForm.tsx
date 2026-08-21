"use client";
// Three-field consented capture, inline in the message rail (§6.3, §6.6).
//
// Inline rather than a modal on purpose: ChatPanel already owns a focus trap,
// and a dialog inside it would double-trap and strand keyboard users.
//
// Three fields is the whole design. Company and phone are not collected —
// this is a callback request, and every extra field is somewhere to abandon.
// The consent box ships unticked and there is no "by continuing you agree"
// anywhere in the flow.

import { useRef, useState } from "react";
import { SETU_ACTION, SETU_FOCUS, SETU_INK } from "@/lib/chat/theme";
import { t } from "@/lib/chat/strings";

export interface HandoffSubmitResult {
  ok: boolean;
}

export function HandoffForm({
  onSubmit,
  onFieldsChange,
}: {
  onSubmit: (contact: { name: string; email: string }) => Promise<HandoffSubmitResult>;
  /** Reports 0–3 filled fields so an abandon event can locate the drop-off. */
  onFieldsChange: (count: number) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const filled = (name.trim() ? 1 : 0) + (email.trim() ? 1 : 0) + (consent ? 1 : 0);
  const report = (n: number) => onFieldsChange(n);

  const ready = name.trim() !== "" && email.trim() !== "" && consent && !busy;

  const submit = async () => {
    if (!ready) return;
    setBusy(true);
    setError(null);
    const res = await onSubmit({ name: name.trim(), email: email.trim() });
    if (!res.ok) {
      setError(t("en", "handoffError"));
      setBusy(false);
    }
    // On success the parent swaps this component out for the confirmation,
    // so there is no success branch to handle here.
  };

  const field =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-[15px] text-[#121A2E] placeholder:text-slate-400 focus:outline-none focus:ring-2";

  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2">
        {/* Honeypot — visually hidden, never announced, only bots fill it. */}
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute h-0 w-0 overflow-hidden opacity-0"
        />

        <label className="text-[13px] font-semibold text-[#354F72]" htmlFor="setu-handoff-name">
          {t("en", "handoffName")}
        </label>
        <input
          id="setu-handoff-name"
          type="text"
          maxLength={100}
          value={name}
          disabled={busy}
          onChange={(e) => {
            setName(e.target.value);
            report(
              (e.target.value.trim() ? 1 : 0) + (email.trim() ? 1 : 0) + (consent ? 1 : 0)
            );
          }}
          className={field}
          style={{ ["--tw-ring-color" as string]: SETU_FOCUS }}
        />

        <label className="text-[13px] font-semibold text-[#354F72]" htmlFor="setu-handoff-email">
          {t("en", "handoffEmail")}
        </label>
        <input
          id="setu-handoff-email"
          type="email"
          inputMode="email"
          maxLength={200}
          value={email}
          disabled={busy}
          onChange={(e) => {
            setEmail(e.target.value);
            report((name.trim() ? 1 : 0) + (e.target.value.trim() ? 1 : 0) + (consent ? 1 : 0));
          }}
          className={field}
          style={{ ["--tw-ring-color" as string]: SETU_FOCUS }}
        />

        <label className="mt-1 flex cursor-pointer items-start gap-2 text-[13px] leading-snug text-[#354F72]">
          <input
            type="checkbox"
            checked={consent}
            disabled={busy}
            onChange={(e) => {
              setConsent(e.target.checked);
              report((name.trim() ? 1 : 0) + (email.trim() ? 1 : 0) + (e.target.checked ? 1 : 0));
            }}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 focus:outline-none focus:ring-2"
            style={{ accentColor: SETU_ACTION, ["--tw-ring-color" as string]: SETU_FOCUS }}
          />
          <span>{t("en", "handoffConsent")}</span>
        </label>

        {error && (
          <p role="alert" className="rounded bg-amber-50 p-2 text-[13px] text-amber-800">
            {error}{" "}
            <a href="/contact" className="font-semibold underline">
              Contact page
            </a>
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!ready}
          className="mt-1 w-full rounded-lg px-4 py-2.5 text-[15px] font-semibold transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40"
          style={{
            backgroundColor: SETU_ACTION,
            color: SETU_INK,
            ["--tw-ring-color" as string]: SETU_FOCUS,
          }}
        >
          {busy ? t("en", "handoffSending") : t("en", "handoffSubmit")}
        </button>
        <p className="text-[13px] text-slate-500">{filled}/3</p>
      </div>
    </div>
  );
}
