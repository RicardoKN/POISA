import { UserPlus } from 'lucide-react'

export default function StaffManagement() {
  // TODO: Wire up with IPC in Phase 5

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-secondary">Manage staff accounts and permissions</h3>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
          <UserPlus size={16} />
          Add Staff
        </button>
      </div>

      {/* Staff table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sunken border-b border-border">
              <th className="text-left text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Role</th>
              <th className="text-center text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-sm text-ink-secondary">
                No staff accounts yet. Add staff to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
