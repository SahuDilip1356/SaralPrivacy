"""
generate_content.py — Generate newsletter content using Claude API.

Usage:
    python tools/generate_content.py --input .tmp/research_2026-03-14.json

Output:
    Writes .tmp/content_{date}.json
"""

import json
import sys
import time
from pathlib import Path

import anthropic
from pydantic import BaseModel, ValidationError

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.utils import (
    get_env,
    load_env,
    parse_input_arg,
    setup_logger,
    tmp_path,
    write_json,
)

logger = setup_logger("generate_content")

MAX_RETRIES = 2


# ── Pydantic schemas for strict validation ─────────────────────────────────────

class ActionItem(BaseModel):
    priority: str       # "high" | "medium" | "low"
    action: str
    owner: str          # "Founder" | "HR" | "IT" | "Marketing" | "Ops" | "All"


class ContentSection(BaseModel):
    heading: str
    body: str


class KeyPoints(BaseModel):
    heading: str
    points: list[str]   # 4–5 bullet points


class ActionItems(BaseModel):
    heading: str
    items: list[ActionItem]


class InfographicData(BaseModel):
    type: str           # "stat" | "process" | "timeline" | "checklist" | "comparison"
    title: str
    description: str    # 1-2 sentences describing what the infographic should show
    data_points: list[str]   # key facts/numbers/steps to visualise


class NewsletterContent(BaseModel):
    topic: str
    date: str
    day_number: int
    subject_line: str
    preview_text: str
    overview: ContentSection
    key_points: KeyPoints
    what_this_means: ContentSection
    action_items: ActionItems
    save_worthy_takeaway: str
    infographic: InfographicData
    sources_used: list[str]
    word_count: int


# ── Prompts ────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are the writer of DPDPA Daily Brief by SaralPrivacy — India's simplest newsletter on data privacy for small businesses.

YOUR READER: A small business owner in India. Class 8 education. Runs a shop, factory, school, or small office. Does not know legal English. Uses WhatsApp every day.

YOUR WRITING RULES (follow strictly):
1. Write like you are talking to a friend. Short sentences. Max 15 words per sentence.
2. Use the simplest word possible. NOT "personal data" — say "people's information". NOT "data fiduciary" — say "your business". NOT "pursuant to" — say "because of".
3. No English words that a Class 8 student would not know.
4. Every section must answer: "So what? Why should I care TODAY?"
5. Use Indian examples: aadhaar, pan card, customer phone numbers, WhatsApp messages, salary slips, resumes.
6. STRUCTURE every briefing as: HOOK → BODY → CTA. See field descriptions below.

Output ONLY valid JSON. No markdown. No code fences. No preamble. No explanation outside the JSON object."""


def build_user_prompt(research: dict) -> str:
    topic_data = research.get("topic_data", {})
    topic = topic_data.get("topic", "")
    concept = topic_data.get("concept", "")
    clarification = topic_data.get("clarification", "")
    takeaway = topic_data.get("save_worthy_takeaway", "")
    date_str = topic_data.get("date", "")
    day_num = topic_data.get("day", 1)
    week_theme = topic_data.get("week_theme", "")
    infographic_type = topic_data.get("infographic_type", "stat")
    raw_snippets = research.get("raw_snippets", "")
    sources = research.get("sources", [])
    knowledge_only = research.get("knowledge_only", False)

    context_block = ""
    if raw_snippets and not knowledge_only:
        context_block = f"""
## Web Research (use to enrich content — do not copy verbatim)
{raw_snippets[:3000]}
"""
    else:
        context_block = "## Note: No web research available. Use your knowledge of Indian DPDPA context."

    source_urls = [s.get("url", "") for s in sources[:5] if s.get("url")]

    return f"""Write the Day {day_num} DPDPA Daily Brief for SaralPrivacy.

## Topic
{topic}

## Week Theme
{week_theme}

## Core Concept (must be communicated clearly)
{concept}

## Clarification (expand on this)
{clarification}

## Save-Worthy Takeaway (copy this VERBATIM into save_worthy_takeaway)
{takeaway}

## Date
{date_str}
{context_block}

## STRUCTURE: Hook → Body → CTA
The briefing must follow this 3-part structure:

HOOK (overview field): Start with a surprising fact, a relatable fear, or a short story. Make the reader say "Oh no, does this apply to me?" Max 3 sentences. Simple words only.

BODY (key_points + what_this_means): Explain what is happening and why it matters. Use bullet points. Give 3-4 real examples from Indian small business life. Max 12 words per sentence.

CTA (action_items): End with clear steps. Last item MUST be: "Check if your business is ready. It takes 3 minutes. Go to saralprivacy.com/assessment"

## Output Schema (strict JSON, all fields required)
{{
  "topic": "{topic}",
  "date": "{date_str}",
  "day_number": {day_num},
  "subject_line": "[Max 55 chars. Punchy. Simple words. E.g. 'Are you breaking this new law without knowing?']",
  "preview_text": "[One sentence. Max 90 chars. Conversational.]",
  "overview": {{
    "heading": "[Short heading — question or bold statement, max 8 words]",
    "body": "[HOOK: 60-80 words. Start with a surprising fact or fear. Simple Class 8 language. Make reader say 'this applies to me'.]"
  }},
  "key_points": {{
    "heading": "[e.g. '3 things every small business must know']",
    "points": ["[point 1 — max 15 words, simple language]", "[point 2]", "[point 3]", "[point 4 — optional]"]
  }},
  "what_this_means": {{
    "heading": "What does this mean for YOUR business?",
    "body": "[BODY: 80-100 words. Practical. Indian examples. WhatsApp, Aadhaar, phone numbers, resumes. Max 12 words per sentence.]"
  }},
  "action_items": {{
    "heading": "3 things you can do this week",
    "items": [
      {{"priority": "high", "action": "[Simple action — max 12 words]", "owner": "Founder"}},
      {{"priority": "medium", "action": "[Simple action]", "owner": "HR or Ops"}},
      {{"priority": "low", "action": "Check if your business is ready. Takes 3 minutes. Visit saralprivacy.com/assessment", "owner": "Founder"}}
    ]
  }},
  "save_worthy_takeaway": "{takeaway}",
  "infographic": {{
    "type": "{infographic_type}",
    "title": "[Short title — max 6 words, simple]",
    "description": "[What the infographic shows. 1-2 sentences. Designed for a Class 8 reader.]",
    "data_points": ["[Concrete fact or step — simple words]", "[fact 2]", "[fact 3]", "[fact 4]"]
  }},
  "sources_used": {json.dumps(source_urls)},
  "word_count": 0
}}

Rules:
- Every sentence must be Class 8 level. If in doubt — simplify.
- Use Indian examples: aadhaar, pan card, WhatsApp, salary slip, resume, GST, shop, factory.
- action_items last item must always link to saralprivacy.com/assessment
- infographic data_points: concrete numbers, steps, or short facts — never vague
- word_count: count total words across overview.body + key_points.points + what_this_means.body
- Return ONLY the JSON object. Nothing else."""


# ── Claude API call ────────────────────────────────────────────────────────────

def call_claude(prompt: str) -> str:
    """Call Claude API and return raw response text."""
    client = anthropic.Anthropic(api_key=get_env("ANTHROPIC_API_KEY"))
    model = get_env("CLAUDE_MODEL", "claude-sonnet-4-6")
    max_tokens = int(get_env("CLAUDE_MAX_TOKENS", "4096"))
    temperature = float(get_env("CLAUDE_TEMPERATURE", "0.3"))

    message = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def parse_and_validate(raw: str, date_str: str, day_num: int) -> dict:
    """Parse Claude's JSON response and validate with Pydantic."""
    # Strip any accidental markdown fences
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Claude returned invalid JSON: {e}\nRaw: {raw[:500]}")

    try:
        validated = NewsletterContent(**data)
        result = validated.model_dump()
        # Compute word count if not set
        if result.get("word_count", 0) == 0:
            words = (
                result["overview"]["body"]
                + " ".join(result["key_points"]["points"])
                + result["what_this_means"]["body"]
            )
            result["word_count"] = len(words.split())
        return result
    except ValidationError as e:
        raise ValueError(f"Content schema validation failed: {e}")


# ── Main ───────────────────────────────────────────────────────────────────────

def main(research: dict) -> dict:
    load_env()
    topic_data = research.get("topic_data", {})
    date_str = topic_data.get("date", "unknown")
    day_num = topic_data.get("day", 1)

    prompt = build_user_prompt(research)
    last_error = None

    for attempt in range(1, MAX_RETRIES + 2):
        try:
            logger.info(f"Calling Claude API (attempt {attempt}/{MAX_RETRIES + 1})")
            raw = call_claude(prompt)
            result = parse_and_validate(raw, date_str, day_num)
            output_path = tmp_path(f"content_{date_str}.json")
            write_json(output_path, result)
            logger.info(
                f"Content generated: '{result['topic']}' "
                f"({result['word_count']} words) → {output_path}"
            )
            return result

        except (ValueError, Exception) as e:
            last_error = e
            logger.warning(f"Attempt {attempt} failed: {e}")
            if attempt <= MAX_RETRIES:
                time.sleep(5)

    raise RuntimeError(
        f"Content generation failed after {MAX_RETRIES + 1} attempts. "
        f"Last error: {last_error}"
    )


if __name__ == "__main__":
    research_data = parse_input_arg()
    main(research_data)
