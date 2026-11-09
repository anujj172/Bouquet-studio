import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Forbidden from '../pages/Forbidden'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return <p className="p-10 text-center text-stone-500">Ачаалж байна...</p>
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (adminOnly && !isAdmin) {
    return <Forbidden />
  }
  return children
}