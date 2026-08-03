// Two-phase stream protocol (spec §5.5) shared by /api/chat and the widget.
// Phase A: plain text tokens. Phase B: META_SENTINEL + ChatMeta JSON.

import type { ChatMeta } from "./orchestrate.ts";

/** U+001E RECORD SEPARATOR — never appears in prose or JSON. */
export const META_SENTINEL = "\u001E";

export interface ParsedChatResponse {
  text: string;
  meta: ChatMeta | null;
}

/** Split a fully-received response body into text + meta. */
export function parseChatResponse(raw: string): ParsedChatResponse {
  const at = raw.indexOf(META_SENTINEL);
  if (at === -1) return { text: raw, meta: null };
  const text = raw.slice(0, at);
  try {
    return { text, meta: JSON.parse(raw.slice(at + 1)) as ChatMeta };
  } catch {
    return { text, meta: null };
  }
}
