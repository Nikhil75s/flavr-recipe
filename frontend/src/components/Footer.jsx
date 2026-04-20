/**
 * components/Footer.jsx — Site-wide footer component.
 */

import { Link } from 'react-router-dom'
import { FiGithub, FiHeart } from 'react-icons/fi'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer" id="site-footer">
      <div className="container footer-inner">
        {/* Brand section — logo and tagline */}
        <div className="footer-brand">
          <span className="footer-logo">🍃 Flavr</span>
          <p className="footer-tagline">Discover, share, and savor delicious recipes from around the world.</p>
        </div>

        {/* Quick navigation links */}
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/recipes">Explore</Link>
          <Link to="/create">Create Recipe</Link>
        </div>

        {/* Copyright — year updates automatically */}
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Flavr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
