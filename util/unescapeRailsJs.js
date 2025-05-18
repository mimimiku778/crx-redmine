/**
 * Unescapes a string that was escaped for safe use in Rails-generated JavaScript.
 * Reverts special character escapes, quotes, slashes, and Unicode line separators.
 *
 * @param {string} escaped - The escaped string to unescape.
 * @returns {string} The unescaped string.
 * @throws {TypeError} If the input is not string.
 */
export default function unescapeRailsJs(escaped) {
  if (typeof escaped !== 'string') throw new TypeError('Input must be a string')

  return escaped
    .replace(/&#x2028;/g, '\u2028')
    .replace(/&#x2029;/g, '\u2029')
    .replace(/<\\\//g, '</')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
}
