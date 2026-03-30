"""
publish_to_webapp.py — Push generated briefing to SaralPrivacy webapp for admin approval.

Reads content_{date}.json + infographic_{date}.jpg, then:
  1. Base64-encodes the infographic
  2. POSTs the full briefing payload to /api/briefings/generate (webapp)
  3. The webapp saves to Appwrite (status: draft) and emails all 3 admins for approval
  4. Any admin clicks "Approve & Publish" — briefing goes live on saralprivacy.com

Usage:
    python tools/publish_to_webapp.py --input .tmp/content_2026-03-14.json
    python tools/publish_to_webapp.py --date 2026-03-14      # auto-resolves paths

Output:
    Writes .tmp/publish_result_{date}.json
"""

import argparse
import base64
import json
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.utils import (
    get_env,
    get_today_iso,
    load_env,
    setup_logger,
    tmp_path,
    write_json,
)

logger = setup_logger("publish_to_webapp")


def upload_infographic_to_appwrite(date_str: str, img_path: Path) -> str:
    """
    Upload infographic to Appwrite Storage and return the public view URL.
    Uses a deterministic file ID (inf{YYYYMMDD}) so retries overwrite cleanly.
    Falls back to empty string on any error.
    """
    endpoint   = get_env("APPWRITE_ENDPOINT",   "https://sgp.cloud.appwrite.io/v1").rstrip("/")
    project_id = get_env("APPWRITE_PROJECT_ID", "")
    api_key    = get_env("APPWRITE_API_KEY",    "")
    bucket_id  = get_env("APPWRITE_BUCKET_ID",  "")

    if not all([project_id, api_key, bucket_id]):
        logger.warning("Appwrite env vars missing — cannot upload infographic to storage")
        return ""

    file_id = f"inf{date_str.replace('-', '')}"   # e.g. "inf20260328"

    headers = {
        "X-Appwrite-Project": project_id,
        "X-Appwrite-Key":     api_key,
    }

    # Delete any existing file with this ID (clean retry)
    try:
        requests.delete(
            f"{endpoint}/storage/buckets/{bucket_id}/files/{file_id}",
            headers=headers, timeout=10
        )
    except Exception:
        pass  # ignore — file may not exist yet

    # Upload the new file
    ext = img_path.suffix.lstrip(".")
    mime = "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}"
    with open(img_path, "rb") as f:
        resp = requests.post(
            f"{endpoint}/storage/buckets/{bucket_id}/files",
            headers=headers,
            files={
                "file":   (img_path.name, f, mime),
                "fileId": (None, file_id),
            },
            timeout=60,
        )

    if not resp.ok:
        logger.warning(f"Appwrite Storage upload failed ({resp.status_code}): {resp.text[:200]}")
        return ""

    # Build the public view URL
    view_url = (
        f"{endpoint}/storage/buckets/{bucket_id}/files/{file_id}"
        f"/view?project={project_id}"
    )
    logger.info(f"Infographic uploaded to Appwrite Storage → {view_url}")
    return view_url


def get_infographic_url(date_str: str) -> str:
    """
    Upload infographic to Appwrite Storage and return the URL.
    Falls back to empty string if no infographic found or upload fails.
    """
    for ext in ("jpg", "jpeg", "png"):
        img_path = tmp_path(f"infographic_{date_str}.{ext}")
        if img_path.exists():
            logger.info(f"Infographic found: {img_path} ({img_path.stat().st_size:,} bytes)")
            url = upload_infographic_to_appwrite(date_str, img_path)
            if url:
                return url
            # Upload failed — log and continue without image
            logger.warning("Appwrite upload failed — briefing will publish without infographic")
            return ""

    logger.warning(f"No infographic found for {date_str} — briefing will publish without image")
    return ""


def build_payload(content: dict, infographic_b64: str) -> dict:
    """
    Build the full JSON payload for the webapp's /api/briefings/generate endpoint.

    Rich content strategy:
    - All Hook/Body/CTA fields are packed into `why_it_matters` as an extended JSON envelope
    - This avoids needing new Appwrite attributes (collection is at capacity)
    - The webapp's parseWhyField() reads back all fields from this single JSON blob
    """
    date_str = content.get("date", get_today_iso())
    day_num  = content.get("day_number", 1)

    overview        = content.get("overview", {})
    key_points      = content.get("key_points", {})
    what_this_means = content.get("what_this_means", {})
    action_items    = content.get("action_items", {})

    # `summary` = the hook text (shown as overview body on briefing page)
    summary = overview.get("body", "")

    # Extended why_it_matters JSON — packs ALL rich Hook/Body/CTA content
    # The webapp's parseWhyField() unpacks these
    why_rich = json.dumps({
        # Hook
        "why":          overview.get("body", ""),
        "why_heading":  overview.get("heading", ""),
        # Body
        "impact":       what_this_means.get("body", ""),
        "body_heading": what_this_means.get("heading", "What does this mean for YOUR business?"),
        # Key points
        "affected":     key_points.get("points", []),
        "key_heading":  key_points.get("heading", ""),
        # Save-worthy takeaway
        "save":         content.get("save_worthy_takeaway", ""),
        # Infographic title (since infographic_title attribute was at capacity)
        "inf_title":    content.get("infographic", {}).get("title", ""),
    }, ensure_ascii=False)

    # Action checklist — array of action strings
    checklist = [
        item.get("action", "")
        for item in action_items.get("items", [])
        if item.get("action")
    ]

    # Tags from topic words
    topic = content.get("topic", "")
    tags  = [w.lower() for w in topic.replace(",", "").split()[:5]]

    return {
        # Core fields (map to existing Appwrite attributes)
        "title":            content.get("subject_line", f"Day {day_num}: {topic}"),
        "excerpt":          content.get("preview_text", summary[:200]),
        "summary":          summary,           # Hook body (overview.body)
        "why_it_matters":   why_rich,          # Extended JSON envelope
        "action_checklist": checklist,
        "category":         "compliance-guidance",
        "tags":             tags,
        "industries":       ["general"],
        "read_time":        max(3, content.get("word_count", 300) // 200),
        "featured":         False,
        "author":           "DPDPA Editorial Team",

        # Infographic — stored as Appwrite Storage URL (not base64 in document)
        "infographic_url": infographic_b64,

        # Pipeline metadata (sent to webapp but not stored as separate fields)
        "day_number":  day_num,
        "topic":       topic,
        "date":        date_str,
        "week_theme":  content.get("week_theme", ""),
    }


def post_to_webapp(payload: dict) -> dict:
    """POST payload to webapp's /api/briefings/generate endpoint."""
    site_url    = get_env("NEXT_PUBLIC_SITE_URL", "https://saralprivacy.com").rstrip("/")
    cron_secret = get_env("BRIEFING_CRON_SECRET", "").strip()

    if not cron_secret:
        raise EnvironmentError("BRIEFING_CRON_SECRET not set in .env — needed to authenticate with webapp")

    url = f"{site_url}/api/briefings/generate"
    headers = {
        "Content-Type":  "application/json",
        "Authorization": f"Bearer {cron_secret}",
    }

    logger.info(f"POSTing briefing to {url} ...")
    response = requests.post(url, headers=headers, json=payload, timeout=60)

    if response.status_code == 401:
        raise PermissionError("Webapp rejected request — check BRIEFING_CRON_SECRET matches Vercel env var")
    if not response.ok:
        raise RuntimeError(f"Webapp returned HTTP {response.status_code}: {response.text[:300]}")

    result = response.json()
    logger.info(f"Webapp accepted briefing: {result}")

    # Revalidate the Next.js briefings list cache
    try:
        revalidate_url = f"{site_url}/api/revalidate?secret={cron_secret}"
        rv = requests.get(revalidate_url, timeout=10)
        if rv.ok:
            logger.info("Briefings cache revalidated — new briefing live on site immediately.")
        else:
            logger.warning(f"Cache revalidation returned {rv.status_code} — page will refresh within 1 hour.")
    except Exception as e:
        logger.warning(f"Cache revalidation failed (non-blocking): {e}")

    # Pre-warm ISR cache for the individual briefing page (Fix 3).
    # Makes a GET request to the new slug so Next.js renders + caches it server-side.
    # First real visitor gets instant response from cache instead of 15-20s cold render.
    slug = result.get("slug", "")
    if slug:
        try:
            warm_url = f"{site_url}/briefings/{slug}"
            wr = requests.get(warm_url, timeout=30)
            if wr.ok:
                logger.info(f"ISR cache pre-warmed for /briefings/{slug} — first visitor will be instant.")
            else:
                logger.warning(f"ISR pre-warm returned {wr.status_code} for /briefings/{slug}")
        except Exception as e:
            logger.warning(f"ISR pre-warm failed (non-blocking): {e}")

    return result


def main(content: dict) -> dict:
    load_env()
    date_str = content.get("date", get_today_iso())
    day_num  = content.get("day_number", 1)

    logger.info(f"Publishing Day {day_num} briefing: '{content.get('topic', '?')}' ({date_str})")

    # Upload infographic to Appwrite Storage — returns URL (not base64)
    infographic_url = get_infographic_url(date_str)

    # Build and send payload
    payload = build_payload(content, infographic_url)
    result  = post_to_webapp(payload)

    # Mark topic as "in_progress" in roadmap (so it won't be picked again)
    # We mark immediately on successful draft submission — not waiting for approval
    try:
        from tools.read_roadmap import mark_topic_sent_in_csv, mark_topic_in_sheet
        sheet_id = get_env("GOOGLE_SHEET_ID")
        # Try Google Sheets first (live update), fall back to local CSV
        if sheet_id:
            marked = mark_topic_in_sheet(sheet_id, day_num, status="done")
        else:
            marked = False
        if not marked:
            mark_topic_sent_in_csv(day_num, status="done")
        logger.info(f"Day {day_num} marked as done in roadmap")
    except Exception as e:
        logger.warning(f"Could not mark Day {day_num} as done: {e}")

    summary = {
        "date":          date_str,
        "day_number":    day_num,
        "topic":         content.get("topic", ""),
        "briefing_id":   result.get("briefingId", ""),
        "slug":          result.get("slug", ""),
        "status":        "published",   # live on site immediately — no admin approval gate
        "has_infographic": bool(infographic_url),
    }

    out_path = tmp_path(f"publish_result_{date_str}.json")
    write_json(out_path, summary)
    logger.info(f"Publish result saved to {out_path}")
    logger.info(f"Day {day_num} published live on saralprivacy.com — no approval required.")

    print(json.dumps(summary))
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", help="Path to content JSON (e.g. .tmp/content_2026-03-14.json)")
    parser.add_argument("--date",  help="Date in YYYY-MM-DD (auto-resolves content path)")
    args = parser.parse_args()

    if args.input:
        from tools.utils import read_json
        content_data = read_json(args.input)
    elif args.date:
        from tools.utils import read_json
        content_data = read_json(tmp_path(f"content_{args.date}.json"))
    else:
        print("Error: provide --input <path> or --date <YYYY-MM-DD>", file=sys.stderr)
        sys.exit(1)

    main(content_data)
