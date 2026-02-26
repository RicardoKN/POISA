import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StockInput from './pages/StockInput'
import StockBalance from './pages/StockBalance'
import Sales from './pages/Sales'
import Reports from './pages/Reports'
import StaffManagement from './pages/StaffManagement'
import Settings from './pages/Settings'

import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/layout/ProtectedRoute'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FFFFFF',
            color: '#1E293B',
            border: '1px solid #E2E8F0',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected app routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stock-balance" element={<StockBalance />} />
          <Route path="/sales" element={<Sales />} />

          {/* Manager-only routes */}
          <Route
            path="/stock-input"
            element={
              <ProtectedRoute requiredRole="manager">
                <StockInput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole="manager">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute requiredRole="manager">
                <StaffManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="manager">
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
