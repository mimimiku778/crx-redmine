/**
 * Replaces a DOM element with a new element created from the given HTML string.
 * @param {HTMLElement} oldElement - The element to be replaced.
 * @param {string} htmlString - The HTML string used to create the new element.
 */
export default function replaceElementWithHTML(oldElement, htmlString) {
  const template = document.createElement('template')
  template.innerHTML = htmlString.trim() // trim to avoid extra text nodes
  const newElement = template.content.firstElementChild

  if (newElement) {
    oldElement.replaceWith(newElement)
  } else {
    console.warn('Invalid HTML string: No root element found.')
  }
}
