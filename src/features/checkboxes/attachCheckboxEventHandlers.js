import { CHECKBOX_CURSOR_STYLE, NOTE_CHECKBOXES_SELECTOR } from './constants'
import setLoadingState from './setLoadingState'
import checkboxEventHandler from './checkboxEventHandler'

/**
 * Attach event listeners to checkboxes in the note.
 *
 * @param {Element} note - The parent element containing checkboxes.
 * @returns {MutationObserver[]} - The observer for monitoring changes in the note.
 */
export default function attachCheckboxEventHandlers(note) {
  return Array.from(note.querySelectorAll(NOTE_CHECKBOXES_SELECTOR)).map((checkbox, checkboxIndex) => {
    // Skip if listener is already attached
    if (checkbox.onclick) return

    checkbox.disabled = false
    checkbox.style.cursor = CHECKBOX_CURSOR_STYLE

    checkbox.onclick = async (e) => {
      e.preventDefault()
      // Set loading state, if it fails, return
      if (!setLoadingState(true, note)) return

      try {
        await checkboxEventHandler(checkboxIndex, note)
      } catch (error) {
        alert(error.message)
        console.error(error)
      } finally {
        // Reset loading state
        setLoadingState(false, note)
      }
    }

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes') {
          attachCheckboxEventHandlers(note)
          return
        }
      }
    })

    observer.observe(note, { attributes: true })
    return observer
  })
}
