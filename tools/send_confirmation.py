"""
send_confirmation.py — Send double opt-in confirmation emails to subscribers.

Reads subscribers from Google Sheets (SUBSCRIBER_SHEET_ID).
Sends confirmation emails in daily batches (max 450/day for Gmail safety).
Updates subscriber status in the sheet.

Sheet column expectations (adjust COL_* constants below if different):
    email       — subscriber email address
    name        — subscriber name (optional, used in greeting)
    status      — current status: "pending" | "confirmed" | "unsubscribed"
    token       — unique confirmation token (written by this script)
    confirmed_at — timestamp when confirmed (written by this script)

Usage:
    # Send today's batch of confirmations (up to 450)
    python tools/send_confirmation.py

    # Send to a specific batch offset (for resuming)
    python tools/send_confirmation.py --offset 450 --batch-size 450

    # Dry run — show who would be emailed, don't send
    python tools/send_confirmation.py --dry-run

    # Mark a token as confirmed (called from your landing page / form handler)
    python tools/send_confirmation.py --confirm <token>

Confirmation link:
    Uses a Google Form URL (CONFIRM_FORM_URL in .env) with the token pre-filled.
    OR uses a plain mailto link if no form URL is configured.
"""

import argparse
import hashlib
import json
import secrets
import smtplib
import sys
import time
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.utils import (
    get_env,
    get_today_iso,
    load_env,
    setup_logger,
    tmp_path,
    write_json,
)

logger = setup_logger("send_confirmation")

# ── Sheet column names — adjust to match your actual sheet headers ─────────────
COL_EMAIL       = "email"
COL_NAME        = "name"
COL_STATUS      = "status"
COL_TOKEN       = "token"
COL_CONFIRMED   = "confirmed_at"
COL_SENT_AT     = "confirmation_sent_at"

# ── Gmail config ───────────────────────────────────────────────────────────────
SMTP_HOST   = "smtp.gmail.com"
SMTP_PORT   = 587
BATCH_SIZE  = 450   # safe daily Gmail limit (500 max, using 450 for safety)
BATCH_DELAY = 1     # seconds between sends


# ── Google Sheets helpers ──────────────────────────────────────────────────────

def get_sheet():
    """Return the gspread worksheet for the subscriber sheet."""
    import os
    import gspread
    from google.oauth2.service_account import Credentials

    creds_path = Path(os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json"))
    if not creds_path.exists():
        raise FileNotFoundError(
            f"credentials.json not found at {creds_path}. "
            "Download a Google service account key and place it in the project root."
        )
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds = Credentials.from_service_account_file(str(creds_path), scopes=scopes)
    client = gspread.authorize(creds)
    sheet_id = get_env("SUBSCRIBER_SHEET_ID")
    return client.open_by_key(sheet_id).sheet1


def get_pending_subscribers(sheet, offset: int = 0, limit: int = BATCH_SIZE) -> list:
    """
    Return subscribers with status != 'confirmed' and != 'unsubscribed'.
    Skips already-confirmed and those already sent a confirmation recently.
    """
    records = sheet.get_all_records()
    pending = []
    for i, row in enumerate(records):
        status = str(row.get(COL_STATUS, "pending")).lower().strip()
        if status in ("confirmed", "unsubscribed"):
            continue
        email = str(row.get(COL_EMAIL, "")).strip()
        if not email or "@" not in email:
            continue
        pending.append({"row_index": i + 2, "record": row})  # +2: 1-indexed + header

    logger.info(f"Found {len(pending)} pending subscribers (offset={offset})")
    return pending[offset: offset + limit]


def update_row(sheet, row_index: int, updates: dict):
    """Update specific columns in a sheet row."""
    headers = sheet.row_values(1)
    for col_name, value in updates.items():
        if col_name in headers:
            col_idx = headers.index(col_name) + 1
            sheet.update_cell(row_index, col_idx, value)
        else:
            logger.warning(f"Column '{col_name}' not found in sheet — skipping update")


def find_row_by_token(sheet, token: str):
    """Find the row index of a subscriber by their confirmation token."""
    try:
        cell = sheet.find(token)
        return cell.row
    except Exception:
        return None


# ── Token generation ───────────────────────────────────────────────────────────

def generate_token(email: str) -> str:
    """Generate a unique, URL-safe confirmation token for an email address."""
    salt = secrets.token_hex(8)
    raw = f"{email}:{salt}:{get_today_iso()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


# ── Email builder ──────────────────────────────────────────────────────────────

def build_confirmation_email(
    recipient_email: str,
    recipient_name: str,
    token: str,
    sender: str,
) -> MIMEMultipart:
    """Build the confirmation email HTML + plain text."""

    confirm_form_url = get_env("CONFIRM_FORM_URL", "")
    newsletter_name  = get_env("NEWSLETTER_NAME", "DPDPA Daily Brief")
    newsletter_tag   = get_env("NEWSLETTER_TAGLINE", "India's Privacy Law, One Day at a Time")
    admin_email      = get_env("ADMIN_EMAIL", sender)

    greeting = f"Hi {recipient_name}," if recipient_name else "Hello,"

    # Build confirm link
    if confirm_form_url:
        # Pre-fill Google Form with token and email
        confirm_link = (
            f"{confirm_form_url}"
            f"?entry.token={token}"
            f"&entry.email={recipient_email}"
        )
    else:
        # Fallback: mailto confirm link
        confirm_link = (
            f"mailto:{admin_email}"
            f"?subject=Confirm%20subscription%20{token}"
            f"&body=Please%20confirm%20my%20subscription.%20Token%3A%20{token}"
        )

    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F7F9FC;font-family:Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background-color:#F7F9FC;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
      style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;max-width:600px;">

      <!-- Header -->
      <tr>
        <td style="background-color:#1B3A5C;padding:28px 32px;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;
            letter-spacing:1px;color:#F4941B;">{newsletter_name}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#90AAC4;">{newsletter_tag}</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px 32px;">
          <p style="font-size:16px;color:#2D3748;line-height:1.6;margin:0 0 16px;">
            {greeting}
          </p>
          <p style="font-size:15px;color:#2D3748;line-height:1.7;margin:0 0 16px;">
            You're subscribed to receive the <strong>{newsletter_name}</strong> — a daily
            newsletter that breaks down India's Digital Personal Data Protection Act 2023
            in plain English, one topic at a time.
          </p>
          <p style="font-size:15px;color:#2D3748;line-height:1.7;margin:0 0 28px;">
            Please confirm your subscription so we can start sending you the newsletter.
            This takes one click.
          </p>

          <!-- CTA Button -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:#F4941B;border-radius:6px;text-align:center;">
                <a href="{confirm_link}"
                  style="display:inline-block;padding:14px 32px;font-size:15px;
                  font-weight:700;color:#FFFFFF;text-decoration:none;
                  letter-spacing:0.3px;">
                  Yes, confirm my subscription →
                </a>
              </td>
            </tr>
          </table>

          <p style="font-size:13px;color:#718096;margin:24px 0 0;line-height:1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="{confirm_link}" style="color:#1B3A5C;word-break:break-all;">
              {confirm_link}
            </a>
          </p>
        </td>
      </tr>

      <!-- What to expect -->
      <tr>
        <td style="background-color:#F7F9FC;padding:24px 32px;border-top:1px solid #E2E8F0;">
          <p style="font-size:12px;font-weight:700;text-transform:uppercase;
            letter-spacing:0.8px;color:#F4941B;margin:0 0 12px;">What to expect</p>
          <p style="font-size:13px;color:#4A5568;line-height:1.7;margin:0;">
            ✓ One email per weekday (Mon–Fri)<br>
            ✓ 90-day structured curriculum on DPDPA 2023<br>
            ✓ Practical guidance for Indian businesses<br>
            ✓ No spam, no promotional content — pure compliance education
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 32px;border-top:1px solid #E2E8F0;">
          <p style="font-size:11px;color:#A0AEC0;line-height:1.6;margin:0;">
            You're receiving this because your email was added to the {newsletter_name}
            subscriber list. If you did not sign up, simply ignore this email — you will
            not receive any further emails without confirmation.<br><br>
            This newsletter is for informational purposes only and does not constitute
            legal advice.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""

    plain = f"""{newsletter_name}
{'=' * 50}

{greeting}

You're subscribed to the {newsletter_name} — India's Privacy Law, One Day at a Time.

Please confirm your subscription by visiting:
{confirm_link}

What to expect:
- One email per weekday (Mon-Fri)
- 90-day DPDPA 2023 curriculum
- Practical guidance for Indian businesses

If you did not sign up, ignore this email. No further emails will be sent without confirmation.

This newsletter is for informational purposes only and does not constitute legal advice.
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Please confirm your {newsletter_name} subscription"
    msg["From"]    = f"{newsletter_name} <{sender}>"
    msg["To"]      = recipient_email
    msg["Reply-To"] = sender
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html,  "html",  "utf-8"))
    return msg


# ── Send batch ─────────────────────────────────────────────────────────────────

def send_confirmations(subscribers: list, sender: str, app_password: str, dry_run: bool = False) -> dict:
    """Send confirmation emails to a batch of subscribers."""
    sent, failed, skipped = [], [], []

    if dry_run:
        for sub in subscribers:
            email = sub["record"].get(COL_EMAIL, "")
            logger.info(f"[DRY RUN] Would send to: {email}")
            sent.append(email)
        return {"sent": sent, "failed": failed, "skipped": skipped}

    sheet = get_sheet()

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.login(sender, app_password)
        logger.info("Gmail SMTP connected")

        for i, sub in enumerate(subscribers, 1):
            record    = sub["record"]
            row_index = sub["row_index"]
            email     = str(record.get(COL_EMAIL, "")).strip()
            name      = str(record.get(COL_NAME, "")).strip()

            if not email or "@" not in email:
                skipped.append(email)
                continue

            try:
                token = generate_token(email)
                msg   = build_confirmation_email(email, name, token, sender)
                server.sendmail(sender, email, msg.as_string())

                # Update sheet: write token + sent timestamp
                update_row(sheet, row_index, {
                    COL_TOKEN:   token,
                    COL_SENT_AT: datetime.utcnow().isoformat(),
                    COL_STATUS:  "pending_confirmation",
                })

                sent.append(email)
                logger.info(f"  [{i}/{len(subscribers)}] Sent → {email}")
                time.sleep(BATCH_DELAY)

            except smtplib.SMTPException as e:
                logger.error(f"  SMTP error → {email}: {e}")
                failed.append({"email": email, "error": str(e)})
            except Exception as e:
                logger.error(f"  Error → {email}: {e}")
                failed.append({"email": email, "error": str(e)})

    return {"sent": sent, "failed": failed, "skipped": skipped}


# ── Confirm by token ───────────────────────────────────────────────────────────

def confirm_token(token: str):
    """Mark a subscriber as confirmed when they click the confirmation link."""
    sheet = get_sheet()
    row_index = find_row_by_token(sheet, token)
    if not row_index:
        logger.error(f"Token not found in sheet: {token}")
        return False

    update_row(sheet, row_index, {
        COL_STATUS:    "confirmed",
        COL_CONFIRMED: datetime.utcnow().isoformat(),
    })
    logger.info(f"Confirmed row {row_index} (token: {token})")
    return True


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    load_env()
    sender       = get_env("GMAIL_SENDER_ADDRESS")
    app_password = get_env("GMAIL_APP_PASSWORD")

    parser = argparse.ArgumentParser()
    parser.add_argument("--offset",     type=int, default=0,          help="Row offset to start from")
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE, help="Emails per run (default 450)")
    parser.add_argument("--dry-run",    action="store_true",           help="Preview only, do not send")
    parser.add_argument("--confirm",    type=str, default="",          help="Confirm a subscriber by token")
    args = parser.parse_args()

    # Handle --confirm mode
    if args.confirm:
        success = confirm_token(args.confirm)
        print(json.dumps({"confirmed": success, "token": args.confirm}))
        return

    if not sender or not app_password:
        raise EnvironmentError("GMAIL_SENDER_ADDRESS and GMAIL_APP_PASSWORD must be set in .env")

    # Fetch pending subscribers
    sheet = get_sheet()
    batch = get_pending_subscribers(sheet, offset=args.offset, limit=args.batch_size)

    if not batch:
        logger.info("No pending subscribers to contact.")
        print(json.dumps({"sent": 0, "message": "No pending subscribers"}))
        return

    logger.info(f"Sending confirmations to {len(batch)} subscribers (offset={args.offset})")

    result = send_confirmations(batch, sender, app_password, dry_run=args.dry_run)

    summary = {
        "date":          get_today_iso(),
        "offset":        args.offset,
        "batch_size":    args.batch_size,
        "attempted":     len(batch),
        "sent":          len(result["sent"]),
        "failed":        len(result["failed"]),
        "skipped":       len(result["skipped"]),
        "failed_detail": result["failed"],
        "dry_run":       args.dry_run,
    }

    date_str = get_today_iso()
    write_json(tmp_path(f"confirmation_result_{date_str}_offset{args.offset}.json"), summary)
    logger.info(f"Done: {summary['sent']} sent, {summary['failed']} failed, {summary['skipped']} skipped")
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
