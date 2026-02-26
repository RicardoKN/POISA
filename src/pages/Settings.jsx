export default function Settings() {
  // TODO: Wire up with IPC in Phase 5

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-sm text-ink-secondary">Configure application settings.</p>

      {/* Shop info */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-semibold text-ink-primary">Shop Information</h3>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Shop Name</label>
          <input
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Your shop name"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Address</label>
          <input
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Shop address"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-primary">Phone Number</label>
          <input
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
            placeholder="Contact number"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
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
            defaultValue={5}
            className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
          />
          <p className="text-xs text-ink-muted">Products below this quantity will show a low stock warning.</p>
        </div>

        <div className="flex justify-end pt-2">
          <button className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
