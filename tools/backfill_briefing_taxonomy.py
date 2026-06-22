"""
backfill_briefing_taxonomy.py — one-time reclassification of the LIVE briefings
archive into the discovery facets (stage / sector / format).

The early archive was published with category hardcoded to "compliance-guidance"
and week_theme dropped at write time. This script joins each Appwrite briefing to
its roadmap row (by slug) and rewrites the three facets onto existing attributes:

    category    <- stage           (learn | assess | fix | sustain)
    industries  <- [sector]        (e.g. ["schools-colleges"] or ["general"])
    tags        <- [format, …words] (format slug first; existing topic words kept)

Safety:
  • DRY-RUN by default — prints the plan, writes nothing.
  • --apply       patches Appwrite, after writing a backup of the originals.
  • --revert FILE restores {category,industries,tags} from a backup file.
  • Idempotent: derivation is deterministic, so re-running is a no-op.
  • Docs with no roadmap slug match are reported and left untouched.

Run from prod-credentialed env (.env with APPWRITE_* + GOOGLE_SHEET_ID +
credentials.json), same as the daily pipeline:

    python tools/backfill_briefing_taxonomy.py
    python tools/backfill_briefing_taxonomy.py --apply
    python tools/backfill_briefing_taxonomy.py --revert .tmp/backfill_backup_1700000000.json
"""

import argparse
import json
import sys
import time
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.utils import get_env, load_env, setup_logger, tmp_path, write_json, read_json
from tools.briefing_taxonomy import derive as derive_taxonomy
from tools.read_roadmap import get_sheet_data, get_csv_data

logger = setup_logger("backfill_taxonomy")
COLLECTION = "briefings"


# ── Appwrite REST helpers ────────────────────────────────────────────────────────

def _cfg():
    endpoint = get_env("APPWRITE_ENDPOINT").rstrip("/")
    project  = get_env("APPWRITE_PROJECT_ID")
    api_key  = get_env("APPWRITE_API_KEY")
    db_id    = get_env("APPWRITE_DATABASE_ID")
    if not all([endpoint, project, api_key, db_id]):
        raise EnvironmentError(
            "Missing APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY / APPWRITE_DATABASE_ID"
        )
    headers = {
        "X-Appwrite-Project": project,
        "X-Appwrite-Key":     api_key,
        "Content-Type":       "application/json",
    }
    base = f"{endpoint}/databases/{db_id}/collections/{COLLECTION}/documents"
    return base, headers


def list_all_briefings(base: str, headers: dict) -> list[dict]:
    """Paginate every briefing document via the Appwrite REST API."""
    docs, offset, PAGE = [], 0, 100
    while True:
        queries = [
            json.dumps({"method": "limit",  "values": [PAGE]}),
            json.dumps({"method": "offset", "values": [offset]}),
            json.dumps({"method": "orderAsc", "attribute": "$createdAt"}),
        ]
        resp = requests.get(base, headers=headers, params=[("queries[]", q) for q in queries], timeout=30)
        resp.raise_for_status()
        data = resp.json()
        batch = data.get("documents", [])
        docs.extend(batch)
        total = data.get("total", len(docs))
        offset += PAGE
        if len(batch) < PAGE or len(docs) >= total:
            break
    logger.info(f"Fetched {len(docs)} briefing documents")
    return docs


def patch_doc(base: str, headers: dict, doc_id: str, data: dict) -> None:
    resp = requests.patch(f"{base}/{doc_id}", headers=headers, json={"data": data}, timeout=30)
    if not resp.ok:
        raise RuntimeError(f"PATCH {doc_id} failed HTTP {resp.status_code}: {resp.text[:200]}")


# ── Roadmap join ─────────────────────────────────────────────────────────────────

def build_slug_index() -> dict:
    """slug -> {week_theme, topic, infographic_type} from the Sheet (or local CSV)."""
    sheet_id = get_env("GOOGLE_SHEET_ID")
    rows = get_sheet_data(sheet_id) if sheet_id else []
    if not rows:
        logger.info("Sheet unavailable — falling back to local CSV (slug coverage may be partial)")
        rows = get_csv_data()
    rows = [{(k or "").strip(): v for k, v in r.items()} for r in rows]
    index = {}
    for r in rows:
        slug = str(r.get("slug", "")).strip()
        if slug:
            index[slug] = {
                "week_theme":       r.get("week_theme", ""),
                "topic":            r.get("topic", ""),
                "infographic_type": r.get("infographic_type", "stat"),
            }
    logger.info(f"Roadmap slug index: {len(index)} entries")
    return index


def _parse_json_field(val, fallback):
    if isinstance(val, list):
        return val
    if not val:
        return fallback
    try:
        return json.loads(val)
    except Exception:
        return fallback


def plan_changes(docs: list[dict], slug_index: dict) -> tuple[list[dict], list[dict]]:
    """Return (changes, unmatched). Each change carries doc id, old + new field values."""
    changes, unmatched = [], []
    for d in docs:
        slug = d.get("slug", "")
        row = slug_index.get(slug)
        if not row:
            unmatched.append({"id": d["$id"], "slug": slug, "title": d.get("title", "")})
            continue

        tax = derive_taxonomy(row)
        old_tags = _parse_json_field(d.get("tags"), [])
        new_tags = [tax["content_type"]] + [t for t in old_tags if t != tax["content_type"]]
        new = {
            "category":   tax["stage"],
            "industries": json.dumps([tax["sector"]]),
            "tags":       json.dumps(new_tags),
        }
        old = {
            "category":   d.get("category", ""),
            "industries": json.dumps(_parse_json_field(d.get("industries"), [])),
            "tags":       json.dumps(old_tags),
        }
        if new != old:
            changes.append({
                "id": d["$id"], "slug": slug, "title": d.get("title", ""),
                "old": old, "new": new,
                "facets": tax,
            })
    return changes, unmatched


# ── Main ─────────────────────────────────────────────────────────────────────────

def run(apply: bool):
    load_env()
    base, headers = _cfg()
    slug_index = build_slug_index()
    docs = list_all_briefings(base, headers)
    changes, unmatched = plan_changes(docs, slug_index)

    from collections import Counter
    by_stage = Counter(c["facets"]["stage"] for c in changes)
    by_sector = Counter(c["facets"]["sector"] for c in changes)

    print(f"\nBriefings total:     {len(docs)}")
    print(f"Will reclassify:     {len(changes)}")
    print(f"Unmatched (skipped): {len(unmatched)}")
    print(f"Stage distribution:  {dict(by_stage)}")
    print(f"Sectors touched:     {len(by_sector)}")
    print("\nSample (first 8):")
    for c in changes[:8]:
        f = c["facets"]
        print(f"  {c['slug'][:48]:<48} {c['old']['category']:>20} -> {f['stage']}/{f['sector']}/{f['content_type']}")
    if unmatched:
        print(f"\nUnmatched examples: {[u['slug'] or u['title'][:30] for u in unmatched[:5]]}")

    if not apply:
        print("\nDRY-RUN — nothing written. Re-run with --apply to patch Appwrite.")
        return

    backup_path = tmp_path(f"backfill_backup_{int(time.time())}.json")
    write_json(backup_path, [{"id": c["id"], "data": c["old"]} for c in changes])
    print(f"\nBackup written: {backup_path}")

    ok = 0
    for c in changes:
        try:
            patch_doc(base, headers, c["id"], c["new"])
            ok += 1
        except Exception as e:
            logger.error(f"Failed {c['id']} ({c['slug']}): {e}")
    print(f"Patched {ok}/{len(changes)} documents. Revert with: --revert {backup_path}")


def revert(backup_file: str):
    load_env()
    base, headers = _cfg()
    entries = read_json(Path(backup_file))
    ok = 0
    for e in entries:
        try:
            patch_doc(base, headers, e["id"], e["data"])
            ok += 1
        except Exception as ex:
            logger.error(f"Revert failed {e['id']}: {ex}")
    print(f"Reverted {ok}/{len(entries)} documents from {backup_file}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--apply", action="store_true", help="Patch Appwrite (default: dry-run)")
    p.add_argument("--revert", metavar="FILE", help="Restore originals from a backup file")
    args = p.parse_args()
    if args.revert:
        revert(args.revert)
    else:
        run(apply=args.apply)
