const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Auth ─────────────────────────────────────────────────
  login: (pin) => ipcRenderer.invoke('auth:login', pin),
  failedAttempt: (pin) => ipcRenderer.invoke('auth:failedAttempt', pin),

  // ── Products ─────────────────────────────────────────────
  getProducts: () => ipcRenderer.invoke('products:getAll'),
  getProductById: (id) => ipcRenderer.invoke('products:getById', id),
  checkDuplicate: (name) => ipcRenderer.invoke('products:checkDuplicate', name),
  addProduct: (data) => ipcRenderer.invoke('products:add', data),
  updateProduct: (id, data) => ipcRenderer.invoke('products:update', id, data),

  // ── Stock ────────────────────────────────────────────────
  getStockBalance: () => ipcRenderer.invoke('stock:balance'),
  restockProduct: (data) => ipcRenderer.invoke('stock:restock', data),

  // ── Dashboard ────────────────────────────────────────────
  getDashboardStats: () => ipcRenderer.invoke('dashboard:stats'),

  // ── Sales ────────────────────────────────────────────────
  createSale: (data) => ipcRenderer.invoke('sales:create', data),
  getSales: (filters) => ipcRenderer.invoke('sales:getAll', filters),
  getSaleById: (id) => ipcRenderer.invoke('sales:getById', id),
  voidSale: (id, staffId) => ipcRenderer.invoke('sales:void', id, staffId),

  // ── Reports ──────────────────────────────────────────────
  getWeeklyReport: (startDate, endDate) => ipcRenderer.invoke('reports:weekly', startDate, endDate),

  // ── Settings ─────────────────────────────────────────────
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
})
