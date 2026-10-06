// pack.ts — derive a Discovery Pack from the user's raw choices.
//
// The client renders the pack from its own state; the server rebuilds it here
// from just (niche id, selected item ids, three answers), each checked against
// the taxonomy. Anything that doesn't resolve is dropped, so a forged request
// can only ever produce a pack made of our own content.

import { getNiche, TAG_LIB } from "./data";
import { resolveGroups, score, TAG_GROUP } from "./engine";
import { buildRegister, type DiscoveryRegister } from "./register";
import type { AnswerValue, Answers, ItemGroup, ScoreResult } from "./types";

/** Confirmed items, grouped — powers both the on-screen map and the register. */
export function selectedGroups(nicheId: string, selected: Set<string>): ItemGroup[] {
  return resolveGroups(nicheId)
    .map((g) => ({ ...g, items: g.items.filter((i) => selected.has(i.id)) }))
    .filter((g) => g.items.length > 0);
}

export function discoveryRegister(
  nicheId: string,
  nicheName: string,
  selected: Set<string>,
  result: ScoreResult,
): DiscoveryRegister {
  return buildRegister({
    nicheId,
    nicheName,
    groups: selectedGroups(nicheId, selected),
    selectedIds: selected,
    result,
    deps: {
      tagWeight: (t) => TAG_LIB[t]?.weight ?? 1,
      categoryName: (k) => TAG_GROUP[k],
    },
  });
}

const ANSWER_VALUES: ReadonlySet<string> = new Set<AnswerValue>(["yes", "partially", "no", "notsure"]);

export interface ServerPack {
  nicheName: string;
  register: DiscoveryRegister;
}

/** Validate untrusted input and rebuild the pack, or null if it doesn't resolve. */
export function packFromInput(nicheId: unknown, selectedIds: unknown, answers: unknown): ServerPack | null {
  if (typeof nicheId !== "string") return null;
  const niche = getNiche(nicheId);
  if (!niche || !Array.isArray(selectedIds)) return null;

  const valid = new Set(resolveGroups(nicheId).flatMap((g) => g.items.map((i) => i.id)));
  const selected = new Set(selectedIds.filter((id): id is string => typeof id === "string" && valid.has(id)));
  if (selected.size === 0) return null;

  const a = (answers && typeof answers === "object" ? answers : {}) as Record<string, unknown>;
  const pick = (v: unknown) => (typeof v === "string" && ANSWER_VALUES.has(v) ? (v as AnswerValue) : undefined);
  const clean: Answers = { q1: pick(a.q1), q2: pick(a.q2), q3: pick(a.q3) };

  const result = score(nicheId, selected, clean);
  return { nicheName: niche.name, register: discoveryRegister(nicheId, niche.name, selected, result) };
}
