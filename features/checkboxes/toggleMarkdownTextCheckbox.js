/**
 * Update the checkbox in the textarea content.
 *
 * @param {String} noteText - The textarea content (text only).
 * @param {Number} index - The index of the checkbox to update.
 * @returns {String|false} - The updated textarea content (text only).
 * @throws {Error} - Throws an error if the textarea or checkbox is not found.
 */
export default function toggleMarkdownTextCheckbox(noteText, checkboxIndex) {
  // Extract the checkbox content from the textarea
  const matches = [...noteText.matchAll(/(?:-|\d+\.)\s+\[( |x)\]/g)]
  if (!matches[checkboxIndex]) throw new Error('Checkbox not found in textarea')

  // Update the checkbox content in the textarea
  const match = matches[checkboxIndex]
  const start = match.index
  const end = start + match[0].length
  const replacement = match[0].replace(/\[( |x)\]/, match[0].match(/\[(x)\]/)?.[1] === 'x' ? '[ ]' : '[x]')

  // Update the textarea value with the new checkbox content
  return noteText.slice(0, start) + replacement + noteText.slice(end)
}
