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
      return await chrome.storage.local.get([
        STORAGE_KEYS.ENABLED,
        STORAGE_KEYS.ENABLED_URLS,
        STORAGE_KEYS.ONLY_MINE,
        STORAGE_KEYS.SKIP_DIFFERENCE_CHECK,
      ])
    }

    // Check if the feature is enabled based on storage settings
    function isFeatureEnabled(storage) {
      const isEnabled = storage[STORAGE_KEYS.ENABLED] !== undefined ? Boolean(storage[STORAGE_KEYS.ENABLED]) : true
      if (!isEnabled) return false

      if (
        storage[STORAGE_KEYS.ENABLED_URLS]?.length &&
        !storage[STORAGE_KEYS.ENABLED_URLS].some((url) => location.href.startsWith(url))
      )
        return false

      if (
        Boolean(storage[STORAGE_KEYS.ONLY_MINE]) &&
        document.querySelector(CURRENT_USER_SELECTOR).href !== document.querySelector(ASSIGNED_USER_NAME_SELECTOR).href
      )
        return false

      return true
    }

    // Selector for all notes in the issue
    const notes = document.querySelectorAll(NOTES_SELECTOR)
    // Observers used to track updates to each note and reassign event handlers accordingly.
    const observers = []

    // Update the feature state based on the current storage and attach or remove event handlers accordingly
    async function updateFeatureState() {
      observers.length && notes.forEach((note, i) => removeCheckboxEventHandlers(note, observers[i]))
      observers.length = 0

      const storage = await getStorage()
      if (!isFeatureEnabled(storage)) return

      // Attach event handlers to each note's checkboxes
      const newObservers = Array.from(notes).map((note) => attachCheckboxEventHandlers(note, storage))
      observers.push(...newObservers)
    }

    // Initial setup: get storage, check feature state, and attach event handlers
    await updateFeatureState()

    // Listen for changes in storage and update the feature state accordingly
    chrome.storage.onChanged.addListener(() => updateFeatureState())
  })()
