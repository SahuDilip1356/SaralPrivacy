"""
read_roadmap.py — Read today's topic from the Google Sheets roadmap.

Matches today's IST date against the "Plan Published Date" column.
Skips rows where Published = Yes (already done).

After publish_to_webapp.py completes, it calls mark_topic_in_sheet()
or mark_topic_sent_in_csv() which writes:
  - Published       → Yes
  - Actual Publish Date → today in DD-Mon-YY format (e.g. 29-Mar-26)

Usage:
    python tools/read_roadmap.py --date 2026-03-29
    python tools/read_roadmap.py               # defaults to today (IST)

Output:
    Prints JSON to stdout + writes .tmp/roadmap_{date}.json
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

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

IST = timezone(timedelta(hours=5, minutes=30))


# ── Date helpers ───────────────────────────────────────────────────────────────

def get_ist_date():
    """Return today's date in IST as a date object."""
    return datetime.now(IST).date()


def get_ist_date_sheet_str() -> str:
    """
    Return today's IST date in sheet format: '29-Mar-26'.
    Matches the format used in the Plan Published Date column.
    """
    d = datetime.now(IST)
    return f"{d.day}-{d.strftime('%b')}-{d.strftime('%y')}"


def parse_sheet_date(date_str: str):
    """
    Parse '24-Mar-26' or '1-Mar-26' into a Python date object.
    Returns None if the string is empty or unparseable.
    """
    if not date_str:
        return None
    try:
        parts = date_str.strip().split("-")
        if len(parts) == 3:
            # Zero-pad the day so strptime works on all platforms
            normalized = f"{parts[0].zfill(2)}-{parts[1]}-{parts[2]}"
            return datetime.strptime(normalized, "%d-%b-%y").date()
    except (ValueError, IndexError):
        pass
    logger.warning(f"Could not parse sheet date: '{date_str}'")
    return None


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
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
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


# ── Mark topic as published ────────────────────────────────────────────────────

def mark_topic_sent_in_csv(day_number: int, status: str = "done", actual_date: str = None) -> bool:
    """
    Mark a day's topic as published in the local CSV roadmap.
    Writes:
      - sent             = done
      - Published        = Yes
      - Actual Publish Date = today in DD-Mon-YY format
    """
    csv_file = roadmap_path()
    if not csv_file.exists():
        logger.warning(f"CSV not found at {csv_file} — cannot mark day {day_number}")
        return False

    actual_date = actual_date or get_ist_date_sheet_str()

    try:
        with open(csv_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fieldnames = list(reader.fieldnames or [])
            rows = list(reader)

        # Ensure all required columns exist in the CSV header
        for col in ("sent", "Published", "Actual Publish Date"):
            if col not in fieldnames:
                fieldnames.append(col)

        updated = False
        for row in rows:
            try:
                if int(row.get("day", 0)) == day_number:
                    row["sent"]               = status
                    row["Published"]          = "Yes"
                    row["Actual Publish Date"] = actual_date
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

        logger.info(
            f"Day {day_number} marked Published=Yes, "
            f"Actual Publish Date={actual_date} in {csv_file}"
        )
        return True

    except Exception as e:
        logger.error(f"Failed to mark day {day_number} in CSV: {e}")
        return False


def mark_topic_in_sheet(sheet_id: str, day_number: int, status: str = "done", actual_date: str = None) -> bool:
    """
    Mark a day's topic as published in Google Sheets.
    Writes:
      - sent             = done
      - Published        = Yes
      - Actual Publish Date = today in DD-Mon-YY format
    Uses batch_update for a single API call.
    """
    try:
        import gspread
        import gspread.utils
        from google.oauth2.service_account import Credentials
    except ImportError:
        logger.warning("gspread not installed — skipping Google Sheets update")
        return False

    creds_path = Path(os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json"))
    if not creds_path.exists():
        logger.warning("credentials.json not found — skipping Google Sheets update")
        return False

    actual_date = actual_date or get_ist_date_sheet_str()

    try:
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = Credentials.from_service_account_file(str(creds_path), scopes=scopes)
        client = gspread.authorize(creds)
        sheet = client.open_by_key(sheet_id).sheet1

        records = sheet.get_all_records()
        headers = sheet.row_values(1)

        # Build column-name → 1-based index map (strip whitespace from headers)
        col_idx = {h.strip(): i + 1 for i, h in enumerate(headers)}

        for i, record in enumerate(records):
            try:
                if int(record.get("day", 0)) == day_number:
                    row_index = i + 2  # +1 for header, +1 for 1-based index

                    updates = []
                    if "sent" in col_idx:
                        updates.append({
                            "range": gspread.utils.rowcol_to_a1(row_index, col_idx["sent"]),
                            "values": [[status]],
                        })
                    if "Published" in col_idx:
                        updates.append({
                            "range": gspread.utils.rowcol_to_a1(row_index, col_idx["Published"]),
                            "values": [["Yes"]],
                        })
                    if "Actual Publish Date" in col_idx:
                        updates.append({
                            "range": gspread.utils.rowcol_to_a1(row_index, col_idx["Actual Publish Date"]),
                            "values": [[actual_date]],
                        })

                    if updates:
                        sheet.batch_update(updates)

                    logger.info(
                        f"Day {day_number} marked Published=Yes, "
                        f"Actual Publish Date={actual_date} in Google Sheet"
                    )
                    return True
            except (ValueError, TypeError):
                continue

        logger.warning(f"Day {day_number} not found in Google Sheet")
        return False

    except Exception as e:
        logger.error(f"Google Sheets update failed: {e}")
        return False


# ── Main ───────────────────────────────────────────────────────────────────────

def main(date_str: str) -> dict:
    load_env()
    sheet_id = get_env("GOOGLE_SHEET_ID")

    # Try Google Sheets first, fall back to local CSV
    rows = get_sheet_data(sheet_id) if sheet_id else []
    if not rows:
        logger.info("Using local CSV roadmap")
        rows = get_csv_data()

    # Find the row for the target date: Plan Published Date = date_str AND Published ≠ Yes
    # When running catch-up for past dates, date_str may differ from today (IST).
    try:
        today = datetime.strptime(date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        today = get_ist_date()
    next_row = None
    # Normalise keys: strip whitespace from column names (sheet may have trailing spaces)
    rows = [{k.strip(): v for k, v in r.items()} for r in rows]
    for r in rows:
        plan_date        = parse_sheet_date(str(r.get("Plan Published Date", "")))
        already_published = str(r.get("Published", "")).strip().lower() == "yes"
        if plan_date == today and not already_published:
            next_row = r
            break

    if next_row is None:
        logger.info(
            f"No planned topic for {date_str} "
            f"(IST today: {today}, sheet format: {get_ist_date_sheet_str()}) — skipping"
        )
        result = {
            "skip":   True,
            "reason": "no_planned_topic_today",
            "date":   date_str,
        }
        write_json(tmp_path(f"roadmap_{date_str}.json"), result)
        print(json.dumps(result))
        return result

    try:
        day_num = int(next_row.get("day", 1))
    except (ValueError, TypeError):
        day_num = 1

    logger.info(f"Found Day {day_num}: '{next_row.get('topic', '')}' planned for {today}")

    # Derive the three discovery facets (stage/sector/content_type). Honours explicit
    # Sheet columns when present, else derives from week_theme / topic / infographic_type.
    from tools.briefing_taxonomy import derive as derive_taxonomy
    taxonomy = derive_taxonomy(next_row)

    result = {
        "skip":                False,
        "date":                date_str,
        "day":                 day_num,
        "week":                int(next_row.get("week", 1)),
        "week_theme":          next_row.get("week_theme", ""),
        "topic":               next_row.get("topic", ""),
        "concept":             next_row.get("concept", ""),
        "clarification":       next_row.get("clarification", ""),
        "save_worthy_takeaway": next_row.get("save_worthy_takeaway", ""),
        "publish_channels":    [
            c.strip()
            for c in str(next_row.get("publish_channels", "email")).split("|")
        ],
        "infographic_type":    next_row.get("infographic_type", "stat"),
        "research_query":      next_row.get("research_query", next_row.get("topic", "")),
        # Discovery facets (stored on category / industries / tags by publish_to_webapp.py)
        "stage":               taxonomy["stage"],
        "sector":              taxonomy["sector"],
        "content_type":        taxonomy["content_type"],
        "total_days":          len(rows),
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
