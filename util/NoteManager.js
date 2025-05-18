import extractIssueIdFromUrl from './extractIssueIdFromCurrentUrl'
import fetchIssueJson from './fetchIssueJson'

/**
 * NoteManager class to manage notes and their updates.
 *
 * @property {String|Number} issueId - The ID of the issue.
 * @property {Array} journals - The list of journals associated with the issue.
 */
export default class NoteManager {
  issueId = 0
  journals = []

  /**
   * Creates an instance of NoteManager.
   *
   * @param {String|Number} issueId - The ID of the issue.
   * @param {Array} journals - The list of journals associated with the issue.
   */
  constructor(issueId, journals) {
    this.issueId = issueId
    this.journals = journals
  }

  static async create() {
    const issueId = extractIssueIdFromUrl()
    return new NoteManager(issueId, (await fetchIssueJson(issueId)).issue.journals)
  }

  /**
   * Checks if the specified note has been updated.
   *
   * @param {String|Number} noteId
   * @returns {Promise<Boolean>}
   * @throws {Error} - Throws an error if the journal is not found.
   */
  async isUpdatedNote(noteId, noteText) {
    const journal = this.journals.find((item) => item.id === Number(noteId))
    if (!journal) throw new Error(`Journal not found for id: ${noteId}`)

    // Normalize line endings for comparison. because the server may return different line endings.
    const normalize = (str) => (str || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    return normalize(journal.notes) !== normalize(noteText)
  }

  /**
   * Updates the note cache with the latest notes.
   *
   * @param {String|Number} noteId
   * @param {string} text
   */
  updateNoteCache(noteId, text) {
    for (const journal of this.journals) {
      if (journal.id === Number(noteId)) {
        journal.notes = text
        return
      }
    }

    throw new Error(`Journal not found for id: ${noteId}`)
  }
}
