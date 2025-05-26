import { STORAGE_KEYS } from '../../popup/constants'
import {
  ASSIGNED_USER_NAME_SELECTOR,
  CURRENT_USER_SELECTOR,
  NOTES_EDIT_BTN_SELECTOR,
  NOTES_SELECTOR,
} from './constants'
import attachCheckboxEventHandlers from './attachCheckboxEventHandlers'
import removeCheckboxEventHandlers from './removeCheckboxEventHandlers'

// Check if the edit button is present and the feature is enabled
document.querySelector(`.journal.has-notes ${NOTES_EDIT_BTN_SELECTOR}`) &&
  (async () => {
    async function getStorage() {
      return await chrome.storage.local.get([STORAGE_KEYS.ENABLED, STORAGE_KEYS.ENABLED_URLS, STORAGE_KEYS.ONLY_MINE])
    }

    function isFeatureEnabled(storage) {
      const isEnabled = storage[STORAGE_KEYS.ENABLED] !== undefined ? Boolean(storage[STORAGE_KEYS.ENABLED]) : true
      if (!isEnabled) return false

      if (
        storage[STORAGE_KEYS.ENABLED_URLS]?.length &&
        !storage[STORAGE_KEYS.ENABLED_URLS].some((url) => location.href.startsWith(url))
      )
        return false

      if (
        storage[STORAGE_KEYS.ONLY_MINE] &&
        document.querySelector(CURRENT_USER_SELECTOR).href !== document.querySelector(ASSIGNED_USER_NAME_SELECTOR).href
      )
        return false

      return true
    }

    function attachEventHandlers(notes) {
      return Array.from(notes).map((note) => attachCheckboxEventHandlers(note))
    }

    function removeEventHandlers(notes, observers) {
      notes.forEach((note, i) => removeCheckboxEventHandlers(note, observers?.[i]))
    }

    const notes = document.querySelectorAll(NOTES_SELECTOR)
    /** @type {MutationObserver[]} */
    let observers = []

    // Check if the edit button is present and the feature is enabled
    if (isFeatureEnabled(await getStorage())) {
      // Attach event handlers to checkboxes in the note
      observers = attachEventHandlers(notes)
    }

    // Listen for changes in storage
    chrome.storage.onChanged.addListener(async function () {
      observers.length && removeEventHandlers(notes, observers)

      if (isFeatureEnabled(await getStorage())) {
        observers = attachEventHandlers(notes)
      } else {
        observers = []
      }
    })
  })()
