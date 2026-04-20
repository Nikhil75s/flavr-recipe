/**
 * components/Navbar.jsx — Main navigation bar component.
 */

import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiMenu, FiX, FiPlusCircle, FiBookmark, FiLogOut, FiUser, FiSearch } from 'react-icons/fi'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()  // Get current user and logout function from auth context
  const navigate = useNavigate()       // Programmatic navigation
  const [menuOpen, setMenuOpen] = useState(false) // Tracks mobile menu open/close state


  const handleLogout = async () => {
    await logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar-inner">
        {/* Brand logo — clicking navigates to home and closes mobile menu */}
        <Link to="/" className="navbar-brand" id="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">🍃</span>
          <span className="brand-text">Flavr</span>
        </Link>

        {/* Navigation links container — toggled via 'open' class on mobile */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {/* Explore link — always visible (public) */}
          <Link to="/recipes" className="nav-link" id="nav-recipes" onClick={() => setMenuOpen(false)}>
            <FiSearch size={16} />
            <span>Explore</span>
          </Link>

          {user ? (
            // ─── Logged-in user links ───────────────────────
            <>
              {/* Create new recipe */}
              <Link to="/create" className="nav-link" id="nav-create" onClick={() => setMenuOpen(false)}>
                <FiPlusCircle size={16} />
                <span>Create</span>
              </Link>
              {/* View saved/bookmarked recipes */}
              <Link to="/saved" className="nav-link" id="nav-saved" onClick={() => setMenuOpen(false)}>
                <FiBookmark size={16} />
                <span>Saved</span>
              </Link>
              {/* View own profile */}
              <Link to={`/profile/${user._id}`} className="nav-link" id="nav-profile" onClick={() => setMenuOpen(false)}>
                <FiUser size={16} />
                <span>Profile</span>
              </Link>
              {/* Logout button */}
              <button className="btn btn-ghost nav-logout" id="nav-logout" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            // ─── Guest user — show Sign In button ───────────
            <Link to="/login" className="btn btn-primary btn-sm" id="nav-login" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger menu button — toggles the mobile navigation */}
        <button className="navbar-toggle" id="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
