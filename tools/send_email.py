"""
send_email.py — Send the newsletter via Gmail SMTP.

Sends 400–450 emails per day (Gmail-safe limit).
Tracks a rolling offset across all subscribers so every subscriber
receives every edition — just spread across multiple days.

Offset tracking file: .tmp/send_offset.json
  {
    "offset": 450,          ← next batch starts here
    "total": 10000,         ← total active subscribers
    "last_run": "2026-03-16"
  }

When offset reaches the end of the list it wraps back to 0 (next cycle).

Usage:
    python tools/send_email.py \
        --html .tmp/email_2026-03-14.html \
        --content .tmp/content_2026-03-14.json

    # Override recipients (e.g. test send)
    python tools/send_email.py \
        --html .tmp/email_2026-03-14.html \
        --content .tmp/content_2026-03-14.json \
        --recipients "user1@example.com,user2@example.com"

Output:
    Prints JSON delivery summary to stdout
    Writes .tmp/send_result_{date}.json
"""

import argparse
import json
import smtplib
import sys
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.utils import (
    get_env,
    get_today_iso,
    load_env,
    read_json,
    setup_logger,
    tmp_path,
    write_json,
)

logger = setup_logger("send_email")

SMTP_HOST       = "smtp.gmail.com"
SMTP_PORT       = 587
DAILY_LIMIT     = 450   # max emails per day (Gmail safe zone: 400–450)
SEND_DELAY      = 0.12  # ~8 emails/second — well within Gmail's ~14/s limit
OFFSET_FILE     = "send_offset.json"


# ── Offset tracking ────────────────────────────────────────────────────────────

def load_offset() -> dict:
    """Load the rolling send offset from .tmp/send_offset.json."""
    path = tmp_path(OFFSET_FILE)
    if path.exists():
        try:
            return read_json(path)
        except Exception:
            pass
    return {"offset": 0, "total": 0, "last_run": ""}


def save_offset(offset: int, total: int) -> None:
    """Persist the updated offset."""
    write_json(tmp_path(OFFSET_FILE), {
        "offset":   offset,
        "total":    total,
        "last_run": get_today_iso(),
    })


# ── Subscriber fetching ────────────────────────────────────────────────────────

def get_subscribers_from_sheets(sheet_id: str) -> list:
    """Fetch active subscribers from Google Sheet."""
    try:
        import os
        import gspread
        from google.oauth2.service_account import Credentials

        creds_path = Path(os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json"))
        if not creds_path.exists():
            logger.warning("credentials.json not found — cannot fetch subscribers from Sheets")
            return []

        scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
        creds  = Credentials.from_service_account_file(str(creds_path), scopes=scopes)
        client = gspread.authorize(creds)
        sheet  = client.open_by_key(sheet_id).sheet1
        records = sheet.get_all_records()

        active = [
            r for r in records
            if str(r.get("status", "active")).lower() in ("active", "confirmed")
        ]
        logger.info(f"Fetched {len(active)} active/confirmed subscribers from Google Sheets")
        return active

    except Exception as e:
        logger.error(f"Failed to fetch subscribers from Sheets: {e}")
        return []


# ── Plain text fallback ────────────────────────────────────────────────────────

def generate_plain_text(content: dict) -> str:
    """Generate a plain-text version of the newsletter for accessibility."""
    lines = [
        f"DPDPA DAILY BRIEF — Day {content.get('day_number', '?')}",
        "=" * 50,
        "",
        content.get("topic", ""),
        content.get("concept", ""),
        "",
        "--- OVERVIEW ---",
        content.get("overview", {}).get("body", ""),
        "",
        "--- KEY POINTS ---",
    ]
    for point in content.get("key_points", {}).get("points", []):
        lines.append(f"• {point}")
    lines += [
        "",
        "--- WHAT THIS MEANS ---",
        content.get("what_this_means", {}).get("body", ""),
        "",
        "--- ACTION ITEMS ---",
    ]
    for item in content.get("action_items", {}).get("items", []):
        lines.append(
            f"[{item.get('priority', '').upper()}] "
            f"{item.get('action', '')} — {item.get('owner', '')}"
        )
    lines += [
        "",
        "---",
        f"\"{content.get('save_worthy_takeaway', '')}\"",
        "",
        "This newsletter is for informational purposes only and does not constitute legal advice.",
    ]
    return "\n".join(lines)


# ── MIME message builder ───────────────────────────────────────────────────────

def build_message(
    subject: str,
    html_body: str,
    plain_body: str,
    sender: str,
    recipient: str,
) -> MIMEMultipart:
    """Build a MIME email message for a single recipient."""
    msg = MIMEMultipart("alternative")
    msg["Subject"]  = subject
    msg["From"]     = f"DPDPA Daily Brief <{sender}>"
    msg["To"]       = recipient
    msg["Reply-To"] = sender
    msg.attach(MIMEText(plain_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body,  "html",  "utf-8"))
    return msg


# ── Gmail SMTP sender ──────────────────────────────────────────────────────────

def send_to_recipients(
    recipients: list,
    subject: str,
    html_body: str,
    plain_body: str,
    sender: str,
    app_password: str,
) -> dict:
    """Send newsletter to a list of recipients via Gmail SMTP."""
    sent   = []
    failed = []

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.login(sender, app_password)
        logger.info("Gmail SMTP connected")

        for i, recipient in enumerate(recipients, 1):
            try:
                msg = build_message(subject, html_body, plain_body, sender, recipient)
                server.sendmail(sender, recipient, msg.as_string())
                sent.append(recipient)
                logger.info(f"  [{i}/{len(recipients)}] Sent → {recipient}")
                time.sleep(SEND_DELAY)

            except smtplib.SMTPException as e:
                logger.error(f"  Failed → {recipient}: {e}")
                failed.append({"email": recipient, "error": str(e)})

    return {"sent": sent, "failed": failed}


# ── Main ───────────────────────────────────────────────────────────────────────

def main(html_path: str, content: dict, recipients_override=None) -> dict:
    load_env()
    sender              = get_env("GMAIL_SENDER_ADDRESS")
    app_password        = get_env("GMAIL_APP_PASSWORD")
    subscriber_sheet_id = get_env("SUBSCRIBER_SHEET_ID")
    date_str            = content.get("date", get_today_iso())

    if not sender or not app_password:
        raise EnvironmentError("GMAIL_SENDER_ADDRESS and GMAIL_APP_PASSWORD must be set in .env")

    # Load HTML
    html_path = Path(html_path)
    if not html_path.exists():
        raise FileNotFoundError(f"Email HTML not found: {html_path}")
    html_body = html_path.read_text(encoding="utf-8")

    # Determine recipients
    if recipients_override:
        # Direct override — send as-is, no offset tracking
        recipients = recipients_override
        offset_info = None
    elif subscriber_sheet_id:
        all_subscribers = get_subscribers_from_sheets(subscriber_sheet_id)
        all_emails      = [s["email"] for s in all_subscribers if s.get("email")]
        total           = len(all_emails)

        if total == 0:
            raise ValueError("Subscriber list is empty — aborting send")

        # Load rolling offset
        state  = load_offset()
        offset = state.get("offset", 0)

        # Wrap around if we've reached the end of the list
        if offset >= total:
            logger.info(f"Offset {offset} >= total {total} — wrapping back to 0")
            offset = 0

        # Slice today's batch (400–450)
        batch      = all_emails[offset: offset + DAILY_LIMIT]
        next_offset = offset + len(batch)

        logger.info(
            f"Subscriber batch: {offset + 1}–{next_offset} of {total} "
            f"({len(batch)} emails today)"
        )

        recipients  = batch
        offset_info = {"offset": offset, "next_offset": next_offset, "total": total}
    else:
        raise ValueError("No recipients provided. Pass --recipients or set SUBSCRIBER_SHEET_ID")

    if not recipients:
        raise ValueError("Recipient list is empty — aborting send")

    subject    = content.get("subject_line", f"DPDPA Daily Brief — Day {content.get('day_number', '?')}")
    plain_body = generate_plain_text(content)

    logger.info(f"Sending Day {content.get('day_number')} to {len(recipients)} recipients: '{subject}'")

    result = send_to_recipients(recipients, subject, html_body, plain_body, sender, app_password)

    # Persist updated offset (only when using subscriber sheet, not override)
    if offset_info and result["sent"]:
        save_offset(offset_info["next_offset"], offset_info["total"])
        logger.info(f"Offset saved: next run starts at {offset_info['next_offset']}")

    summary = {
        "date":                 date_str,
        "day_number":           content.get("day_number", 1),
        "subject_line":         subject,
        "recipients_attempted": len(recipients),
        "sent_count":           len(result["sent"]),
        "failed_count":         len(result["failed"]),
        "failed_details":       result["failed"],
        "sender":               sender,
        "status":               "success" if not result["failed"] else "partial",
        "offset_start":         offset_info["offset"]      if offset_info else None,
        "offset_end":           offset_info["next_offset"] if offset_info else None,
        "total_subscribers":    offset_info["total"]       if offset_info else None,
    }

    write_json(tmp_path(f"send_result_{date_str}.json"), summary)
    logger.info(f"Send complete: {summary['sent_count']} sent, {summary['failed_count']} failed")
    print(json.dumps(summary))
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--html",       required=True, help="Path to rendered HTML email file")
    parser.add_argument("--content",    required=True, help="Path to content JSON file")
    parser.add_argument("--recipients", default="",    help="Comma-separated emails (overrides Sheets + offset)")
    args = parser.parse_args()

    content_data    = read_json(args.content)
    recipients_list = [r.strip() for r in args.recipients.split(",") if r.strip()] or None

    main(args.html, content_data, recipients_list)
