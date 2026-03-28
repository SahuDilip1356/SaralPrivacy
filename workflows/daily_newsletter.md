# Daily Newsletter — Master SOP

## Objective
Send a DPDPA educational newsletter to subscribers every weekday at 6:00 AM IST.
Each edition covers one day of the 90-day roadmap: Awareness (1–30) → Understanding (31–60) → Action (61–90).

---

## Inputs Required

| Input | Source |
|---|---|
| Today's date | Auto-derived by n8n |
| Roadmap row | Google Sheets (`GOOGLE_SHEET_ID`) |
| SERP research | SerpAPI (`SERP_API_KEY`) |
| Newsletter content | Claude API (`ANTHROPIC_API_KEY`) |
| Infographic | KIE.ai Nano Banana (`KIE_API_KEY`) |
| Subscriber list | Google Sheets (`SUBSCRIBER_SHEET_ID`) |
| Email delivery | Gmail SMTP (`GMAIL_SENDER_ADDRESS` + `GMAIL_APP_PASSWORD`) |
| Run logging | Notion (`NOTION_API_KEY` + `NOTION_RUNS_DATABASE_ID`) |

---

## n8n Workflow: Node Sequence

```
[1] Schedule Trigger
    Cron: 0 6 * * 1-5   (06:00 IST Mon–Fri)

[2] Code Node: Set Variables
    today_date = new Date().toISOString().split('T')[0]
    project_root = "/Users/sahudilip/Desktop/Product Dev/DPDPA Daily Brief"

[3] Execute Command: Read Roadmap
    Command: python tools/read_roadmap.py --date {{ $json.today_date }}
    Working Dir: {{ $json.project_root }}
    → Picks NEXT unprocessed topic sequentially from Google Sheet / CSV
    → Parses stdout as JSON

[4] IF Node: Skip check
    Condition: {{ $json.skip }} === false
    TRUE branch: continue
    FALSE branch: → [Error Handler] with reason {{ $json.reason }}

[5] Execute Command: Research
    Command: python tools/research.py --input .tmp/roadmap_{{ $json.date }}.json
    Timeout: 60s

[6] Execute Command: Generate Content
    Command: python tools/generate_content.py --input .tmp/research_{{ $json.date }}.json
    Timeout: 90s
    → Content is Hook (overview) + Body (key_points + what_this_means) + CTA (action_items)
    → Written at Class 8 reading level for Indian MSME owners
    → CTA always links to saralprivacy.com/assessment

[7] Execute Command: Generate Infographic
    Command: python tools/generate_infographic.py --input .tmp/content_{{ $json.date }}.json
    Timeout: 60s
    → KIE.ai Nano Banana generates image matching infographic_type from roadmap
    → SaralPrivacy watermark applied via Pillow

[8] Execute Command: Publish to Webapp
    Command: python tools/publish_to_webapp.py --date {{ $json.date }}
    Timeout: 60s
    → Pushes content + infographic (base64) to Appwrite as status: draft
    → Sends approval email to ALL 3 admins simultaneously:
        dilip.sahu@gmail.com | sahudilip1356@gmail.com | saralprivacy@gmail.com
    → ANY ONE admin clicking "Approve & Publish" publishes to saralprivacy.com/briefings/[slug]
    → On approval: sends briefing to up to 300 subscribers via Resend
    → Roadmap row marked sent=TRUE in Google Sheet

[9] Execute Command: Log Entry
    Command: python tools/log_entry.py
      --send-result .tmp/publish_result_{{ $json.date }}.json
      --content .tmp/content_{{ $json.date }}.json
    Timeout: 30s

[Error Handler] (connected to ALL nodes)
    On failure: write .tmp/errors_{date}.log
    Send alert to ADMIN_EMAIL via Gmail node
```

---

## Tool Execution Sequence

```
read_roadmap.py     → .tmp/roadmap_{date}.json
research.py         → .tmp/research_{date}.json
generate_content.py → .tmp/content_{date}.json
generate_infographic.py → .tmp/infographic_{date}.png  (+ _meta.json)
html_builder.py     → .tmp/email_{date}.html  (+ html_meta_{date}.json)
send_email.py       → .tmp/send_result_{date}.json
log_entry.py        → .tmp/log_{date}.json
                    → Notion page created
                    → Google Sheets row marked sent
```

---

## Edge Cases and Error Handling

| Scenario | Behaviour |
|---|---|
| Weekend / public holiday | `read_roadmap.py` returns `skip: true` — n8n IF node stops pipeline |
| Day already sent | `read_roadmap.py` detects sent=TRUE in Sheets — returns `skip: true` |
| SerpAPI unavailable or quota hit | `research.py` returns `knowledge_only: true` — Claude uses training knowledge |
| Claude returns malformed JSON | `generate_content.py` retries up to 2x with stricter prompt |
| KIE.ai Nano Banana fails | `generate_infographic.py` falls back to SVG placeholder |
| Gmail send partially fails | `send_email.py` logs failed recipients in `send_result.json` |
| Notion unavailable | `log_entry.py` logs warning and continues — does not block pipeline |

---

## Cost Estimates (per edition)

| Service | Usage | Approx Cost |
|---|---|---|
| Claude API (Sonnet) | ~4,000 tokens | ~$0.003 |
| SerpAPI | 2 queries | ~$0.002 |
| KIE.ai Nano Banana 2 | 1 image @ 1024px | ~$0.045 |
| Gmail SMTP | Free up to 500/day | $0 |
| **Total per edition** | | **~$0.05** |

---

## Quota Limits

- **SerpAPI**: 100 queries/month free → 2/day × 20 weekdays = 40/month ✓
- **Gmail SMTP**: 500 outgoing emails/day free → upgrade to SendGrid if list > 500
- **KIE.ai**: Pay-per-use, no daily cap
- **Claude API**: Pay-per-use, no daily cap

---

## Setup Checklist (one-time)

- [ ] Fill in all `.env` values (see `.env` file)
- [ ] Enable 2FA on Gmail, generate App Password → `GMAIL_APP_PASSWORD`
- [ ] Get KIE API key from https://kie.ai/api-key → `KIE_API_KEY`
- [ ] Create Google Sheet from `roadmap/90_day_roadmap.csv` → copy Sheet ID → `GOOGLE_SHEET_ID`
- [ ] Create subscriber Google Sheet (columns: email, name, status, subscribed_at) → `SUBSCRIBER_SHEET_ID`
- [ ] Create Notion database for run logs → `NOTION_RUNS_DATABASE_ID`
- [ ] Place `credentials.json` (Google service account) in project root
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Import n8n workflow and set working directory
- [ ] Test full pipeline: `python tools/read_roadmap.py --date $(date +%F)`

---

## Test Commands (run in sequence)

```bash
cd "/Users/sahudilip/Desktop/Product Dev/DPDPA Daily Brief"

# Step 1: Read roadmap
python tools/read_roadmap.py --date $(date +%F)

# Step 2: Research
python tools/research.py --input .tmp/roadmap_$(date +%F).json

# Step 3: Generate content
python tools/generate_content.py --input .tmp/research_$(date +%F).json

# Step 4: Generate infographic
python tools/generate_infographic.py --input .tmp/content_$(date +%F).json

# Step 5: Build HTML
python tools/html_builder.py --input .tmp/content_$(date +%F).json

# Step 6: Preview in browser
open .tmp/email_$(date +%F).html

# Step 7: Send test (to yourself only)
python tools/send_email.py \
  --html .tmp/email_$(date +%F).html \
  --content .tmp/content_$(date +%F).json \
  --recipients "your-email@gmail.com"
```
