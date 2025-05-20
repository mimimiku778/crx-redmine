import { CHECKBOX_CURSOR_STYLE, NOTE_CHECKBOXES_SELECTOR } from './constants'
import checkBoxEventHandler from './checkBoxEventHandler'
import setLoadingState from './setLoadingState'

/**
 * Sets event listeners for checkboxes in the note.
 *
 * @param {Element} note - The parent element containing checkboxes.
 */
export default function setCheckboxEventListeners(note) {
  note.querySelectorAll(NOTE_CHECKBOXES_SELECTOR).forEach((checkbox, checkboxIndex) => {
    // Skip if the checkbox already has an event listener attached
    if (checkbox.dataset.listenerAttached === 'true') return
    checkbox.dataset.listenerAttached = 'true'

    checkbox.addEventListener('click', async (e) => {
      // Prevent default action and set loading state
      e.preventDefault()

      // Set loading state for the note and checkboxes. if it fails, other checkboxes are already loading
      if (!setLoadingState(true, note)) return

      try {
        await checkBoxEventHandler(checkboxIndex, note)
      } catch (error) {
        alert(error.message)
        console.error(error)
      } finally {
        // Reset loading state for the note and checkboxes
        setLoadingState(false, note)
      }
    })

    // Set the cursor style
    checkbox.disabled = false
    checkbox.style.cursor = CHECKBOX_CURSOR_STYLE
  })
}
