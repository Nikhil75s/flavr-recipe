/**
 * pages/AuthSuccess.jsx — OAuth callback landing page.
 *
 * This page is the redirect target after a successful Google OAuth login.
 * The backend redirects here with the JWT token as a URL query parameter:
 *   /auth/success?token=<jwt_token>
 *
 * Flow:
 *  1. Extracts the token (or error) from the URL search params
 *  2. If error → redirects to /login with error message
 *  3. If token → stores it via login(), fetches user data via refreshUser()
 *  4. After user data is loaded → redirects to the home page
 *
 * Shows a loading spinner while processing.
 */

import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthSuccess = () => {
  const [searchParams] = useSearchParams() // Access URL query parameters
  const navigate = useNavigate()
  const { login, refreshUser } = useAuth()

  useEffect(() => {
    // Extract token and error from the URL (e.g., ?token=abc123 or ?error=auth_failed)
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    // OAuth failed — redirect to login page with error indicator
    if (error) {
      navigate('/login?error=auth_failed')
      return
    }

    if (token) {
      // Store the JWT token in localStorage
      login(token)

      // Fetch the user's profile data using the newly stored token
      // Once loaded, redirect to the home page (replace: true removes this page from history)
      refreshUser().then(() => {
        navigate('/', { replace: true })
      })
    } else {
      // No token and no error — something unexpected happened, go to login
      navigate('/login')
    }
  }, [searchParams, navigate, login, refreshUser])

  // Show a loading spinner while the token is being processed
  return (
    <div className="loading-page page-wrapper">
      <div className="spinner"></div>
    </div>
  )
}

export default AuthSuccess
