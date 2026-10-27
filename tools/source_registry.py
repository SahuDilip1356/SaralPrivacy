"""
source_registry.py — the claim register behind every published statistic.

Rule: **no source id, no statistic.** A number presented as a measured fact is
publishable only when a registry entry backs it, or when it came from the
research corpus retrieved for that briefing.

The register lives at webapp/content/source-registry.json so the Next.js app
can import the same file the Python pipeline enforces against — one source of
truth, not two that drift.

A claim's identity includes its METRIC DEFINITION, not just its number and
publisher. PwC's 2024 consumer work carries at least two different 82%
figures measuring different things; "PwC — 82%" would have let the wrong one
through while looking perfectly sourced.

Retired claims are kept, not deleted. A claim that was wrong once gets used
again by someone who half-remembers it, so the register blocks its return and
says why.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional

REGISTRY_PATH = Path(__file__).resolve().parent.parent / "webapp" / "content" / "source-registry.json"


@dataclass(frozen=True)
class Claim:
    id: str
    numbers: tuple
    approved_wording: tuple
    source: str
    source_url: Optional[str]
    report_date: str
    geography: str
    sample: str
    metric_definition: str
    evidence_grade: str
    verified_by: str
    verified_date: str
    review_date: str
    notes: str = ""
    attribution_required: bool = True

    def cite(self) -> str:
        where = f"{self.source}" + (f" — {self.source_url}" if self.source_url else "")
        return f"{where} ({self.geography}, {self.report_date}; {self.sample})"


@dataclass(frozen=True)
class RetiredClaim:
    id: str
    retired_wording: str
    match: str
    why_retired: str
    replace_with: Optional[str]
    retired_by: str
    retired_date: str


class Registry:
    def __init__(self, raw: dict):
        self.raw = raw
        self.claims: Dict[str, Claim] = {}
        for entry in raw.get("claims", []):
            claim = Claim(
                id=entry["id"],
                numbers=tuple(str(n).replace(",", "") for n in entry.get("numbers", [])),
                approved_wording=tuple(entry.get("approved_wording", [])),
                source=entry["source"],
                source_url=entry.get("source_url"),
                report_date=entry["report_date"],
                geography=entry["geography"],
                sample=entry["sample"],
                metric_definition=entry["metric_definition"],
                evidence_grade=entry["evidence_grade"],
                verified_by=entry["verified_by"],
                verified_date=entry["verified_date"],
                review_date=entry["review_date"],
                notes=entry.get("notes", ""),
                attribution_required=entry.get("attribution_required", True),
            )
            self.claims[claim.id] = claim
        self.retired: List[RetiredClaim] = [
            RetiredClaim(
                id=e["id"],
                retired_wording=e["retired_wording"],
                match=e["match"],
                why_retired=e["why_retired"],
                replace_with=e.get("replace_with"),
                retired_by=e["retired_by"],
                retired_date=e["retired_date"],
            )
            for e in raw.get("retired", [])
        ]
        self._retired_res = [(r, re.compile(r.match, re.IGNORECASE)) for r in self.retired]

    # ── lookups the scorers use ──────────────────────────────────────────────

    def registered_numbers(self) -> set:
        """Every number any registered claim is allowed to state."""
        return {n for c in self.claims.values() for n in c.numbers}

    def claims_for_number(self, number: str) -> List[Claim]:
        n = str(number).replace(",", "")
        return [c for c in self.claims.values() if n in c.numbers]

    def find_retired(self, text: str) -> List[RetiredClaim]:
        return [r for r, rx in self._retired_res if rx.search(text)]

    # ── hygiene ──────────────────────────────────────────────────────────────

    def incomplete(self) -> Dict[str, List[str]]:
        """Claims missing a required field value. A null source_url counts."""
        required = self.raw.get("required_fields", [])
        gaps: Dict[str, List[str]] = {}
        for entry in self.raw.get("claims", []):
            missing = [f for f in required if not entry.get(f)]
            if missing:
                gaps[entry["id"]] = missing
        return gaps

    def due_for_review(self, today: str) -> List[Claim]:
        return [c for c in self.claims.values() if c.review_date <= today]


@lru_cache(maxsize=1)
def load(path: Optional[str] = None) -> Registry:
    p = Path(path) if path else REGISTRY_PATH
    return Registry(json.loads(p.read_text(encoding="utf-8")))


if __name__ == "__main__":
    import datetime

    reg = load()
    print(f"{len(reg.claims)} registered claims · {len(reg.retired)} retired")
    for cid, claim in reg.claims.items():
        print(f"  {cid:42s} {', '.join(claim.numbers):>6s}  {claim.cite()}")
    gaps = reg.incomplete()
    if gaps:
        print("\nincomplete records (publishable, but chase these):")
        for cid, fields in gaps.items():
            print(f"  {cid}: missing {', '.join(fields)}")
    due = reg.due_for_review(datetime.date.today().isoformat())
    if due:
        print("\ndue for review:")
        for c in due:
            print(f"  {c.id} (review_date {c.review_date})")
