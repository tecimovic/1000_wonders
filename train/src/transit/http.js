// Fetching JSON from a transit authority's API, with its API key attached the
// way the authority's `api` entry says (header and/or query parameter), plus
// any fixed `api.headers` (e.g. Entur's ET-Client-Name).

export class TransitApiError extends Error {}

function buildRequest(authority, path, params) {
  const { baseUrl, apiKeyHeader, apiKeyQueryParam, headers: fixedHeaders } = authority.api
  const url = new URL(baseUrl.replace(/\/+$/, '') + path)
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(name, Array.isArray(value) ? value.join(',') : String(value))
  }
  const headers = { ...fixedHeaders }
  if (authority.apiKey) {
    if (apiKeyHeader) headers[apiKeyHeader] = authority.apiKey
    if (apiKeyQueryParam) url.searchParams.set(apiKeyQueryParam, authority.apiKey)
  }
  return { url, headers }
}

async function send(authority, url, init) {
  let response
  try {
    response = await fetch(url, init)
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new TransitApiError(`Could not reach the ${authority.name} API.`)
  }
  if (response.status === 429) throw new TransitApiError(`Too many requests to the ${authority.name} API. Try again in a minute.`)
  if (!response.ok) throw new TransitApiError(`The ${authority.name} API answered ${response.status}.`)
  return response.json()
}

// `params` values may be strings, numbers or arrays (arrays are comma-joined).
export async function getJson(authority, path, params = {}, { signal } = {}) {
  const { url, headers } = buildRequest(authority, path, params)
  return send(authority, url, { headers, signal })
}

// POSTs `body` as JSON (e.g. a GraphQL query) and returns the JSON answer.
export async function postJson(authority, path, body, { signal } = {}) {
  const { url, headers } = buildRequest(authority, path, {})
  return send(authority, url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal
  })
}
