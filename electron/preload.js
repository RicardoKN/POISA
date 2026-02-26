const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Auth ─────────────────────────────────────────────────
  // login: (pin) => ipcRenderer.invoke('auth:login', pin),

  // ── Products ─────────────────────────────────────────────
  // getProducts: () => ipcRenderer.invoke('products:getAll'),
  // addProduct: (data) => ipcRenderer.invoke('products:add', data),
  // updateProduct: (id, data) => ipcRenderer.invoke('products:update', id, data),

  // ── Stock ────────────────────────────────────────────────
  // getStockBalance: () => ipcRenderer.invoke('stock:balance'),
  // restockProduct: (data) => ipcRenderer.invoke('stock:restock', data),

  // ── Sales ────────────────────────────────────────────────
  // createSale: (data) => ipcRenderer.invoke('sales:create', data),
  // getSales: (filters) => ipcRenderer.invoke('sales:getAll', filters),
  // voidSale: (id) => ipcRenderer.invoke('sales:void', id),

  // ── Reports ──────────────────────────────────────────────
  // getWeeklyReport: (startDate, endDate) => ipcRenderer.invoke('reports:weekly', startDate, endDate),

  // ── Settings ─────────────────────────────────────────────
  // getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  // setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
})
