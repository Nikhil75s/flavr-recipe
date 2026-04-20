/**
 * components/RecipeCard.jsx — Reusable recipe card component.
 * @param {Object} recipe - The recipe object from the API
 */

import { Link } from 'react-router-dom'
import { FiClock, FiStar, FiUser } from 'react-icons/fi'
import './RecipeCard.css'

const RecipeCard = ({ recipe }) => {
  // Generate a fallback placeholder image using placehold.co (uses recipe title as text)
  const placeholderImg = `https://placehold.co/400x260/1a1a28/ff8510?text=${encodeURIComponent(recipe.title?.slice(0, 12) || 'Recipe')}`

  return (
    // Entire card is a link to the recipe detail page
    <Link to={`/recipes/${recipe._id}`} className="recipe-card glass-card fade-in-up" id={`recipe-card-${recipe._id}`}>
      {/* Image section with overlay badges */}
      <div className="recipe-card-image">
        <img
          src={recipe.image || placeholderImg}
          alt={recipe.title}
          loading="lazy"  // Lazy-load images for performance
          onError={(e) => { e.target.src = placeholderImg }} // Fallback if image URL is broken
        />
        {/* Category badge overlay (e.g., "Breakfast", "Dinner") */}
        <div className="recipe-card-overlay">
          <span className="badge badge-primary">{recipe.category || 'Other'}</span>
        </div>
        {/* Difficulty badge (e.g., "Easy", "Medium", "Hard") */}
        {recipe.difficulty && (
          <span className={`difficulty-badge difficulty-${recipe.difficulty.toLowerCase()}`}>
            {recipe.difficulty}
          </span>
        )}
      </div>

      {/* Card body — title, description, meta info, author */}
      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        {/* Truncate description to 80 characters for the card preview */}
        <p className="recipe-card-desc">{recipe.description?.slice(0, 80)}{recipe.description?.length > 80 ? '...' : ''}</p>

        {/* Meta information row — cook time and rating */}
        <div className="recipe-card-meta">
          <div className="meta-item">
            <FiClock size={14} />
            <span>{recipe.cookTime || 0} min</span>
          </div>
          <div className="meta-item">
            <FiStar size={14} className={recipe.averageRating > 0 ? 'star-filled' : ''} />
            <span>{recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : 'New'}</span>
          </div>
        </div>

        {/* Author info — avatar and name (if author data is populated) */}
        {recipe.author && (
          <div className="recipe-card-author">
            <img
              src={recipe.author.avatar || `https://ui-avatars.com/api/?name=${recipe.author.name}&background=ff8510&color=fff&size=24`}
              alt={recipe.author.name}
              className="author-avatar-sm"
            />
            <span className="author-name">{recipe.author.name}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default RecipeCard
