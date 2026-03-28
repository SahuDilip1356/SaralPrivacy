"""
html_builder.py — Render the newsletter HTML from content + infographic.

Usage:
    python tools/html_builder.py --input .tmp/content_2026-03-14.json

Output:
    Writes .tmp/email_{date}.html (self-contained, CSS inlined)
"""

import base64
import sys
from datetime import datetime
from pathlib import Path

import jinja2

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.utils import (
    get_today_iso,
    load_env,
    parse_input_arg,
    setup_logger,
    tmp_path,
    write_json,
)

logger = setup_logger("html_builder")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "templates"


# ── Jinja2 environment ─────────────────────────────────────────────────────────

def get_jinja_env() -> jinja2.Environment:
    return jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=jinja2.select_autoescape(["html"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )


# ── Infographic loading ────────────────────────────────────────────────────────

def load_infographic(date_str: str) -> dict:
    """
    Load the infographic image for this date.
    Returns a dict with b64, format, svg, and title.
    """
    result = {
        "infographic_b64": "",
        "infographic_format": "png",
        "infographic_svg": "",
        "infographic_title": "",
        "infographic_cid_fallback": "",
    }

    # Try PNG first (KIE.ai output)
    for ext in ("png", "jpg", "jpeg"):
        img_path = tmp_path(f"infographic_{date_str}.{ext}")
        if img_path.exists():
            img_bytes = img_path.read_bytes()
            result["infographic_b64"] = base64.b64encode(img_bytes).decode("utf-8")
            result["infographic_format"] = ext
            logger.info(f"Loaded infographic PNG: {img_path} ({len(img_bytes):,} bytes)")
            return result

    # Try SVG fallback
    svg_path = tmp_path(f"infographic_{date_str}.svg")
    if svg_path.exists():
        result["infographic_svg"] = svg_path.read_text(encoding="utf-8")
        logger.info(f"Loaded infographic SVG: {svg_path}")
        return result

    logger.warning(f"No infographic found for {date_str} — section will show placeholder")
    return result


# ── CSS inlining ───────────────────────────────────────────────────────────────

def inline_css(html: str) -> str:
    """Inline CSS using premailer for email client compatibility."""
    try:
        import premailer
        css_path = TEMPLATES_DIR / "styles" / "email.css"
        extra_css = css_path.read_text(encoding="utf-8") if css_path.exists() else ""
        result = premailer.transform(
            html,
            base_url="",
            preserve_internal_links=True,
            exclude_pseudoclasses=True,
            keep_style_tags=False,
            remove_classes=False,
            strip_important=False,
            css_text=extra_css,
        )
        return result
    except Exception as e:
        logger.warning(f"CSS inlining failed (premailer): {e} — using raw HTML")
        return html


# ── Template context builder ───────────────────────────────────────────────────

def build_context(content: dict, infographic: dict) -> dict:
    date_str = content.get("date", get_today_iso())
    day_num = content.get("day_number", 1)
    total_days = 90

    # Format date nicely
    try:
        parsed = datetime.strptime(date_str, "%Y-%m-%d")
        date_formatted = parsed.strftime("%B %d, %Y")
    except ValueError:
        date_formatted = date_str

    # Progress
    progress_pct = round((day_num / total_days) * 100)
    progress_pct_int = round((day_num / total_days) * 560)  # for MSO VML (560px track)

    from tools.utils import get_env
    load_env()
    footer_url = get_env("NEWSLETTER_FOOTER_URL", "#")

    return {
        # Meta
        "subject_line": content.get("subject_line", f"Day {day_num}: {content.get('topic', '')}"),
        "preview_text": content.get("preview_text", ""),
        "date_formatted": date_formatted,
        "day_number": day_num,
        "total_days": total_days,
        "week": content.get("week", 1),
        "week_theme": content.get("week_theme", ""),
        "progress_pct": progress_pct,
        "progress_pct_int": progress_pct_int,

        # Content
        "topic": content.get("topic", ""),
        "concept": content.get("concept", ""),
        "overview": content.get("overview", {}),
        "key_points": content.get("key_points", {}),
        "what_this_means": content.get("what_this_means", {}),
        "action_items": content.get("action_items", {}),
        "save_worthy_takeaway": content.get("save_worthy_takeaway", ""),

        # Infographic
        "infographic_b64": infographic.get("infographic_b64", ""),
        "infographic_format": infographic.get("infographic_format", "png"),
        "infographic_svg": infographic.get("infographic_svg", ""),
        "infographic_title": content.get("infographic", {}).get("title", ""),
        "infographic_cid_fallback": infographic.get("infographic_cid_fallback", ""),

        # Footer
        "unsubscribe_url": f"{footer_url}?action=unsubscribe",
    }


# ── Main ───────────────────────────────────────────────────────────────────────

def main(content: dict) -> dict:
    load_env()
    date_str = content.get("date", get_today_iso())

    # Load infographic
    infographic = load_infographic(date_str)

    # Build Jinja2 context
    context = build_context(content, infographic)

    # Render template
    env = get_jinja_env()
    template = env.get_template("email_base.html")
    raw_html = template.render(**context)

    # Inline CSS
    final_html = inline_css(raw_html)

    # Write output
    output_path = tmp_path(f"email_{date_str}.html")
    output_path.write_text(final_html, encoding="utf-8")
    logger.info(
        f"Email HTML rendered: {len(final_html):,} chars → {output_path}"
    )

    result = {
        "html_path": str(output_path),
        "date": date_str,
        "day_number": content.get("day_number", 1),
        "subject_line": context["subject_line"],
        "has_infographic": bool(infographic.get("infographic_b64") or infographic.get("infographic_svg")),
        "file_size_bytes": len(final_html.encode("utf-8")),
    }
    write_json(tmp_path(f"html_meta_{date_str}.json"), result)

    import json
    print(json.dumps(result))
    return result


if __name__ == "__main__":
    content_data = parse_input_arg()
    main(content_data)
