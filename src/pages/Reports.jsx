import { Calendar, FileDown } from 'lucide-react'

export default function Reports() {
  // TODO: Wire up with useReports hook + IPC in Phase 4

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-ink-muted" />
          <input
            type="date"
            className="bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 transition duration-150"
          />
          <span className="text-sm text-ink-muted">to</span>
          <input
            type="date"
            className="bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 transition duration-150"
          />
        </div>
        <button className="flex items-center gap-2 bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-150">
          <FileDown size={16} />
          Export PDF
        </button>
      </div>

      {/* Sales summary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: 'BWP 0.00' },
          { label: 'Transactions', value: '0' },
          { label: 'Avg Sale Value', value: 'BWP 0.00' },
          { label: 'Gross Profit', value: 'BWP 0.00' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface rounded-xl border border-border p-5 shadow-sm">
            <p className="text-xs font-medium text-ink-secondary uppercase tracking-wide">
              {kpi.label}
            </p>
            <p className="text-2xl font-bold text-ink-primary mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-ink-primary mb-4">Daily Sales Breakdown</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-ink-secondary">Chart will appear here when sales data is available.</p>
        </div>
      </div>

      {/* Top products placeholder */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-ink-primary mb-4">Top 10 by Revenue</h3>
          <p className="text-sm text-ink-secondary">No sales data yet.</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-ink-primary mb-4">Top 10 by Units Sold</h3>
          <p className="text-sm text-ink-secondary">No sales data yet.</p>
        </div>
      </div>
    </div>
  )
}
