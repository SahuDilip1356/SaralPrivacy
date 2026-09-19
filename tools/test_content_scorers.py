"""
test_content_scorers.py — regression rows for the briefing quality gates.

Run:  python -m unittest tools.test_content_scorers -v

Two kinds of row, and both matter equally:

  · POSITIVE — text that must be caught. Every past defect gets a permanent
    row here so it can never silently return.
  · NEGATIVE — text that must pass. A scorer that blocks correct copy is worse
    than no scorer, because it trains everyone to ignore it.
"""

import json
import unittest
from pathlib import Path

from tools.content_scorers import run_scorers, score_text

# Research fixtures — the grounding corpus the generator actually had.
NO_RESEARCH = {"sources": [], "raw_snippets": "", "knowledge_only": True}
RESEARCH_60PC = {
    "sources": [{"title": "SMB survey", "snippet": "60% of small firms keep records on WhatsApp"}],
    "raw_snippets": "60% of small firms keep customer records on WhatsApp.",
    "knowledge_only": False,
}


def _content(**overrides) -> dict:
    """A minimal but schema-shaped NewsletterContent."""
    base = {
        "subject_line": "A new law for your shop",
        "preview_text": "What changes for you this week.",
        "overview": {"heading": "Does this apply to you?", "body": "Your shop keeps customer phone numbers."},
        "key_points": {"heading": "3 things to know", "points": ["Keep only what you need."]},
        "what_this_means": {"heading": "What does this mean?", "body": "Ask before you save a number."},
        "action_items": {
            "heading": "3 things you can do this week",
            "items": [
                {"priority": "low", "action": "Check if your business is ready. Takes 3 minutes.", "owner": "Founder"}
            ],
        },
        "save_worthy_takeaway": "Ask first. Save less.",
        "infographic": {"type": "stat", "title": "Where data hides", "description": "Four places.", "data_points": ["WhatsApp"]},
        "sources_used": [],
        "word_count": 20,
    }
    base.update(overrides)
    return base


class PenaltyFigures(unittest.TestCase):
    """Scorer 1 — a rupee figure stated as a DPDPA penalty must be in the Schedule."""

    def _block(self, text):
        rep = score_text(text)
        self.assertTrue(rep.blocking, f"expected a block, got none for: {text}")
        self.assertEqual("penalty-figure", rep.blocking[0].scorer)

    def _pass(self, text):
        rep = score_text(text)
        penalty = [f for f in rep.findings if f.scorer == "penalty-figure"]
        self.assertFalse(penalty, f"unexpected block for: {text}\n{rep.summary()}")

    # ── Permanent regression rows (real defects, found by hand 2026-09-14) ──
    def test_regression_220_crore_live_briefing(self):
        # 2026-08-19 "your customer's data is in 10 places" said this on prod.
        self._block("Under the law, the fines can go up to ₹220 crore.")

    def test_regression_500_crore_enhancement_myth(self):
        # The penalty calculator claimed a 2× enhancement to a ₹500 crore max.
        self._block("A repeat offender can be fined up to ₹500 crore.")

    # ── Must be caught ──
    def test_rs_spelling_variant(self):
        self._block("The penalty can go up to Rs. 220 crore.")

    def test_bare_rupees_suffix_variant(self):
        self._block("You could face a fine of 300 crore rupees.")

    def test_lakh_cap_claim(self):
        self._block("Fines can go up to ₹5 lakh.")

    # ── Must pass ──
    def test_schedule_250_crore(self):
        self._pass("Failing to protect information can bring a fine of up to ₹250 crore.")

    def test_schedule_200_crore(self):
        self._pass("Not telling the Board about a breach can mean a penalty of ₹200 crore.")

    def test_schedule_150_crore(self):
        self._pass("A Significant Data Fiduciary can be fined ₹150 crore.")

    def test_schedule_50_crore_residual(self):
        self._pass("Any other breach can bring a penalty of ₹50 crore.")

    def test_schedule_10000_rupees(self):
        self._pass("Giving false information can mean a fine of ₹10,000.")

    def test_non_penalty_money_is_not_our_business(self):
        # A briefing may talk about money that is not a penalty.
        self._pass("Your shop may earn ₹5 lakh in a good month.")

    def test_price_is_not_a_penalty(self):
        self._pass("A basic compliance review costs ₹9,999.")

    # ── Caps vs actual penalties (calibrated against the live corpus) ──
    def test_actual_penalty_below_the_cap_warns_but_does_not_block(self):
        # Live row, 2026-06-14 briefing. s.33(1) penalties "may extend to" the
        # Schedule figure, so a ₹10 lakh penalty is a lawful outcome. Blocking
        # this would have been a false positive on correct copy.
        text = "A fine of even 10 lakh rupees costs far more than fixing things now."
        rep = score_text(text)
        self.assertFalse(rep.blocking, rep.summary())
        self.assertTrue(rep.warnings, "a non-Schedule penalty figure should still be flagged")

    def test_same_figure_framed_as_the_legal_maximum_does_block(self):
        self._block("The law says fines can go up to 10 lakh rupees.")


class UnsourcedStats(unittest.TestCase):
    """Scorer 2 — a statistic must appear in the research that went in."""

    def _block(self, text, research):
        rep = score_text(text, research=research)
        stats = [f for f in rep.findings if f.scorer == "unsourced-stat"]
        self.assertTrue(stats, f"expected a block, got none for: {text}")

    def _pass(self, text, research):
        rep = score_text(text, research=research)
        stats = [f for f in rep.findings if f.scorer == "unsourced-stat"]
        self.assertFalse(stats, f"unexpected block for: {text}\n{rep.summary()}")

    # ── Permanent regression row (real defect, found by hand 2026-09-14) ──
    def test_regression_22_crore_average_breach_cost(self):
        # 2026-04-01 "your daily work is leaking customer data" said this on prod.
        # Note it is NOT a penalty claim, so scorer 1 cannot see it — this is
        # exactly why there are two scorers and not one.
        self._block("A data breach costs a company ₹22 crore on average.", NO_RESEARCH)

    # ── Must be caught ──
    def test_percentage_not_in_research(self):
        self._block("70% of small shops store customer data on WhatsApp.", RESEARCH_60PC)

    def test_ratio_claim_not_in_research(self):
        self._block("1 in 3 businesses has already had a leak.", NO_RESEARCH)

    def test_per_year_claim(self):
        self._block("India sees 15,000 data breaches every year.", NO_RESEARCH)

    # ── Must pass ──
    def test_grounded_percentage(self):
        self._pass("60% of small firms keep records on WhatsApp.", RESEARCH_60PC)

    def test_act_amount_needs_no_external_source(self):
        # The Gazette text in the repo is the source for Schedule amounts.
        self._pass("On average, the biggest fines reach ₹250 crore.", NO_RESEARCH)

    def test_plain_numbers_are_not_statistics(self):
        self._pass("Check if your business is ready. It takes 3 minutes.", NO_RESEARCH)

    def test_list_count_is_not_a_statistic(self):
        self._pass("3 things you can do this week.", NO_RESEARCH)

    def test_no_number_no_finding(self):
        self._pass("Studies show that small businesses are the most exposed.", NO_RESEARCH)


class FullContent(unittest.TestCase):
    """The runner over a whole NewsletterContent dict."""

    def test_clean_content_passes(self):
        rep = run_scorers(_content(), RESEARCH_60PC)
        self.assertTrue(rep.ok, rep.summary())

    def test_bad_figure_anywhere_blocks(self):
        bad = _content(what_this_means={"heading": "What this means", "body": "You can be fined up to ₹220 crore."})
        rep = run_scorers(bad, RESEARCH_60PC)
        self.assertFalse(rep.ok)
        self.assertEqual("what_this_means.body", rep.blocking[0].field)

    def test_bad_figure_in_infographic_data_points_blocks(self):
        # The infographic is rendered into the JPG that goes out with the email.
        bad = _content(infographic={
            "type": "stat", "title": "Fines", "description": "What it costs.",
            "data_points": ["Penalty: up to ₹220 crore"],
        })
        rep = run_scorers(bad, RESEARCH_60PC)
        self.assertFalse(rep.ok)
        self.assertEqual("infographic.data_points[0]", rep.blocking[0].field)

    def test_finding_message_names_the_allowed_set(self):
        bad = _content(overview={"heading": "h", "body": "Fines can reach ₹220 crore."})
        rep = run_scorers(bad, RESEARCH_60PC)
        self.assertIn("₹250 crore", rep.blocking[0].message)


class LiveCorpus(unittest.TestCase):
    """
    Calibration against real published briefings.

    tools/fixtures/live_briefing_claims.jsonl holds every money-or-statistic
    sentence found in app.briefings_meta on 2026-09-19 (171 rows in, 25
    candidate sentences out). It pins two things at once: that the scorers
    catch what they should, and — more importantly — that they stay quiet on
    the 20 correct sentences. It is swept without a research corpus, so a
    statistic finding here means "this claim has no source on file", not
    "this claim is false".
    """

    FIXTURE = Path(__file__).with_name("fixtures") / "live_briefing_claims.jsonl"

    def setUp(self):
        self.rows = [
            json.loads(line)
            for line in self.FIXTURE.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        self.reports = {r["id"]: score_text(r["text"], field=r["id"]) for r in self.rows}

    def test_every_schedule_figure_passes_clean(self):
        # 20 of 25 rows are correct copy. Any false positive here would be a
        # scorer defect, not a content defect.
        noisy = {rid: rep.summary() for rid, rep in self.reports.items() if rep.findings}
        self.assertEqual(5, len(noisy), f"expected exactly 5 flagged rows, got:\n{noisy}")

    def test_unsourced_statistics_are_caught(self):
        flagged = {rid for rid, rep in self.reports.items()
                   if any(f.scorer == "unsourced-stat" for f in rep.findings)}
        self.assertEqual(
            {
                "2026-03-31 · PwC 82% attributed",
                "2026-03-31 · 82 out of 100 ratio",
                "2026-04-08 · 43 out of 100 cyberattacks",
                "2026-04-12 · over 40% never recover",
            },
            flagged,
        )

    def test_ratio_written_with_every_is_not_missed(self):
        # First sweep missed "43 out of every 100" because the pattern required
        # the two numbers to be adjacent. Permanent row so it cannot come back.
        rep = score_text("43 out of every 100 cyberattacks in India hit small businesses.")
        self.assertTrue([f for f in rep.findings if f.scorer == "unsourced-stat"])

    def test_money_without_a_figure_is_ignored(self):
        # "can cost you crores" / "can cost you lakhs" — no number, no claim.
        for rid in ("2026-05-06 · lakhs, no figure", "2026-08-11 · crores, no figure"):
            self.assertFalse(self.reports[rid].findings, rid)


class PipelineGate(unittest.TestCase):
    """
    The gate must actually fire inside generate_content.main() — a scorer that
    is never called is worse than no scorer. No API key and no network: the
    Claude call is replaced with scripted responses.
    """

    def setUp(self):
        import json as _json
        from unittest import mock

        import tools.generate_content as gc

        self.gc = gc
        self.mock = mock
        self.research = {
            "topic_data": {"topic": "Breach fines", "date": "2026-09-19", "day": 42,
                           "save_worthy_takeaway": "Ask first. Save less."},
            "sources": [], "raw_snippets": "", "knowledge_only": True,
        }
        bad = _content(what_this_means={"heading": "What this means", "body": "You can be fined up to ₹220 crore."})
        good = _content(what_this_means={"heading": "What this means", "body": "You can be fined ₹250 crore."})
        for draft in (bad, good):
            draft.update(topic="Breach fines", date="2026-09-19", day_number=42)
        self.drafts = [_json.dumps(bad), _json.dumps(good)]

    def test_bad_draft_is_rejected_then_corrected(self):
        prompts = []

        def fake_call(prompt):
            prompts.append(prompt)
            return self.drafts[min(len(prompts) - 1, len(self.drafts) - 1)]

        with self.mock.patch.object(self.gc, "call_claude", side_effect=fake_call), \
             self.mock.patch.object(self.gc, "load_env", return_value={}), \
             self.mock.patch.object(self.gc, "write_json") as written, \
             self.mock.patch.object(self.gc.time, "sleep"):
            result = self.gc.main(self.research)

        self.assertEqual(2, len(prompts), "the bad draft should have forced a second attempt")
        self.assertIn("CORRECTION REQUIRED", prompts[1])
        self.assertIn("₹220 crore", prompts[1], "the correction must quote what was wrong")
        self.assertIn("₹250 crore", result["what_this_means"]["body"])
        self.assertEqual(1, written.call_count, "only the clean draft may be written to .tmp/")

    def test_persistently_bad_draft_fails_the_pipeline(self):
        # Nothing is written and the process exits non-zero, so the daily job
        # fails loudly instead of publishing a wrong figure.
        with self.mock.patch.object(self.gc, "call_claude", return_value=self.drafts[0]), \
             self.mock.patch.object(self.gc, "load_env", return_value={}), \
             self.mock.patch.object(self.gc, "write_json") as written, \
             self.mock.patch.object(self.gc.time, "sleep"):
            with self.assertRaises(RuntimeError):
                self.gc.main(self.research)
        self.assertEqual(0, written.call_count)


class PublishGate(unittest.TestCase):
    """
    publish_to_webapp.py can be run on its own with --input <any json>, which
    bypasses the generator entirely. That path must not be how a wrong figure
    reaches the database.
    """

    def test_publish_refuses_a_bad_penalty_figure(self):
        from unittest import mock

        import tools.publish_to_webapp as pub

        bad = _content(overview={"heading": "h", "body": "Fines can go up to ₹220 crore."})
        bad.update(date="2026-09-19", day_number=42, topic="t")

        with mock.patch.object(pub, "load_env", return_value={}):
            with self.assertRaises(ValueError) as ctx:
                pub.main(bad)
        self.assertIn("refusing to publish", str(ctx.exception))

    def test_publish_gate_does_not_block_on_stats_without_research(self):
        # Without research_<date>.json there is no corpus to judge grounding
        # against, so the stat scorer must sit out rather than flag every
        # correct statistic in a re-publish.
        clean = _content(overview={"heading": "h", "body": "Over 40% of shops keep data on WhatsApp."})
        rep = run_scorers(clean, None)
        self.assertTrue(rep.ok, rep.summary())


if __name__ == "__main__":
    unittest.main()
