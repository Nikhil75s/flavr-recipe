import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiBookmark } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axiosInstance'
import RecipeCard from '../components/RecipeCard'

const SavedRecipes = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data } = await API.get('/users/saved/recipes')
        setRecipes(data || [])
      } catch (error) {
        toast.error('Failed to load saved recipes')
      } finally {
        setLoading(false)
      }
    }
    fetchSaved()
  }, [])

  if (loading) {
    return (
      <div className="loading-page page-wrapper">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="saved-page page-wrapper">
      <div className="container">
        <div className="fade-in-up">
          <h1 className="page-title">
            <FiBookmark style={{ display: 'inline', verticalAlign: 'middle' }} /> Saved Recipes
          </h1>
          <p className="page-subtitle">Your bookmarked favorites, all in one place</p>

          {recipes.length > 0 ? (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔖</div>
              <h3 className="empty-state-title">No saved recipes</h3>
              <p className="empty-state-text">
                Start exploring and save recipes you love!
              </p>
              <Link to="/recipes" className="btn btn-primary">
                Explore Recipes
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SavedRecipes
