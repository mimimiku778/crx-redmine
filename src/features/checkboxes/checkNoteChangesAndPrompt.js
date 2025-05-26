import ajax from '../../util/ajax'
import compareNoteHtml from './compareNoteHtml'
import { PREVIEW_TAB_SELECTOR } from './constants'

/**
 * Checks if the note content has changed and prompts the user if so.
 * If changes are detected, asks the user whether to ignore them.
 *
 * @param {string} noteText - The current text of the note.
 * @param {Element} note - The DOM element representing the note.
 * @returns {Promise<boolean>} - Resolves to true if no changes or user chooses to ignore, otherwise false.
 * @throws {Error} - Throws if required elements are missing.
 */
export default async function checkNoteChangesAndPrompt(noteText, note) {
  // Fetch the preview HTML for comparirng current note HTML
  const previewUrl = document.querySelector(PREVIEW_TAB_SELECTOR)?.dataset?.url
  if (!previewUrl) throw new Error('Preview button URL not found')

  const previewFormData = new FormData()
  previewFormData.set('pwfmt_format', 'common_mark')
  previewFormData.set('text', noteText)
  const previewResponseRaw = await ajax(previewUrl, 'POST', previewFormData)

  // Check if the note is updated and prompt the user
  return (
    compareNoteHtml(previewResponseRaw, note) ||
    confirm('The note has been updated. Do you want to ignore the changes?')
  )
}
