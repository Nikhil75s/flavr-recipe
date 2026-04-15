import { Link } from 'react-router-dom'
import './NotFound.css'

const NotFound = () => {
  return (
    <div className="notfound-page page-wrapper">
      <div className="container notfound-content fade-in-up">
        <div className="notfound-icon">🍳</div>
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Recipe Not Found</h2>
        <p className="notfound-text">
          Looks like this page got overcooked! Let's get you back to something delicious.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
          <Link to="/recipes" className="btn btn-secondary btn-lg">Explore Recipes</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
