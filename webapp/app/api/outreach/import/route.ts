import { NextRequest, NextResponse } from "next/server";
import { insertDocument, listPage } from "@/lib/db";
import { generateToken } from "@/lib/tokens";
import { requireRole } from "@/lib/adminSession";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// CSV-only on purpose: this route parses an UPLOADED file, and the xlsx
// package it previously used has no-fix-available CVEs (prototype pollution,
// ReDoS) — exactly the wrong parser for untrusted input. CSV covers the real
// workflow (Excel exports CSV in one click) with a parser we fully control.
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_ROWS = 10_000;

/** Minimal RFC-4180 CSV parser: quoted fields, escaped quotes, CRLF/LF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
      if (rows.length > MAX_ROWS) break;
    } else field += c;
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

const EMAIL_ALIASES = ["email", "e-mail", "emailaddress", "email address", "mail", "emailid", "email id"];
const NAME_ALIASES  = ["name", "full name", "fullname", "contact name", "contactname", "person"];
const CO_ALIASES    = ["company", "organisation", "organization", "business", "firm", "company name"];
const IND_ALIASES   = ["industry", "sector", "vertical", "domain"];

function detect(headers: string[], aliases: string[]): string | null {
  for (const h of headers) {
    if (aliases.includes(h.toLowerCase().replace(/\s+/g, " ").trim())) return h;
  }
  return null;
}

function pickStr(row: Record<string, unknown>, col: string | null): string {
  if (!col) return "";
  return String(row[col] ?? "").trim();
}

async function fetchExistingEmails(): Promise<Set<string>> {
  const set = new Set<string>();
  let cursor: string | undefined;
  for (;;) {
    const docs = await listPage("outreach_contacts", { limit: 100, after: cursor });
    docs.forEach((d) => set.add((d.email as string).toLowerCase()));
    if (docs.length < 100) break;
    cursor = docs[docs.length - 1].id;
  }
  return set;
}

async function insertBatch(docs: Record<string, unknown>[]): Promise<number> {
  const results = await Promise.allSettled(
    docs.map((d) => insertDocument("outreach_contacts", d))
  );
  return results.filter((r) => r.status === "fulfilled").length;
}

export async function POST(request: NextRequest) {
  // This route feeds the outreach mailer — unauthenticated, it let anyone
  // load victim addresses into our sender. Admin session required.
  if (!(await requireRole(request, ["admin"]))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large (max 2 MB). Export as CSV." }, { status: 413 });
    }
    if (file.name && !/\.csv$/i.test(file.name)) {
      return NextResponse.json(
        { error: "Only CSV files are accepted. In Excel: File → Save As → CSV." },
        { status: 400 }
      );
    }

    const text = await file.text();
    const grid = parseCsv(text);
    if (grid.length < 2) {
      return NextResponse.json({ error: "Spreadsheet is empty." }, { status: 400 });
    }

    const headers = grid[0].map((h) => h.trim());
    const rows: Record<string, unknown>[] = grid.slice(1).map((cells) => {
      const rec: Record<string, unknown> = {};
      headers.forEach((h, i) => { rec[h] = cells[i] ?? ""; });
      return rec;
    });
    const emailCol = detect(headers, EMAIL_ALIASES);
    if (!emailCol) {
      return NextResponse.json(
        { error: `Cannot detect email column. Columns found: ${headers.join(", ")}. Rename your email column to "Email".` },
        { status: 400 }
      );
    }

    const nameCol = detect(headers, NAME_ALIASES);
    const coCol   = detect(headers, CO_ALIASES);
    const indCol  = detect(headers, IND_ALIASES);

    const existing = await fetchExistingEmails();
    const now = new Date().toISOString();

    const toInsert: Record<string, unknown>[] = [];
    let invalid = 0;
    let dupes   = 0;

    for (const row of rows) {
      const email = String(row[emailCol] ?? "").trim().toLowerCase();
      if (!EMAIL_RE.test(email)) { invalid++; continue; }
      if (existing.has(email))   { dupes++;   continue; }
      existing.add(email);

      const doc: Record<string, unknown> = {
        email,
        source:      "excel_import_v1",
        status:      "pending",
        magic_token: generateToken(),
        created_at:  now,
      };
      const name = pickStr(row, nameCol);
      const co   = pickStr(row, coCol);
      const ind  = pickStr(row, indCol);
      if (name) doc.name     = name;
      if (co)   doc.company  = co;
      if (ind)  doc.industry = ind;

      toInsert.push(doc);
    }

    let inserted = 0;
    const BATCH = 50;
    for (let i = 0; i < toInsert.length; i += BATCH) {
      inserted += await insertBatch(toInsert.slice(i, i + BATCH));
    }

    return NextResponse.json({ success: true, total: rows.length, inserted, duplicates: dupes, invalid });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[outreach/import]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
