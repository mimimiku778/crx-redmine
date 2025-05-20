import {
  CHECKBOX_CURSOR_STYLE,
  CHECKBOX_WAIT_CURSOR_STYLE,
  NOTE_CHECKBOXES_SELECTOR,
  NOTE_CURSOR_STYLE,
  NOTE_WAIT_CURSOR_STYLE,
  NOTES_SELECTOR,
} from './constants'

/**
 * Sets the loading state for the note and checkboxes while preventing
 * multiple simultaneous loading states.
 * 
 * @param {Boolean} loading - Whether to set the loading state.
 * @param {Element} note - The parent element containing checkboxes.
 * @param {NodeList} notes - The list of notes to set the loading state for.
 * @returns {Boolean} - Returns true if loading state was set, false otherwise.
 */
export default function setLoadingState(loading, note) {
  const noteCursorStyle = loading ? NOTE_WAIT_CURSOR_STYLE : NOTE_CURSOR_STYLE
  const checkboxCursorStyle = loading ? CHECKBOX_WAIT_CURSOR_STYLE : CHECKBOX_CURSOR_STYLE

  // if other checkboxes are loading, do not set the loading state and return false
  if (loading && document.querySelector(NOTE_CHECKBOXES_SELECTOR).style.cursor === CHECKBOX_WAIT_CURSOR_STYLE) {
    return false
  }

  note.style.cursor = noteCursorStyle

  // Set loading state for the note and checkboxes
  document.querySelectorAll(NOTES_SELECTOR).forEach((note) => {
    note.querySelectorAll(NOTE_CHECKBOXES_SELECTOR).forEach((checkbox) => {
      checkbox.style.cursor = checkboxCursorStyle
    })
  })

  return true
}
