import { useState, useEffect } from 'react'
import { PackagePlus, RotateCcw, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { validateProduct } from '../utils/validators'
import { formatCurrency } from '../utils/formatters'

const CATEGORIES = ['Beverages', 'Snacks', 'Dairy', 'Bakery', 'Household', 'Personal Care', 'Staples', 'Canned Goods', 'Other']
const INPUT_CLASS = 'w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150'
const ERROR_INPUT_CLASS = 'w-full bg-sunken border border-danger rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-danger/40'

export default function StockInput() {
  const [mode, setMode] = useState('add')

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('add')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
            mode === 'add'
              ? 'bg-slate-800 text-white'
              : 'bg-surface text-slate-700 border border-border hover:bg-sunken'
          }`}
        >
          <PackagePlus size={16} />
          New Product
        </button>
        <button
          onClick={() => setMode('restock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
            mode === 'restock'
              ? 'bg-slate-800 text-white'
              : 'bg-surface text-slate-700 border border-border hover:bg-sunken'
          }`}
        >
          <RotateCcw size={16} />
          Restock
        </button>
      </div>

      {/* Form card */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm max-w-2xl">
        {mode === 'add' ? <AddProductForm /> : <RestockForm />}
      </div>
    </div>
  )
}

function AddProductForm() {
  const { staff } = useAuthStore()
  const [form, setForm] = useState({
    name: '', category: '', barcode: '',
    cost_price: '', sale_price: '', quantity: '',
    supplier: '', purchase_date: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState(null)
  const [priceWarning, setPriceWarning] = useState(false)

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      ...form,
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      quantity: parseInt(form.quantity, 10) || 0,
    }

    // Client-side validation
    const validationErrors = validateProduct(data)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Sale price < cost price warning
    if (data.sale_price < data.cost_price && !priceWarning) {
      setPriceWarning(true)
      return
    }

    // Duplicate name check
    if (!duplicateWarning) {
      try {
        const api = window.electronAPI
        if (api) {
          const dupResult = await api.checkDuplicate(data.name)
          if (dupResult.success && dupResult.data.exists) {
            setDuplicateWarning(dupResult.data.product.name)
            return
          }
        }
      } catch {
        // continue if check fails
      }
    }

    setSaving(true)
    try {
      const api = window.electronAPI
      if (api) {
        const result = await api.addProduct({
          ...data,
          min_threshold: 5,
          staff_id: staff?.id,
        })

        if (result.success) {
          toast.success(`"${result.data.name}" added successfully`)
          // Reset form
          setForm({
            name: '', category: '', barcode: '',
            cost_price: '', sale_price: '', quantity: '',
            supplier: '', purchase_date: new Date().toISOString().split('T')[0],
          })
          setDuplicateWarning(null)
          setPriceWarning(false)
        } else {
          toast.error(result.error)
        }
      } else {
        toast.success('Product saved (dev mode)')
        setForm({
          name: '', category: '', barcode: '',
          cost_price: '', sale_price: '', quantity: '',
          supplier: '', purchase_date: new Date().toISOString().split('T')[0],
        })
      }
    } catch (err) {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
      setDuplicateWarning(null)
      setPriceWarning(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '', category: '', barcode: '',
      cost_price: '', sale_price: '', quantity: '',
      supplier: '', purchase_date: new Date().toISOString().split('T')[0],
    })
    setErrors({})
    setDuplicateWarning(null)
    setPriceWarning(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-lg font-semibold text-ink-primary">Add New Product</h3>

      {/* Duplicate warning */}
      {duplicateWarning && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle size={16} className="text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              A product named "{duplicateWarning}" already exists.
            </p>
            <p className="text-xs text-amber-700 mt-1">Submit again to save anyway, or change the name.</p>
          </div>
        </div>
      )}

      {/* Price warning */}
      {priceWarning && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle size={16} className="text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              Sale price is lower than cost price.
            </p>
            <p className="text-xs text-amber-700 mt-1">Submit again to confirm, or adjust the prices.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Product Name</label>
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={errors.name ? ERROR_INPUT_CLASS : INPUT_CLASS}
            placeholder="e.g. Arabica Coffee Beans"
          />
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Category</label>
          <select
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            className={errors.category ? ERROR_INPUT_CLASS : INPUT_CLASS}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink-primary">Barcode</label>
        <input
          value={form.barcode}
          onChange={(e) => updateField('barcode', e.target.value)}
          className={INPUT_CLASS}
          placeholder="Scan or enter barcode (optional)"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Cost Price (BWP)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.cost_price}
            onChange={(e) => updateField('cost_price', e.target.value)}
            className={errors.cost_price ? ERROR_INPUT_CLASS : INPUT_CLASS}
            placeholder="0.00"
          />
          {errors.cost_price && <p className="text-xs text-danger mt-1">{errors.cost_price}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Sale Price (BWP)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.sale_price}
            onChange={(e) => updateField('sale_price', e.target.value)}
            className={errors.sale_price ? ERROR_INPUT_CLASS : INPUT_CLASS}
            placeholder="0.00"
          />
          {errors.sale_price && <p className="text-xs text-danger mt-1">{errors.sale_price}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Initial Quantity</label>
          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => updateField('quantity', e.target.value)}
            className={errors.quantity ? ERROR_INPUT_CLASS : INPUT_CLASS}
            placeholder="0"
          />
          {errors.quantity && <p className="text-xs text-danger mt-1">{errors.quantity}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Supplier</label>
          <input
            value={form.supplier}
            onChange={(e) => updateField('supplier', e.target.value)}
            className={INPUT_CLASS}
            placeholder="Supplier name (optional)"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Purchase Date</label>
          <input
            type="date"
            value={form.purchase_date}
            onChange={(e) => updateField('purchase_date', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={resetForm}
          className="bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  )
}

function RestockForm() {
  const { staff } = useAuthStore()
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [supplier, setSupplier] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Load products for search
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const api = window.electronAPI
        if (api) {
          const result = await api.getProducts()
          if (result.success) setProducts(result.data)
        }
      } catch {
        // ignore
      }
    }
    loadProducts()
  }, [])

  const filtered = search.length >= 1
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.barcode && p.barcode.includes(search))
      )
    : []

  const selectProduct = (product) => {
    setSelectedProduct(product)
    setSearch(product.name)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!selectedProduct) newErrors.product = 'Select a product'
    const qty = parseInt(quantity, 10)
    if (!qty || qty <= 0) newErrors.quantity = 'Quantity must be at least 1'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const api = window.electronAPI
      if (api) {
        const result = await api.restockProduct({
          product_id: selectedProduct.id,
          quantity: qty,
          supplier: supplier || null,
          purchase_date: purchaseDate,
          staff_id: staff?.id,
        })

        if (result.success) {
          toast.success(`Restocked "${result.data.name}" — now ${result.data.quantity} in stock`)
          setSearch('')
          setSelectedProduct(null)
          setQuantity('')
          setSupplier('')
          // Refresh product list
          const refreshed = await api.getProducts()
          if (refreshed.success) setProducts(refreshed.data)
        } else {
          toast.error(result.error)
        }
      } else {
        toast.success('Restocked (dev mode)')
      }
    } catch (err) {
      toast.error('Failed to restock product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-lg font-semibold text-ink-primary">Restock Existing Product</h3>

      {/* Product search */}
      <div className="space-y-1.5 relative">
        <label className="text-sm font-medium text-ink-primary">Search Product</label>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelectedProduct(null)
            setErrors((prev) => ({ ...prev, product: null }))
          }}
          className={errors.product ? ERROR_INPUT_CLASS : INPUT_CLASS}
          placeholder="Type product name or scan barcode..."
        />
        {errors.product && <p className="text-xs text-danger mt-1">{errors.product}</p>}

        {/* Search results dropdown */}
        {filtered.length > 0 && !selectedProduct && (
          <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-md max-h-48 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectProduct(p)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors duration-100 flex justify-between items-center"
              >
                <span className="text-ink-primary">{p.name}</span>
                <span className="text-xs text-ink-muted">Stock: {p.quantity}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected product info */}
      {selectedProduct && (
        <div className="bg-sunken rounded-lg p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-secondary">Current Stock</span>
            <span className="text-ink-primary font-medium">{selectedProduct.quantity} units</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-ink-secondary">Cost Price</span>
            <span className="text-ink-primary font-medium">{formatCurrency(selectedProduct.cost_price)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Quantity to Add</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value)
              setErrors((prev) => ({ ...prev, quantity: null }))
            }}
            className={errors.quantity ? ERROR_INPUT_CLASS : INPUT_CLASS}
            placeholder="0"
          />
          {errors.quantity && <p className="text-xs text-danger mt-1">{errors.quantity}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Supplier</label>
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className={INPUT_CLASS}
            placeholder="Supplier name (optional)"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink-primary">Purchase Date</label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setSearch('')
            setSelectedProduct(null)
            setQuantity('')
            setSupplier('')
            setErrors({})
          }}
          className="bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          {saving ? 'Restocking...' : 'Restock'}
        </button>
      </div>
    </form>
  )
}
