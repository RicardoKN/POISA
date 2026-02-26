import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, staff } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && staff?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
