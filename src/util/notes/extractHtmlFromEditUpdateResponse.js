import unescapeRailsJs from "../unescapeRailsJs"

/**
 * Extracts HTML strings from a raw script string containing escaped HTML.
 *
 * @param {String} raw - The raw script string containing escaped HTML.
 * @returns {{journalActions: string, privateNotes: string, notes: string, updateInfo: string}}
 *  - An object containing the extracted HTML strings for journal actions, private notes, notes, and update info.
 * @throws {Error} - Throws an error if the <span> tags are not found.
 */
export default function extractHtmlFromEditUpdateResponse(raw) {
  // Unescape the Rails JavaScript code
  const jscode = unescapeRailsJs(raw)

  // Extract the journal actions, private notes, and notes HTML using regular expressions
  const journalActionsMatch = jscode.match(/\.journal-actions"\)\.html\(['"]([\s\S]*?)['"]\)/)
  if (!journalActionsMatch?.[1]) {
    throw new Error('Journal actions not found')
  }

  const privateNotesMatch = jscode.match(/journal-\d+-private_notes"\)\.replaceWith\(['"]([\s\S]*?)['"]\)/)
  if (!privateNotesMatch?.[1]) {
    throw new Error('Private notes not found')
  }

  const NotesMatch = jscode.match(/journal-\d+-notes"\)\.replaceWith\(['"]([\s\S]*?)['"]\)/)
  if (!NotesMatch?.[1]) {
    throw new Error('Notes not found')
  }

  const updateInfoMatch = jscode.match(/<span[^>]*class=["'][^"']*\bupdate-info\b[^"']*["'][^>]*>.*?<\/span>/gs)
  if (!updateInfoMatch?.[0]) {
    throw new Error('Update info span not found')
  }

  return {
    journalActions: journalActionsMatch[1],
    privateNotes: privateNotesMatch[1],
    notes: NotesMatch[1],
    updateInfo: updateInfoMatch[0],
  }
}
