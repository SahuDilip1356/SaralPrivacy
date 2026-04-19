import { NextRequest, NextResponse } from "next/server";
import { databases, DB_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { generateToken } from "@/lib/tokens";
import * as XLSX from "xlsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const q = [Query.select(["email"]), Query.limit(100)];
    if (cursor) q.push(Query.cursorAfter(cursor));
    const res = await databases.listDocuments(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, q);
    res.documents.forEach((d) => set.add((d.email as string).toLowerCase()));
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
  }
  return set;
}

async function insertBatch(docs: Record<string, unknown>[]): Promise<number> {
  const results = await Promise.allSettled(
    docs.map((d) => databases.createDocument(DB_ID, COLLECTIONS.OUTREACH_CONTACTS, ID.unique(), d))
  );
  return results.filter((r) => r.status === "fulfilled").length;
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

    const buf  = await file.arrayBuffer();
    const wb   = XLSX.read(buf, { type: "array" });
    const ws   = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

    if (!rows.length) return NextResponse.json({ error: "Spreadsheet is empty." }, { status: 400 });

    const headers  = Object.keys(rows[0]);
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
