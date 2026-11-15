#!/bin/bash
# Re-downloads the MBTA / GTFS developer documentation into this folder.
# Needs: curl, pandoc, gh (GitHub CLI), python3.
#
#   doc/mbta/fetch.sh
set -euo pipefail
cd "$(dirname "$0")"
today=$(date +%F)

# --- mbta.com developer pages → Markdown -------------------------------------
# $1 = path under /developers, $2 = output file, $3 = sed line ranges to keep
# (the pages repeat sidebar content after the main text, so we keep only the
# main part; check the result when the site layout changes).
page() {
  local tmp
  tmp=$(mktemp)
  curl -fsS "https://www.mbta.com/developers/$1" \
    | pandoc -f html -t gfm-raw_html --wrap=none \
    | sed -E 's/!\[[^]]*\]\(data:[^)]*\)//g' | cat -s > "$tmp"
  {
    echo "<!-- Source: https://www.mbta.com/developers/$1 — downloaded $today, converted to Markdown -->"
    echo
    sed -n "$3" "$tmp"
  } > "$2"
  rm -f "$tmp"
  echo "  $2"
}

echo "mbta.com pages:"
page v3-api                        mbta-v3-api-overview.md               '1,/^## Real-Time Display Guidelines$/{/^## Real-Time Display Guidelines$/!p}'
page v3-api/best-practices         mbta-v3-api-best-practices.md         '1,/^## Real-Time Display Guidelines$/{/^## Real-Time Display Guidelines$/!p}'
page v3-api/streaming              mbta-v3-api-streaming.md              '1,/^## Get Help/{/^## Get Help/!p};/^## Event Types$/,/^## Developers$/{/^## Developers$/!p}'
page v3-api/versioning             mbta-v3-api-versioning.md             '1,/^## Get Help/{/^## Get Help/!p};/^## Backward-Compatible/,/^## Developers$/{/^## Developers$/!p}'
page gtfs                          mbta-gtfs-page.md                     '1,/^## Get Help/{/^## Get Help/!p}'
page gtfs-realtime                 mbta-gtfs-realtime-page.md            '1,/^## Get Help/{/^## Get Help/!p}'
page real-time-display-guidelines  mbta-real-time-display-guidelines.md  '1,/^## Developers$/{/^## Developers$/!p}'

# --- MBTA's GTFS extensions (github.com/mbta/gtfs-documentation) -------------
echo "MBTA GTFS documentation:"
for f in gtfs gtfs-realtime; do
  {
    echo "<!-- Source: https://github.com/mbta/gtfs-documentation/blob/master/reference/$f.md — downloaded $today -->"
    echo
    gh api "repos/mbta/gtfs-documentation/contents/reference/$f.md" -H "Accept: application/vnd.github.raw"
  } > "mbta-$f-reference.md"
  echo "  mbta-$f-reference.md"
done

# --- The GTFS standard itself (github.com/google/transit, shown on gtfs.org) --
echo "GTFS standard:"
for pair in \
  "gtfs/spec/en/reference.md:gtfs-schedule-reference.md" \
  "gtfs-realtime/spec/en/reference.md:gtfs-realtime-reference.md" \
  "gtfs-realtime/spec/en/service-alerts.md:gtfs-realtime-service-alerts.md" \
  "gtfs-realtime/spec/en/trip-updates.md:gtfs-realtime-trip-updates.md"; do
  src=${pair%%:*}; out=${pair##*:}
  {
    echo "<!-- Source: https://github.com/google/transit/blob/master/$src (gtfs.org) — downloaded $today -->"
    echo
    gh api "repos/google/transit/contents/$src" -H "Accept: application/vnd.github.raw"
  } > "$out"
  echo "  $out"
done

# --- V3 API OpenAPI spec + generated digest ----------------------------------
echo "V3 API spec:"
curl -fsS -o swagger.json https://api-v3.mbta.com/docs/swagger/swagger.json
python3 swagger-to-md.py swagger.json > mbta-v3-api-reference.md
echo "  swagger.json, mbta-v3-api-reference.md"
