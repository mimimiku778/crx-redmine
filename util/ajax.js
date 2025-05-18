/**
 * Fetches the response from the given URL and returns the text.
 *
 * @param {String} url - The URL to fetch.
 * @param {String} method - The HTTP method. Defaults to 'GET'.
 * @param {String} body - The request body (optional).
 * @param {String} csfrToken - The CSRF token (optional). defaults to the meta tag value.
 * @returns {Promise<String>} - The response text or false on error.
 * @throws {Error} - Throws an error if the fetch fails.
 */
export default async function ajax(url, method = 'GET', body = undefined, csfrToken = undefined) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
      'X-CSRF-Token': csfrToken || document.querySelector('meta[name="csrf-token"]').content,
      'x-requested-with': 'XMLHttpRequest',
    },
    method,
    body,
  })

  if (response.ok) {
    return await response.text()
  } else {
    throw new Error('Failed to fetch response')
  }
}
