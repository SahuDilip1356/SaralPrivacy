"""
briefing_taxonomy.py — derive the three discovery facets for a briefing.

Mirror of webapp/lib/data/briefing-taxonomy.ts (keep slugs in sync). The pipeline
writes SLUGS onto existing Appwrite attributes (collection is at attribute capacity):
    Stage  -> category        (learn | assess | fix | sustain)
    Sector -> industries[0]   (e.g. "schools-colleges")
    Format -> tags[0]         (e.g. "checklist")

All three accept an explicit roadmap column if present, else derive deterministically.
"""

import re

# ── Stage ───────────────────────────────────────────────────────────────────────
# The day 91–240 macro themes map onto the journey spine. Foundational weeks (1–90)
# are mostly "learn"; the industry blocks are assess → fix → sustain.
_STAGE_BY_WEEK_THEME = {
    "industry data reality":        "assess",
    "industry compliance touchpoints": "fix",
    "industry response packs":      "sustain",
}
_STAGE_SLUGS = {"learn", "assess", "fix", "sustain"}


def stage_for(week_theme: str = "", explicit: str = "") -> str:
    """Return a stage slug. Prefers an explicit roadmap value, else maps week_theme."""
    e = (explicit or "").strip().lower()
    if e in _STAGE_SLUGS:
        return e
    wt = (week_theme or "").strip().lower()
    if wt in _STAGE_BY_WEEK_THEME:
        return _STAGE_BY_WEEK_THEME[wt]
    # Foundational / unknown -> safest default for the early editorial arc.
    return "learn"


# ── Sector ──────────────────────────────────────────────────────────────────────
# Keyed by the lowercase topic prefix used in the roadmap (text before the first ":").
_SECTOR_SLUG_BY_PREFIX = {
    "ca firms": "ca-firms",
    "recruitment firms": "recruitment",
    "training institutes": "training-institutes",
    "d2c brands": "d2c-brands",
    "clinics and labs": "clinics-labs",
    "schools and colleges": "schools-colleges",
    "law firms": "law-firms",
    "real estate firms": "real-estate",
    "hospitality businesses": "hospitality",
    "pharmacies": "pharmacies",
    "nbfcs": "nbfc",
    "insurance brokers": "insurance-brokers",
    "manufacturing firms": "manufacturing",
    "logistics firms": "logistics",
    "retail chains": "retail",
    "restaurants and cloud kitchens": "restaurants",
    "fitness and wellness": "fitness-wellness",
    "it services and saas startups": "it-saas",
    "marketing agencies": "marketing-agencies",
    "consultancies and bpos": "consultancies-bpo",
    "hospitals and healthcare groups": "hospitals",
    "edtech and online learning": "edtech",
    "marketplaces and platform businesses": "marketplaces",
    "housing societies and proptech": "housing-proptech",
    "auto dealers and service centres": "auto-dealers",
    "ngos and member networks": "ngos",
    "media and community platforms": "media-community",
    "travel tech and booking platforms": "travel-tech",
    "fintech and payments-adjacent smes": "fintech",
    "multi-location service businesses": "multi-location",
}


def sector_for(topic: str = "", explicit: str = "") -> str:
    """Return a sector slug. Prefers an explicit roadmap value, else parses the topic prefix."""
    e = (explicit or "").strip().lower()
    if e:
        return e
    t = (topic or "")
    if ":" in t:
        prefix = t.split(":")[0].strip().lower()
        if prefix in _SECTOR_SLUG_BY_PREFIX:
            return _SECTOR_SLUG_BY_PREFIX[prefix]
    return "general"


# ── Format ──────────────────────────────────────────────────────────────────────
# Derived from the roadmap's infographic_type, nuanced by stage:
# response-pack "process" pieces are playbooks, not generic explainers.
def content_type_for(infographic_type: str = "", stage: str = "", explicit: str = "") -> str:
    e = (explicit or "").strip().lower()
    if e:
        return e
    ig = (infographic_type or "").strip().lower()
    if stage == "sustain" and ig in ("process", "timeline"):
        return "playbook"
    return {
        "stat": "stat",
        "process": "explainer",
        "checklist": "checklist",
        "timeline": "playbook",
        "comparison": "explainer",
    }.get(ig, "explainer")


def derive(row: dict) -> dict:
    """
    Given a roadmap/content row, return {stage, sector, content_type} slugs.
    Honours explicit columns (stage/sector/content_type) when the Sheet provides them.
    """
    stage = stage_for(row.get("week_theme", ""), row.get("stage", ""))
    sector = sector_for(row.get("topic", ""), row.get("sector", ""))
    fmt = content_type_for(
        row.get("infographic_type", ""), stage, row.get("content_type", "")
    )
    return {"stage": stage, "sector": sector, "content_type": fmt}
