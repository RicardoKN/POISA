import { useState } from 'react'
import { PackagePlus, RotateCcw } from 'lucide-react'

export default function StockInput() {
  const [mode, setMode] = useState('add') // 'add' | 'restock'

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
  return (
    <form className="space-y-5">
      <h3 className="text-lg font-semibold text-ink-primary">Add New Product</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Product Name</label>
          <input
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="e.g. Arabica Coffee Beans"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Category</label>
          <select className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="">Select category</option>
            <option>Beverages</option>
            <option>Snacks</option>
            <option>Dairy</option>
            <option>Household</option>
            <option>Personal Care</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink-primary">Barcode</label>
        <input
          className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
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
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Sale Price (BWP)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Initial Quantity</label>
          <input
            type="number"
            min="0"
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Supplier</label>
          <input
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Supplier name (optional)"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Purchase Date</label>
          <input
            type="date"
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Save Product
        </button>
      </div>
    </form>
  )
}

function RestockForm() {
  return (
    <form className="space-y-5">
      <h3 className="text-lg font-semibold text-ink-primary">Restock Existing Product</h3>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink-primary">Search Product</label>
        <input
          className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
          placeholder="Type product name or scan barcode..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Quantity to Add</label>
          <input
            type="number"
            min="1"
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="0"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Supplier</label>
          <input
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Supplier name (optional)"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink-primary">Purchase Date</label>
        <input
          type="date"
          className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Restock
        </button>
      </div>
    </form>
  )
}
