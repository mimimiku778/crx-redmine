import { STORAGE_KEYS } from './constants'
import { TRANSLATIONS } from './translations'
import attachEventHandlers from './attachEventHandlers'
import './popup-style.css'

const currentLang = navigator.language.startsWith('ja') ? 'ja' : 'en'
const t = (key) => TRANSLATIONS[currentLang]?.[key] || key

export default function renderPopup() {
  document.getElementById('app').innerHTML = /* html */ `
    <form>
      <h1>${t('Redmine Interactive Checkboxes')}</h1>
      <label><input type="checkbox" id="${STORAGE_KEYS.ENABLED}" /> ${t('Enable feature')}</label>
      <label><input type="checkbox" id="${STORAGE_KEYS.ONLY_MINE}" /> ${t('Only apply to my issues')}</label>
      <div>
        <details>
          <summary>${t('Target URLs')}</summary>
          <textarea id="${STORAGE_KEYS.ENABLED_URLS}"></textarea>
          <small>${t('(Enter with space delimited)')}</small>
          <input id="save" type="button" value="${t('Save URLs')}" />
          <small>${t('The feature will be enabled on URL containing the target URL.')}</small>
          <small>${t('If empty, *://*/issues/* will be used.')}</small>
          <small>${t('e.g.')}</small>
          <small>${t('https://redmine.com/issues/')}</small>
          <small>${t('https://example.com/issues/123')}</small>
        </details>
      </div>
      <div>
        <details>
          <summary>${t('Advanced Settings')}</summary>
          <label><input type="checkbox" id="${STORAGE_KEYS.SKIP_DIFFERENCE_CHECK}" /> ${t(
    'Skip difference check'
  )}</label>
          <small>${t(
            'This will skip checking the differences between the browser and the server, reducing server requests and speeding up checkbox updates, which may have unintended consequences if the note is being edited in another session.'
          )}</small>
        </details>
      </div>
    </form>
  `

  // Attach event handlers to the form elements
  attachEventHandlers()
}
