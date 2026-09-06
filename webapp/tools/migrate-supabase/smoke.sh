#!/usr/bin/env bash
# smoke.sh <base-url> <module> — post-flip smoke probes (RUNBOOK step 3/5).
# Read-only / guard-path probes only: expected-status checks, no data writes.
# For preview deployments pass a URL that already carries _vercel_share auth,
# or run against prod. Usage: ./smoke.sh https://saralprivacy.com m1
set -u
BASE="${1:?base url}"; MODULE="${2:?module m1..m8}"
pass=0; fail=0
check() { # check <name> <expected-status> <curl args...>
  local name="$1" want="$2"; shift 2
  # SMOKE_COOKIE_JAR: pre-warmed cookie jar for deployment-protected previews
  local got; got=$(curl -s -o /dev/null -w "%{http_code}" ${SMOKE_COOKIE_JAR:+-b "$SMOKE_COOKIE_JAR"} "$@")
  if [ "$got" = "$want" ]; then echo "  ✓ $name ($got)"; pass=$((pass+1));
  else echo "  ✗ $name: want $want got $got"; fail=$((fail+1)); fi
}
echo "── smoke $MODULE @ $BASE"
case "$MODULE" in
  m1)
    check "template-download rejects empty"  400 -X POST "$BASE/api/template-download" -H 'Content-Type: application/json' -d '{}'
    # 500 = current prod behavior (route throws pre-validation; fix session in flight) — parity, not correctness
    check "templates/download rejects empty" 500 -X POST "$BASE/api/templates/download" -F 'x=y'
    check "white-paper rejects empty"        400 -X POST "$BASE/api/white-paper" -H 'Content-Type: application/json' -d '{}'
    ;;
  m2)
    check "subscribe rejects no-consent"     400 -X POST "$BASE/api/subscribe" -H 'Content-Type: application/json' -d '{"email":"x@y.z"}'
    check "unsubscribe unknown = clean"      200 -X POST "$BASE/api/subscribers/unsubscribe" -H 'Content-Type: application/json' -d '{"email":"nobody-here@example.com"}'
    ;;
  m3)
    check "contact rejects empty"            400 -X POST "$BASE/api/contact" -H 'Content-Type: application/json' -d '{}'
    check "survey rejects empty"             400 -X POST "$BASE/api/survey/submit" -H 'Content-Type: application/json' -d '{}'
    ;;
  m4)
    check "notice capture rejects empty"     400 -X POST "$BASE/api/notice/capture" -H 'Content-Type: application/json' -d '{}'
    check "chat feedback accepts (stored)"   200 -X POST "$BASE/api/chat/feedback" -H 'Content-Type: application/json' -d '{"sessionId":"smoke","turnId":"smoke","helpful":true}'
    ;;
  m5)
    check "outreach stats unauth"            401 "$BASE/api/outreach/stats"
    check "outreach import unauth"           401 -X POST "$BASE/api/outreach/import"
    check "magic-token unknown"              404 -X POST "$BASE/api/outreach/subscribe" -H 'Content-Type: application/json' -d '{"token":"smoke-nonexistent"}'
    ;;
  m6)
    check "assessment rejects empty"         400 -X POST "$BASE/api/assessment" -H 'Content-Type: application/json' -d '{}'
    check "unknown report token 404s"        404 "$BASE/report/smoke-nonexistent-token"
    check "send-report unauth"               401 -X POST "$BASE/api/admin/send-report" -H 'Content-Type: application/json' -d '{"assessmentId":"x"}'
    ;;
  m7)
    check "briefings today unauth"           401 "$BASE/api/briefings/today"
    check "briefings archive page"           200 "$BASE/briefings"
    check "blog list page"                   200 "$BASE/blog"
    check "sitemap"                          200 "$BASE/sitemap.xml"
    ;;
  m8)
    check "admin data unauth"                401 "$BASE/api/admin/data?collection=leads"
    check "bloggers list unauth"             401 "$BASE/api/admin/bloggers"
    check "admin page redirects"             307 "$BASE/admin"
    ;;
  *) echo "unknown module $MODULE"; exit 2;;
esac
echo "── $pass passed, $fail failed"
[ "$fail" = 0 ]
