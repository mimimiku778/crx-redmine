import { SETTING_UPDATE_MESSAGE_TYPE, STORAGE_KEYS } from './constants'

export default function attachEventHandlers() {
  const enabledCheckbox = document.getElementById(STORAGE_KEYS.ENABLED)
  const urlsTextarea = document.getElementById(STORAGE_KEYS.ENABLED_URLS)
  const onlyMineCheckbox = document.getElementById(STORAGE_KEYS.ONLY_MINE)
  const saveButton = document.getElementById('save')
  const form = enabledCheckbox.closest('form')

  // Load settings from localStorage and populate the form
  const enabled = localStorage.getItem(STORAGE_KEYS.ENABLED)
  enabledCheckbox.checked = enabled === null ? true : enabled === 'true'
  const urls = localStorage.getItem(STORAGE_KEYS.ENABLED_URLS)
  urlsTextarea.value = urls ? JSON.parse(urls).join('\n') : ''
  onlyMineCheckbox.checked = localStorage.getItem(STORAGE_KEYS.ONLY_MINE) === 'true'

  const eventHandler = (e) => {
    if (e.target.id === STORAGE_KEYS.ENABLED_URLS) return

    // Split textarea input into trimmed, non-empty lines
    const urlList = urlsTextarea.value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    // Store updated settings
    const settings = {
      [STORAGE_KEYS.ENABLED]: enabledCheckbox.checked,
      [STORAGE_KEYS.ENABLED_URLS]: JSON.stringify(urlList),
      [STORAGE_KEYS.ONLY_MINE]: onlyMineCheckbox.checked,
    }
    localStorage.setItem(STORAGE_KEYS.ENABLED, settings[STORAGE_KEYS.ENABLED])
    localStorage.setItem(STORAGE_KEYS.ENABLED_URLS, settings[STORAGE_KEYS.ENABLED_URLS])
    localStorage.setItem(STORAGE_KEYS.ONLY_MINE, settings[STORAGE_KEYS.ONLY_MINE])

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: SETTING_UPDATE_MESSAGE_TYPE,
        settings,
      })
    })
  }

  // Save settings to localStorage when input changes
  form.addEventListener('input', eventHandler)
  saveButton.addEventListener('click', eventHandler)
}
