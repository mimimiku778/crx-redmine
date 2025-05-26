import {
  TAB_CONTENT_WAIT_CURSOR_STYLE,
  TAB_CONTENT_CURSOR_STYLE,
  CHECKBOX_CURSOR_STYLE,
} from './constants'

/**
 * Set the loading state for the tab content.
 *
 * @param {Boolean} loading - Whether to set the loading state.
 * @param {NodeList} checkboxes - The checkboxes in the note.
 * @param {Element} tabContent - The tab content element.
 * @returns {Boolean} - Returns true if loading state was set, false otherwise.
 */
export default function setLoadingState(loading, tabContent, checkboxes) {
  const tabContentCursorStyle = loading ? TAB_CONTENT_WAIT_CURSOR_STYLE : TAB_CONTENT_CURSOR_STYLE
  const checkboxCursorStyle = loading ? TAB_CONTENT_WAIT_CURSOR_STYLE : CHECKBOX_CURSOR_STYLE

  // if other checkboxes are loading, do not set the loading state and return false
  if (loading && tabContent.style.cursor === TAB_CONTENT_WAIT_CURSOR_STYLE) {
    return false
  } else {
    // Set the cursor style for the tab content
    tabContent.style.cursor = tabContentCursorStyle
    // Set the cursor style for all checkboxes in the note
    checkboxes.forEach((checkbox) => (checkbox.style.cursor = checkboxCursorStyle))
    return true
  }
}
