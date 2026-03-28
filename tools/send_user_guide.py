"""
send_user_guide.py — Send DPDPA User Guide to subscribers in batches of 300.

Reads from the subscriber Google Sheet, picks the next 300 rows where
sent_date is empty, sends each one the User Guide email via Resend,
then marks sent_date in the sheet.

Usage:
    python tools/send_user_guide.py              # sends next 300
    python tools/send_user_guide.py --batch 300  # explicit batch size
    python tools/send_user_guide.py --dry-run    # preview only, no emails sent

Progress is tracked in the sheet column E (sent_date).
Run daily (or as often as needed) until all rows are sent.
Total: ~10,353 emails → ~35 daily runs of 300.
"""

import argparse
import base64
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import resend
from google.oauth2.service_account import Credentials
import gspread

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tools.utils import get_env, load_env, setup_logger

logger = setup_logger("send_user_guide")

# ── Config ────────────────────────────────────────────────────────────────────
SUBSCRIBER_SHEET_ID = "1tsksAs0whu19Ik4J7g-w-dZZGvEBvYyNBj4hVL6G1Xc"
PDF_PATH            = Path(__file__).resolve().parent.parent / "WhitePapers" / "DPDP_Visual_Guide_v4 (3).pdf"
FROM_EMAIL          = "briefings@saralprivacy.com"
BATCH_SIZE          = 300
RATE_LIMIT_DELAY    = 0.1   # seconds between emails (10/sec = safe for Resend)


# ── Sheet helpers ──────────────────────────────────────────────────────────────

def get_sheet():
    creds = Credentials.from_service_account_file(
        str(Path(__file__).resolve().parent.parent / "credentials.json"),
        scopes=["https://www.googleapis.com/auth/spreadsheets"],
    )
    client = gspread.authorize(creds)
    return client.open_by_key(SUBSCRIBER_SHEET_ID).sheet1


def get_unsent_batch(sheet, batch_size: int) -> list[dict]:
    """Return up to batch_size rows where sent_date is empty."""
    all_rows = sheet.get_all_records()   # list of dicts using header row as keys
    unsent = [
        {"row_index": i + 2, **r}        # +2 = header row + 0-indexed
        for i, r in enumerate(all_rows)
        if not str(r.get("sent_date", "")).strip()
        and str(r.get("Email", "")).strip()
    ]
    logger.info(f"Total unsent: {len(unsent)} / {len(all_rows)}")
    return unsent[:batch_size]


def mark_sent(sheet, row_index: int, sent_date: str):
    """Write sent_date into column E for this row."""
    sheet.update_cell(row_index, 5, sent_date)


# ── Email builder ─────────────────────────────────────────────────────────────

def load_pdf_b64() -> str:
    if not PDF_PATH.exists():
        raise FileNotFoundError(f"PDF not found: {PDF_PATH}")
    raw = PDF_PATH.read_bytes()
    logger.info(f"PDF loaded: {len(raw):,} bytes")
    return base64.b64encode(raw).decode("utf-8")


def build_email_html(name: str) -> str:
    first_name = name.split()[0] if name else "there"
    return f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">SaralPrivacy</h1>
    <p style="color: #93c5fd; margin: 8px 0 0;">India's Privacy Law, One Day at a Time</p>
  </div>

  <p style="font-size: 16px;">Hi {first_name},</p>

  <p style="font-size: 15px; line-height: 1.6;">
    India's Digital Personal Data Protection Act (DPDPA) is now law — and it applies to
    <strong>every business</strong> that collects or uses people's digital data, regardless of size.
  </p>

  <p style="font-size: 15px; line-height: 1.6;">
    We've attached your free <strong>DPDPA Visual Guide</strong> — a plain-English walkthrough
    of what the law means, what your obligations are, and what happens if you ignore it.
    No legalese, just clear guidance for Indian business owners.
  </p>

  <!-- Guide highlight box -->
  <div style="background: #f0f7ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="color: #1e3a5f; margin: 0 0 12px;">📘 Your Visual Guide covers:</h3>
    <ul style="margin: 0; padding-left: 20px; line-height: 2; font-size: 14px;">
      <li>What counts as "personal data" under DPDPA</li>
      <li>Who is a Data Fiduciary — and if that means you</li>
      <li>Consent rules, notice requirements & user rights</li>
      <li>Penalties up to ₹250 crore under Section 33</li>
      <li>Practical compliance checklist for Indian SMEs</li>
    </ul>
  </div>

  <!-- Assessment CTA -->
  <div style="background: #fff7ed; border: 2px solid #f97316; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <h3 style="color: #c2410c; margin: 0 0 10px;">📊 Know Your Compliance Score — Free</h3>
    <p style="margin: 0 0 15px; font-size: 14px;">
      Take our 5-minute DPDPA readiness assessment and get a personalised score
      with specific gaps identified for your business.
    </p>
    <a href="https://saralprivacy.com/assessment"
       style="background: #f97316; color: white; padding: 12px 28px; border-radius: 6px;
              text-decoration: none; font-weight: bold; display: inline-block; font-size: 15px;">
      Take Free Assessment →
    </a>
  </div>

  <!-- Daily Briefings CTA -->
  <div style="background: #f0fdf4; border: 2px solid #16a34a; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <h3 style="color: #15803d; margin: 0 0 10px;">📰 Free Daily DPDPA Briefings</h3>
    <p style="margin: 0 0 15px; font-size: 14px;">
      Get one DPDPA compliance update every weekday — written for business owners,
      not lawyers. Free on SaralPrivacy.
    </p>
    <a href="https://saralprivacy.com/briefings"
       style="background: #16a34a; color: white; padding: 12px 28px; border-radius: 6px;
              text-decoration: none; font-weight: bold; display: inline-block; font-size: 15px;">
      Read Daily Briefings →
    </a>
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #374151;">
    If you have questions about DPDPA compliance for your specific business, reply to this
    email — we read every message.
  </p>

  <p style="font-size: 14px; color: #374151;">
    Warm regards,<br>
    <strong>Dilip Sahu</strong><br>
    Founder, SaralPrivacy.com
  </p>

  <!-- Footer -->
  <p style="font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
    You're receiving this because you expressed interest in DPDPA compliance.<br>
    <a href="https://saralprivacy.com" style="color: #2563eb;">saralprivacy.com</a>
  </p>

</div>
""".strip()


# ── Core send function ────────────────────────────────────────────────────────

def send_batch(batch: list[dict], pdf_b64: str, dry_run: bool = False) -> dict:
    """Send emails to a batch of recipients. Returns summary stats."""
    sent_ok    = []
    sent_fail  = []
    now_date   = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    for i, row in enumerate(batch, 1):
        email = str(row.get("Email", "")).strip()
        name  = str(row.get("Name",  "")).strip() or "there"

        if not email or "@" not in email:
            logger.warning(f"  [{i}/{len(batch)}] Skipping invalid email: {email!r}")
            sent_fail.append({"email": email, "error": "invalid"})
            continue

        if dry_run:
            logger.info(f"  [DRY RUN {i}/{len(batch)}] Would send to: {email}")
            sent_ok.append(email)
            continue

        try:
            resend.Emails.send({
                "from":    FROM_EMAIL,
                "to":      email,
                "subject": "Your Free DPDPA Visual Guide — India's Privacy Law, Explained Simply",
                "html":    build_email_html(name),
                "attachments": [{
                    "filename":    "DPDPA_Visual_Guide_SaralPrivacy.pdf",
                    "content":     pdf_b64,
                    "content_type": "application/pdf",
                }],
            })
            sent_ok.append(email)
            logger.info(f"  [{i}/{len(batch)}] ✅ Sent → {email}")
        except Exception as e:
            sent_fail.append({"email": email, "error": str(e)})
            logger.error(f"  [{i}/{len(batch)}] ❌ Failed → {email}: {e}")

        time.sleep(RATE_LIMIT_DELAY)

    return {"sent_ok": sent_ok, "sent_fail": sent_fail, "date": now_date}


# ── Main ───────────────────────────────────────────────────────────────────────

def main(batch_size: int = BATCH_SIZE, dry_run: bool = False) -> dict:
    load_env()
    resend.api_key = get_env("RESEND_API_KEY", "").strip().strip('"')
    if not resend.api_key:
        raise EnvironmentError("RESEND_API_KEY not set in .env")

    logger.info(f"{'[DRY RUN] ' if dry_run else ''}Starting user guide email blast — batch size: {batch_size}")

    # Load PDF
    pdf_b64 = load_pdf_b64()

    # Connect to sheet
    sheet = get_sheet()

    # Get next unsent batch
    batch = get_unsent_batch(sheet, batch_size)
    if not batch:
        logger.info("🎉 All emails have been sent — sheet is complete!")
        return {"status": "complete", "sent": 0}

    logger.info(f"Sending to {len(batch)} recipients (rows {batch[0]['row_index']}–{batch[-1]['row_index']})...")

    # Send emails
    result = send_batch(batch, pdf_b64, dry_run=dry_run)

    # Mark sent_date in sheet for successful sends
    if not dry_run:
        logger.info("Updating sent_date in sheet...")
        success_emails = set(result["sent_ok"])
        for row in batch:
            if row["Email"] in success_emails:
                try:
                    mark_sent(sheet, row["row_index"], result["date"])
                except Exception as e:
                    logger.error(f"Failed to mark row {row['row_index']}: {e}")
        logger.info(f"Sheet updated — {len(result['sent_ok'])} rows marked")

    # Summary
    total_remaining = len(get_unsent_batch(sheet, 99999))
    summary = {
        "status":           "done",
        "batch_sent":       len(result["sent_ok"]),
        "batch_failed":     len(result["sent_fail"]),
        "failures":         result["sent_fail"],
        "remaining":        total_remaining,
        "estimated_runs":   (total_remaining // batch_size) + (1 if total_remaining % batch_size else 0),
        "dry_run":          dry_run,
    }

    logger.info("─" * 50)
    logger.info(f"✅ Batch complete: {summary['batch_sent']} sent, {summary['batch_failed']} failed")
    logger.info(f"📊 Remaining: {summary['remaining']} emails (~{summary['estimated_runs']} more runs)")
    logger.info("─" * 50)

    print(json.dumps(summary, indent=2))
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send DPDPA User Guide to subscriber batches")
    parser.add_argument("--batch", type=int, default=BATCH_SIZE, help="Emails per run (default: 300)")
    parser.add_argument("--dry-run", action="store_true", help="Preview only — no emails sent")
    args = parser.parse_args()
    main(batch_size=args.batch, dry_run=args.dry_run)
