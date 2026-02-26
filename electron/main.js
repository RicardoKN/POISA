const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { getDatabase, closeDatabase } = require('./db/database')

// Determine if running in development
const isDev = !app.isPackaged

let mainWindow

// ── PIN lockout state (in-memory, per spec) ───────────────
const MAX_PIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 10 * 60 * 1000 // 10 minutes
const failedAttempts = {} // { staffId: { count, lockedUntil } }

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  closeDatabase()
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ── IPC Handlers ──────────────────────────────────────────
// All handlers return { success, data, error }

// ── Auth ──────────────────────────────────────────────────

ipcMain.handle('auth:login', async (_event, pin) => {
  try {
    const db = getDatabase()
    const staff = db.prepare('SELECT id, name, role, pin FROM staff WHERE pin = ? AND is_active = 1').get(pin)

    if (!staff) {
      return { success: false, error: 'Invalid PIN. Please try again.' }
    }

    // Check lockout
    const lockInfo = failedAttempts[staff.id]
    if (lockInfo && lockInfo.lockedUntil && Date.now() < lockInfo.lockedUntil) {
      const minutesLeft = Math.ceil((lockInfo.lockedUntil - Date.now()) / 60000)
      return { success: false, error: `Account locked. Try again in ${minutesLeft} minute(s).` }
    }

    // Clear failed attempts on successful login
    delete failedAttempts[staff.id]

    // Return staff without PIN
    const { pin: _pin, ...staffData } = staff
    return { success: true, data: staffData }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('auth:failedAttempt', async (_event, pin) => {
  try {
    const db = getDatabase()
    // Look up all active staff to check if any share this PIN pattern
    // We track by PIN since we don't know the staff ID yet
    const allStaff = db.prepare('SELECT id FROM staff WHERE is_active = 1').all()

    // Track globally by PIN value
    if (!failedAttempts[pin]) {
      failedAttempts[pin] = { count: 0, lockedUntil: null }
    }
    failedAttempts[pin].count += 1

    if (failedAttempts[pin].count >= MAX_PIN_ATTEMPTS) {
      failedAttempts[pin].lockedUntil = Date.now() + LOCKOUT_DURATION_MS
      return { success: false, error: 'Too many failed attempts. Locked for 10 minutes.', locked: true }
    }

    const remaining = MAX_PIN_ATTEMPTS - failedAttempts[pin].count
    return { success: false, error: `Invalid PIN. ${remaining} attempt(s) remaining.`, locked: false }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ── Products ──────────────────────────────────────────────

ipcMain.handle('products:getAll', async () => {
  try {
    const db = getDatabase()
    const products = db.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY name ASC').all()
    return { success: true, data: products }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('products:getById', async (_event, id) => {
  try {
    const db = getDatabase()
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
    if (!product) return { success: false, error: 'Product not found' }
    return { success: true, data: product }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('products:checkDuplicate', async (_event, name) => {
  try {
    const db = getDatabase()
    const existing = db.prepare('SELECT id, name FROM products WHERE LOWER(name) = LOWER(?) AND is_active = 1').get(name)
    return { success: true, data: { exists: !!existing, product: existing || null } }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('products:add', async (_event, data) => {
  try {
    const db = getDatabase()

    const insertProduct = db.prepare(`
      INSERT INTO products (name, category, barcode, cost_price, sale_price, quantity, min_threshold)
      VALUES (@name, @category, @barcode, @cost_price, @sale_price, @quantity, @min_threshold)
    `)

    const insertStockEntry = db.prepare(`
      INSERT INTO stock_entries (product_id, type, quantity, supplier, notes, staff_id)
      VALUES (@product_id, 'initial', @quantity, @supplier, @notes, @staff_id)
    `)

    const addProductTransaction = db.transaction((productData) => {
      const result = insertProduct.run({
        name: productData.name,
        category: productData.category || null,
        barcode: productData.barcode || null,
        cost_price: productData.cost_price,
        sale_price: productData.sale_price,
        quantity: productData.quantity || 0,
        min_threshold: productData.min_threshold || 5,
      })

      const productId = result.lastInsertRowid

      if (productData.quantity > 0) {
        insertStockEntry.run({
          product_id: productId,
          quantity: productData.quantity,
          supplier: productData.supplier || null,
          notes: productData.purchase_date ? `Purchase date: ${productData.purchase_date}` : null,
          staff_id: productData.staff_id,
        })
      }

      return productId
    })

    const productId = addProductTransaction(data)
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId)

    return { success: true, data: product }
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return { success: false, error: 'A product with this name already exists.' }
    }
    return { success: false, error: err.message }
  }
})

ipcMain.handle('products:update', async (_event, id, data) => {
  try {
    const db = getDatabase()
    db.prepare(`
      UPDATE products
      SET name = @name, category = @category, barcode = @barcode,
          cost_price = @cost_price, sale_price = @sale_price,
          min_threshold = @min_threshold
      WHERE id = @id
    `).run({ ...data, id })

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
    return { success: true, data: product }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ── Stock ─────────────────────────────────────────────────

ipcMain.handle('stock:restock', async (_event, data) => {
  try {
    const db = getDatabase()

    const updateQuantity = db.prepare('UPDATE products SET quantity = quantity + ? WHERE id = ?')
    const insertEntry = db.prepare(`
      INSERT INTO stock_entries (product_id, type, quantity, supplier, notes, staff_id)
      VALUES (@product_id, 'restock', @quantity, @supplier, @notes, @staff_id)
    `)

    const restockTransaction = db.transaction((restockData) => {
      updateQuantity.run(restockData.quantity, restockData.product_id)
      insertEntry.run({
        product_id: restockData.product_id,
        quantity: restockData.quantity,
        supplier: restockData.supplier || null,
        notes: restockData.purchase_date ? `Purchase date: ${restockData.purchase_date}` : null,
        staff_id: restockData.staff_id,
      })
    })

    restockTransaction(data)

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(data.product_id)
    return { success: true, data: product }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('stock:balance', async () => {
  try {
    const db = getDatabase()
    const products = db.prepare(`
      SELECT id, name, category, barcode, cost_price, sale_price, quantity, min_threshold
      FROM products
      WHERE is_active = 1
      ORDER BY name ASC
    `).all()
    return { success: true, data: products }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ── Dashboard ─────────────────────────────────────────────

ipcMain.handle('dashboard:stats', async () => {
  try {
    const db = getDatabase()

    // Today's sales
    const todaySales = db.prepare(`
      SELECT
        COALESCE(SUM(total), 0) AS revenue,
        COUNT(*) AS transactions
      FROM sales
      WHERE date(created_at) = date('now', 'localtime')
    `).get()

    const avgSale = todaySales.transactions > 0
      ? todaySales.revenue / todaySales.transactions
      : 0

    // Total active products
    const productCount = db.prepare('SELECT COUNT(*) AS count FROM products WHERE is_active = 1').get()

    // Low stock items
    const lowStock = db.prepare(`
      SELECT id, name, category, quantity, min_threshold
      FROM products
      WHERE is_active = 1 AND quantity <= min_threshold
      ORDER BY quantity ASC
    `).all()

    return {
      success: true,
      data: {
        todayRevenue: todaySales.revenue,
        todayTransactions: todaySales.transactions,
        avgSaleValue: avgSale,
        totalProducts: productCount.count,
        lowStockItems: lowStock,
      },
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ── Sales ─────────────────────────────────────────────────

ipcMain.handle('sales:create', async (_event, data) => {
  try {
    const db = getDatabase()

    const insertSale = db.prepare(`
      INSERT INTO sales (subtotal, discount_amount, total, payment_method, cash_tendered, change_given, staff_id)
      VALUES (@subtotal, @discount_amount, @total, @payment_method, @cash_tendered, @change_given, @staff_id)
    `)
    const insertSaleItem = db.prepare(`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, line_total)
      VALUES (@sale_id, @product_id, @quantity, @unit_price, @discount, @line_total)
    `)
    const deductStock = db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?')
    const insertStockEntry = db.prepare(`
      INSERT INTO stock_entries (product_id, type, quantity, staff_id, notes)
      VALUES (@product_id, 'sale', @quantity, @staff_id, @notes)
    `)

    const createSaleTransaction = db.transaction((saleData) => {
      for (const item of saleData.items) {
        const product = db.prepare('SELECT quantity FROM products WHERE id = ?').get(item.product_id)
        if (!product || product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ID ${item.product_id}`)
        }
      }
      const saleResult = insertSale.run({
        subtotal: saleData.subtotal,
        discount_amount: saleData.discount_amount,
        total: saleData.total,
        payment_method: saleData.payment_method,
        cash_tendered: saleData.cash_tendered || null,
        change_given: saleData.change_given || null,
        staff_id: saleData.staff_id,
      })
      const saleId = saleResult.lastInsertRowid

      for (const item of saleData.items) {
        insertSaleItem.run({
          sale_id: saleId, product_id: item.product_id,
          quantity: item.quantity, unit_price: item.unit_price,
          discount: item.discount || 0, line_total: item.line_total,
        })
        deductStock.run(item.quantity, item.product_id, item.quantity)
        insertStockEntry.run({
          product_id: item.product_id, quantity: -item.quantity,
          staff_id: saleData.staff_id, notes: `Sale #${saleId}`,
        })
      }
      return saleId
    })

    const saleId = createSaleTransaction(data)
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId)
    const items = db.prepare(`
      SELECT si.*, p.name AS product_name FROM sale_items si
      JOIN products p ON p.id = si.product_id WHERE si.sale_id = ?
    `).all(saleId)

    return { success: true, data: { ...sale, items } }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('sales:getAll', async (_event, filters) => {
  try {
    const db = getDatabase()
    let query = 'SELECT s.*, st.name AS staff_name FROM sales s LEFT JOIN staff st ON st.id = s.staff_id'
    const params = []
    const conditions = []
    if (filters?.date) { conditions.push("date(s.created_at) = date(?)"); params.push(filters.date) }
    if (filters?.startDate && filters?.endDate) {
      conditions.push("date(s.created_at) BETWEEN date(?) AND date(?)"); params.push(filters.startDate, filters.endDate)
    }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY s.created_at DESC'
    const sales = db.prepare(query).all(...params)
    return { success: true, data: sales }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('sales:getById', async (_event, id) => {
  try {
    const db = getDatabase()
    const sale = db.prepare('SELECT s.*, st.name AS staff_name FROM sales s LEFT JOIN staff st ON st.id = s.staff_id WHERE s.id = ?').get(id)
    if (!sale) return { success: false, error: 'Sale not found' }
    const items = db.prepare('SELECT si.*, p.name AS product_name FROM sale_items si JOIN products p ON p.id = si.product_id WHERE si.sale_id = ?').all(id)
    return { success: true, data: { ...sale, items } }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('sales:void', async (_event, id, staffId) => {
  try {
    const db = getDatabase()
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id)
    if (!sale) return { success: false, error: 'Sale not found' }
    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id)

    db.transaction(() => {
      for (const item of items) {
        db.prepare('UPDATE products SET quantity = quantity + ? WHERE id = ?').run(item.quantity, item.product_id)
        db.prepare("INSERT INTO stock_entries (product_id, type, quantity, staff_id, notes) VALUES (?, 'adjustment', ?, ?, ?)").run(item.product_id, item.quantity, staffId, `Voided sale #${id}`)
      }
      db.prepare('DELETE FROM sale_items WHERE sale_id = ?').run(id)
      db.prepare('DELETE FROM sales WHERE id = ?').run(id)
    })()

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ── Reports ───────────────────────────────────────────────

ipcMain.handle('reports:weekly', async (_event, startDate, endDate) => {
  try {
    const db = getDatabase()

    const summary = db.prepare(`
      SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS transactions, COALESCE(AVG(total), 0) AS avg_sale
      FROM sales WHERE date(created_at) BETWEEN date(?) AND date(?)
    `).get(startDate, endDate)

    const cogs = db.prepare(`
      SELECT COALESCE(SUM(si.quantity * p.cost_price), 0) AS total_cost
      FROM sale_items si JOIN products p ON p.id = si.product_id
      JOIN sales s ON s.id = si.sale_id WHERE date(s.created_at) BETWEEN date(?) AND date(?)
    `).get(startDate, endDate)

    const dailyBreakdown = db.prepare(`
      SELECT date(created_at) AS date, COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS transactions
      FROM sales WHERE date(created_at) BETWEEN date(?) AND date(?)
      GROUP BY date(created_at) ORDER BY date(created_at)
    `).all(startDate, endDate)

    const topByRevenue = db.prepare(`
      SELECT p.name, SUM(si.line_total) AS total_revenue, SUM(si.quantity) AS total_units
      FROM sale_items si JOIN products p ON p.id = si.product_id
      JOIN sales s ON s.id = si.sale_id WHERE date(s.created_at) BETWEEN date(?) AND date(?)
      GROUP BY si.product_id ORDER BY total_revenue DESC LIMIT 10
    `).all(startDate, endDate)

    const topByUnits = db.prepare(`
      SELECT p.name, SUM(si.quantity) AS total_units, SUM(si.line_total) AS total_revenue
      FROM sale_items si JOIN products p ON p.id = si.product_id
      JOIN sales s ON s.id = si.sale_id WHERE date(s.created_at) BETWEEN date(?) AND date(?)
      GROUP BY si.product_id ORDER BY total_units DESC LIMIT 10
    `).all(startDate, endDate)

    const stockMovement = db.prepare(`
      SELECT p.id, p.name, p.quantity AS current_stock,
        COALESCE(sold.qty, 0) AS sold, COALESCE(restocked.qty, 0) AS restocked
      FROM products p
      LEFT JOIN (SELECT product_id, SUM(ABS(quantity)) AS qty FROM stock_entries WHERE type = 'sale' AND date(created_at) BETWEEN date(?) AND date(?) GROUP BY product_id) sold ON sold.product_id = p.id
      LEFT JOIN (SELECT product_id, SUM(quantity) AS qty FROM stock_entries WHERE type = 'restock' AND date(created_at) BETWEEN date(?) AND date(?) GROUP BY product_id) restocked ON restocked.product_id = p.id
      WHERE p.is_active = 1 AND (sold.qty > 0 OR restocked.qty > 0) ORDER BY p.name
    `).all(startDate, endDate, startDate, endDate)

    return {
      success: true,
      data: {
        summary: { revenue: summary.revenue, transactions: summary.transactions, avgSale: summary.avg_sale, cogs: cogs.total_cost, grossProfit: summary.revenue - cogs.total_cost },
        dailyBreakdown, topByRevenue, topByUnits, stockMovement,
      },
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ── Settings ──────────────────────────────────────────────

ipcMain.handle('settings:get', async (_event, key) => {
  try {
    const db = getDatabase()
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
    return { success: true, data: row ? row.value : null }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('settings:getAll', async () => {
  try {
    const db = getDatabase()
    const rows = db.prepare('SELECT key, value FROM settings').all()
    const settings = {}
    rows.forEach((r) => { settings[r.key] = r.value })
    return { success: true, data: settings }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('settings:set', async (_event, key, value) => {
  try {
    const db = getDatabase()
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
})
