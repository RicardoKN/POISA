import { useState, useEffect } from 'react'
import { UserPlus, Pencil, ShieldCheck, ShieldOff, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { validatePin } from '../utils/validators'
import { formatDateTime } from '../utils/formatters'

const EMPTY_FORM = { name: '', role: 'cashier', pin: '', confirmPin: '' }

export default function StaffManagement() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null) // null = add, object = edit
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    setLoading(true)
    try {
      const api = window.electronAPI
      if (api) {
        const result = await api.getAllStaff()
        if (result.success) setStaff(result.data)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  const openAddModal = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowModal(true)
  }

  const openEditModal = (member) => {
    setEditing(member)
    setForm({ name: member.name, role: member.role, pin: '', confirmPin: '' })
    setErrors({})
    setShowModal(true)
  }

  const validateForm = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!editing) {
      // PIN required for new staff
      const pinErr = validatePin(form.pin)
      if (pinErr) errs.pin = pinErr
      if (form.pin !== form.confirmPin) errs.confirmPin = 'PINs do not match'
    } else if (form.pin) {
      // PIN optional when editing, but validate if provided
      const pinErr = validatePin(form.pin)
      if (pinErr) errs.pin = pinErr
      if (form.pin !== form.confirmPin) errs.confirmPin = 'PINs do not match'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const api = window.electronAPI
      if (!api) {
        toast.success(editing ? 'Staff updated (dev mode)' : 'Staff added (dev mode)')
        setShowModal(false)
        setSaving(false)
        return
      }

      if (editing) {
        const updateData = { name: form.name.trim(), role: form.role }
        if (form.pin) updateData.pin = form.pin
        const result = await api.updateStaff(editing.id, updateData)
        if (result.success) {
          toast.success('Staff member updated')
          setShowModal(false)
          loadStaff()
        } else {
          toast.error(result.error)
        }
      } else {
        const result = await api.addStaff({
          name: form.name.trim(),
          role: form.role,
          pin: form.pin,
        })
        if (result.success) {
          toast.success('Staff member added')
          setShowModal(false)
          loadStaff()
        } else {
          toast.error(result.error)
        }
      }
    } catch {
      toast.error('Failed to save staff member')
    }
    setSaving(false)
  }

  const handleToggleActive = async (member) => {
    const action = member.is_active ? 'deactivate' : 'reactivate'
    try {
      const api = window.electronAPI
      if (api) {
        const result = await api.toggleStaffActive(member.id)
        if (result.success) {
          toast.success(`Staff member ${action}d`)
          loadStaff()
        } else {
          toast.error(result.error)
        }
      }
    } catch {
      toast.error(`Failed to ${action} staff member`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-secondary">
          Manage staff accounts and permissions
        </h3>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
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
              <th className="text-left text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Created</th>
              <th className="text-center text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Loader2 size={20} className="animate-spin mx-auto text-ink-muted" />
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-ink-secondary">
                  No staff accounts yet. Add staff to get started.
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className={!member.is_active ? 'opacity-50' : ''}>
                  <td className="px-4 py-3 font-medium text-ink-primary">{member.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.role === 'manager'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {member.role === 'manager' ? 'Manager' : 'Cashier'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{formatDateTime(member.created_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.is_active
                        ? 'bg-green-50 text-success'
                        : 'bg-red-50 text-danger'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(member)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-sunken transition-colors duration-150"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(member)}
                        title={member.is_active ? 'Deactivate' : 'Reactivate'}
                        className={`p-1.5 rounded-lg transition-colors duration-150 ${
                          member.is_active
                            ? 'text-ink-muted hover:text-danger hover:bg-red-50'
                            : 'text-ink-muted hover:text-success hover:bg-green-50'
                        }`}
                      >
                        {member.is_active ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-ink-primary">
                {editing ? 'Edit Staff Member' : 'Add Staff Member'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-ink-secondary hover:bg-sunken hover:text-ink-primary transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-primary">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full bg-sunken border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150 ${errors.name ? 'border-danger' : 'border-border'}`}
                  placeholder="e.g. Jane Moeti"
                />
                {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-primary">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full bg-sunken border border-border rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150"
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              {/* PIN */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-primary">
                  {editing ? 'New PIN (leave blank to keep current)' : 'Login PIN'}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={form.pin}
                  onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  className={`w-full bg-sunken border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150 ${errors.pin ? 'border-danger' : 'border-border'}`}
                  placeholder="4-digit PIN"
                />
                {errors.pin && <p className="text-xs text-danger">{errors.pin}</p>}
              </div>

              {/* Confirm PIN */}
              {(form.pin || !editing) && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink-primary">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={form.confirmPin}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    className={`w-full bg-sunken border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition duration-150 ${errors.confirmPin ? 'border-danger' : 'border-border'}`}
                    placeholder="Re-enter PIN"
                  />
                  {errors.confirmPin && <p className="text-xs text-danger">{errors.confirmPin}</p>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm font-medium text-ink-secondary hover:text-ink-primary px-4 py-2 rounded-lg hover:bg-sunken transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? 'Save Changes' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
