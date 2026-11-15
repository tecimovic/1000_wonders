#!/bin/bash
# Re-downloads BKK's FUTÁR API spec and regenerates the Markdown digest.
# Needs: curl, python3 with PyYAML.
#
#   doc/bkk/fetch.sh
set -euo pipefail
cd "$(dirname "$0")"
curl -fsS -o futar-openapi.yaml https://opendata.bkk.hu/docs/futar-openapi.yaml
python3 openapi-to-md.py futar-openapi.yaml > futar-api-reference.md
echo "futar-openapi.yaml, futar-api-reference.md"
