/**
 * Rails JS_ESCAPE_MAP equivalent for unescaping strings escaped by Rails' `j` helper.
 * Maps each escape sequence back to its original character.
 */
const JS_UNESCAPE_MAP = {
  '\\\\': '\\',
  '<\\/': '</',
  '\\n': '\n',
  '\\"': '"',
  "\\'": "'",
  '\\`': '`',
  '\\$': '$',
  '&#x2028;': '\u2028',
  '&#x2029;': '\u2029',
}

// Sort keys by descending length to avoid partial overlaps (e.g., "\\\\" vs "\\n")
const escapeKeysSorted = Object.keys(JS_UNESCAPE_MAP).sort((a, b) => b.length - a.length)

/**
 * Unescapes a string that was escaped by Rails' `j` helper for JavaScript.
 * Uses JS_UNESCAPE_MAP to reverse each escape sequence in priority order.
 *
 * @param {string} escaped - A string escaped by Rails’ `j` helper.
 * @returns {string} - The unescaped original string.
 * @throws {TypeError} - If the input is not a string.
 */
export default function unescapeRailsJs(escaped) {
  if (typeof escaped !== 'string') {
    throw new TypeError('Input must be a string')
  }

  let result = escaped

  // Iterate over sorted keys so longer sequences are replaced first
  for (const key of escapeKeysSorted) {
    const original = JS_UNESCAPE_MAP[key]
    // Escape regex metacharacters in the key
    const escapedKey = key.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')
    const pattern = new RegExp(escapedKey, 'g')
    result = result.replace(pattern, original)
  }

  return result
}
