const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

let db = null

function getDbPath() {
  // In production, store in app's userData directory
  // In dev, store in project root for convenience
  const isDev = !app.isPackaged
  if (isDev) {
    return path.join(__dirname, '..', '..', 'pos-dev.db')
  }
  return path.join(app.getPath('userData'), 'pos.db')
}

function getDatabase() {
  if (db) return db

  const dbPath = getDbPath()
  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  return db
}

function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

module.exports = { getDatabase, closeDatabase }
