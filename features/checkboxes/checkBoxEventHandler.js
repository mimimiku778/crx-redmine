import NoteManager from '../../util/notes/NoteManager'
import ajax from '../../util/ajax'
import extractFormElementFromEditBtnResponse from '../../util/notes/extractFormElementFromEditBtnResponse'
import toggleMarkdownTextCheckbox from './toggleMarkdownTextCheckbox'
import extractHtmlFromEditUpdateResponse from '../../util/notes/extractHtmlFromEditUpdateResponse'
import { NOTE_HEADER_SELECTOR, NOTES_EDIT_BTN_SELECTOR, PREVIEW_TAB_SELECTOR } from './constants'
import replaceElementWithHTML from '../../util/replaceElementWithHTML'

/**
 * Main function to handle checkbox click events.
 *
 * @param {NoteManager} noteManager - The instance of NoteManager to manage notes.
 * @param {Number} checkboxIndex - The index of the checkbox.
 * @param {Element} note - The parent element containing checkboxes.
 * @throws {Error} - Any error that occurs during the process.
 */
export default async function checkBoxEventHandler(checkboxIndex, note) {
  const journalID = note.id.replace('change-', '')
  if (!journalID) throw new Error('Journal ID not found')

  // Fetch the form HTML from the server like clicking the edit button
  const editorUrl = note.querySelector(NOTES_EDIT_BTN_SELECTOR)?.href
  if (!editorUrl) throw new Error('Edit button URL not found')

  const raw = await ajax(editorUrl)
  const formDom = extractFormElementFromEditBtnResponse(raw)
  const noteText = formDom.querySelector('textarea')?.value
  if (noteText === undefined) throw new Error('Textarea element not found')

  const previewUrl = document.querySelector(PREVIEW_TAB_SELECTOR)?.dataset?.url
  console.log('previewUrl', previewUrl)
  if (!previewUrl) throw new Error('Preview button URL not found')

  // Check if the note is updated and prompt the user
  if (
    !confirm('The note has been updated. Do you want to ignore the changes?')
  )
    return

  // Create a new FormData object from the form element
  const formData = new FormData(formDom)
  formData.set('commit', formDom.querySelector('input[type="submit"]').value)
  const newText = toggleMarkdownTextCheckbox(noteText, checkboxIndex)
  formData.set('journal[notes]', newText)

  // Send the updated form data to the server
  const response = await ajax(`/journals/${journalID}`, 'POST', formData)

  // Extract the updated HTML from the response
  const responseHtml = extractHtmlFromEditUpdateResponse(response)

  // Update the note with the new html like clicking the save button
  note.querySelector('.journal-actions').innerHTML = responseHtml.journalActions
  replaceElementWithHTML(note.querySelector(`#journal-${journalID}-private_notes`), responseHtml.privateNotes)
  replaceElementWithHTML(note.querySelector(`#journal-${journalID}-notes`), responseHtml.notes)
  replaceElementWithHTML(note.querySelector(NOTE_HEADER_SELECTOR), responseHtml.updateInfo)
}
