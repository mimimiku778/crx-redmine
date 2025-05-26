import { STORAGE_KEYS } from './constants'

export default function attachEventHandlers() {
  const enabledCheckbox = document.getElementById(STORAGE_KEYS.ENABLED)
  const urlsTextarea = document.getElementById(STORAGE_KEYS.ENABLED_URLS)
  const onlyMineCheckbox = document.getElementById(STORAGE_KEYS.ONLY_MINE)
  const saveButton = document.getElementById('save')
  const form = enabledCheckbox.closest('form')

  // Load settings from chrome.storage and populate the form
  chrome.storage.local.get(
    [STORAGE_KEYS.ENABLED, STORAGE_KEYS.ENABLED_URLS, STORAGE_KEYS.ONLY_MINE, STORAGE_KEYS.SKIP_DIFFERENCE_CHECK],
    (result) => {
      const isEnabled = result[STORAGE_KEYS.ENABLED] !== undefined ? Boolean(result[STORAGE_KEYS.ENABLED]) : true
      enabledCheckbox.checked = isEnabled
      urlsTextarea.value = Array.isArray(result[STORAGE_KEYS.ENABLED_URLS])
        ? result[STORAGE_KEYS.ENABLED_URLS].join('\n')
        : ''
      onlyMineCheckbox.checked = Boolean(result[STORAGE_KEYS.ONLY_MINE])
      skipDifferenceCheck.checked = Boolean(result[STORAGE_KEYS.SKIP_DIFFERENCE_CHECK])
    }
  )

  const eventHandler = (e) => {
    if (e.target.id === STORAGE_KEYS.ENABLED_URLS) return

    // Split textarea input into trimmed, non-empty lines
    const urlList = urlsTextarea.value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    // Store updated settings
    chrome.storage.local.set({
      [STORAGE_KEYS.ENABLED]: enabledCheckbox.checked,
      [STORAGE_KEYS.ENABLED_URLS]: urlList,
      [STORAGE_KEYS.ONLY_MINE]: onlyMineCheckbox.checked,
      [STORAGE_KEYS.SKIP_DIFFERENCE_CHECK]: skipDifferenceCheck.checked,
    })
  }

  // Save settings to chrome.storage when input changes
  form.addEventListener('input', eventHandler)
  saveButton.addEventListener('click', eventHandler)
}
