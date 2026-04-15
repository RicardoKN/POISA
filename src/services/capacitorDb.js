import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

// In-memory lockout state
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000;
const failedAttempts = {};

class DatabaseService {
  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.db = null;
  }

  async initializePlugin() {
    if (Capacitor.getPlatform() === 'web') {
      const jeepSqlite = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepSqlite);
      await customElements.whenDefined('jeep-sqlite');
      await this.sqlite.initWebStore();
    }
  }

  async openDatabase() {
    try {
      await this.initializePlugin();
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection('pos_db', false)).result;
      
      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection('pos_db', false);
      } else {
        this.db = await this.sqlite.createConnection('pos_db', false, 'no-encryption', 1, false);
      }
      
      await this.db.open();
      await this.initSchema();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error opening database', error);
      throw error;
    }
  }

  async initSchema() {
    const schema = `
      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('manager', 'cashier')),
        pin TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        barcode TEXT,
        cost_price REAL NOT NULL,
        sale_price REAL NOT NULL,
        quantity INTEGER DEFAULT 0,
        min_threshold INTEGER DEFAULT 5,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS stock_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id),
        type TEXT NOT NULL CHECK (type IN ('initial', 'restock', 'sale', 'adjustment')),
        quantity INTEGER NOT NULL,
        supplier TEXT,
        notes TEXT,
        staff_id INTEGER REFERENCES staff(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subtotal REAL NOT NULL,
        discount_amount REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mixed')),
        cash_tendered REAL,
        change_given REAL,
        staff_id INTEGER REFERENCES staff(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL REFERENCES sales(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        line_total REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;
    await this.db.execute(schema);
    
    if (Capacitor.getPlatform() === 'web') {
      await this.sqlite.saveToStore('pos_db');
    }
  }

  // ── Auth ──────────────────────────────────────────────────
  async checkAdminExists() {
    try {
      const res = await this.db.query("SELECT id FROM staff WHERE role = 'manager' AND is_active = 1 LIMIT 1");
      return { success: true, exists: res.values.length > 0 };
    } catch (err) {
      return { success: false, error: err.message, exists: true };
    }
  }

  async createFirstAdmin(data) {
    try {
      const adminRes = await this.db.query("SELECT id FROM staff WHERE role = 'manager' AND is_active = 1 LIMIT 1");
      if (adminRes.values.length > 0) return { success: false, error: 'Admin exists' };
      
      await this.db.run('INSERT INTO staff (name, role, pin) VALUES (?, ?, ?)', [data.name, 'manager', data.pin]);
      const newAdmin = await this.db.query("SELECT id, name, role FROM staff WHERE pin = ? AND is_active = 1", [data.pin]);
      
      if (Capacitor.getPlatform() === 'web') await this.sqlite.saveToStore('pos_db');
      return { success: true, data: newAdmin.values[0] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async login(pin) {
    try {
      const res = await this.db.query('SELECT id, name, role, pin FROM staff WHERE pin = ? AND is_active = 1', [pin]);
      const staff = res.values[0];
      if (!staff) return { success: false, error: 'Invalid PIN. Please try again.' };

      const lockInfo = failedAttempts[staff.id];
      if (lockInfo && lockInfo.lockedUntil && Date.now() < lockInfo.lockedUntil) {
        const minutesLeft = Math.ceil((lockInfo.lockedUntil - Date.now()) / 60000);
        return { success: false, error: `Account locked. Try again in ${minutesLeft} minute(s).` };
      }

      delete failedAttempts[staff.id];
      const { pin: _pin, ...staffData } = staff;
      return { success: true, data: staffData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async failedAttempt(pin) {
    try {
      if (!failedAttempts[pin]) failedAttempts[pin] = { count: 0, lockedUntil: null };
      failedAttempts[pin].count += 1;

      if (failedAttempts[pin].count >= MAX_PIN_ATTEMPTS) {
        failedAttempts[pin].lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        return { success: false, error: 'Too many failed attempts. Locked for 10 minutes.', locked: true };
      }

      const remaining = MAX_PIN_ATTEMPTS - failedAttempts[pin].count;
      return { success: false, error: `Invalid PIN. ${remaining} attempt(s) remaining.`, locked: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Add more methods according to standard structure...
  // Stubbing for basic implementation. 

}

export const dbService = new DatabaseService();
