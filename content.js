import ajax from './util/ajax'
import NoteManager from './util/NoteManager'
import replaceElementWithHTML from './util/replaceElementWithHTML'
import unescapeRailsJs from './util/unescapeRailsJs'

const NOTE_CURSOR = 'default'
const CHECKBOX_CURSOR = 'pointer'
const NOTE_WAIT_CURSOR = 'progress'
const CHECKBOX_WAIT_CURSOR = 'progress'
const NOTES_SELECTOR = '.journal.has-notes'
const NOTE_HEADER_SELECTOR = 'h4.note-header span.update-info'
const CHECKBOXES_SELECTOR = '.wiki input[type="checkbox"]'

const noteManagerInstance = await NoteManager.create()

/**
 * Set loading state (cursor and checkbox disable)
 *
 * @param {Boolean} loading - Whether to set the loading state.
 * @param {Element} note - The parent element containing checkboxes.
 * @param {NodeList} notes - The list of notes to set the loading state for.
 * @returns {Boolean} - Returns true if loading state was set, false otherwise.
 */
function setLoading(loading, note) {
  const noteCursorStyle = loading ? NOTE_WAIT_CURSOR : NOTE_CURSOR
  const checkboxCursorStyle = loading ? CHECKBOX_WAIT_CURSOR : CHECKBOX_CURSOR

  // if other checkboxes are loading, do not set the loading state and return false
  if (loading && document.querySelector(CHECKBOXES_SELECTOR).style.cursor === CHECKBOX_WAIT_CURSOR) {
    return false
  }

  note.style.cursor = noteCursorStyle

  // Set loading state for the note and checkboxes
  document.querySelectorAll(NOTES_SELECTOR).forEach((note) => {
    note.querySelectorAll(CHECKBOXES_SELECTOR).forEach((checkbox) => {
      checkbox.style.cursor = checkboxCursorStyle
    })
  })

  return true
}

/**
 * Updates the nth markdown checkbox in the textarea content found in the given HTML string.
 *
 * @param {String} noteText - The textarea content (text only).
 * @param {Number} index - The index of the checkbox to update.
 * @returns {String|false} - The updated textarea content (text only).
 * @throws {Error} - Throws an error if the textarea or checkbox is not found.
 */
function updateMarkdownCheckbox(noteText, index) {
  // Extract the checkbox content from the textarea
  const matches = [...noteText.matchAll(/(?:-|\d+\.)\s+\[( |x)\]/g)]
  if (!matches[index]) throw new Error('Checkbox not found in textarea')

  // Update the checkbox content in the textarea
  const match = matches[index]
  const start = match.index
  const end = start + match[0].length
  const replacement = match[0].replace(/\[( |x)\]/, match[0].match(/\[(x)\]/)?.[1] === 'x' ? '[ ]' : '[x]')

  // Update the textarea value with the new checkbox content
  return noteText.slice(0, start) + replacement + noteText.slice(end)
}

/**
 * Extracts the textarea content from a script string containing HTML form markup.
 *
 * @param {String} raw - The raw script string containing escaped HTML.
 * @returns {Document} - The parsed HTML document containing the form.
 * @throws {Error} - Throws an error if the form HTML is not found.
 */
function extractFormElementFromScript(raw) {
  // Unescape the Rails JavaScript code
  const jscode = unescapeRailsJs(raw)

  // Extract the form HTML using a regular expression
  const formMatch = jscode.match(/after\('((?:.|\n)*?<\/form>)/)

  if (formMatch?.[1]) {
    // Parse the form HTML string into a DOM element
    return new DOMParser().parseFromString(formMatch[1], 'text/html')
  } else {
    throw new Error('Form HTML not found')
  }
}

/**
 * Extracts all <span> tags with the class "update-info" from a given JavaScript code string.
 *
 * @param {String} raw - The raw script string containing escaped HTML.
 * @returns {{journalActions: string, privateNotes: string, notes: string, updateInfo: string}}
 *  - An object containing the extracted HTML strings for journal actions, private notes, notes, and update info.
 * @throws {Error} - Throws an error if the <span> tags are not found.
 */
function extractUpdateResponseHtmlFromScript(raw) {
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

/**
 * Main function to handle checkbox click events.
 *
 * @param {Event} e - The event object.
 * @param {Number} checkboxIndex - The index of the checkbox.
 * @param {Element} note - The parent element containing checkboxes.
 * @throws {Error} - Any error that occurs during the process.
 */
async function checkBoxEventHandler(e, checkboxIndex, note) {
  const noteId = note.querySelector('.note')?.id.replace('note-', '')
  if (!noteId) throw new Error('Note ID not found')

  const privateNote = note.querySelector(`#journal-${noteId}-private_notes`)
  const isPrivateNote = privateNote.classList.contains('badge-private')

  // Fetch the form HTML from the server like clicking the edit button
  const raw = await ajax(note.querySelector('.contextual a.icon-edit').href)
  const formDom = extractFormElementFromScript(raw).querySelector('form')
  const noteText = formDom.querySelector('textarea').value

  // Check if the note is updated and prompt the user
  if (
    !isPrivateNote &&
    (await noteManagerInstance.isUpdatedNote(noteId, noteText)) &&
    !confirm('The note has been updated. Do you want to ignore the changes?')
  )
    return

  // Create a new FormData object from the form element
  const formData = new FormData(formDom)
  formData.set('commit', formDom.querySelector('input[type="submit"]').value)
  const newText = updateMarkdownCheckbox(noteText, checkboxIndex)
  formData.set('journal[notes]', newText)

  // Send the updated form data to the server
  const response = await ajax(`/journals/${noteId}`, 'POST', formData)

  // Extract the updated HTML from the response
  const responseHtml = extractUpdateResponseHtmlFromScript(response)

  // Update the note with the new html like clicking the save button
  note.querySelector('.journal-actions').innerHTML = responseHtml.journalActions
  replaceElementWithHTML(privateNote, responseHtml.privateNotes)
  replaceElementWithHTML(note.querySelector(`#journal-${noteId}-notes`), responseHtml.notes)
  replaceElementWithHTML(note.querySelector(NOTE_HEADER_SELECTOR), responseHtml.updateInfo)

  // Update the note cache with the new text
  !isPrivateNote && noteManagerInstance.updateNoteCache(noteId, newText)

  setEventListeners(note)
}

/**
 * Wrapper function for checkbox event handler to handle errors and loading state.
 *
 * @param {Event} e - The event object.
 * @param {Number} checkboxIndex - The index of the checkbox.
 * @param {Element} note - The parent element containing checkboxes.
 * @throws {Error} - Any error that occurs during the process.
 */
async function checkBoxEventHandlerWrapper(e, checkboxIndex, note) {
  // Prevent default action and set loading state
  e.preventDefault()

  // Set loading state for the note and checkboxes. if it fails, other checkboxes are already loading
  if (!setLoading(true, note)) return

  try {
    await checkBoxEventHandler(e, checkboxIndex, note)
  } catch (error) {
    console.error(error)
  } finally {
    // Reset loading state for the note and checkboxes
    setLoading(false, note)
  }
}

/**
 * Sets event listeners for checkboxes in the given note.
 * @param {Element} note - The note element to set event listeners on.
 */
function setEventListeners(note) {
  note.querySelectorAll(CHECKBOXES_SELECTOR).forEach((checkbox, checkboxIndex) => {
    checkbox.disabled = false
    checkbox.style.cursor = CHECKBOX_CURSOR

    checkbox.addEventListener('click', async (e) => await checkBoxEventHandlerWrapper(e, checkboxIndex, note))
  })
}

// Add event listeners to all checkboxes in notes with notes
const notes = document.querySelectorAll(NOTES_SELECTOR)
notes.forEach((note) => {
  setEventListeners(note)
})
