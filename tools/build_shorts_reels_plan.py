"""
build_shorts_reels_plan.py — turn the 240-day briefing roadmap into a shorts/reels plan.

The daily briefing pipeline already carries everything a 30-second video needs: a
one-line claim (`concept`), the detail that makes it land (`clarification`), and a
verdict built to be screenshotted (`save_worthy_takeaway`). This script lifts those
into a per-day production sheet so a reel can ship *alongside* its briefing instead
of being re-invented from scratch.

Reads:
    roadmap/90_day_roadmap.csv        days 1-90   (foundations)
    roadmap/day_91_240_enriched.csv   days 91-240 (30 industry verticals x 5 days)

Writes:
    roadmap/shorts_reels_master.csv   machine-readable production tracker
    SHORTS_REELS_PLAN.md              the human-readable master list

Facets (stage / sector / format) come from tools/briefing_taxonomy.py — the same
derivation the publish pipeline writes to Appwrite — so a reel is filed under the
same three facets as the briefing it sits next to. Labels and per-stage CTAs mirror
webapp/lib/data/briefing-taxonomy.ts; keep the two in sync.

Re-running is safe: the five production columns (short_status, reel_status,
asset_link, posted_at, notes) are read back from the existing CSV and preserved,
so regenerating after a roadmap edit never wipes tracking.

Usage:
    python3 tools/build_shorts_reels_plan.py
    python3 tools/build_shorts_reels_plan.py --check   # verify, write nothing
"""

import argparse
import csv
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.briefing_taxonomy import derive

ROOT = Path(__file__).resolve().parent.parent
FOUNDATION_CSV = ROOT / "roadmap" / "90_day_roadmap.csv"
INDUSTRY_CSV = ROOT / "roadmap" / "day_91_240_enriched.csv"
OUT_CSV = ROOT / "roadmap" / "shorts_reels_master.csv"
OUT_MD = ROOT / "SHORTS_REELS_PLAN.md"

SITE = "https://saralprivacy.com"

# Day 1 went live 26-Mar-26. Days 1-90 ran daily from there; only the rows the
# pipeline has already stamped carry a real published_date, so the rest are
# derived from this anchor and labelled "planned" in the output.
DAY_ONE = date(2026, 3, 26)

# ── Labels (mirror of webapp/lib/data/briefing-taxonomy.ts) ─────────────────────

STAGE_LABEL = {
    "learn": "Learn",
    "assess": "Assess",
    "fix": "Fix",
    "sustain": "Sustain",
}

# What the briefing card itself links to at each stage — the reel caption should
# send people to the same place, so the video and the briefing pull one direction.
STAGE_CTA = {
    "learn": ("Check my readiness", "/assessment"),
    "assess": ("Map my data", "/discovery"),
    "fix": ("Get the checklist", "/resources"),
    "sustain": ("Browse templates", "/resources"),
}

FORMAT_LABEL = {
    "explainer": "Explainer",
    "checklist": "Checklist",
    "playbook": "Playbook",
    "stat": "Stat",
    "case-story": "Case story",
    "myth-buster": "Myth-buster",
}

# How each format is shot. One treatment per format, not one per topic — the
# roadmap already varies the words, the treatment only has to vary the shape.
FORMAT_TREATMENT = {
    "stat": (
        "One number on a Trust Navy card, held for a beat before the voice starts. "
        "Number → what it means for the viewer's business → verdict. No b-roll."
    ),
    "explainer": (
        "Talking head with one on-screen phrase per sentence. Claim, then the "
        "everyday example that proves it, then the verdict. Cut every filler word."
    ),
    "checklist": (
        "Screen-recorded list that builds line by line as it is read. 3-5 items, "
        "never more. Final frame holds the whole list still so it can be screenshotted."
    ),
    "playbook": (
        "Numbered steps with a timer or day-marker in the corner. Show the order of "
        "operations, not the theory. End on step 1 so the viewer can start today."
    ),
}

SECTOR_LABEL = {
    "general": "Foundations / all sectors",
    "ca-firms": "CA firms",
    "recruitment": "Recruitment firms",
    "training-institutes": "Training institutes",
    "d2c-brands": "D2C brands",
    "clinics-labs": "Clinics & labs",
    "schools-colleges": "Schools & colleges",
    "law-firms": "Law firms",
    "real-estate": "Real estate firms",
    "hospitality": "Hospitality businesses",
    "pharmacies": "Pharmacies",
    "nbfc": "NBFCs",
    "insurance-brokers": "Insurance brokers",
    "manufacturing": "Manufacturing firms",
    "logistics": "Logistics firms",
    "retail": "Retail chains",
    "restaurants": "Restaurants & cloud kitchens",
    "fitness-wellness": "Fitness & wellness",
    "it-saas": "IT services & SaaS",
    "marketing-agencies": "Marketing agencies",
    "consultancies-bpo": "Consultancies & BPOs",
    "hospitals": "Hospitals & healthcare",
    "edtech": "Edtech & online learning",
    "marketplaces": "Marketplaces & platforms",
    "housing-proptech": "Housing societies & proptech",
    "auto-dealers": "Auto dealers & service",
    "ngos": "NGOs & member networks",
    "media-community": "Media & community platforms",
    "travel-tech": "Travel tech & booking",
    "fintech": "Fintech & payments",
    "multi-location": "Multi-location service businesses",
}

HIGH_RISK_SECTORS = {
    "ca-firms", "recruitment", "clinics-labs", "schools-colleges", "hospitals",
    "pharmacies", "nbfc", "fintech", "insurance-brokers", "edtech", "law-firms",
    "fitness-wellness",
}

PRODUCTION_COLUMNS = ["short_status", "reel_status", "asset_link", "posted_at", "notes"]

COLUMNS = [
    "day", "planned_date", "date_source", "phase", "week", "week_theme",
    "stage", "stage_label", "sector", "sector_label", "risk",
    "format", "format_label", "topic", "hook", "stakes", "verdict",
    "cta_label", "cta_url", "briefing_url",
] + PRODUCTION_COLUMNS


# ── Helpers ────────────────────────────────────────────────────────────────────

def parse_sheet_date(value: str):
    """Parse the roadmap's `d-Mon-yy` plan date (e.g. '23-Jun-26'). None if unparseable."""
    v = (value or "").strip()
    if not v:
        return None
    try:
        return datetime.strptime(v, "%d-%b-%y").date()
    except ValueError:
        return None


def parse_iso_date(value: str):
    v = (value or "").strip()
    if not v:
        return None
    try:
        return datetime.strptime(v[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def read_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_existing_production() -> dict[str, dict]:
    """Read back the tracking columns from a previous run so we never clobber them."""
    if not OUT_CSV.exists():
        return {}
    kept = {}
    for row in read_csv(OUT_CSV):
        day = (row.get("day") or "").strip()
        if not day:
            continue
        values = {c: (row.get(c) or "").strip() for c in PRODUCTION_COLUMNS}
        if any(values.values()):
            kept[day] = values
    return kept


# ── Build ──────────────────────────────────────────────────────────────────────

def build_rows() -> list[dict]:
    rows = []

    for src in read_csv(FOUNDATION_CSV):
        day = int(src["day"])
        published = parse_iso_date(src.get("published_date", ""))
        rows.append(_row(
            src,
            day=day,
            phase="Foundations",
            when=published or (DAY_ONE + timedelta(days=day - 1)),
            date_source="published" if published else "derived",
            briefing_url=(src.get("website_url") or "").strip(),
        ))

    for src in read_csv(INDUSTRY_CSV):
        day = int(src["day"])
        planned = parse_sheet_date(src.get("plan_published_date", ""))
        rows.append(_row(
            src,
            day=day,
            phase="Industry verticals",
            when=planned or (DAY_ONE + timedelta(days=day - 1)),
            date_source="planned" if planned else "derived",
            briefing_url="",
        ))

    rows.sort(key=lambda r: r["day"])
    return rows


def _row(src: dict, *, day: int, phase: str, when: date, date_source: str,
         briefing_url: str) -> dict:
    facets = derive(src)
    stage, sector, fmt = facets["stage"], facets["sector"], facets["content_type"]
    cta_label, cta_url = STAGE_CTA.get(stage, STAGE_CTA["learn"])
    return {
        "day": day,
        "planned_date": when.isoformat(),
        "date_source": date_source,
        "phase": phase,
        "week": (src.get("week") or "").strip(),
        "week_theme": (src.get("week_theme") or "").strip(),
        "stage": stage,
        "stage_label": STAGE_LABEL.get(stage, stage),
        "sector": sector,
        "sector_label": SECTOR_LABEL.get(sector, sector),
        "risk": "high" if sector in HIGH_RISK_SECTORS else "medium",
        "format": fmt,
        "format_label": FORMAT_LABEL.get(fmt, fmt),
        "topic": (src.get("topic") or "").strip(),
        "hook": (src.get("concept") or "").strip(),
        "stakes": (src.get("clarification") or "").strip(),
        "verdict": (src.get("save_worthy_takeaway") or "").strip(),
        "cta_label": cta_label,
        "cta_url": SITE + cta_url,
        "briefing_url": briefing_url,
        **{c: "" for c in PRODUCTION_COLUMNS},
    }


def write_csv(rows: list[dict]) -> None:
    kept = load_existing_production()
    for row in rows:
        carried = kept.get(str(row["day"]))
        if carried:
            row.update(carried)
    with OUT_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


# ── Markdown ───────────────────────────────────────────────────────────────────

def md_escape(text: str) -> str:
    return (text or "").replace("|", "\\|").strip()


def write_md(rows: list[dict]) -> None:
    foundations = [r for r in rows if r["phase"] == "Foundations"]
    industry = [r for r in rows if r["phase"] == "Industry verticals"]
    out: list[str] = []
    w = out.append

    w("# Shorts & reels — the full briefing topic list")
    w("")
    w(f"Every daily briefing topic on the roadmap, laid out so a short or a reel can ship "
      f"next to the briefing on the same morning. **{len(rows)} topics** — "
      f"{len(foundations)} foundations (days 1–{foundations[-1]['day']}) and "
      f"{len(industry)} industry pieces across "
      f"{len({r['sector'] for r in industry})} verticals "
      f"(days {industry[0]['day']}–{industry[-1]['day']}).")
    w("")
    w("> Generated by `tools/build_shorts_reels_plan.py` from `roadmap/90_day_roadmap.csv` "
      "and `roadmap/day_91_240_enriched.csv`. Edit the roadmap, re-run the script — "
      "don't hand-edit this file.")
    w("")
    w("Working copy for production tracking: **`roadmap/shorts_reels_master.csv`** "
      "(one row per day, with `short_status` / `reel_status` / `asset_link` / `posted_at` "
      "/ `notes` columns to fill in). Re-running the generator preserves whatever you've "
      "typed into those five columns.")
    w("")

    w("## How to use this")
    w("")
    w("Each briefing already contains the three lines a 30-second video needs, so nothing "
      "here is newly written — it's the briefing's own copy, re-cut for camera:")
    w("")
    w("| Roadmap field | Job in the video |")
    w("|---|---|")
    w("| `topic` | The title card — what this one is about |")
    w("| `concept` → **Hook** | First 3 seconds. The claim, stated flat. |")
    w("| `clarification` → **Stakes** | Middle. The everyday detail that makes it land. |")
    w("| `save_worthy_takeaway` → **Verdict** | Final frame. Built to be screenshotted. |")
    w("")
    w("### The 30-second skeleton")
    w("")
    w("```")
    w("0:00–0:03   HOOK      concept, on screen and spoken")
    w("0:03–0:12   STAKES    clarification — one concrete example, no law-quoting")
    w("0:12–0:22   VERDICT   save_worthy_takeaway, held still on Trust Navy")
    w("0:22–0:30   CTA       stage CTA + 'full briefing in the link'")
    w("```")
    w("")
    w("Keep reels under 40s and shorts under 60s. If a topic won't fit, it's a carousel, "
      "not a reel.")
    w("")

    w("### Treatment by format")
    w("")
    w("| Format | Count | How to shoot it |")
    w("|---|---:|---|")
    for slug, treatment in FORMAT_TREATMENT.items():
        count = sum(1 for r in rows if r["format"] == slug)
        w(f"| **{FORMAT_LABEL[slug]}** | {count} | {treatment} |")
    w("")

    w("### Caption + CTA")
    w("")
    w("One primary action per video, matched to the stage so the reel and the briefing "
      "card send people the same way:")
    w("")
    w("| Stage | What the viewer needs | CTA in the caption |")
    w("|---|---|---|")
    for slug, label in STAGE_LABEL.items():
        cta_label, cta_url = STAGE_CTA[slug]
        need = {
            "learn": "Understand the law",
            "assess": "Check my risk",
            "fix": "Take action",
            "sustain": "Maintain readiness",
        }[slug]
        w(f"| {label} | {need} | **{cta_label}** → `{cta_url}` |")
    w("")
    w("Caption shape: verdict line → one-sentence why → CTA → link to the briefing → "
      "`@saralprivacy`. Sentence case, active voice, no fear theatre, and never the "
      "phrase \"legal compliance\".")
    w("")

    w("### Posting it adjacent to the briefing")
    w("")
    w("1. The pipeline publishes the briefing at **09:00 IST**; the reel goes out the same "
      "morning, after the briefing URL exists.")
    w("2. Caption links to `" + SITE + "/briefings/<slug>` — put the slug in the CSV's "
      "`briefing_url` column as each day goes live, so the sheet stays the join between "
      "video and page.")
    w("3. Reuse the day's infographic as the reel's end card — same claim, same colours, "
      "one asset doing two jobs.")
    w("4. Record a vertical in sector blocks, not day by day: days 91–240 run five "
      "consecutive days per vertical, so one sitting produces a week of a single "
      "audience's content.")
    w("")

    w("## Start here — the first 20 to shoot")
    w("")
    w("Three rules: the verdict works as a still frame on its own, it stays true whatever "
      "week you post it, and it isn't tied to a campaign moment (webinars, AMAs, polls, "
      "launches and weekly recaps are all excluded — they only make sense inside their "
      "week).")
    w("")
    w("| Day | Date | Format | Topic | Verdict |")
    w("|---:|---|---|---|---|")
    for r in starter_set(rows):
        w(f"| {r['day']} | {r['planned_date']} | {r['format_label']} | "
          f"{md_escape(r['topic'])} | {md_escape(r['verdict'])} |")
    w("")

    w("---")
    w("")
    w("## Phase 1 — Foundations (days 1–90)")
    w("")
    w("Twelve weekly themes taking a reader from *what is this law* to *what do I do "
      "this month*. Sector-agnostic, so every one of these works for any audience.")
    w("")
    for (week, theme), group in group_by_week(foundations):
        w(f"### Week {week} — {theme}")
        w("")
        w(f"*Days {group[0]['day']}–{group[-1]['day']} · "
          f"{group[0]['planned_date']} → {group[-1]['planned_date']} · "
          f"stage: {group[0]['stage_label']}*")
        w("")
        w("| Day | Date | Topic | Format | Hook | Verdict |")
        w("|---:|---|---|---|---|---|")
        for r in group:
            w(f"| {r['day']} | {r['planned_date']} | {md_escape(r['topic'])} | "
              f"{r['format_label']} | {md_escape(r['hook'])} | {md_escape(r['verdict'])} |")
        w("")

    w("---")
    w("")
    w("## Phase 2 — Industry verticals (days 91–240)")
    w("")
    w("Thirty verticals, five consecutive days each, always in the same three beats: "
      "**what data you hold** (Assess) → **where it leaks** (Fix) → **what to do when "
      "someone asks** (Sustain). Shoot a vertical in one sitting.")
    w("")
    w("| Vertical | Days | Dates | Risk |")
    w("|---|---|---|---|")
    for sector, group in group_by_sector(industry):
        w(f"| [{group[0]['sector_label']}](#{anchor(group[0]['sector_label'])}) | "
          f"{group[0]['day']}–{group[-1]['day']} | "
          f"{group[0]['planned_date']} → {group[-1]['planned_date']} | "
          f"{'High' if group[0]['risk'] == 'high' else 'Medium'} |")
    w("")
    for sector, group in group_by_sector(industry):
        label = group[0]["sector_label"]
        w(f"### {label}")
        w("")
        w(f"*Days {group[0]['day']}–{group[-1]['day']} · "
          f"{group[0]['planned_date']} → {group[-1]['planned_date']} · "
          f"{'High risk' if group[0]['risk'] == 'high' else 'Medium risk'}*")
        w("")
        w("| Day | Date | Stage | Format | Topic | Hook | Verdict |")
        w("|---:|---|---|---|---|---|---|")
        for r in group:
            w(f"| {r['day']} | {r['planned_date']} | {r['stage_label']} | "
              f"{r['format_label']} | {md_escape(r['topic'])} | {md_escape(r['hook'])} | "
              f"{md_escape(r['verdict'])} |")
        w("")

    w("---")
    w("")
    w("## Notes on the dates")
    w("")
    derived = [r for r in rows if r["date_source"] == "derived"]
    w(f"- Days 1–90 run daily from **{DAY_ONE.isoformat()}** (day 1). Only the rows the "
      f"pipeline has already stamped carry a real publish date in the roadmap CSV; the "
      f"rest ({len(derived)} of them) are derived from that anchor and marked "
      f"`derived` in the `date_source` column. The live archive is the authority — "
      f"correct the CSV if it disagrees.")
    w("- Days 91–240 use the roadmap's own `plan_published_date` (`planned`), "
      f"{industry[0]['planned_date']} → {industry[-1]['planned_date']}.")
    w("- **Day 90 and day 91 both land on 2026-06-23.** The two roadmap files were "
      "planned separately and overlap by a day. Decide which one moves before the "
      "handover week, and fix it in the roadmap rather than here.")
    w("")

    OUT_MD.write_text("\n".join(out) + "\n", encoding="utf-8")


def anchor(label: str) -> str:
    """GitHub-style heading anchor."""
    return "".join(c for c in label.lower().replace(" ", "-") if c.isalnum() or c == "-")


def group_by_week(rows: list[dict]):
    seen: dict[tuple, list] = {}
    for r in rows:
        seen.setdefault((r["week"], r["week_theme"]), []).append(r)
    return sorted(seen.items(), key=lambda kv: int(kv[0][0] or 0))


def group_by_sector(rows: list[dict]):
    seen: dict[str, list] = {}
    for r in rows:
        seen.setdefault(r["sector"], []).append(r)
    return sorted(seen.items(), key=lambda kv: kv[1][0]["day"])


# Days whose verdict stands on its own as a still frame and doesn't depend on the
# rest of the arc. Deliberately excludes the campaign-bound days — webinars, AMAs,
# polls, launches, weekly recaps — which only make sense inside their week.
STARTER_DAYS = [1, 3, 4, 11, 12, 13, 16, 18, 22, 23, 27, 38, 42, 45, 47, 48, 50, 55, 73, 91]


def starter_set(rows: list[dict]) -> list[dict]:
    by_day = {r["day"]: r for r in rows}
    return [by_day[d] for d in STARTER_DAYS if d in by_day]


# ── Entry point ────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true",
                        help="parse and report, write nothing")
    args = parser.parse_args()

    rows = build_rows()

    days = [r["day"] for r in rows]
    missing = sorted(set(range(1, max(days) + 1)) - set(days))
    duplicates = sorted({d for d in days if days.count(d) > 1})
    blank_verdicts = [r["day"] for r in rows if not r["verdict"]]

    print(f"topics:          {len(rows)}")
    print(f"day range:       {min(days)}–{max(days)}")
    print(f"missing days:    {missing or 'none'}")
    print(f"duplicate days:  {duplicates or 'none'}")
    print(f"blank verdicts:  {blank_verdicts or 'none'}")
    dates = [r["planned_date"] for r in rows]
    collisions = sorted({d for d in dates if dates.count(d) > 1})
    print(f"date collisions: {collisions or 'none'}")

    if args.check:
        return 0

    write_csv(rows)
    write_md(rows)
    print(f"\nwrote {OUT_CSV.relative_to(ROOT)}")
    print(f"wrote {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
