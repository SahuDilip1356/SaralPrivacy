// registry.ts — Consent Registry summary. Records are append-only, so a
// person's state for a purpose is its latest record, not a count of rows:
// pair = (lower-cased email, consent_type); latest by timestamp decides.
// Run tests: node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/consent/registry.test.ts

export interface ConsentRecordLike {
  email?: string | null;
  consent_type?: string | null;
  consent_value?: unknown;
  withdrawn_at?: unknown;
  timestamp?: string | null;
}

export interface ConsentSummary {
  active: number;
  withdrawn: number;
  totalRecords: number;
  byType: { type: string; pairs: number; active: number }[];
}

function isWithdrawn(r: ConsentRecordLike): boolean {
  return r.consent_value === false || Boolean(r.withdrawn_at);
}

function isActive(r: ConsentRecordLike): boolean {
  return Boolean(r.consent_value) && !r.withdrawn_at;
}

export function summariseConsent(records: ConsentRecordLike[], types: string[]): ConsentSummary {
  const latest = new Map<string, ConsentRecordLike>();
  for (const r of records) {
    const key = `${(r.email ?? "").trim().toLowerCase()}\u0000${r.consent_type ?? ""}`;
    const prev = latest.get(key);
    const ts = r.timestamp ?? "";
    const prevTs = prev?.timestamp ?? "";
    // ISO strings compare lexically. On an exact tie the withdrawal wins —
    // never report consent as active when a same-instant withdrawal exists.
    if (!prev || ts > prevTs || (ts === prevTs && isWithdrawn(r))) latest.set(key, r);
  }

  let active = 0;
  let withdrawn = 0;
  const perType = new Map(types.map((t) => [t, { type: t, pairs: 0, active: 0 }]));
  for (const r of latest.values()) {
    const on = isActive(r);
    if (on) active++;
    else if (isWithdrawn(r)) withdrawn++;
    const bucket = perType.get(r.consent_type ?? "");
    if (bucket) {
      bucket.pairs++;
      if (on) bucket.active++;
    }
  }

  return { active, withdrawn, totalRecords: records.length, byType: [...perType.values()] };
}
