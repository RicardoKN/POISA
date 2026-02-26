import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Delete } from 'lucide-react'
import useAuthStore from '../store/authStore'

const PIN_LENGTH = 4

export default function Login() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleDigit = (digit) => {
    if (pin.length >= PIN_LENGTH || loading) return
    const newPin = pin + digit

    setError('')
    setPin(newPin)

    if (newPin.length === PIN_LENGTH) {
      handleLogin(newPin)
    }
  }

  const handleDelete = () => {
    if (loading) return
    setPin((prev) => prev.slice(0, -1))
    setError('')
  }

  const handleLogin = async (enteredPin) => {
    setLoading(true)
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.login(enteredPin)
        if (result.success) {
          login(result.data)
          navigate('/dashboard')
        } else {
          const attemptResult = await window.electronAPI.failedAttempt(enteredPin)
          setError(attemptResult.error || result.error)
          setPin('')
        }
      } else {
        // Dev fallback when running outside Electron (npm run dev)
        if (enteredPin === '1234') {
          login({ id: 1, name: 'Admin Manager', role: 'manager' })
          navigate('/dashboard')
        } else if (enteredPin === '5678') {
          login({ id: 2, name: 'Jane Cashier', role: 'cashier' })
          navigate('/dashboard')
        } else {
          setError('Invalid PIN. Please try again.')
          setPin('')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-canvas">
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-8 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-ink-primary">POISA POS</h1>
          <p className="text-sm text-ink-secondary mt-1">Enter your PIN to sign in</p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-150 ${
                i < pin.length ? 'bg-slate-800' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-danger text-center mb-4">{error}</p>
        )}

        {/* Loading indicator */}
        {loading && (
          <p className="text-xs text-ink-secondary text-center mb-4">Signing in...</p>
        )}

        {/* PIN pad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(String(digit))}
              disabled={loading}
              className="w-14 h-14 mx-auto bg-sunken rounded-xl text-lg font-semibold text-ink-primary hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {digit}
            </button>
          ))}

          {/* Bottom row: empty | 0 | delete */}
          <div />
          <button
            onClick={() => handleDigit('0')}
            disabled={loading}
            className="w-14 h-14 mx-auto bg-sunken rounded-xl text-lg font-semibold text-ink-primary hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-14 h-14 mx-auto rounded-xl text-ink-secondary hover:bg-sunken hover:text-ink-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400 flex items-center justify-center"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
