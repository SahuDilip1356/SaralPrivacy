"""
log_entry.py — Log the newsletter run to Notion and Google Sheets.

Usage:
    python tools/log_entry.py \
        --send-result .tmp/send_result_2026-03-14.json \
        --content .tmp/content_2026-03-14.json

Output:
    - Creates a Notion page in the runs database
    - Marks the roadmap Google Sheet row as "sent"
    - Writes .tmp/log_{date}.json
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.utils import (
    get_env,
    load_env,
    read_json,
    setup_logger,
    tmp_path,
    write_json,
)

logger = setup_logger("log_entry")


# ── Notion logging ─────────────────────────────────────────────────────────────

def log_to_notion(summary: dict) -> bool:
    """Create a page in the Notion runs database."""
    try:
        from notion_client import Client
    except ImportError:
        logger.warning("notion-client not installed — skipping Notion logging")
        return False

    notion_key = get_env("NOTION_API_KEY")
    db_id = get_env("NOTION_RUNS_DATABASE_ID")

    if not notion_key or not db_id:
        logger.warning("NOTION_API_KEY or NOTION_RUNS_DATABASE_ID not set — skipping Notion")
        return False

    try:
        client = Client(auth=notion_key)
        client.pages.create(
            parent={"database_id": db_id},
            properties={
                "Name": {
                    "title": [{"text": {"content": f"Day {summary['day_number']}: {summary['topic']}"}}]
                },
                "Date": {"date": {"start": summary["date"]}},
                "Day": {"number": summary["day_number"]},
                "Subject Line": {"rich_text": [{"text": {"content": summary["subject_line"]}}]},
                "Recipients Sent": {"number": summary.get("sent_count", 0)},
                "Status": {
                    "select": {"name": summary.get("status", "success").capitalize()}
                },
                "Word Count": {"number": summary.get("word_count", 0)},
                "Has Infographic": {"checkbox": summary.get("has_infographic", False)},
            },
        )
        logger.info(f"Notion log created for Day {summary['day_number']}")
        return True
    except Exception as e:
        logger.error(f"Notion logging failed: {e}")
        return False


# ── Google Sheets: mark row sent ───────────────────────────────────────────────

def mark_row_sent(date_str: str, day_num: int) -> bool:
    """Update the roadmap Google Sheet to mark this day as sent."""
    try:
        import gspread
        from google.oauth2.service_account import Credentials
        import os

        creds_path = Path(os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json"))
        if not creds_path.exists():
            logger.warning("credentials.json not found — cannot update Google Sheets")
            return False

        sheet_id = get_env("GOOGLE_SHEET_ID")
        if not sheet_id:
            return False

        scopes = ["https://www.googleapis.com/auth/spreadsheets"]
        creds = Credentials.from_service_account_file(str(creds_path), scopes=scopes)
        client = gspread.authorize(creds)
        sheet = client.open_by_key(sheet_id).sheet1

        # Find the row with matching day number
        all_values = sheet.get_all_values()
        headers = all_values[0] if all_values else []

        try:
            day_col = headers.index("day") + 1
            sent_col = headers.index("sent") + 1
            sent_at_col = headers.index("sent_at") + 1
        except ValueError as e:
            logger.warning(f"Column not found in sheet: {e}")
            return False

        for row_idx, row in enumerate(all_values[1:], start=2):
            if len(row) >= day_col and str(row[day_col - 1]).strip() == str(day_num):
                sheet.update_cell(row_idx, sent_col, "TRUE")
                sheet.update_cell(row_idx, sent_at_col, datetime.now(timezone.utc).isoformat())
                logger.info(f"Marked Day {day_num} as sent in Google Sheets (row {row_idx})")
                return True

        logger.warning(f"Day {day_num} not found in Google Sheets — could not mark as sent")
        return False

    except Exception as e:
        logger.error(f"Google Sheets update failed: {e}")
        return False


# ── Build summary ──────────────────────────────────────────────────────────────

def build_summary(send_result: dict, content: dict, html_meta: dict) -> dict:
    return {
        "date": send_result.get("date", content.get("date", "")),
        "day_number": send_result.get("day_number", content.get("day_number", 1)),
        "topic": content.get("topic", ""),
        "subject_line": send_result.get("subject_line", content.get("subject_line", "")),
        "sent_count": send_result.get("sent_count", 0),
        "failed_count": send_result.get("failed_count", 0),
        "status": send_result.get("status", "unknown"),
        "word_count": content.get("word_count", 0),
        "has_infographic": html_meta.get("has_infographic", False),
        "logged_at": datetime.now(timezone.utc).isoformat(),
    }


# ── Main ───────────────────────────────────────────────────────────────────────

def main(send_result: dict, content: dict) -> dict:
    load_env()
    date_str = send_result.get("date", content.get("date", "unknown"))
    day_num = send_result.get("day_number", content.get("day_number", 1))

    # Load HTML meta if available
    html_meta_path = tmp_path(f"html_meta_{date_str}.json")
    html_meta = read_json(html_meta_path) if html_meta_path.exists() else {}

    summary = build_summary(send_result, content, html_meta)
    logger.info(f"Logging Day {day_num}: {summary['topic']}")

    # Log to Notion
    notion_ok = log_to_notion(summary)

    # Mark sent in Sheets
    sheets_ok = mark_row_sent(date_str, day_num)

    summary["notion_logged"] = notion_ok
    summary["sheets_updated"] = sheets_ok

    log_path = tmp_path(f"log_{date_str}.json")
    write_json(log_path, summary)
    logger.info(f"Log written to {log_path}")

    print(json.dumps(summary))
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--send-result", required=True, help="Path to send_result JSON")
    parser.add_argument("--content", required=True, help="Path to content JSON")
    args = parser.parse_args()

    send_result_data = read_json(args.send_result)
    content_data = read_json(args.content)
    main(send_result_data, content_data)
