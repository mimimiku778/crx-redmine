import { NOTE_TEXT_SELECTOR } from './constants'

/**
 * Compare the HTML of the preview response with the current note HTML.
 *
 * @param {String} previewResponseRaw - The raw HTML response from the preview.
 * @param {Element} note - The parent element containing note.
 * @returns {Boolean} - Returns true if the preview HTML is equal to the current note HTML.
 */
export default function compareNoteHtml(previewResponseRaw, note) {
  const preview = document.createElement('div')
  preview.innerHTML = previewResponseRaw.trim()

  const current = document.createElement('div')
  current.innerHTML = note.querySelector(NOTE_TEXT_SELECTOR).innerHTML.trim()

  current.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.disabled = true
    checkbox.hasAttribute('style') && checkbox.attributes.removeNamedItem('style')
    checkbox.hasAttribute('data-listener-attached') && checkbox.attributes.removeNamedItem('data-listener-attached')
  })
  current.querySelectorAll('a').forEach((a) => {
    a.hasAttribute('target') && a.attributes.removeNamedItem('target')
  })

  return current.isEqualNode(preview)
}
