#!/bin/bash
# Re-downloads the schema of Entur's Journey Planner v3 GraphQL API and turns
# it into readable GraphQL SDL.
#
#   doc/entur/fetch.sh
#
# Entur asks every client to identify itself with an ET-Client-Name header
# ("<company>-<application>"). Set ET_CLIENT_NAME to override the default.
set -euo pipefail
cd "$(dirname "$0")"
CLIENT="${ET_CLIENT_NAME:-local-docs-fetch}"

QUERY='query { __schema { queryType { name } mutationType { name } types { kind name description
  fields(includeDeprecated: true) { name description isDeprecated deprecationReason args { name description defaultValue type { ...T } } type { ...T } }
  inputFields { name description defaultValue type { ...T } }
  enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason }
  possibleTypes { name } interfaces { name } } } }
fragment T on __Type { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } } }'

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
python3 -c 'import json,sys; print(json.dumps({"query": sys.argv[1]}))' "$QUERY" |
  curl -fsS https://api.entur.io/journey-planner/v3/graphql \
    -H 'Content-Type: application/json' -H "ET-Client-Name: $CLIENT" -d @- > "$TMP"
python3 introspection-to-sdl.py "$TMP" > journey-planner-v3.graphql
echo "journey-planner-v3.graphql"
