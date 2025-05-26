/**
 * Toggle the checkbox in the textarea content (excluding code blocks/spans).
 *
 * @param {String} noteText - The textarea content (text only).
 * @param {Number} checkboxIndex - The index of the visible checkbox to toggle.
 * @returns {String} - The updated textarea content (text only).
 * @throws {Error} - Throws an error if the checkbox index is invalid.
 */
export default function toggleMarkdownTextCheckbox(noteText, checkboxIndex) {
  // Match Markdown checkboxes at the start of a line or after whitespace
  // Matches:
  // - [ ] Item
  // - [x] Item
  // 1. [ ] Item
  // 1. [x] Item
  // Handles any amount of whitespace and both checked/unchecked states
  // Group 1: start of line or whitespace
  // Group 2: '-' or numbered list (e.g., '1.')
  // Group 3: space or 'x' (checkbox state)
  const checkboxRegex = /(^|\s)(-|\d+\.)\s+\[( |x)\](?=\s)/gm

  // Step 1: Find code blocks and inline code ranges to ignore
  const ignoreRanges = []

  // Match code blocks: ```...```
  const codeBlockRegex = /```[\s\S]*?```/g
  for (const match of noteText.matchAll(codeBlockRegex)) {
    ignoreRanges.push([match.index, match.index + match[0].length])
  }

  // Match inline code: `...`
  const inlineCodeRegex = /`[\s\S]*?`/g
  for (const match of noteText.matchAll(inlineCodeRegex)) {
    ignoreRanges.push([match.index, match.index + match[0].length])
  }

  // Helper: check if a given index is inside any ignore range
  const isIgnored = (index) => {
    return ignoreRanges.some(([start, end]) => index >= start && index < end)
  }

  // Step 2: Find visible (non-ignored) checkboxes
  const visibleMatches = []
  for (const match of noteText.matchAll(checkboxRegex)) {
    if (!isIgnored(match.index)) {
      visibleMatches.push(match)
    }
  }

  // Step 3: Toggle the checkbox at the requested index
  const match = visibleMatches[checkboxIndex]
  if (!match) throw new Error('Checkbox not found in visible content')

  const start = match.index
  const end = start + match[0].length
  const replacement = match[0].includes('[x]') ? match[0].replace('[x]', '[ ]') : match[0].replace('[ ]', '[x]')

  return noteText.slice(0, start) + replacement + noteText.slice(end)
}
