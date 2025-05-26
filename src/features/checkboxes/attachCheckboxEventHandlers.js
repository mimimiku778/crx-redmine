import {
  CHECKBOX_CURSOR_STYLE,
  NOTE_CHECKBOXES_SELECTOR,
  NOTES_EDIT_BTN_SELECTOR,
  TAB_CONTENT_SELECTOR,
} from './constants'
import setLoadingState from './setLoadingState'
import checkboxEventHandler from './checkboxEventHandler'

/**
 * Attach event listeners to all checkboxes in a note.
 *
 * @param {Element} note - The parent element containing checkboxes.
 * @param {Object} storage - The storage object containing settings.
 * @throws {Error} If journal ID or edit button URL is not found.
 */
function attachCheckboxEventHandlersToAllCheckboxes(note, storage) {
  const tabContent = document.querySelector(TAB_CONTENT_SELECTOR)
  const checkboxes = note.querySelectorAll(NOTE_CHECKBOXES_SELECTOR)

  const journalID = note.id.replace('change-', '')
  if (!journalID) throw new Error('Journal ID not found')

  // Fetch the form HTML from the server like clicking the edit button
  const editorUrl = note.querySelector(NOTES_EDIT_BTN_SELECTOR)?.href
  if (!editorUrl) throw new Error('Edit button URL not found')

  checkboxes.forEach((checkbox, checkboxIndex) => {
    // Skip if listener is already attached
    if (checkbox.onclick) return

    checkbox.disabled = false
    checkbox.style.cursor = CHECKBOX_CURSOR_STYLE

    checkbox.onclick = async (e) => {
      e.preventDefault()
      // Set loading state, if it fails, return
      if (!setLoadingState(true, tabContent, checkboxes)) return

      try {
        await checkboxEventHandler(checkboxIndex, note, storage, journalID, editorUrl)
      } catch (error) {
        alert(error.message)
        console.error('Error in checkbox event handler:', error)
      } finally {
        // Wait for a short time to allow the UI to update
        await new Promise((resolve) => setTimeout(resolve, 100))
        // Reset loading state
        setLoadingState(false, tabContent)
      }
    }
  })
}

/**
 * Attaches event handlers to checkboxes in a note and observes for changes.
 *
 * @param {Element} note
 * @param {Object} storage
 * @throws {Error} If journal ID or edit button URL is not found.
 */
export default function attachCheckboxEventHandlers(note, storage) {
  attachCheckboxEventHandlersToAllCheckboxes(note, storage)

  // Create a MutationObserver to monitor changes in the note
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        attachCheckboxEventHandlersToAllCheckboxes(note, storage)
        return
      }
    }
  })

  observer.observe(note, { childList: true, subtree: true })
  return observer
}
