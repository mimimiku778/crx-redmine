import ajax from '../../util/ajax'
import extractFormElementFromEditBtnResponse from '../../util/notes/extractFormElementFromEditBtnResponse'
import toggleMarkdownTextCheckbox from './toggleMarkdownTextCheckbox'
import extractHtmlFromEditUpdateResponse from '../../util/notes/extractHtmlFromEditUpdateResponse'
import {
  NOTE_HEADER,
  NOTE_HEADER_UPDATE_INFO_SELECTOR,
  NOTES_EDIT_BTN_SELECTOR,
  NOTES_EDITOR_FORMAT_SELECTOR,
  PREVIEW_TAB_SELECTOR,
} from './constants'
import replaceElementWithHTML from '../../util/replaceElementWithHTML'
import compareNoteHtml from './compareNoteHtml'

/**
 * Main function to handle checkbox click events.
 *
 * @param {Number} checkboxIndex - The index of the checkbox.
 * @param {Element} note - The parent element containing checkboxes.
 * @throws {Error} - Any error that occurs during the process.
 */
export default async function checkboxEventHandler(checkboxIndex, note) {
  const journalID = note.id.replace('change-', '')
  if (!journalID) throw new Error('Journal ID not found')

  // Fetch the form HTML from the server like clicking the edit button
  const editorUrl = note.querySelector(NOTES_EDIT_BTN_SELECTOR)?.href
  if (!editorUrl) throw new Error('Edit button URL not found')

  // Fetch the editor form HTML
  const editorResponseRaw = await ajax(editorUrl)
  const editorFormElement = extractFormElementFromEditBtnResponse(editorResponseRaw)
  const noteText = editorFormElement.querySelector('textarea')?.value
  if (noteText === undefined) throw new Error('Textarea element not found')

  // Check if the note format is common_mark
  if (!editorFormElement.querySelector(NOTES_EDITOR_FORMAT_SELECTOR)?.value === 'common_mark')
    throw new Error('Editor format is not common_mark')

  // Fetch the preview HTML for comparirng current note HTML
  const previewUrl = document.querySelector(PREVIEW_TAB_SELECTOR)?.dataset?.url
  if (!previewUrl) throw new Error('Preview button URL not found')
  const previewFormData = new FormData()
  previewFormData.set('pwfmt_format', 'common_mark')
  previewFormData.set('text', noteText)
  const previewResponseRaw = await ajax(previewUrl, 'POST', previewFormData)

  // Check if the note is updated and prompt the user
  if (
    !compareNoteHtml(previewResponseRaw, note) &&
    !confirm('The note has been updated. Do you want to ignore the changes?')
  )
    return

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
