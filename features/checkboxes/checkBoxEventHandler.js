import NoteManager from '../../util/notes/NoteManager'
import ajax from '../../util/ajax'
import extractFormElementFromEditBtnResponse from '../../util/notes/extractFormElementFromEditBtnResponse'
import toggleMarkdownTextCheckbox from './toggleMarkdownTextCheckbox'
import extractHtmlFromEditUpdateResponse from '../../util/notes/extractHtmlFromEditUpdateResponse'
import { NOTE_HEADER_SELECTOR, NOTES_EDIT_BTN_SELECTOR } from './constants'
import replaceElementWithHTML from '../../util/replaceElementWithHTML'

/**
 * Main function to handle checkbox click events.
 *
 * @param {NoteManager} noteManager - The instance of NoteManager to manage notes.
 * @param {Number} checkboxIndex - The index of the checkbox.
 * @param {Element} note - The parent element containing checkboxes.
 * @throws {Error} - Any error that occurs during the process.
 */
export default async function checkBoxEventHandler(noteManager, checkboxIndex, note) {
  const noteId = note.querySelector('.note')?.id.replace('note-', '')
  if (!noteId) throw new Error('Note ID not found')

  const privateNote = note.querySelector(`#journal-${noteId}-private_notes`)
  const isPrivateNote = privateNote.classList.contains('badge-private')

  // Fetch the form HTML from the server like clicking the edit button
  const ajaxUrl = note.querySelector(NOTES_EDIT_BTN_SELECTOR)?.href
  if (!ajaxUrl) throw new Error('Edit button URL not found')

  const raw = await ajax(ajaxUrl)
  const formDom = extractFormElementFromEditBtnResponse(raw)
  const noteText = formDom.querySelector('textarea')?.value
  if (noteText === undefined) throw new Error('Textarea element not found')

  // Check if the note is updated and prompt the user
  if (
    // NoteManager caches the note text via issue json api. if the note is private,
    // it will not be cached because it is not in the issue json.
    !isPrivateNote &&
    noteManager.isUpdatedNote(noteId, noteText) &&
    !confirm('The note has been updated. Do you want to ignore the changes?')
  )
    return

  // Create a new FormData object from the form element
  const formData = new FormData(formDom)
  formData.set('commit', formDom.querySelector('input[type="submit"]').value)
  const newText = toggleMarkdownTextCheckbox(noteText, checkboxIndex)
  formData.set('journal[notes]', newText)

  // Send the updated form data to the server
  const response = await ajax(`/journals/${noteId}`, 'POST', formData)

  // Extract the updated HTML from the response
  const responseHtml = extractHtmlFromEditUpdateResponse(response)

  // Update the note with the new html like clicking the save button
  note.querySelector('.journal-actions').innerHTML = responseHtml.journalActions
  replaceElementWithHTML(privateNote, responseHtml.privateNotes)
  replaceElementWithHTML(note.querySelector(`#journal-${noteId}-notes`), responseHtml.notes)
  replaceElementWithHTML(note.querySelector(NOTE_HEADER_SELECTOR), responseHtml.updateInfo)

  // Update the note cache with the new text
  !isPrivateNote && noteManager.updateNoteCache(noteId, newText)
}
