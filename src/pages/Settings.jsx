import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [savingShop, setSavingShop] = useState(false)
  const [savingStock, setSavingStock] = useState(false)

  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [minThreshold, setMinThreshold] = useState(5)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const api = window.electronAPI
      if (api) {
        const result = await api.getAllSettings()
        if (result.success) {
          const s = result.data
          setShopName(s.shop_name || '')
          setShopAddress(s.shop_address || '')
          setShopPhone(s.shop_phone || '')
          setMinThreshold(parseInt(s.default_min_threshold, 10) || 5)
        }
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  const handleSaveShop = async () => {
    setSavingShop(true)
    try {
      const api = window.electronAPI
      if (api) {
        await api.setSetting('shop_name', shopName.trim())
        await api.setSetting('shop_address', shopAddress.trim())
        await api.setSetting('shop_phone', shopPhone.trim())
        toast.success('Shop information saved')
      } else {
        toast.success('Settings saved (dev mode)')
      }
    } catch {
      toast.error('Failed to save settings')
    }
    setSavingShop(false)
  }

  const handleSaveStock = async () => {
    if (minThreshold < 0 || !Number.isInteger(minThreshold)) {
      toast.error('Threshold must be a whole number (0 or greater)')
      return
    }
    setSavingStock(true)
    try {
      const api = window.electronAPI
      if (api) {
        await api.setSetting('default_min_threshold', String(minThreshold))
        toast.success('Stock settings saved')
      } else {
        toast.success('Settings saved (dev mode)')
      }
    } catch {
      toast.error('Failed to save settings')
    }
    setSavingStock(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-ink-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-sm text-ink-secondary">Configure application settings.</p>

      {/* Shop info */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-semibold text-ink-primary">Shop Information</h3>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Shop Name</label>
          <input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Your shop name"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Address</label>
          <input
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Shop address"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Phone Number</label>
          <input
            value={shopPhone}
            onChange={(e) => setShopPhone(e.target.value)}
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Contact number"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveShop}
            disabled={savingShop}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {savingShop && <Loader2 size={14} className="animate-spin" />}
            Save Settings
          </button>
        </div>
      </div>

      {/* Stock settings */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-semibold text-ink-primary">Stock Settings</h3>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Default Minimum Stock Threshold</label>
          <input
            type="number"
            min="0"
            value={minThreshold}
            onChange={(e) => setMinThreshold(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
          />
          <p className="text-xs text-ink-muted">Products below this quantity will show a low stock warning.</p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveStock}
            disabled={savingStock}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {savingStock && <Loader2 size={14} className="animate-spin" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
