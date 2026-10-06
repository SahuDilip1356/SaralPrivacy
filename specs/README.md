# specs/

One directory per change: `specs/<slug>/{intent,spec,plan}.md`.

- `intent.md` — why, for whom. Goals `G*`, non-goals `NG*`, assumptions `A*`.
- `spec.md` — what the system does. Acceptance criteria `AC*`, each `traces:` a `G*`.
- `plan.md` — how, decomposed. Tasks `T*`, each `implements:` an `AC*` and carries a `verify:` command.

Validate before dispatching agents or opening a PR:

```bash
python3 scripts/validate_chain.py --all specs/
```

CI runs the same command. Chains stay after a feature ships — they are the
record of why the code looks the way it does.

Skip the chain for one-line fixes, dependency bumps, reverts, and spikes.

Templates and full guidance: `~/.claude/skills/spec-chain/`
