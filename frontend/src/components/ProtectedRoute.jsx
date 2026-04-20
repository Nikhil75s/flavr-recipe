/**
 * components/ProtectedRoute.jsx — Auth guard wrapper component.
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Auth state is still being determined (initial token validation in progress)
  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
      </div>
    )
  }

  // User is not authenticated — redirect to login page
  // 'replace' prevents the login page from being added to browser history
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated — render the protected content
  return children
}

export default ProtectedRoute
