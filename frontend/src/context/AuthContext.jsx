/**
 * context/AuthContext.jsx — Global authentication state management.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axiosInstance'

// Create the context with a default value of null (no auth state yet)
const AuthContext = createContext(null)

/**
 * Custom hook to consume the AuthContext.
 * Throws an error if used outside of an AuthProvider — ensures proper usage.
 *
 * @returns {{ user, loading, login, logout, refreshUser, setUser }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)      // Current user data (or null)
  const [loading, setLoading] = useState(true) // True until initial auth check completes

  // On mount: check if a token exists in localStorage and fetch the user's profile
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('flavr_token')

      // No token stored — user is not logged in
      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Validate the token by fetching the current user from the backend
        const { data } = await API.get('/auth/me')
        setUser(data) // Token is valid — store the user data
      } catch (error) {
        // Token is invalid or expired — clear it and reset user state
        console.error('Auth check failed:', error)
        localStorage.removeItem('flavr_token')
        setUser(null)
      } finally {
        setLoading(false) // Auth check complete — stop showing loading spinners
      }
    }

    fetchUser()
  }, [])


  const login = (token) => {
    localStorage.setItem('flavr_token', token)
  }


  const logout = async () => {
    try {
      await API.post('/auth/logout')
    } catch (err) {
      // Server-side logout failure is non-critical — continue with client-side cleanup
    }
    localStorage.removeItem('flavr_token')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await API.get('/auth/me')
      setUser(data)
    } catch {
      setUser(null)
    }
  }

  // Provide auth state and methods to all child components
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
