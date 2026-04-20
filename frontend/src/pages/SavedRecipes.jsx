/**
 * pages/SavedRecipes.jsx — Bookmarked/saved recipes page.
 *
 * Displays all recipes the logged-in user has bookmarked.
 * Fetches the saved recipes list from GET /api/users/saved/recipes on mount.
 *
 * This is a protected route (wrapped in ProtectedRoute) —
 * only accessible to authenticated users.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiBookmark } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axiosInstance'
import RecipeCard from '../components/RecipeCard'

const SavedRecipes = () => {
  const [recipes, setRecipes] = useState([])   // List of saved recipes
  const [loading, setLoading] = useState(true) // Loading state

  // Fetch saved recipes on component mount
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

  // Show loading spinner while fetching
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
          {/* Page header */}
          <h1 className="page-title">
            <FiBookmark style={{ display: 'inline', verticalAlign: 'middle' }} /> Saved Recipes
          </h1>
          <p className="page-subtitle">Your bookmarked favorites, all in one place</p>

          {recipes.length > 0 ? (
            // Display saved recipes in a responsive grid
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            // Empty state — user hasn't saved any recipes yet
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
