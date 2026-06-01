"""
utils.py — Shared utilities for the DPDPA Daily Brief pipeline.
All tools import from here for env loading, logging, path resolution, and JSON I/O.
"""

import json
import logging
import os
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Union

from dotenv import load_dotenv

# ── Project root (one level above this file) ──────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"
TMP_DIR.mkdir(exist_ok=True)

# ── Environment ────────────────────────────────────────────────────────────────

def load_env() -> dict:
    """Load .env, validate required keys, return as dict."""
    env_path = PROJECT_ROOT / ".env"
    load_dotenv(dotenv_path=env_path, override=True)

    # Only the vars the 5-step publish pipeline actually uses are required here.
    # GMAIL_SENDER_ADDRESS / GMAIL_APP_PASSWORD are NOT required: they are used
    # solely by the standalone email tools (send_email.py, send_confirmation.py),
    # which carry their own missing-credential guards. Subscriber email delivery
    # runs separately via the Vercel cron + Resend, not this pipeline.
    required = [
        "ANTHROPIC_API_KEY",
        "KIE_API_KEY",
        "SERP_API_KEY",
        "GOOGLE_SHEET_ID",
    ]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            f"Please fill them in {env_path}"
        )
    return dict(os.environ)


def get_env(key: str, default: str = "") -> str:
    """Get a single env variable (loads .env if not already loaded)."""
    load_dotenv(dotenv_path=PROJECT_ROOT / ".env", override=True)
    return os.getenv(key, default)


# ── Date helpers ───────────────────────────────────────────────────────────────

def get_today_iso() -> str:
    """Return today's date as YYYY-MM-DD."""
    return date.today().isoformat()


def parse_date(date_str: str) -> date:
    """Parse YYYY-MM-DD string to date object."""
    return datetime.strptime(date_str, "%Y-%m-%d").date()


# ── Path helpers ───────────────────────────────────────────────────────────────

def tmp_path(filename: str) -> Path:
    """Return absolute path inside .tmp/ directory."""
    return TMP_DIR / filename


def roadmap_path() -> Path:
    return PROJECT_ROOT / "roadmap" / "90_day_roadmap.csv"


# ── JSON I/O ───────────────────────────────────────────────────────────────────

def read_json(path: Union[str, Path]) -> dict:
    """Read and parse a JSON file. Raises with clear message on failure."""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {path}")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in {path}: {e}") from e


def write_json(path: Union[str, Path], data: dict, pretty: bool = True) -> None:
    """Write dict to JSON file atomically."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_file = path.with_suffix(".tmp")
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2 if pretty else None, ensure_ascii=False, default=str)
    tmp_file.replace(path)


# ── Logging ────────────────────────────────────────────────────────────────────

def setup_logger(name: str) -> logging.Logger:
    """Return a structured logger with timestamps."""
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger  # already configured
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%S",
        )
    )
    logger.addHandler(handler)
    return logger


# ── Error logging ──────────────────────────────────────────────────────────────

def log_error(error: Exception, date_str: str, context: str = "") -> None:
    """Append an error entry to .tmp/errors_{date}.log."""
    error_log = tmp_path(f"errors_{date_str}.log")
    with open(error_log, "a", encoding="utf-8") as f:
        timestamp = datetime.utcnow().isoformat()
        f.write(f"[{timestamp}] {context}: {type(error).__name__}: {error}\n")


# ── CLI argument parsing helper ────────────────────────────────────────────────

def parse_input_arg() -> dict:
    """
    Parse --input <path> from CLI args and return loaded JSON.
    Usage: python tools/some_tool.py --input .tmp/something_2026-03-14.json
    """
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to input JSON file")
    args = parser.parse_args()
    return read_json(args.input)


def parse_date_arg() -> str:
    """
    Parse --date <YYYY-MM-DD> from CLI args. Defaults to today.
    """
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--date",
        default=get_today_iso(),
        help="Date in YYYY-MM-DD format (default: today)",
    )
    args = parser.parse_args()
    return args.date
