/**
 * pages/Login.jsx — Login page with Google OAuth sign-in.
 *
 * Displays a centered login card with:
 *  - Brand icon and welcome message
 *  - "Continue with Google" button that initiates the OAuth flow
 *  - Terms of Service disclaimer
 *
 * If the user is already logged in, they are automatically redirected to
 * the home page (prevents accessing the login page when authenticated).
 */

import { FiLogIn } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const { user } = useAuth()

  // If user is already authenticated, redirect to home page
  if (user) return <Navigate to="/" replace />

  /**
   * Initiate Google OAuth login.
   * Redirects the browser to the backend's /api/auth/google endpoint,
   * which triggers Passport's Google OAuth strategy and sends the user
   * to Google's consent screen.
   */
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="login-page page-wrapper">
      <div className="container">
        <div className="login-card glass-card fade-in-up">
          {/* Login header — brand icon and welcome text */}
          <div className="login-header">
            <span className="login-icon">🍃</span>
            <h1 className="login-title">Welcome to Flavr</h1>
            <p className="login-subtitle">Sign in to create, share, and save your favorite recipes.</p>
          </div>

          {/* Google OAuth sign-in button */}
          <button className="google-btn" id="google-login-btn" onClick={handleGoogleLogin}>
            <FcGoogle size={22} />
            <span>Continue with Google</span>
          </button>

          {/* Legal disclaimer */}
          <p className="login-footer-text">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
