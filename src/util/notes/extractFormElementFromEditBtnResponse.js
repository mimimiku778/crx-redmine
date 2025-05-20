import unescapeRailsJs from '../unescapeRailsJs'

/**
 * This function extracts a form element from a given raw script string.
 *
 * @param {String} raw - The raw script string containing escaped HTML.
 * @returns {HTMLFormElement} - The parsed HTMLFormElement.
 * @throws {Error} - Throws an error if the form HTML is not found.
 */
export default function extractFormElementFromEditBtnResponse(raw) {
  // Unescape the Rails JavaScript code
  const jscode = unescapeRailsJs(raw)

  // Extract the form HTML using a regular expression
  const formMatch = jscode.match(/after\('((?:.|\n)*?<\/form>)/)

  if (formMatch?.[1]) {
    // Parse the form HTML string into a DOM element
    return new DOMParser().parseFromString(formMatch[1], 'text/html').querySelector('form')
  } else {
    throw new Error('Form HTML not found')
  }
}
