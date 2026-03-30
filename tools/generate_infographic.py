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

import base64
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

# Brand palette
BRAND_NAVY = "#1B3A5C"
BRAND_SAFFRON = "#F4941B"
BRAND_WHITE = "#FFFFFF"
BRAND_LIGHT_BG = "#F7F9FC"

MAX_RETRIES = 2
RETRY_DELAY = 8
POLL_INTERVAL = 5   # seconds between status checks
POLL_TIMEOUT = 120  # max seconds to wait for image


# ── Prompt builder ─────────────────────────────────────────────────────────────

INFOGRAPHIC_STYLE = (
    f"Professional infographic design. Clean, modern layout. "
    f"Color palette: navy blue {BRAND_NAVY} as primary, saffron orange {BRAND_SAFFRON} as accent, "
    f"white {BRAND_WHITE} background. Sans-serif typography. "
    f"Indian business context. No watermarks. No borders. Flat design style. "
    f"Newsletter-ready, 600px wide format."
)

INFOGRAPHIC_TYPE_INSTRUCTIONS = {
    "stat": (
        "Large statistic callout cards. 2-3 bold numbers or key facts displayed prominently. "
        "Each card has a number/value, short label, and accent color bar. "
        "Horizontal layout. Clean white cards with navy headings and saffron highlights."
    ),
    "process": (
        "Vertical step-by-step process flowchart. "
        "Numbered steps with connecting arrows. "
        "Each step has an icon area, bold heading, and short description. "
        "Navy numbered circles, saffron arrows, white card backgrounds."
    ),
    "timeline": (
        "Horizontal timeline. "
        "Nodes connected by a line showing progression. "
        "Each node has a year/label and short event description. "
        "Navy line, saffron milestone dots, white background."
    ),
    "checklist": (
        "Visual checklist or summary card. "
        "Bullet points with checkmark icons. "
        "Clear heading at top, items below with icons. "
        "Two-column layout if more than 5 items. "
        "Navy headings, saffron checkmarks."
    ),
    "comparison": (
        "Side-by-side comparison table. "
        "Two columns with a clear divider. "
        "Row-by-row comparison of attributes. "
        "Navy headers, alternating white/light rows, saffron highlights for key differences."
    ),
}


def build_prompt(content: dict) -> str:
    """Build a detailed Nano Banana image generation prompt from newsletter content."""
    infographic = content.get("infographic", {})
    inf_type = infographic.get("type", "stat")
    inf_title = infographic.get("title", content.get("topic", ""))
    inf_description = infographic.get("description", "")
    data_points = infographic.get("data_points", [])
    topic = content.get("topic", "")
    day_num = content.get("day_number", 1)

    type_instruction = INFOGRAPHIC_TYPE_INSTRUCTIONS.get(inf_type, INFOGRAPHIC_TYPE_INSTRUCTIONS["stat"])

    data_block = ""
    if data_points:
        data_block = "Data to visualise:\n" + "\n".join(f"- {dp}" for dp in data_points)

    prompt = f"""Create a professional newsletter infographic.

Title: "{inf_title}"
Topic: {topic} (DPDPA Daily Brief — Day {day_num})

Layout type: {type_instruction}

{inf_description}

{data_block}

Style: {INFOGRAPHIC_STYLE}

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

        # Semi-transparent background pill
        draw.rounded_rectangle(
            [x - 6, y - 4, x + text_w + 6, y + text_h + 4],
            radius=4,
            fill=(27, 58, 92, 180),   # brand navy, 70% opacity
        )
        draw.text((x, y), text, font=font, fill=(244, 148, 27, 220))  # saffron

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
    """
    logger.warning("Using SVG fallback infographic (KIE.ai unavailable)")

    topic = content.get("topic", "DPDPA Daily Brief")
    day_num = content.get("day_number", 1)
    takeaway = content.get("save_worthy_takeaway", "")[:80]
    data_points = content.get("infographic", {}).get("data_points", [])[:3]

    items_svg = ""
    for i, dp in enumerate(data_points):
        y = 120 + i * 50
        items_svg += f'<text x="40" y="{y}" font-family="Arial" font-size="14" fill="#1B3A5C">• {dp[:70]}</text>\n'

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="560" height="280" viewBox="0 0 560 280">
  <rect width="560" height="280" fill="#FFFFFF"/>
  <rect width="560" height="6" fill="#F4941B"/>
  <text x="40" y="45" font-family="Arial" font-weight="bold" font-size="11" fill="#F4941B">DPDPA DAILY BRIEF · DAY {day_num}</text>
  <text x="40" y="80" font-family="Arial" font-weight="bold" font-size="18" fill="#1B3A5C">{topic[:55]}</text>
  {items_svg}
  <text x="40" y="255" font-family="Arial" font-size="12" fill="#666666" font-style="italic">"{takeaway}"</text>
</svg>"""

    # Return SVG as bytes (HTML email can render SVG directly as fallback)
    return svg.encode("utf-8")


# ── Main ───────────────────────────────────────────────────────────────────────

def main(content: dict) -> dict:
    load_env()
    api_key = get_env("KIE_API_KEY")
    date_str = content.get("date", "unknown")

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
