/**
 * Extracts the issue ID from the current URL.
 *
 * @param {String} url - The URL to extract the issue ID from. 
 * @returns {Number} - The issue ID extracted from the current URL.
 * @throws {Error} - Throws if the issue ID is not found in the URL.
 */
export default function extractIssueIdFromUrl(url = window.location.href) {
  const match = url.match(/\/issues\/(\d+)/)
  if (match && match[1]) {
    return Number(match[1])
  } else {
    throw new Error('Issue ID not found in URL')
  }
}
