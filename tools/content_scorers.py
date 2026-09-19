"""
content_scorers.py — deterministic quality gates for generated briefings.

Two scorers, both pure functions over text. No model calls, no network, no
dependencies beyond the standard library. They run at *generation* time so a
bad figure never reaches the database, the website, or a subscriber's inbox.

Why these two and not others
────────────────────────────
Both encode a failure class that already shipped and was caught by hand,
months late:

  1. 2026-08-19 briefing said DPDPA fines run "up to ₹220 crore".
     ₹220 crore is not a Schedule amount. The real figure is ₹250 crore.
  2. 2026-04-01 briefing said a breach "costs ~₹22 crore on average".
     No source for that number existed anywhere in the research input.

A model cannot reliably check either. Code can, in microseconds. Per the
eval rule: never ask a model what code can check.

Severity
────────
  block — generation is rejected and retried with the finding fed back;
          if it survives the retries the pipeline fails and nothing is
          published. A missing briefing is cheaper than a wrong one.
  warn  — logged, does not stop the pipeline.

CLI
───
    python tools/content_scorers.py --content .tmp/content_2026-09-19.json \
                                    --research .tmp/research_2026-09-19.json
    python tools/content_scorers.py --corpus briefings.jsonl
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field as dc_field
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

# Same bootstrap as the other tools: this module is also run directly
# (`python tools/content_scorers.py --corpus …`), where the repo root is not
# on sys.path and `from tools import …` would fail.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools import source_registry  # noqa: E402

# ── The Schedule ──────────────────────────────────────────────────────────────
# Source: DPDP Act 2023, THE SCHEDULE [See section 33(1)], as held verbatim in
# webapp/content/dpdp-act-2023.ts (`scheduleRows`). Seven entries, five distinct
# amounts — item 6 is "up to the extent applicable" and carries no figure.
#
#   1. s.8(5) security safeguards ............ ₹250 crore
#   2. s.8(6) breach notification ............ ₹200 crore
#   3. s.9    children ....................... ₹200 crore
#   4. s.10   Significant Data Fiduciary ..... ₹150 crore
#   5. s.15   duties of Data Principal ....... ₹10,000
#   6. s.32   voluntary undertaking .......... (variable, no figure)
#   7. residual .............................. ₹50 crore
#
# ⛔ If this set is edited, the edit must come from the Gazette text, not from
#    memory. There is no "₹500 crore maximum" — s.42(1) is a power to amend the
#    Schedule by notification, capped at 2×, and no notification has issued.
SCHEDULE_AMOUNTS_INR = {
    2_500_000_000,  # ₹250 crore
    2_000_000_000,  # ₹200 crore
    1_500_000_000,  # ₹150 crore
    500_000_000,    # ₹50 crore
    10_000,         # ₹10,000
}

MULTIPLIERS = {
    "": 1,
    "thousand": 1_000,
    "lakh": 100_000,
    "lakhs": 100_000,
    "lac": 100_000,
    "million": 1_000_000,
    "crore": 10_000_000,
    "crores": 10_000_000,
    "cr": 10_000_000,
    "billion": 1_000_000_000,
}

_UNITS = "|".join(sorted((u for u in MULTIPLIERS if u), key=len, reverse=True))

# ₹250 crore · Rs. 10,000 · INR 50 crore · 250 crore rupees
MONEY_RE = re.compile(
    r"(?:(?P<sym>₹|Rs\.?|INR|rupees?)\s*(?P<n1>\d[\d,]*(?:\.\d+)?)\s*(?P<u1>" + _UNITS + r")?"
    r"|(?P<n2>\d[\d,]*(?:\.\d+)?)\s*(?P<u2>" + _UNITS + r")\s*(?:rupees|rs\.?)\b)",
    re.IGNORECASE,
)

# Words that make a rupee figure a *penalty* claim rather than any other amount
# (turnover, a subscription price, a salary). Only penalty-context figures are
# checked against the Schedule — a briefing may legitimately mention money.
PENALTY_WORDS = (
    "fine", "fines", "fined", "fining",
    "penalty", "penalties", "penalise", "penalised", "penalize", "penalized",
    "punish", "punishment", "punished",
    "liable", "liability", "damages",
    "jurmana", "जुर्माना",
)
PENALTY_RE = re.compile(r"\b(" + "|".join(PENALTY_WORDS) + r")", re.IGNORECASE)
PENALTY_WINDOW = 90  # characters either side of the figure

# s.33(1) penalties "may extend to" the Schedule figure — those are CAPS, not
# fixed fines. So a penalty of ₹10 lakh is a lawful outcome and must not be
# blocked; a *cap* of ₹220 crore is a false statement of the law and must be.
# Only cap-framed figures are held to the Schedule.
CAP_RE = re.compile(
    r"\b(up\s?to|upto|as (?:high|much) as|maximum|max\b|at most|"
    r"can (?:go|reach|rise|climb)|could reach|reaches?|extend(?:ing|s)? to|"
    r"as steep as|ceiling)\b",
    re.IGNORECASE,
)
MAX_SCHEDULE_INR = max(SCHEDULE_AMOUNTS_INR)

# ── Statistic detection ───────────────────────────────────────────────────────
# A "statistic" is a number presented as a measured fact about the world. Plain
# numbers ("3 things you can do", "takes 3 minutes") are not statistics and are
# deliberately not matched — that keeps false positives near zero.
STAT_MARKER_RE = re.compile(
    r"(\d[\d,]*(?:\.\d+)?\s*%"
    r"|\bper\s*cent\b|\bpercent\b|\bpercentage\b"
    r"|\bon average\b|\ban average\b|\baverage of\b|\baverage\b|\bmedian\b"
    r"|\b\d[\d,]*\s*out of\s*(?:every\s+)?\d"
    r"|\b\d+\s*in\s*(?:every\s+)?\d"
    r"|\bstudy\b|\bstudies\b|\bsurvey\b|\bresearch shows\b|\breport(?:s|ed)? (?:say|says|found|shows)\b"
    r"|\bdata shows\b|\bstatistics\b"
    r"|\bevery year\b|\beach year\b|\bper year\b|\bannually\b)",
    re.IGNORECASE,
)

# Any digit run of 2+ characters, or a 1-digit number attached to a unit. Used
# to pull the figures out of a statistic-bearing sentence for grounding.
NUMBER_RE = re.compile(r"\d[\d,]*(?:\.\d+)?")

SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+|\n+")



# ── Findings ──────────────────────────────────────────────────────────────────

@dataclass
class Finding:
    scorer: str
    severity: str  # "block" | "warn"
    field: str
    excerpt: str
    message: str

    def __str__(self) -> str:
        mark = "BLOCK" if self.severity == "block" else " WARN"
        return f"[{mark}] {self.scorer} · {self.field}: {self.message}\n         “{self.excerpt}”"


@dataclass
class Report:
    findings: List[Finding] = dc_field(default_factory=list)

    @property
    def blocking(self) -> List[Finding]:
        return [f for f in self.findings if f.severity == "block"]

    @property
    def warnings(self) -> List[Finding]:
        return [f for f in self.findings if f.severity == "warn"]

    @property
    def ok(self) -> bool:
        return not self.blocking

    def summary(self) -> str:
        if not self.findings:
            return "clean — 0 findings"
        return (
            f"{len(self.blocking)} blocking, {len(self.warnings)} warning\n"
            + "\n".join(str(f) for f in self.findings)
        )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_rupees(number: str, unit: str) -> Optional[int]:
    """'250', 'crore' → 2_500_000_000. None if unparseable."""
    try:
        value = float(number.replace(",", ""))
    except ValueError:
        return None
    mult = MULTIPLIERS.get((unit or "").lower().rstrip("."), None)
    if mult is None:
        return None
    amount = value * mult
    return int(round(amount))


def _format_inr(amount: int) -> str:
    if amount >= 10_000_000 and amount % 10_000_000 == 0:
        return f"₹{amount // 10_000_000} crore"
    if amount >= 100_000 and amount % 100_000 == 0:
        return f"₹{amount // 100_000} lakh"
    return f"₹{amount:,}"


def _excerpt(text: str, start: int, end: int, pad: int = 45) -> str:
    lo = max(0, start - pad)
    hi = min(len(text), end + pad)
    snippet = text[lo:hi].replace("\n", " ").strip()
    return ("…" if lo > 0 else "") + snippet + ("…" if hi < len(text) else "")


def iter_content_fields(content: dict) -> Iterable[Tuple[str, str]]:
    """Every reader-visible string in a NewsletterContent dict, with its path."""
    def s(value) -> str:
        return value if isinstance(value, str) else ""

    yield "subject_line", s(content.get("subject_line"))
    yield "preview_text", s(content.get("preview_text"))
    for section in ("overview", "what_this_means"):
        block = content.get(section) or {}
        yield f"{section}.heading", s(block.get("heading"))
        yield f"{section}.body", s(block.get("body"))
    kp = content.get("key_points") or {}
    yield "key_points.heading", s(kp.get("heading"))
    for i, point in enumerate(kp.get("points") or []):
        yield f"key_points.points[{i}]", s(point)
    ai = content.get("action_items") or {}
    yield "action_items.heading", s(ai.get("heading"))
    for i, item in enumerate(ai.get("items") or []):
        yield f"action_items.items[{i}]", s((item or {}).get("action"))
    yield "save_worthy_takeaway", s(content.get("save_worthy_takeaway"))
    info = content.get("infographic") or {}
    yield "infographic.title", s(info.get("title"))
    yield "infographic.description", s(info.get("description"))
    for i, dp in enumerate(info.get("data_points") or []):
        yield f"infographic.data_points[{i}]", s(dp)


# ── Scorer 1 — penalty figures must be Schedule amounts ───────────────────────

def score_penalty_figures(field: str, text: str) -> List[Finding]:
    """Any rupee figure stated as a DPDPA penalty must appear in the Schedule."""
    findings: List[Finding] = []
    if not text:
        return findings

    for m in MONEY_RE.finditer(text):
        number = m.group("n1") or m.group("n2")
        unit = m.group("u1") or m.group("u2") or ""
        amount = _to_rupees(number, unit)
        if amount is None:
            continue

        window = text[max(0, m.start() - PENALTY_WINDOW): m.end() + PENALTY_WINDOW]
        if not PENALTY_RE.search(window):
            continue  # a rupee figure, but not a penalty claim — not our business

        if amount in SCHEDULE_AMOUNTS_INR:
            continue

        allowed = ", ".join(_format_inr(a) for a in sorted(SCHEDULE_AMOUNTS_INR, reverse=True))
        shown = _format_inr(amount)

        if amount > MAX_SCHEDULE_INR:
            severity = "block"
            message = (
                f"{shown} exceeds every penalty the Act allows. The highest Schedule "
                f"amount is {_format_inr(MAX_SCHEDULE_INR)}. There is no 2× enhancement "
                f"in force — s.42(1) is a power to amend the Schedule by notification, "
                f"and no notification has issued."
            )
        elif CAP_RE.search(window):
            severity = "block"
            message = (
                f"{shown} is stated as the maximum penalty but is not a Schedule amount. "
                f"The Schedule [see s.33(1)] caps penalties at: {allowed}."
            )
        else:
            # A penalty below the cap is a lawful outcome — the Board "may extend
            # to" the Schedule figure. Flag it for a human, do not stop the run.
            severity = "warn"
            message = (
                f"{shown} is not a Schedule amount. Lawful as an actual penalty "
                f"(the Schedule sets maxima), but check it is not being presented "
                f"as the legal limit."
            )

        findings.append(
            Finding(
                scorer="penalty-figure",
                severity=severity,
                field=field,
                excerpt=_excerpt(text, m.start(), m.end()),
                message=message,
            )
        )
    return findings


# ── Scorer 2 — statistics must be grounded in the research input ──────────────

# ── Scorer 3 — a retired claim must never come back ──────────────────────────

def score_retired_claims(field: str, text: str) -> List[Finding]:
    """
    A claim that was wrong once gets reused by someone who half-remembers it.
    The register keeps retired claims and blocks their return, with the reason
    attached so nobody has to re-derive it. See webapp/content/source-registry.json.
    """
    findings: List[Finding] = []
    if not text:
        return findings
    try:
        registry = source_registry.load()
    except Exception:  # a missing or broken register must not silently open the gate
        return [
            Finding(
                scorer="retired-claim",
                severity="warn",
                field=field,
                excerpt="",
                message="source registry could not be loaded — retired-claim check did not run",
            )
        ]

    for retired in registry.find_retired(text):
        replacement = ""
        if retired.replace_with:
            claim = registry.claims.get(retired.replace_with)
            if claim:
                replacement = (
                    f" Use instead: “{claim.approved_wording[0]}” — {claim.cite()}."
                )
        else:
            replacement = " There is no replacement figure: remove the claim."
        findings.append(
            Finding(
                scorer="retired-claim",
                severity="block",
                field=field,
                excerpt=text if len(text) <= 160 else text[:157] + "…",
                message=f"retired claim `{retired.id}`. {retired.why_retired}{replacement}",
            )
        )
    return findings


# ── Scorer 2 (continued) ──────────────────────────────────────────────────────

def _corpus_text(research: Optional[dict]) -> str:
    if not research:
        return ""
    parts = [research.get("raw_snippets") or ""]
    for src in research.get("sources") or []:
        if isinstance(src, dict):
            parts.extend(str(src.get(k) or "") for k in ("title", "snippet", "url"))
    return " ".join(parts)


def _numbers_in(text: str) -> List[str]:
    return [n.replace(",", "") for n in NUMBER_RE.findall(text)]


# A number only counts as a statistic if it is claim-shaped: two or more digits,
# a percentage, a money figure, a scale unit, or one side of a ratio. This is
# what keeps "takes 3 minutes" and "3 things you can do" out of the scorer.
RATIO_RE = re.compile(r"\b\d[\d,]*\s*(?:in|out of)\s*(?:every\s+)?\d", re.IGNORECASE)
QUALIFIED_NUMBER_RE = re.compile(
    r"(\d[\d,]*(?:\.\d+)?)\s*(?:%|per\s*cent|percent|" + _UNITS + r")\b",
    re.IGNORECASE,
)


# "82 out of 100" states one figure, not two — 100 is a normalising base, the
# same thing a percent sign does. "1 in 3" is different: there the denominator
# carries the claim, so only 100 and 1000 are treated as bases.
RATIO_BASE_RE = re.compile(r"(?:out of|in)\s*(?:every\s+)?(100|1000|1,000)\b", re.IGNORECASE)


# A four-digit year is not a statistic. Attribution makes years MORE common in
# good copy ("PwC India, Voice of the Consumer Survey 2024"), so flagging them
# would punish exactly the sourcing behaviour the register exists to encourage.
# Only bare years are exempt — "₹2024 crore" or "2024%" still count.
YEAR_RE = re.compile(r"(?<![₹\d.,])\b(19\d{2}|20\d{2})\b(?!\s*(?:%|" + _UNITS + r"))", re.IGNORECASE)


def _statistic_numbers(sentence: str) -> List[str]:
    """The numbers in a sentence that are actually making a factual claim."""
    numbers = set()
    for n in _numbers_in(sentence):
        if len(n.split(".")[0]) >= 2:
            numbers.add(n)
    for m in QUALIFIED_NUMBER_RE.finditer(sentence):
        numbers.add(m.group(1).replace(",", ""))
    for m in MONEY_RE.finditer(sentence):
        numbers.add((m.group("n1") or m.group("n2")).replace(",", ""))
    if RATIO_RE.search(sentence):
        numbers.update(_numbers_in(sentence))
    for m in RATIO_BASE_RE.finditer(sentence):
        numbers.discard(m.group(1).replace(",", ""))
    for m in YEAR_RE.finditer(sentence):
        numbers.discard(m.group(1))
    return sorted(numbers, key=lambda x: (len(x), x))


def score_unsourced_stats(field: str, text: str, research: Optional[dict]) -> List[Finding]:
    """
    A statistic in the output must be traceable to the research that went in.

    The check is grounding, not truth: a number presented as a measured fact
    must appear somewhere in the retrieved sources. A figure that appears in
    the output and nowhere in the input was invented by the model.

    Amounts that come from the Act itself (the Schedule) are exempt — the
    Gazette text in the repo is their source.
    """
    findings: List[Finding] = []
    if not text:
        return findings

    corpus = _corpus_text(research)
    corpus_numbers = set(_numbers_in(corpus))
    knowledge_only = bool((research or {}).get("knowledge_only", research is None))

    # A registered claim carries its own source, so its number is grounded even
    # when this briefing's web research turned up nothing.
    try:
        registered = source_registry.load().registered_numbers()
    except Exception:
        registered = set()

    for sentence in SENTENCE_SPLIT_RE.split(text):
        sentence = sentence.strip()
        if not sentence or not STAT_MARKER_RE.search(sentence):
            continue

        numbers = _statistic_numbers(sentence)
        if not numbers:
            continue

        # A number is exempt only when it is itself a money figure equal to a
        # Schedule amount — the Gazette text is its source. Deriving exempt
        # tokens by unit conversion instead would exempt ordinary numbers by
        # accident (₹150 crore is also "15,000 lakh", so 15,000 would go free).
        act_tokens = {
            (m.group("n1") or m.group("n2")).replace(",", "")
            for m in MONEY_RE.finditer(sentence)
            if _to_rupees(m.group("n1") or m.group("n2"), m.group("u1") or m.group("u2") or "")
            in SCHEDULE_AMOUNTS_INR
        }
        ungrounded = [
            n for n in numbers
            if n not in act_tokens and n not in corpus_numbers and n not in registered
        ]

        if not ungrounded:
            continue

        reason = (
            "no web research was available for this briefing (knowledge_only), so no "
            "source exists for it"
            if knowledge_only
            else "it does not appear anywhere in the retrieved sources"
        )
        findings.append(
            Finding(
                scorer="unsourced-stat",
                severity="block",
                field=field,
                excerpt=sentence if len(sentence) <= 160 else sentence[:157] + "…",
                message=(
                    f"statistic cites {', '.join(ungrounded)} but {reason}, and no entry in "
                    f"webapp/content/source-registry.json backs it. Register the claim "
                    f"(source · url · date · geography · sample · metric definition) or "
                    f"drop the number."
                ),
            )
        )
    return findings


# ── Runner ────────────────────────────────────────────────────────────────────

def run_scorers(
    content: dict,
    research: Optional[dict] = None,
    include_stats: Optional[bool] = None,
) -> Report:
    """
    Run both scorers over a NewsletterContent dict.

    `include_stats` defaults to "only when there is a research object to judge
    grounding against". At generation there always is one (even a failed
    search yields knowledge_only=True, which is itself the answer). At publish
    time the research file may be long gone, and judging grounding against an
    empty corpus would flag every correct statistic — so the stat scorer sits
    out and the penalty scorer, which needs no corpus, still runs.
    """
    if include_stats is None:
        include_stats = research is not None
    report = Report()
    for field, text in iter_content_fields(content):
        report.findings.extend(score_penalty_figures(field, text))
        report.findings.extend(score_retired_claims(field, text))
        if include_stats:
            report.findings.extend(score_unsourced_stats(field, text, research))
    return report


def score_text(text: str, field: str = "text", research: Optional[dict] = None) -> Report:
    """Run both scorers over a bare string — used for the live-corpus sweep."""
    report = Report()
    report.findings.extend(score_penalty_figures(field, text))
    report.findings.extend(score_retired_claims(field, text))
    report.findings.extend(score_unsourced_stats(field, text, research))
    return report


# ── CLI ───────────────────────────────────────────────────────────────────────

def _cli() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--content", help="path to a content_<date>.json")
    ap.add_argument("--research", help="path to the matching research_<date>.json")
    ap.add_argument("--corpus", help="JSONL of {\"id\": str, \"text\": str} — sweep existing briefings")
    args = ap.parse_args()

    if args.corpus:
        flagged = total = 0
        for line in Path(args.corpus).read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            total += 1
            rep = score_text(row.get("text", ""), field=row.get("id", "?"))
            if rep.findings:
                flagged += 1
                print(f"\n── {row.get('id')}")
                print(rep.summary())
        print(f"\nswept {total} rows · {flagged} flagged")
        return 1 if flagged else 0

    if not args.content:
        ap.error("--content or --corpus is required")

    content = json.loads(Path(args.content).read_text(encoding="utf-8"))
    research = json.loads(Path(args.research).read_text(encoding="utf-8")) if args.research else None
    report = run_scorers(content, research)
    print(report.summary())
    return 0 if report.ok else 1


if __name__ == "__main__":
    sys.exit(_cli())
