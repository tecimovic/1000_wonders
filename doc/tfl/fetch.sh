#!/bin/bash
# Re-downloads TfL's Unified API spec (Swagger 2.0).
#
#   doc/tfl/fetch.sh
set -euo pipefail
cd "$(dirname "$0")"
curl -fsS https://api.tfl.gov.uk/swagger/docs/v1 | python3 -m json.tool > swagger.json
echo "swagger.json"
