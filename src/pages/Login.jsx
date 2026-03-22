import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Delete, Sparkles, LineChart, Heart } from 'lucide-react'
import useAuthStore from '../store/authStore'

const PIN_LENGTH = 4

export default function Login() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [time, setTime] = useState(new Date())

  const navigate = useNavigate()
  const { login } = useAuthStore()

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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
          triggerError(attemptResult.error || result.error)
        }
      } else {
        // Dev fallback when running outside Electron
        if (enteredPin === '1234') {
          login({ id: 1, name: 'Admin Manager', role: 'manager' })
          navigate('/dashboard')
        } else if (enteredPin === '5678') {
          login({ id: 2, name: 'Jane Cashier', role: 'cashier' })
          navigate('/dashboard')
        } else {
          triggerError('Invalid PIN. Please try again.')
        }
      }
    } catch (err) {
      triggerError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const triggerError = (msg) => {
    setError(msg)
    setPin('')
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  // Format date and time
  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateString = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* LEFT PANEL: Branding & Infographic (Hidden on tiny screens) */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between bg-slate-900 border-r border-slate-800 p-12 lg:p-16">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-[40%] translate-x-[40%] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] translate-y-[30%] -translate-x-[30%] pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">POISA POS</h1>
          <p className="text-indigo-200/90 font-medium text-lg lg:text-xl">Next-Generation Commerce Platform</p>
        </div>

        {/* Infographic Values Section */}
        <div className="relative z-10 flex-col gap-10 max-w-xl my-auto flex">
          
          {/* Item 1 */}
          <div className="flex items-start gap-6 group hover:translate-x-2 transition-transform duration-300">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors duration-300">
              <Sparkles size={26} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Modern & Fast</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">Experience a fluid, next-generation interface meticulously designed to accelerate your checkout process and eliminate friction.</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-6 group hover:translate-x-2 transition-transform duration-300 delay-75">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 transition-colors duration-300">
              <LineChart size={26} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Intelligent Operations</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">Leverage real-time data insights to manage inventory, forecast sales, and optimize your business effortlessly.</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-6 group hover:translate-x-2 transition-transform duration-300 delay-150">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors duration-300">
              <Heart size={26} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Customer-Centric</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">Focus entirely on the people that matter. Deepen relationships, build loyalty, and deliver an exceptional, highly-personalized service.</p>
            </div>
          </div>
          
        </div>

        <div className="relative z-10 text-slate-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} POISA Systems. Empowering retail globally.
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center relative bg-gradient-to-br from-slate-50 to-slate-200">
        
        {/* Decorative elements for right side */}
        <div className="absolute top-0 right-0 w-full h-[50%] bg-gradient-to-b from-white/80 to-transparent pointer-events-none"></div>

        <div className="relative z-10 bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-2xl p-10 w-full max-w-md mx-6 flex flex-col items-center">
          
          {/* Clock & Header */}
          <div className="text-center mb-10 w-full">
            <div className="mb-4">
              <h2 className="text-[2.5rem] font-light text-slate-800 tracking-tight leading-none mb-1">{timeString}</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{dateString}</p>
            </div>
            
            {/* Show title only on mobile since the left panel handles branding on desktop */}
            <h1 className="lg:hidden text-2xl font-black bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent mb-2">POISA POS</h1>
            <p className="text-sm text-slate-500 font-medium">Enter your PIN to sign in</p>
          </div>

          {/* PIN dots (with shake class) */}
          <div className={`flex justify-center gap-4 mb-6 h-4 w-full ${shake ? 'animate-shake' : ''}`}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => {
              const isFilled = i < pin.length;
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled 
                      ? 'bg-indigo-600 scale-110 animate-pop shadow-md' 
                      : 'bg-transparent border-2 border-slate-300'
                  }`}
                />
              )
            })}
          </div>

          {/* Error / Loading space */}
          <div className="h-6 mb-6 w-full text-center flex items-center justify-center">
            {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
            {loading && <p className="text-sm font-medium text-slate-500 animate-pulse">Signing in...</p>}
          </div>

          {/* PIN pad */}
          <div className="grid grid-cols-3 gap-y-4 gap-x-6 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(String(digit))}
                disabled={loading}
                className="w-16 h-16 mx-auto bg-white rounded-full shadow-sm text-2xl font-medium text-slate-800 hover:bg-slate-50 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                {digit}
              </button>
            ))}

            <div />
            <button
              onClick={() => handleDigit('0')}
              disabled={loading}
              className="w-16 h-16 mx-auto bg-white rounded-full shadow-sm text-2xl font-medium text-slate-800 hover:bg-slate-50 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-16 h-16 mx-auto bg-transparent rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none flex items-center justify-center"
            >
              <Delete size={26} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
