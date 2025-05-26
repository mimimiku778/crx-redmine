import ajax from '../../util/ajax'
import extractFormElementFromEditBtnResponse from '../../util/notes/extractFormElementFromEditBtnResponse'
import checkNoteChangesAndPrompt from './checkNoteChangesAndPrompt'
import toggleMarkdownTextCheckbox from './toggleMarkdownTextCheckbox'
import extractHtmlFromEditUpdateResponse from '../../util/notes/extractHtmlFromEditUpdateResponse'
import {
  NOTE_HEADER,
  NOTE_HEADER_UPDATE_INFO_SELECTOR,
  NOTES_EDITOR_FORMAT_SELECTOR,
} from './constants'
import replaceElementWithHTML from '../../util/replaceElementWithHTML'
import { STORAGE_KEYS } from '../../popup/constants'

/**
 * Main function to handle checkbox click events.
 *
 * @param {Number} checkboxIndex - The index of the checkbox.
 * @param {Element} note - The parent element containing checkboxes.
 * @param {Object} storage - The storage object containing settings.
 * @param {String} journalID - The ID of the journal.
 * @param {String} editorUrl - The URL to fetch the editor form HTML.
 * @throws {Error} - Any error that occurs during the process.
 */
export default async function checkboxEventHandler(checkboxIndex, note, storage, journalID, editorUrl) {
  // Fetch the editor form HTML
  const editorResponseRaw = await ajax(editorUrl)
  const editorFormElement = extractFormElementFromEditBtnResponse(editorResponseRaw)
  const noteText = editorFormElement.querySelector('textarea')?.value
  if (noteText === undefined) throw new Error('Textarea element not found')

  // Check if the note format is common_mark
  if (!editorFormElement.querySelector(NOTES_EDITOR_FORMAT_SELECTOR)?.value === 'common_mark')
    throw new Error('Editor format is not common_mark')

  // Check if the note is updated and prompt the user
  if (storage[STORAGE_KEYS.SKIP_DIFFERENCE_CHECK] !== true && !(await checkNoteChangesAndPrompt(noteText, note))) return

  // Create a new FormData object from the form element
  const updateFormData = new FormData(editorFormElement)
  updateFormData.set('commit', editorFormElement.querySelector('input[type="submit"]').value)
  updateFormData.set('journal[notes]', toggleMarkdownTextCheckbox(noteText, checkboxIndex))

  // Send the updated form data to the server
  const response = await ajax(`/journals/${journalID}`, 'POST', updateFormData)

  // Extract the updated HTML from the response
  const responseHtml = extractHtmlFromEditUpdateResponse(response)

  // Update the note with the new html like clicking the save button
  note.querySelector('.journal-actions').innerHTML = responseHtml.journalActions
  replaceElementWithHTML(note.querySelector(`#journal-${journalID}-private_notes`), responseHtml.privateNotes)
  replaceElementWithHTML(note.querySelector(`#journal-${journalID}-notes`), responseHtml.notes)
  const noteHeader = note.querySelector(NOTE_HEADER_UPDATE_INFO_SELECTOR)
  if (noteHeader) {
    replaceElementWithHTML(noteHeader, responseHtml.updateInfo)
  } else {
    note.querySelector(NOTE_HEADER).insertAdjacentHTML('beforeend', responseHtml.updateInfo)
  }
}
