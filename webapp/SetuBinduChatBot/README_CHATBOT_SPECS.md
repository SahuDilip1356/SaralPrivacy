# SaralPrivacy Chatbot Specs — Package Index

**Here is the short version:** These files are the blueprint for a motion-graphic Setu guide that answers only from saralprivacy.com and walks users to the right page.

## Start here

| Priority | File | What it is |
|----------|------|------------|
| **0 — Canonical** | `SETU_BINDU_CHATBOT_SPEC.md` | **The shipped spec (v2.4).** Supersedes the V2 motion spec below for anything build-related |
| **0 — Canonical** | `SETU_OUTCOME_LAYER_SPEC.md` | Enhancement spec v1.0 — outcome lanes, human handoff, contextual openers, trust chrome. Extends v2.4; branch `feature/setu-outcome-layer` |
| **1 — Read first** | `SaralPrivacy_Motion_Graphic_Chatbot_Spec_V2.md` | Strong product + motion + site-only spec |
| 2 | `config/site-routing.json` | Topic → URL map |
| 3 | `config/motion-states.json` | Rive animation state bridge |
| 4 | `prompts/system-prompt-v2.md` | Production LLM prompt (site-only) |
| 5 | `prompts/tool-definitions.json` | Function-calling tools |
| 6 | `eval/golden-questions.json` | QA cases for routing + refusal |
| Archive | `SaralPrivacy_Setu_Bindu_Chatbot_Spec.md` | V1 text-first spec |
| Archive | `prompts/system-prompt.md` | V1 prompt |
| Brand | `setu_bindu_pro_dpdpa_character_bibleV3.md` | Voice + character bible |

## Product boundary (do not forget)

- **In:** Concepts and pages on saralprivacy.com  
- **Out:** Anything not on the site, legal advice, open-web answers  

## Folder layout

```
setubindu/
├── SaralPrivacy_Motion_Graphic_Chatbot_Spec_V2.md
├── SaralPrivacy_Setu_Bindu_Chatbot_Spec.md
├── README_CHATBOT_SPECS.md
├── config/
│   ├── site-routing.json
│   └── motion-states.json
├── prompts/
│   ├── system-prompt-v2.md
│   ├── system-prompt.md
│   └── tool-definitions.json
├── eval/
│   └── golden-questions.json
└── setu_bindu_pro_dpdpa_character_bibleV3.md
```

## How to download / share

On your Mac, open:

`/Users/sahudilip/Downloads/SetuBindu/setubindu`

Zip the folder and upload to Drive / email / GitHub if you need a shareable link.
