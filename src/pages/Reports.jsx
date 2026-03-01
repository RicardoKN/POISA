import { useState, useEffect } from 'react'
import { Calendar, FileDown, Printer, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '../utils/formatters'
import { generateReportPdf } from '../utils/pdf'

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMon)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  }
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Reports() {
  const week = getWeekRange()
  const [startDate, setStartDate] = useState(week.start)
  const [endDate, setEndDate] = useState(week.end)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReport()
  }, [startDate, endDate])

  const loadReport = async () => {
    setLoading(true)
    try {
      const api = window.electronAPI
      if (api) {
        const result = await api.getWeeklyReport(startDate, endDate)
        if (result.success) setReport(result.data)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const chartData = (report?.dailyBreakdown || []).map((d) => ({
    date: DAY_NAMES[new Date(d.date + 'T00:00:00').getDay()] + ' ' + d.date.slice(8),
    revenue: d.revenue,
    transactions: d.transactions,
  }))

  const handleExportPdf = () => {
    if (!report) return
    generateReportPdf({ report, startDate, endDate })
  }

  const s = report?.summary

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-ink-muted" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 transition duration-150"
          />
          <span className="text-sm text-ink-muted">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 transition duration-150"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-surface hover:bg-sunken text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-150"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={handleExportPdf}
            disabled={!report}
            className="flex items-center gap-2 bg-surface hover:bg-sunken disabled:opacity-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-150"
          >
            <FileDown size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-ink-muted" />
        </div>
      ) : (
        <>
          {/* Sales summary KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(s?.revenue || 0) },
              { label: 'Transactions', value: String(s?.transactions || 0) },
              { label: 'Avg Sale Value', value: formatCurrency(s?.avgSale || 0) },
              { label: 'Cost of Goods', value: formatCurrency(s?.cogs || 0) },
              { label: 'Gross Profit', value: formatCurrency(s?.grossProfit || 0) },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-surface rounded-xl border border-border p-5 shadow-sm">
                <p className="text-xs font-medium text-ink-secondary uppercase tracking-wide">{kpi.label}</p>
                <p className="text-2xl font-bold text-ink-primary mt-1">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Daily sales chart */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-ink-primary mb-4">Daily Sales Breakdown</h3>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-sm text-ink-secondary">No sales data for this period.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: '0.875rem' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top products */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-ink-primary mb-4">Top 10 by Revenue</h3>
              {!report?.topByRevenue?.length ? (
                <p className="text-sm text-ink-secondary">No sales data yet.</p>
              ) : (
                <div className="space-y-2">
                  {report.topByRevenue.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-ink-muted w-5">{i + 1}.</span>
                        <span className="text-sm text-ink-primary truncate">{p.name}</span>
                      </div>
                      <span className="text-sm font-medium text-ink-primary whitespace-nowrap ml-2">{formatCurrency(p.total_revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-ink-primary mb-4">Top 10 by Units Sold</h3>
              {!report?.topByUnits?.length ? (
                <p className="text-sm text-ink-secondary">No sales data yet.</p>
              ) : (
                <div className="space-y-2">
                  {report.topByUnits.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-ink-muted w-5">{i + 1}.</span>
                        <span className="text-sm text-ink-primary truncate">{p.name}</span>
                      </div>
                      <span className="text-sm font-medium text-ink-primary whitespace-nowrap ml-2">{p.total_units} units</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stock movement table */}
          {report?.stockMovement?.length > 0 && (
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-ink-primary">Stock Movement</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sunken border-b border-border">
                    <th className="text-left text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Product</th>
                    <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Sold</th>
                    <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Restocked</th>
                    <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.stockMovement.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors duration-100">
                      <td className="px-4 py-3 text-ink-primary font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-ink-primary text-right">{row.sold}</td>
                      <td className="px-4 py-3 text-ink-primary text-right">{row.restocked}</td>
                      <td className="px-4 py-3 text-ink-primary text-right">{row.current_stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
