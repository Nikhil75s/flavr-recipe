import { FiLogIn } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const { user } = useAuth()

  // Redirect if already logged in
  if (user) return <Navigate to="/" replace />

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="login-page page-wrapper">
      <div className="container">
        <div className="login-card glass-card fade-in-up">
          <div className="login-header">
            <span className="login-icon">🍃</span>
            <h1 className="login-title">Welcome to Flavr</h1>
            <p className="login-subtitle">Sign in to create, share, and save your favorite recipes.</p>
          </div>

          <button className="google-btn" id="google-login-btn" onClick={handleGoogleLogin}>
            <FcGoogle size={22} />
            <span>Continue with Google</span>
          </button>

          <p className="login-footer-text">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
