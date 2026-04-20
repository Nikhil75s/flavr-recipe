/**
 * pages/NotFound.jsx — 404 error page.
 *
 * Displayed when the user navigates to a route that doesn't match
 * any defined routes in App.jsx (caught by the <Route path="*"> catch-all).
 *
 * Shows a fun food-themed 404 message with navigation buttons
 * to get back to the home page or explore recipes.
 */

import { Link } from 'react-router-dom'
import './NotFound.css'

const NotFound = () => {
  return (
    <div className="notfound-page page-wrapper">
      <div className="container notfound-content fade-in-up">
        {/* Fun cooking emoji as the error icon */}
        <div className="notfound-icon">🍳</div>

        {/* Large 404 number */}
        <h1 className="notfound-title">404</h1>

        {/* Descriptive subtitle */}
        <h2 className="notfound-subtitle">Recipe Not Found</h2>

        {/* Friendly error message with a food pun */}
        <p className="notfound-text">
          Looks like this page got overcooked! Let's get you back to something delicious.
        </p>

        {/* Navigation buttons to recover from the error */}
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
          <Link to="/recipes" className="btn btn-secondary btn-lg">Explore Recipes</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
