// Fetching JSON from a transit authority's API, with its API key attached the
// way the authority's `api` entry says (header and/or query parameter).

export class TransitApiError extends Error {}

// `params` values may be strings, numbers or arrays (arrays are comma-joined).
export async function getJson(authority, path, params = {}, { signal } = {}) {
  const { baseUrl, apiKeyHeader, apiKeyQueryParam } = authority.api
  const url = new URL(baseUrl.replace(/\/+$/, '') + path)
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(name, Array.isArray(value) ? value.join(',') : String(value))
  }
  const headers = {}
  if (authority.apiKey) {
    if (apiKeyHeader) headers[apiKeyHeader] = authority.apiKey
    if (apiKeyQueryParam) url.searchParams.set(apiKeyQueryParam, authority.apiKey)
  }

  let response
  try {
    response = await fetch(url, { headers, signal })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new TransitApiError(`Could not reach the ${authority.name} API.`)
  }
  if (response.status === 429) throw new TransitApiError(`Too many requests to the ${authority.name} API. Try again in a minute.`)
  if (!response.ok) throw new TransitApiError(`The ${authority.name} API answered ${response.status}.`)
  return response.json()
}
