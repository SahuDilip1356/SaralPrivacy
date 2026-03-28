"""
read_roadmap.py — Read today's topic from the Google Sheets roadmap.

Usage:
    python tools/read_roadmap.py --date 2026-03-14
    python tools/read_roadmap.py               # defaults to today

Output:
    Prints JSON to stdout + writes .tmp/roadmap_{date}.json
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Allow importing from project root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.utils import (
    get_env,
    get_today_iso,
    load_env,
    roadmap_path,
    setup_logger,
    tmp_path,
    write_json,
)

logger = setup_logger("read_roadmap")

# ── Google Sheets integration ──────────────────────────────────────────────────

def get_sheet_data(sheet_id: str) -> list[dict]:
    """Fetch all rows from the Google Sheet roadmap."""
    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        logger.warning("gspread not installed — falling back to local CSV")
        return []

    creds_path = Path(os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json"))
    if not creds_path.exists():
        logger.warning(f"credentials.json not found at {creds_path} — falling back to local CSV")
        return []

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
    ]
    creds = Credentials.from_service_account_file(str(creds_path), scopes=scopes)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(sheet_id).sheet1
    records = sheet.get_all_records()
    logger.info(f"Fetched {len(records)} rows from Google Sheets")
    return records


def get_csv_data() -> list[dict]:
    """Load roadmap from local CSV as fallback."""
    csv_file = roadmap_path()
    if not csv_file.exists():
        raise FileNotFoundError(f"Roadmap CSV not found: {csv_file}")
    with open(csv_file, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def mark_topic_sent_in_csv(day_number: int, status: str = "done") -> bool:
    """
    Mark a day's topic as sent in the local CSV roadmap.
    Updates the 'sent' column to 'done' and sets 'sent_at' timestamp.
    Returns True on success, False if row not found or write failed.
    """
    csv_file = roadmap_path()
    if not csv_file.exists():
        logger.warning(f"CSV not found at {csv_file} — cannot mark day {day_number}")
        return False

    try:
        with open(csv_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames or []
            rows = list(reader)

        # Ensure 'sent' and 'sent_at' columns exist
        if "sent" not in fieldnames:
            fieldnames = list(fieldnames) + ["sent"]
        if "sent_at" not in fieldnames:
            fieldnames = list(fieldnames) + ["sent_at"]

        updated = False
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        for row in rows:
            try:
                if int(row.get("day", 0)) == day_number:
                    row["sent"] = status
                    row["sent_at"] = now_iso
                    updated = True
                    break
            except (ValueError, TypeError):
                continue

        if not updated:
            logger.warning(f"Day {day_number} not found in CSV — nothing marked")
            return False

        with open(csv_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

        logger.info(f"Day {day_number} marked as '{status}' in {csv_file}")
        return True

    except Exception as e:
        logger.error(f"Failed to mark day {day_number} in CSV: {e}")
        return False


def mark_topic_in_sheet(sheet_id: str, day_number: int, status: str = "done") -> bool:
    """
    Mark a day's topic as sent in Google Sheets (when credentials.json exists).
    Returns True on success.
    """
    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        logger.warning("gspread not installed — skipping Google Sheets update")
        return False

    creds_path = Path(os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json"))
    if not creds_path.exists():
        logger.warning("credentials.json not found — skipping Google Sheets update")
        return False

    try:
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = Credentials.from_service_account_file(str(creds_path), scopes=scopes)
        client = gspread.authorize(creds)
        sheet = client.open_by_key(sheet_id).sheet1

        # Find the row with the matching day number
        records = sheet.get_all_records()
        headers = sheet.row_values(1)
        sent_col = headers.index("sent") + 1 if "sent" in headers else None
        sent_at_col = headers.index("sent_at") + 1 if "sent_at" in headers else None

        for i, record in enumerate(records):
            try:
                if int(record.get("day", 0)) == day_number:
                    row_index = i + 2  # +2 because records are 0-indexed and header is row 1
                    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                    if sent_col:
                        sheet.update_cell(row_index, sent_col, status)
                    if sent_at_col:
                        sheet.update_cell(row_index, sent_at_col, now_iso)
                    logger.info(f"Day {day_number} marked as '{status}' in Google Sheet")
                    return True
            except (ValueError, TypeError):
                continue

        logger.warning(f"Day {day_number} not found in Google Sheet")
        return False

    except Exception as e:
        logger.error(f"Google Sheets update failed: {e}")
        return False


# ── Row lookup ─────────────────────────────────────────────────────────────────

def find_row_by_day(rows, day_number: int) -> Optional[dict]:
    """Find the row matching a given day number."""
    for row in rows:
        try:
            if int(row.get("day", 0)) == day_number:
                return row
        except (ValueError, TypeError):
            continue
    return None


def day_number_for_date(rows, date_str: str) -> Optional[int]:
    """
    Return the day number for a given date string (YYYY-MM-DD).
    If the roadmap has explicit date columns, use those.
    Otherwise, compute sequentially from Day 1 = first weekday >= start date.
    """
    # Check if any rows have an explicit date column
    for row in rows:
        if row.get("date") == date_str:
            return int(row["day"])

    # Fallback: compute from campaign start date
    # The campaign start date is the date field of day 1 if set, else today
    day1_row = find_row_by_day(rows, 1)
    if day1_row and day1_row.get("date"):
        from datetime import datetime, timedelta
        start = datetime.strptime(day1_row["date"], "%Y-%m-%d").date()
        target = datetime.strptime(date_str, "%Y-%m-%d").date()
        delta = (target - start).days
        if 0 <= delta < len(rows):
            return delta + 1
    return None


# ── Main ───────────────────────────────────────────────────────────────────────

def main(date_str: str) -> dict:
    load_env()
    sheet_id = get_env("GOOGLE_SHEET_ID")

    # Try Google Sheets first, fall back to local CSV
    rows = get_sheet_data(sheet_id) if sheet_id else []
    if not rows:
        logger.info("Using local CSV roadmap")
        rows = get_csv_data()

    # Find today's day number
    day_num = day_number_for_date(rows, date_str)

    if day_num is None:
        # No date column set — pick the next un-sent topic sequentially
        logger.info(f"No date match for {date_str} — picking next unsent topic from roadmap")
        # Find first row where sent is falsy — publishes every day incl. weekends
        next_row = next(
            (r for r in rows
             if str(r.get("sent", "")).strip().lower() not in ("true", "1", "yes", "done")),
            None,
        )
        if next_row is None:
            logger.info("All 90 topics have been sent — campaign complete")
            result = {"skip": True, "reason": "campaign_complete", "date": date_str}
            write_json(tmp_path(f"roadmap_{date_str}.json"), result)
            print(json.dumps(result))
            return result

        try:
            day_num = int(next_row.get("day", 1))
        except (ValueError, TypeError):
            day_num = 1
        logger.info(f"Next unsent topic is Day {day_num}: '{next_row.get('topic', '')}'")

        # Return directly from this row — no need to look up again below
        result = {
            "skip": False,
            "date": date_str,
            "day": day_num,
            "week": int(next_row.get("week", 1)),
            "week_theme": next_row.get("week_theme", ""),
            "topic": next_row.get("topic", ""),
            "concept": next_row.get("concept", ""),
            "clarification": next_row.get("clarification", ""),
            "save_worthy_takeaway": next_row.get("save_worthy_takeaway", ""),
            "publish_channels": [c.strip() for c in str(next_row.get("publish_channels", "email")).split("|")],
            "infographic_type": next_row.get("infographic_type", "stat"),
            "research_query": next_row.get("research_query", next_row.get("topic", "")),
            "total_days": len(rows),
        }
        output_path = tmp_path(f"roadmap_{date_str}.json")
        write_json(output_path, result)
        logger.info(f"Day {day_num}: '{result['topic']}' — written to {output_path}")
        print(json.dumps(result))
        return result

    row = find_row_by_day(rows, day_num)
    if not row:
        logger.warning(f"No row found for day {day_num}")
        result = {"skip": True, "reason": f"no_row_for_day_{day_num}", "date": date_str}
        write_json(tmp_path(f"roadmap_{date_str}.json"), result)
        print(json.dumps(result))
        return result

    # Check if already sent
    if str(row.get("sent", "")).lower() in ("true", "1", "yes"):
        logger.warning(f"Day {day_num} already sent — skipping to prevent duplicate")
        result = {
            "skip": True,
            "reason": "already_sent",
            "date": date_str,
            "day": day_num,
            "topic": row.get("topic"),
        }
        write_json(tmp_path(f"roadmap_{date_str}.json"), result)
        print(json.dumps(result))
        return result

    # Build output
    result = {
        "skip": False,
        "date": date_str,
        "day": int(row.get("day", day_num)),
        "week": int(row.get("week", 1)),
        "week_theme": row.get("week_theme", ""),
        "topic": row.get("topic", ""),
        "concept": row.get("concept", ""),
        "clarification": row.get("clarification", ""),
        "save_worthy_takeaway": row.get("save_worthy_takeaway", ""),
        "publish_channels": [c.strip() for c in str(row.get("publish_channels", "email")).split("|")],
        "infographic_type": row.get("infographic_type", "stat"),
        "research_query": row.get("research_query", row.get("topic", "")),
        "total_days": len(rows),
    }

    output_path = tmp_path(f"roadmap_{date_str}.json")
    write_json(output_path, result)
    logger.info(f"Day {day_num}: '{result['topic']}' — written to {output_path}")
    print(json.dumps(result))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=get_today_iso())
    args = parser.parse_args()
    main(args.date)
