import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Delete } from 'lucide-react'
import useAuthStore from '../store/authStore'

const PIN_LENGTH = 4

export default function Login() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleDigit = (digit) => {
    if (pin.length >= PIN_LENGTH) return
    const newPin = pin + digit

    setError('')
    setPin(newPin)

    if (newPin.length === PIN_LENGTH) {
      handleLogin(newPin)
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
    setError('')
  }

  const handleLogin = async (enteredPin) => {
    // TODO: Replace with IPC call in Phase 3
    // const result = await window.electronAPI.login(enteredPin)
    // For now, simulate login for UI development
    if (enteredPin === '1234') {
      login({ id: 1, name: 'Manager', role: 'manager' })
      navigate('/dashboard')
    } else if (enteredPin === '5678') {
      login({ id: 2, name: 'Cashier', role: 'cashier' })
      navigate('/dashboard')
    } else {
      setError('Invalid PIN. Please try again.')
      setPin('')
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

        {/* PIN pad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(String(digit))}
              className="w-14 h-14 mx-auto bg-sunken rounded-xl text-lg font-semibold text-ink-primary hover:bg-slate-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {digit}
            </button>
          ))}

          {/* Bottom row: empty | 0 | delete */}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="w-14 h-14 mx-auto bg-sunken rounded-xl text-lg font-semibold text-ink-primary hover:bg-slate-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-14 mx-auto rounded-xl text-ink-secondary hover:bg-sunken hover:text-ink-primary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400 flex items-center justify-center"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
