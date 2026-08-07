// Live smoke of the chat core (route.ts minus Next plumbing) — dev tool for
// prompt/retrieval tuning. Needs ANTHROPIC_API_KEY in the environment.
// Run: export $(grep '^ANTHROPIC_API_KEY=' .env.local) && \
//      node --experimental-strip-types scripts/smoke-chat.mts "your question" [pageUrl]

import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

import { planTurn, buildGroundingBlock, buildMeta } from "../lib/chat/orchestrate.ts";
import { CHAT_MODEL, buildSystemPrompt, buildTurnNotes } from "../lib/chat/system-prompt.ts";
import { createInitialState } from "../lib/chat/journeys.ts";

const message = process.argv[2] ?? "Do I need consent to send marketing emails to my existing customers?";
const pageUrl = process.argv[3] ?? "/";

const state = createInitialState("smoke", pageUrl);
const plan = planTurn(message, state, pageUrl);
const meta = buildMeta(plan);
console.log("REFUSE:", plan.refuse, "| JOURNEY:", plan.journey, "| CONF:", plan.retrieval.confidence, "| INDUSTRY:", plan.industry ?? "—");

if (plan.refuse) {
  console.log("\n(canned refusal path — model not called)");
  console.log(JSON.stringify(meta, null, 1));
  process.exit(0);
}

const t0 = Date.now();
const result = streamText({
  model: anthropic(CHAT_MODEL),
  system: buildSystemPrompt(),
  messages: [
    {
      role: "user",
      content: `${buildTurnNotes({ piiWarning: plan.piiWarning, refusalForced: false, factsConfirmed: state.factsConfirmed, pageUrl })}\n\n${buildGroundingBlock(plan)}\n\n<user_message>\n${message}\n</user_message>`,
    },
  ],
  maxOutputTokens: 600,
});

let firstToken = 0;
let text = "";
for await (const chunk of result.textStream) {
  if (!firstToken) firstToken = Date.now() - t0;
  text += chunk;
}
console.log(`\nFIRST TOKEN: ${firstToken}ms | TOTAL: ${Date.now() - t0}ms\n`);
console.log("--- SETU SAYS ---\n" + text);
console.log(
  "\n--- SERVER META ---\n" +
    JSON.stringify(
      {
        citations: meta.citations,
        actions: meta.actions,
        confidence: meta.confidence,
        followups: meta.suggestedFollowups,
        animation: meta.animation,
      },
      null,
      1
    )
);
