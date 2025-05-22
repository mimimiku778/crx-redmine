import { NOTE_CHECKBOXES_SELECTOR } from './constants'

/**
 * Remove event listeners from checkboxes in the note.
 *
 * @param {Element} note - The parent element containing checkboxes.
 * @param {MutationObserver[]} observers - The observers for monitoring changes in the note.
 */
export default function removeCheckboxEventHandlers(note, observers) {
  // Disconnect mutation observer
  observers && observers.forEach((observer) => observer.disconnect())

  // Remove event listeners from checkboxes
  note.querySelectorAll(NOTE_CHECKBOXES_SELECTOR).forEach((checkbox) => {
    if (checkbox.onclick) {
      checkbox.style.cursor = ''
      checkbox.onclick = null
      checkbox.disabled = true
    }
  })
}
