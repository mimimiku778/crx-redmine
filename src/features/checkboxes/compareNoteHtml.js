import { NOTE_TEXT_SELECTOR } from './constants'

/**
 * Compare the HTML of the preview response with the current note HTML.
 *
 * @param {String} previewResponseRaw - The raw HTML response from the preview.
 * @param {Element} note - The parent element containing note.
 * @returns {Boolean} - Returns true if the preview HTML is equal to the current note HTML.
 */
export default function compareNoteHtml(previewResponseRaw, note) {
  // Create a new div for the current note and remove unnecessary attributes
  // for comparison
  const current = document.createElement('div')
  current.innerHTML = note.querySelector(NOTE_TEXT_SELECTOR).innerHTML.trim()
  current.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.disabled = true
    checkbox.removeAttribute('data-listener-attached')
  })
  current.querySelectorAll('a').forEach((a) => {
    a.removeAttribute('target')
  })
  current.querySelectorAll('*').forEach((el) => {
    el.removeAttribute('style')
    el.removeAttribute('id')
    el.removeAttribute('onclick')
  })

  // Create a new div for the preview response and remove unnecessary attributes
  // for comparison
  const preview = document.createElement('div')
  preview.innerHTML = previewResponseRaw.trim()
  preview.querySelectorAll('*').forEach((el) => {
    el.removeAttribute('style')
    el.removeAttribute('id')
    el.removeAttribute('onclick')
  })

  return current.isEqualNode(preview)
}
