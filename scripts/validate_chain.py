#!/usr/bin/env python3
"""Validate a spec-chain: intent.md -> spec.md -> plan.md.

Checks traceability (no orphan goals, no uncovered criteria, no unjustified
tasks), dependency-graph sanity, and task executability. Exits non-zero on any
error, so it works unchanged as a pre-push hook and as a CI gate.

Usage:
    validate_chain.py specs/consent-expiry/
    validate_chain.py --all specs/
    validate_chain.py --all specs/ --json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# "### AC4 — Processing is blocked"  /  "### T1 - Add index"  /  "### G2: thing"
ID_RE = re.compile(r"^###\s+(NG|AC|G|A|T)(\d+)\b\s*[—–:-]?\s*(.*)$")
FIELD_RE = re.compile(r"^\s*[-*]\s+([a-z_]+)\s*:\s*(.*)$")
REF_SPLIT_RE = re.compile(r"[,\s]+")

MAX_FILES_PER_TASK = 5
VALID_RISK = {"tier1", "tier2"}


class Block:
    __slots__ = ("id", "kind", "title", "fields", "line")

    def __init__(self, bid: str, kind: str, title: str, line: int) -> None:
        self.id = bid
        self.kind = kind
        self.title = title.strip()
        self.fields: dict[str, str] = {}
        self.line = line


def parse(path: Path) -> tuple[dict[str, Block], list[str]]:
    """Return {id: Block} and a list of duplicate-id complaints."""
    blocks: dict[str, Block] = {}
    dupes: list[str] = []
    current: Block | None = None
    last_field: str | None = None

    for lineno, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        m = ID_RE.match(raw)
        if m:
            kind, num, title = m.group(1), m.group(2), m.group(3)
            bid = f"{kind}{num}"
            if bid in blocks:
                dupes.append(f"{path.name}:{lineno} duplicate id {bid}")
            current = Block(bid, kind, title, lineno)
            blocks[bid] = current
            last_field = None
            continue

        if current is None:
            continue

        if raw.startswith("#"):  # a plain heading ends the block
            current = None
            last_field = None
            continue

        f = FIELD_RE.match(raw)
        if f:
            last_field = f.group(1)
            current.fields[last_field] = f.group(2).strip()
        elif last_field and raw.strip() and raw[:1].isspace():
            current.fields[last_field] += " " + raw.strip()

    return blocks, dupes


def refs(block: Block, field: str) -> list[str]:
    raw = block.fields.get(field, "").strip()
    if not raw or raw.lower() in {"none", "n/a", "-"}:
        return []
    return [p for p in REF_SPLIT_RE.split(raw) if p]


def find_cycle(graph: dict[str, list[str]]) -> list[str] | None:
    WHITE, GREY, BLACK = 0, 1, 2
    color = dict.fromkeys(graph, WHITE)
    stack: list[str] = []

    def walk(node: str) -> list[str] | None:
        color[node] = GREY
        stack.append(node)
        for nxt in graph.get(node, []):
            if nxt not in color:
                continue
            if color[nxt] == GREY:
                return stack[stack.index(nxt):] + [nxt]
            if color[nxt] == WHITE:
                found = walk(nxt)
                if found:
                    return found
        stack.pop()
        color[node] = BLACK
        return None

    for node in graph:
        if color[node] == WHITE:
            found = walk(node)
            if found:
                return found
    return None


def validate(chain_dir: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    paths = {name: chain_dir / f"{name}.md" for name in ("intent", "spec", "plan")}
    missing = [p.name for p in paths.values() if not p.is_file()]
    if missing:
        return [f"{chain_dir}: missing {', '.join(missing)}"], []

    intent, d1 = parse(paths["intent"])
    spec, d2 = parse(paths["spec"])
    plan, d3 = parse(paths["plan"])
    warnings.extend(d1 + d2 + d3)

    goals = {k: v for k, v in intent.items() if v.kind == "G"}
    assumptions = {k: v for k, v in intent.items() if v.kind == "A"}
    criteria = {k: v for k, v in spec.items() if v.kind == "AC"}
    tasks = {k: v for k, v in plan.items() if v.kind == "T"}

    # --- intent.md -------------------------------------------------------
    if not goals:
        errors.append("intent.md: no goals found (expected '### G1 — ...')")
    if len(assumptions) < 3:
        warnings.append(
            f"intent.md: only {len(assumptions)} assumption(s); "
            "3 or more is the bar — unexamined beliefs are where plans break"
        )
    for aid, a in sorted(assumptions.items()):
        if not a.fields.get("validate_by"):
            warnings.append(
                f"intent.md:{a.line} {aid} has no 'validate_by' — "
                "an assumption you cannot test is a decision in disguise"
            )

    # --- spec.md ---------------------------------------------------------
    if not criteria:
        errors.append("spec.md: no acceptance criteria found (expected '### AC1 — ...')")

    covered_goals: set[str] = set()
    for acid, ac in sorted(criteria.items()):
        traced = refs(ac, "traces")
        if not traced:
            errors.append(f"spec.md:{ac.line} {acid} has no 'traces:' to a goal")
        for gid in traced:
            if gid not in goals:
                errors.append(
                    f"spec.md:{ac.line} {acid} traces to {gid}, "
                    "which is not a goal in intent.md"
                )
            else:
                covered_goals.add(gid)
        for part in ("given", "when", "then"):
            if not ac.fields.get(part):
                errors.append(f"spec.md:{ac.line} {acid} is missing '{part}:'")

    for gid, g in sorted(goals.items()):
        if gid not in covered_goals:
            errors.append(
                f"intent.md:{g.line} {gid} ({g.title!r}) has no acceptance "
                "criterion — it will not get built"
            )

    # --- plan.md ---------------------------------------------------------
    if not tasks:
        errors.append("plan.md: no tasks found (expected '### T1 — ...')")

    implemented: set[str] = set()
    graph: dict[str, list[str]] = {}

    for tid, t in sorted(tasks.items()):
        impl = refs(t, "implements")
        if not impl:
            errors.append(
                f"plan.md:{t.line} {tid} implements no acceptance criterion — "
                "that is scope creep; add an AC to spec.md or drop the task"
            )
        for acid in impl:
            if acid not in criteria:
                errors.append(
                    f"plan.md:{t.line} {tid} implements {acid}, "
                    "which is not in spec.md"
                )
            else:
                implemented.add(acid)

        if not t.fields.get("verify"):
            errors.append(
                f"plan.md:{t.line} {tid} has no 'verify:' command — "
                "a task an agent cannot check is a wish, not a task"
            )

        deps = refs(t, "depends_on")
        for dep in deps:
            if dep not in tasks:
                errors.append(f"plan.md:{t.line} {tid} depends on {dep}, which does not exist")
        graph[tid] = [d for d in deps if d in tasks]

        risk = t.fields.get("risk", "").strip().lower()
        if risk not in VALID_RISK:
            warnings.append(
                f"plan.md:{t.line} {tid} has no valid 'risk:' "
                f"({' or '.join(sorted(VALID_RISK))}) — review routing will default to human"
            )

        files = refs(t, "files")
        if len(files) > MAX_FILES_PER_TASK:
            warnings.append(
                f"plan.md:{t.line} {tid} touches {len(files)} files "
                f"(>{MAX_FILES_PER_TASK}) — likely too big for one agent context; split it"
            )
        if t.fields.get("size", "").strip().upper() == "L":
            warnings.append(
                f"plan.md:{t.line} {tid} is size L — 'L' is a signal to split, not a size"
            )

    for acid, ac in sorted(criteria.items()):
        if acid not in implemented:
            errors.append(
                f"spec.md:{ac.line} {acid} ({ac.title!r}) is implemented by no task"
            )

    cycle = find_cycle(graph)
    if cycle:
        errors.append("plan.md: dependency cycle " + " -> ".join(cycle))

    return errors, warnings


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate spec-chain artifacts.")
    ap.add_argument("path", help="a chain directory, or the parent dir with --all")
    ap.add_argument("--all", action="store_true", help="validate every chain under path")
    ap.add_argument("--json", action="store_true", help="machine-readable output for CI")
    args = ap.parse_args()

    root = Path(args.path)
    if not root.is_dir():
        print(f"not a directory: {root}", file=sys.stderr)
        return 2

    if args.all:
        chains = sorted(p.parent for p in root.glob("*/intent.md"))
        if not chains:
            print(f"no chains found under {root} (looking for */intent.md)", file=sys.stderr)
            return 0
    else:
        chains = [root]

    report: dict[str, dict[str, list[str]]] = {}
    total_errors = 0

    for chain in chains:
        errors, warnings = validate(chain)
        total_errors += len(errors)
        report[str(chain)] = {"errors": errors, "warnings": warnings}

    if args.json:
        print(json.dumps({"ok": total_errors == 0, "chains": report}, indent=2))
        return 1 if total_errors else 0

    for chain, res in report.items():
        if not res["errors"] and not res["warnings"]:
            print(f"PASS  {chain}")
            continue
        print(f"\n{'FAIL' if res['errors'] else 'WARN'}  {chain}")
        for e in res["errors"]:
            print(f"  ERROR  {e}")
        for w in res["warnings"]:
            print(f"  warn   {w}")

    if total_errors:
        print(f"\n{total_errors} error(s). Fix the chain before dispatching agents.")
        return 1
    print("\nChain valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
