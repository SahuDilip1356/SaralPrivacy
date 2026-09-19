// Which question a 👎 is about — the failure-turn log (decisions D2).
//
// Feedback buttons render on every completed Setu turn, not just the latest,
// so "the last thing the user typed" can be a different question entirely.
// Logging that pairs an answer with the wrong question, and the failure log
// exists to show which questions Setu answers badly.

export interface TranscriptTurn {
  id: string;
  role: "user" | "setu";
  text: string;
}

/**
 * The user message that prompted `turnId`: the nearest user turn BEFORE it.
 * Returns "" when the turn is not in the transcript (e.g. the session was
 * cleared under it) — an empty question is honest, the latest question would
 * be a confident wrong row.
 */
export function questionForTurn(messages: readonly TranscriptTurn[], turnId: string): string {
  const at = messages.findIndex((m) => m.id === turnId);
  for (let i = at - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].text;
  }
  return "";
}
