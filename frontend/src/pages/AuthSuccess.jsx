import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login, refreshUser } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      navigate('/login?error=auth_failed')
      return
    }

    if (token) {
      login(token)
      // Fetch user data after setting token
      refreshUser().then(() => {
        navigate('/', { replace: true })
      })
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate, login, refreshUser])

  return (
    <div className="loading-page page-wrapper">
      <div className="spinner"></div>
    </div>
  )
}

export default AuthSuccess
