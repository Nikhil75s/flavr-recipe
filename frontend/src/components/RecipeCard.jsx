import { Link } from 'react-router-dom'
import { FiClock, FiStar, FiUser } from 'react-icons/fi'
import './RecipeCard.css'

const RecipeCard = ({ recipe }) => {
  const placeholderImg = `https://placehold.co/400x260/1a1a28/ff8510?text=${encodeURIComponent(recipe.title?.slice(0, 12) || 'Recipe')}`

  return (
    <Link to={`/recipes/${recipe._id}`} className="recipe-card glass-card fade-in-up" id={`recipe-card-${recipe._id}`}>
      <div className="recipe-card-image">
        <img
          src={recipe.image || placeholderImg}
          alt={recipe.title}
          loading="lazy"
          onError={(e) => { e.target.src = placeholderImg }}
        />
        <div className="recipe-card-overlay">
          <span className="badge badge-primary">{recipe.category || 'Other'}</span>
        </div>
        {recipe.difficulty && (
          <span className={`difficulty-badge difficulty-${recipe.difficulty.toLowerCase()}`}>
            {recipe.difficulty}
          </span>
        )}
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <p className="recipe-card-desc">{recipe.description?.slice(0, 80)}{recipe.description?.length > 80 ? '...' : ''}</p>

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
