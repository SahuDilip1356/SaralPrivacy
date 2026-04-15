"""
generate_infographic.py — Generate newsletter infographic using KIE.ai Nano Banana Pro API.

Usage:
    python tools/generate_infographic.py --input .tmp/content_2026-03-14.json

Output:
    Writes .tmp/infographic_{date}.png
    Writes .tmp/infographic_{date}_meta.json (prompt + metadata)

KIE.ai API docs: https://docs.kie.ai/
Auth: Authorization: Bearer <KIE_API_KEY>
"""

import json
import sys
import time
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.utils import (
    get_env,
    load_env,
    parse_input_arg,
    setup_logger,
    tmp_path,
    write_json,
)

logger = setup_logger("generate_infographic")

# ── KIE.ai API config ──────────────────────────────────────────────────────────
# Async job API: POST to createTask, then GET recordInfo to poll
KIE_API_BASE = "https://api.kie.ai/api/v1"
KIE_CREATE_TASK = f"{KIE_API_BASE}/jobs/createTask"
KIE_RECORD_INFO = f"{KIE_API_BASE}/jobs/recordInfo"

# ── SaralPrivacy Brand Tokens (v3.0) ──────────────────────────────────────────
# Source: SaralPrivacy_Brand_Sheet.html
BRAND_NAVY   = "#121A2E"   # Trust Navy   45%
BRAND_GREEN  = "#07B981"   # Verification Green  20%
BRAND_TEAL   = "#35B6AE"   # Assurance Teal  10%
BRAND_GOLD   = "#E8AB42"   # Signal Gold   5%
BRAND_SLATE  = "#334155"   # Slate 700   10%
BRAND_CLOUD  = "#F7F9FC"   # Cloud 50    10%
BRAND_WHITE  = "#FFFFFF"

# ── Infographic Colour Palettes ────────────────────────────────────────────────
# Each palette maps semantic roles to brand hex values.
# Forbidden combos (per brand sheet): Gold on white · Green bg + Teal text ·
# Navy bg + Slate text · Any gradient as primary bg.

PALETTES = {
    # A — Trust Navy  (dark, authoritative — default / Law Explained)
    "A": {
        "name":       "Trust Navy",
        "background": BRAND_NAVY,
        "heading":    BRAND_WHITE,
        "accent":     BRAND_GREEN,
        "highlight":  BRAND_GOLD,
        "body_text":  BRAND_CLOUD,
    },
    # B — Cloud & Green  (light, editorial — checklists / how-to)
    "B": {
        "name":       "Cloud & Green",
        "background": BRAND_CLOUD,
        "heading":    BRAND_NAVY,
        "accent":     BRAND_GREEN,
        "highlight":  BRAND_TEAL,
        "body_text":  BRAND_SLATE,
    },
    # C — Teal Forward  (fresh, approachable — Myth vs Fact / SME content)
    "C": {
        "name":       "Teal Forward",
        "background": BRAND_WHITE,
        "heading":    BRAND_NAVY,
        "accent":     BRAND_TEAL,
        "highlight":  BRAND_GREEN,
        "body_text":  BRAND_SLATE,
    },
    # D — Midnight Gold  (premium, governance — Compliance Playbook / alerts)
    "D": {
        "name":       "Midnight Gold",
        "background": BRAND_NAVY,
        "heading":    BRAND_GOLD,
        "accent":     BRAND_TEAL,
        "highlight":  BRAND_GREEN,
        "body_text":  BRAND_WHITE,
    },
}

# Lane → palette mapping (auto-selection when no manual override)
LANE_PALETTE_MAP = {
    "law explained":        "A",
    "compliance playbook":  "D",
    "myth vs fact":         "C",
    "compliance checklist": "B",
    "governance watch":     "D",
    "sector notes":         "B",
}
DEFAULT_PALETTE = "A"

MAX_RETRIES = 2
RETRY_DELAY = 8
POLL_INTERVAL = 5   # seconds between status checks
POLL_TIMEOUT = 120  # max seconds to wait for image


# ── Prompt builder ─────────────────────────────────────────────────────────────

def _palette_style(palette: dict) -> str:
    """Build the style clause for a KIE prompt from a palette dict."""
    return (
        f"Professional infographic design. Clean, modern layout. "
        f"Colour palette — background: {palette['background']}, "
        f"headings: {palette['heading']}, "
        f"accent bars and icons: {palette['accent']}, "
        f"highlight callouts: {palette['highlight']}, "
        f"body text: {palette['body_text']}. "
        f"Sans-serif typography (Inter or equivalent). "
        f"Indian business context. No watermarks. No borders. Flat design style. "
        f"Newsletter-ready, 600px wide format."
    )


def _type_instructions(palette: dict) -> dict:
    """Return layout instructions with palette-aware colour references."""
    bg    = palette["background"]
    head  = palette["heading"]
    acc   = palette["accent"]
    hi    = palette["highlight"]
    body  = palette["body_text"]

    return {
        "stat": (
            f"Large statistic callout cards. 2-3 bold numbers or key facts displayed prominently. "
            f"Each card has a number/value, short label, and accent colour bar. "
            f"Horizontal layout. Cards use {bg} background with {head} headings and {acc} accent bars. "
            f"Key numbers in {hi}."
        ),
        "process": (
            f"Vertical step-by-step process flowchart. "
            f"Numbered steps with connecting arrows. "
            f"Each step has an icon area, bold heading, and short description. "
            f"Numbered circles in {acc}, arrows in {hi}, card backgrounds in {bg}, text in {head}."
        ),
        "timeline": (
            f"Horizontal timeline. "
            f"Nodes connected by a line showing progression. "
            f"Each node has a year/label and short event description. "
            f"Timeline line in {acc}, milestone dots in {hi}, background {bg}, labels in {head}."
        ),
        "checklist": (
            f"Visual checklist or summary card. "
            f"Bullet points with checkmark icons. "
            f"Clear heading at top, items below with icons. "
            f"Two-column layout if more than 5 items. "
            f"Background {bg}, headings in {head}, checkmarks in {acc}, highlights in {hi}."
        ),
        "comparison": (
            f"Side-by-side comparison table. "
            f"Two columns with a clear divider. "
            f"Row-by-row comparison of attributes. "
            f"Headers in {head} on {acc} background, alternating rows in {bg}/{body}, "
            f"key differences highlighted in {hi}."
        ),
    }


def _select_palette(content: dict) -> dict:
    """
    Pick a palette for this piece of content.
    Priority: infographic.palette (manual) → infographic.lane → DEFAULT_PALETTE.
    """
    infographic = content.get("infographic", {})

    # 1. Manual override in content JSON
    manual = infographic.get("palette", "").strip().upper()
    if manual in PALETTES:
        return PALETTES[manual]

    # 2. Auto-select from lane
    lane = infographic.get("lane", content.get("lane", "")).strip().lower()
    palette_key = LANE_PALETTE_MAP.get(lane, DEFAULT_PALETTE)
    return PALETTES[palette_key]


def build_prompt(content: dict) -> str:
    """Build a detailed Nano Banana image generation prompt from newsletter content."""
    infographic = content.get("infographic", {})
    inf_type = infographic.get("type", "stat")
    inf_title = infographic.get("title", content.get("topic", ""))
    inf_description = infographic.get("description", "")
    data_points = infographic.get("data_points", [])
    topic = content.get("topic", "")
    day_num = content.get("day_number", 1)

    palette = _select_palette(content)
    style = _palette_style(palette)
    type_instructions = _type_instructions(palette)
    type_instruction = type_instructions.get(inf_type, type_instructions["stat"])

    data_block = ""
    if data_points:
        data_block = "Data to visualise:\n" + "\n".join(f"- {dp}" for dp in data_points)

    prompt = f"""Create a professional newsletter infographic.

Title: "{inf_title}"
Topic: {topic} (DPDPA Daily Brief — Day {day_num})
Colour palette: {palette['name']}

Layout type: {type_instruction}

{inf_description}

{data_block}

Style: {style}

The infographic must be self-contained and readable without additional context.
Include the title prominently at the top.
Label: "© saralprivacy.com" in small text at the bottom left corner. Keep the bottom right corner clear — do not place any text or watermark there.
Image dimensions: approximately 560px wide x 280px tall (landscape, 2:1 ratio)."""

    return prompt


# ── KIE.ai API call ────────────────────────────────────────────────────────────

def call_kie_nano_banana(prompt: str, api_key: str) -> bytes:
    """
    Call KIE.ai Nano Banana API (async job pattern):
    1. POST /api/v1/jobs/createTask → taskId
    2. GET  /api/v1/jobs/recordInfo?taskId=... → poll until state=success
    3. Download the result image URL
    Returns raw image bytes (PNG or JPG).
    """
    model = get_env("NANO_BANANA_MODEL", "nano-banana-2")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "input": {
            "prompt": prompt,
            "aspect_ratio": "16:9",
            "resolution": "1K",
            "output_format": "jpg",
            "google_search": False,
            "image_input": [],
        },
    }

    logger.info(f"Calling KIE.ai Nano Banana ({model})...")

    # Step 1: Submit task
    response = requests.post(KIE_CREATE_TASK, headers=headers, json=payload, timeout=30)

    if response.status_code == 401:
        raise ValueError("KIE.ai API key invalid or expired. Check KIE_API_KEY in .env")
    if response.status_code == 429:
        raise RuntimeError("KIE.ai rate limit hit. Wait and retry.")
    response.raise_for_status()

    resp_data = response.json()
    if resp_data.get("code") != 200:
        raise RuntimeError(f"KIE.ai createTask failed: {resp_data.get('msg', resp_data)}")

    task_id = resp_data["data"]["taskId"]
    logger.info(f"KIE.ai task submitted: {task_id}")

    # Step 2: Poll for completion
    deadline = time.time() + POLL_TIMEOUT
    while time.time() < deadline:
        time.sleep(POLL_INTERVAL)
        poll_resp = requests.get(
            KIE_RECORD_INFO,
            headers=headers,
            params={"taskId": task_id},
            timeout=15,
        )
        poll_resp.raise_for_status()
        poll_data = poll_resp.json()

        if poll_data.get("code") != 200:
            raise RuntimeError(f"KIE.ai recordInfo error: {poll_data}")

        task = poll_data.get("data", {})
        state = task.get("state", "")
        logger.info(f"KIE.ai task state: {state}")

        if state == "success":
            result_json = json.loads(task.get("resultJson", "{}"))
            urls = result_json.get("resultUrls", [])
            if not urls:
                raise ValueError("KIE.ai task succeeded but no result URL")
            img_url = urls[0]
            logger.info(f"KIE.ai image ready: {img_url}")
            img_response = requests.get(img_url, timeout=30)
            img_response.raise_for_status()
            return img_response.content

        if state in ("failed", "error"):
            fail_msg = task.get("failMsg", "unknown error")
            raise RuntimeError(f"KIE.ai task failed: {fail_msg}")

    raise TimeoutError(f"KIE.ai task {task_id} did not complete within {POLL_TIMEOUT}s")


def add_watermark(image_bytes: bytes) -> bytes:
    """
    Stamp 'saralprivacy.com' watermark onto the bottom-right corner of the infographic.
    Uses Pillow (PIL). Falls back silently if Pillow is not installed.
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        import io

        img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        text = "© saralprivacy.com"
        font_size = max(12, img.width // 40)

        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except Exception:
            font = ImageFont.load_default()

        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        margin = 10
        x = img.width  - text_w - margin
        y = img.height - text_h - margin

        # Semi-transparent background pill — brand navy #121A2E @ 70% opacity
        draw.rounded_rectangle(
            [x - 6, y - 4, x + text_w + 6, y + text_h + 4],
            radius=4,
            fill=(18, 26, 46, 180),
        )
        # Watermark text in Verification Green #07B981
        draw.text((x, y), text, font=font, fill=(7, 185, 129, 220))

        watermarked = Image.alpha_composite(img, overlay).convert("RGB")
        out = io.BytesIO()
        watermarked.save(out, format="JPEG", quality=90)
        return out.getvalue()

    except Exception as e:
        logger.warning(f"Watermark failed (Pillow issue): {e} — returning original image")
        return image_bytes


def generate_fallback_png(content: dict) -> bytes:
    """
    Minimal SVG-to-PNG fallback if KIE.ai is unavailable.
    Generates a simple branded stat card using only stdlib.
    Uses the selected palette's heading and accent colors.
    """
    logger.warning("Using SVG fallback infographic (KIE.ai unavailable)")

    palette = _select_palette(content)
    topic = content.get("topic", "DPDPA Daily Brief")
    day_num = content.get("day_number", 1)
    takeaway = content.get("save_worthy_takeaway", "")[:80]
    data_points = content.get("infographic", {}).get("data_points", [])[:3]

    items_svg = ""
    for i, dp in enumerate(data_points):
        y = 120 + i * 50
        items_svg += (
            f'<text x="40" y="{y}" font-family="Arial" font-size="14" '
            f'fill="{palette["body_text"]}">• {dp[:70]}</text>\n'
        )

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="560" height="280" viewBox="0 0 560 280">
  <rect width="560" height="280" fill="{palette['background']}"/>
  <rect width="560" height="6" fill="{palette['accent']}"/>
  <text x="40" y="45" font-family="Arial" font-weight="bold" font-size="11" fill="{palette['accent']}">DPDPA DAILY BRIEF · DAY {day_num}</text>
  <text x="40" y="80" font-family="Arial" font-weight="bold" font-size="18" fill="{palette['heading']}">{topic[:55]}</text>
  {items_svg}
  <text x="40" y="255" font-family="Arial" font-size="12" fill="{palette['highlight']}" font-style="italic">"{takeaway}"</text>
  <text x="10" y="272" font-family="Arial" font-size="9" fill="{palette['accent']}">© saralprivacy.com</text>
</svg>"""

    return svg.encode("utf-8")


# ── Main ───────────────────────────────────────────────────────────────────────

def main(content: dict) -> dict:
    load_env()
    api_key = get_env("KIE_API_KEY")
    date_str = content.get("date", "unknown")

    palette = _select_palette(content)
    prompt = build_prompt(content)
    logger.info(f"Infographic prompt built for: {content.get('topic', '?')}")

    # Try KIE.ai; fall back to SVG on failure
    image_bytes = None
    used_fallback = False

    if api_key:
        for attempt in range(1, MAX_RETRIES + 2):
            try:
                image_bytes = call_kie_nano_banana(prompt, api_key)
                logger.info(f"KIE.ai infographic generated ({len(image_bytes):,} bytes)")
                break
            except Exception as e:
                logger.warning(f"KIE.ai attempt {attempt} failed: {e}")
                if attempt <= MAX_RETRIES:
                    time.sleep(RETRY_DELAY)
                else:
                    logger.error("KIE.ai failed — using SVG fallback")

    if image_bytes is None:
        image_bytes = generate_fallback_png(content)
        used_fallback = True

    # Apply SaralPrivacy watermark (KIE.ai images only; SVG fallback skipped)
    if not used_fallback:
        image_bytes = add_watermark(image_bytes)

    # Determine extension
    ext = "svg" if used_fallback else "jpg"
    img_path = tmp_path(f"infographic_{date_str}.{ext}")
    img_path.write_bytes(image_bytes)
    logger.info(f"Infographic saved to {img_path}")

    # Write metadata
    meta = {
        "date": date_str,
        "topic": content.get("topic", ""),
        "day_number": content.get("day_number", 1),
        "infographic_type": content.get("infographic", {}).get("type", "stat"),
        "palette_name": palette["name"],
        "palette_colors": palette,
        "image_path": str(img_path),
        "image_format": ext,
        "prompt": prompt,
        "used_fallback": used_fallback,
        "model": get_env("NANO_BANANA_MODEL", "nano-banana-2"),
        "size_bytes": len(image_bytes),
    }
    write_json(tmp_path(f"infographic_{date_str}_meta.json"), meta)

    return meta


if __name__ == "__main__":
    content_data = parse_input_arg()
    result = main(content_data)
    print(json.dumps(result, indent=2))
