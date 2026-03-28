"""
research.py — Fetch real-time web research using SerpAPI.

Usage:
    python tools/research.py --input .tmp/roadmap_2026-03-14.json

Output:
    Writes .tmp/research_{date}.json
"""

import sys
import time
from datetime import datetime, timezone
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

logger = setup_logger("research")

SERP_API_URL = "https://serpapi.com/search.json"
MAX_RESULTS_PER_QUERY = 6
QUERY_DELAY_SECONDS = 2  # be polite to SerpAPI


# ── SerpAPI call ───────────────────────────────────────────────────────────────

def search_serp(query: str, api_key: str) -> list[dict]:
    """Call SerpAPI and return organic results."""
    params = {
        "q": query,
        "api_key": api_key,
        "engine": "google",
        "num": MAX_RESULTS_PER_QUERY,
        "gl": "in",          # India results
        "hl": "en",
        "safe": "active",
    }
    try:
        resp = requests.get(SERP_API_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        organic = data.get("organic_results", [])
        logger.info(f"Query '{query[:60]}' → {len(organic)} results")
        return organic
    except requests.RequestException as e:
        logger.error(f"SerpAPI request failed: {e}")
        return []


def extract_snippets(results: list[dict]) -> list[dict]:
    """Extract clean snippet objects from raw SerpAPI results."""
    snippets = []
    for r in results:
        snippet = r.get("snippet", "").strip()
        if not snippet:
            continue
        snippets.append({
            "title": r.get("title", ""),
            "url": r.get("link", ""),
            "snippet": snippet,
            "source": r.get("source", ""),
            "position": r.get("position", 0),
        })
    return snippets


def score_relevance(snippet: str, topic: str) -> float:
    """Simple keyword overlap relevance score (0.0–1.0)."""
    topic_words = set(topic.lower().split())
    snippet_words = set(snippet.lower().split())
    if not topic_words:
        return 0.5
    overlap = len(topic_words & snippet_words)
    return min(overlap / len(topic_words), 1.0)


def deduplicate(sources: list[dict]) -> list[dict]:
    """Remove duplicate URLs."""
    seen = set()
    unique = []
    for s in sources:
        url = s.get("url", "")
        if url not in seen:
            seen.add(url)
            unique.append(s)
    return unique


# ── Fallback: no SerpAPI key ───────────────────────────────────────────────────

def build_fallback_research(roadmap: dict) -> dict:
    """
    When SerpAPI is unavailable, return minimal structure.
    Claude will use its training knowledge in generate_content.py.
    """
    logger.warning("No SerpAPI key — using knowledge-only mode")
    return {
        "topic_data": roadmap,
        "sources": [],
        "raw_snippets": "",
        "knowledge_only": True,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "query_count": 0,
    }


# ── Main ───────────────────────────────────────────────────────────────────────

def main(roadmap: dict) -> dict:
    load_env()
    api_key = get_env("SERP_API_KEY")
    date_str = roadmap.get("date", "unknown")

    if not api_key:
        result = build_fallback_research(roadmap)
        write_json(tmp_path(f"research_{date_str}.json"), result)
        return result

    topic = roadmap.get("topic", "")
    research_query = roadmap.get("research_query", topic)
    concept = roadmap.get("concept", "")

    # Build two queries: primary (specific) + secondary (broader context)
    queries = [
        research_query,
        f"DPDPA India {topic} SMB business compliance",
    ]

    all_sources = []
    for i, query in enumerate(queries):
        if i > 0:
            time.sleep(QUERY_DELAY_SECONDS)
        results = search_serp(query, api_key)
        snippets = extract_snippets(results)
        for s in snippets:
            s["relevance_score"] = score_relevance(s["snippet"], topic)
            s["query"] = query
        all_sources.extend(snippets)

    sources = deduplicate(all_sources)
    sources.sort(key=lambda x: x["relevance_score"], reverse=True)

    # Build concatenated text for the Claude prompt
    raw_snippets = "\n\n".join(
        f"[{s['title']}] ({s['url']})\n{s['snippet']}"
        for s in sources[:8]
    )

    result = {
        "topic_data": roadmap,
        "sources": sources,
        "raw_snippets": raw_snippets,
        "knowledge_only": False,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "query_count": len(queries),
    }

    output_path = tmp_path(f"research_{date_str}.json")
    write_json(output_path, result)
    logger.info(f"Research complete: {len(sources)} sources → {output_path}")
    return result


if __name__ == "__main__":
    roadmap_data = parse_input_arg()
    main(roadmap_data)
