/**
 * Fetches JSON for the current issue.
 *
 * @param {String|Number} issueId - The ID of the issue to fetch.
 * @param {String} include - Additional data to include in the request. Defaults to 'journals'.
 * @param {String} baseUrl - The base URL for the request. Defaults to the current window location.
 * @param {{key?: string, username?: string, password?: string}} auth 
 *  - Authentication object containing API key or basic auth credentials username and password.
 * @returns {Promise<Object>} - The issue JSON data.
 * @throws {Error} - Throws if fetching or parsing fails.
 */
export default async function fetchIssueJson(
  issueId,
  include = 'journals',
  baseUrl = window.location.origin,
  auth = {}
) {
  try {
    const url = new URL(`/issues/${issueId}.json`, baseUrl)
    const params = { include }
    if (auth.key) {
      params.key = auth.key
    }
    url.search = new URLSearchParams(params).toString()

    const headers = {}
    if (auth.key) {
      headers['X-Redmine-API-Key'] = auth.key
    } else if (auth.username && auth.password) {
      const credentials = btoa(`${auth.username}:${auth.password}`)
      headers.Authorization = `Basic ${credentials}`
    }

    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error('Failed to fetch json data')

    const data = await res.json()
    if (!data.issue) throw new Error('Invalid JSON data because issue is missing')
    if (include === 'journals' && !Array.isArray(data.issue.journals)) {
      throw new Error('Invalid JSON data because journals is not an array')
    }

    return data
  } catch (e) {
    throw new Error('Error fetching issue JSON: ' + e.message)
  }
}
