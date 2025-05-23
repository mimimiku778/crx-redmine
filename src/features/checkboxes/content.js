import { SETTING_UPDATE_MESSAGE_TYPE, STORAGE_KEYS } from '../../popup/constants'
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
    function getStorage() {
      const enabled = localStorage.getItem(STORAGE_KEYS.ENABLED)
      return {
        [STORAGE_KEYS.ENABLED]: enabled === null ? true : enabled === 'true',
        [STORAGE_KEYS.ENABLED_URLS]: localStorage.getItem(STORAGE_KEYS.ENABLED_URLS),
        [STORAGE_KEYS.ONLY_MINE]: localStorage.getItem(STORAGE_KEYS.ONLY_MINE) === 'true',
      }
    }

    function isFeatureEnabled(storage) {
      if (!storage[STORAGE_KEYS.ENABLED]) return false

      const urlList = JSON.parse(storage[STORAGE_KEYS.ENABLED_URLS]) || []
      if (urlList.length && !urlList.some((url) => location.href.startsWith(url))) return false

      if (
        storage[STORAGE_KEYS.ONLY_MINE] &&
        document.querySelector(CURRENT_USER_SELECTOR).href !== document.querySelector(ASSIGNED_USER_NAME_SELECTOR).href
      )
        return false

      return true
    }

    /** @return {MutationObserver[][]} */
    function attachEventHandlers(notes) {
      return Array.from(notes).map((note) => attachCheckboxEventHandlers(note))
    }

    function removeEventHandlers(note, observers) {
      note.forEach((note, i) => removeCheckboxEventHandlers(note, observers?.[i]))
    }

    const notes = document.querySelectorAll(NOTES_SELECTOR)
    let observers = []

    // Check if the edit button is present and the feature is enabled
    if (isFeatureEnabled(getStorage())) {
      // Attach event handlers to checkboxes in the note
      observers = attachEventHandlers(notes)
    }

    // Listen for changes in the localStorage
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type !== SETTING_UPDATE_MESSAGE_TYPE) return
      localStorage.setItem(STORAGE_KEYS.ENABLED, message.settings[STORAGE_KEYS.ENABLED])
      localStorage.setItem(STORAGE_KEYS.ENABLED_URLS, message.settings[STORAGE_KEYS.ENABLED_URLS])
      localStorage.setItem(STORAGE_KEYS.ONLY_MINE, message.settings[STORAGE_KEYS.ONLY_MINE])
      
      removeEventHandlers(notes, observers)
      if (!isFeatureEnabled(message.settings)) return
      observers = attachEventHandlers(notes)
    })
  })()
