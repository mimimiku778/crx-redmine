import { NOTES_EDIT_BTN_SELECTOR, NOTES_SELECTOR } from './constants'
import setCheckboxEventListeners from './setCheckboxEventListeners'
;(async () => {
  // Check if is editable page
  if (!document.querySelector(NOTES_EDIT_BTN_SELECTOR)) {
    console.log('Not an editable page')
    return
  }

  // Add event listeners to all checkboxes in notes with notes
  document.querySelectorAll(NOTES_SELECTOR).forEach((note) => {
    setCheckboxEventListeners(note)

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'subtree' || mutation.type === 'attributes') {
          setCheckboxEventListeners(note)
          return
        }
      }
    })

    observer.observe(note, { childList: true, subtree: true, attributes: true })
  })
})()
