import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiMenu, FiX, FiPlusCircle, FiBookmark, FiLogOut, FiUser, FiSearch } from 'react-icons/fi'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" id="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">🍃</span>
          <span className="brand-text">Flavr</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/recipes" className="nav-link" id="nav-recipes" onClick={() => setMenuOpen(false)}>
            <FiSearch size={16} />
            <span>Explore</span>
          </Link>

          {user ? (
            <>
              <Link to="/create" className="nav-link" id="nav-create" onClick={() => setMenuOpen(false)}>
                <FiPlusCircle size={16} />
                <span>Create</span>
              </Link>
              <Link to="/saved" className="nav-link" id="nav-saved" onClick={() => setMenuOpen(false)}>
                <FiBookmark size={16} />
                <span>Saved</span>
              </Link>
              <Link to={`/profile/${user._id}`} className="nav-link" id="nav-profile" onClick={() => setMenuOpen(false)}>
                <FiUser size={16} />
                <span>Profile</span>
              </Link>
              <button className="btn btn-ghost nav-logout" id="nav-logout" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="nav-login" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>

        <button className="navbar-toggle" id="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
