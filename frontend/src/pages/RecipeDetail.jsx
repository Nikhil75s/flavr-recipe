/**
 * pages/RecipeDetail.jsx — Full recipe detail page with reviews.
 *
 * Displays a single recipe with:
 *  - Hero image with category and difficulty badges
 *  - Title, description, cook time, servings, rating, cuisine, and author
 *  - Ingredients list and step-by-step instructions
 *  - Save/bookmark toggle button
 *  - Edit/Delete buttons (visible only to the recipe author)
 *  - Reviews section with rating input and comment form
 *  - List of existing reviews with delete option for own reviews
 *
 * Fetches recipe and reviews in parallel on mount.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiClock, FiUsers, FiEdit3, FiTrash2, FiBookmark, FiArrowLeft, FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import StarInput from '../components/StarInput'
import './RecipeDetail.css'

const RecipeDetail = () => {
  const { id } = useParams()                    // Recipe ID from the URL
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()       // Current user and refresh function

  // Component state
  const [recipe, setRecipe] = useState(null)     // Recipe data from API
  const [reviews, setReviews] = useState([])     // Reviews list for this recipe
  const [loading, setLoading] = useState(true)   // Initial data loading state
  const [reviewText, setReviewText] = useState('')    // Review comment input
  const [reviewRating, setReviewRating] = useState(5) // Review star rating (default: 5)
  const [submitting, setSubmitting] = useState(false) // Review submission loading state
  const [isSaved, setIsSaved] = useState(false)       // Whether the recipe is bookmarked

  // Fetch recipe and reviews data in parallel when the page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recipe details and reviews simultaneously for faster loading
        const [recipeRes, reviewsRes] = await Promise.all([
          API.get(`/recipes/${id}`),
          API.get(`/reviews/${id}`),
        ])
        setRecipe(recipeRes.data)
        setReviews(reviewsRes.data)

        // Check if the logged-in user has saved/bookmarked this recipe
        if (user) {
          setIsSaved(user.savedRecipes?.includes(id))
        }
      } catch (error) {
        toast.error('Recipe not found')
        navigate('/recipes') // Redirect to recipes list on error
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, user])

  /**
   * Delete the recipe — shows a confirmation dialog first.
   * Only the recipe author can trigger this action.
   */
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return
    try {
      await API.delete(`/recipes/${id}`)
      toast.success('Recipe deleted')
      navigate('/recipes')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete')
    }
  }

  /**
   * Toggle save/unsave (bookmark) for this recipe.
   * Requires authentication — redirects to login if not logged in.
   */
  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save recipes')
      return navigate('/login')
    }
    try {
      const { data } = await API.post(`/users/save/${id}`)
      setIsSaved(data.saved) // Update bookmark icon state
      toast.success(data.saved ? 'Recipe saved!' : 'Recipe unsaved')
      refreshUser() // Refresh user data to update savedRecipes array
    } catch (error) {
      toast.error('Failed to save recipe')
    }
  }

  /**
   * Submit a new review — validates input, posts to API, and updates local state.
   * After submission, re-fetches the recipe to get the updated average rating.
   */
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to leave a review')
      return navigate('/login')
    }
    if (!reviewText.trim()) {
      return toast.error('Please write a comment')
    }

    setSubmitting(true)
    try {
      // Post the new review
      const { data } = await API.post(`/reviews/${id}`, {
        rating: reviewRating,
        comment: reviewText,
      })
      // Add the new review to the top of the list (optimistic update)
      setReviews([data, ...reviews])
      setReviewText('')    // Clear the form
      setReviewRating(5)   // Reset rating to default
      toast.success('Review added!')

      // Re-fetch recipe to get the updated averageRating and totalReviews
      const recipeRes = await API.get(`/recipes/${id}`)
      setRecipe(recipeRes.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review')
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Delete a review — removes from the server and updates local state.
   * Re-fetches the recipe to update the average rating.
   */
  const handleDeleteReview = async (reviewId) => {
    try {
      await API.delete(`/reviews/${reviewId}`)
      // Remove the deleted review from local state (optimistic update)
      setReviews(reviews.filter((r) => r._id !== reviewId))
      toast.success('Review deleted')

      // Re-fetch recipe to update rating stats
      const recipeRes = await API.get(`/recipes/${id}`)
      setRecipe(recipeRes.data)
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="loading-page page-wrapper">
        <div className="spinner"></div>
      </div>
    )
  }

  // Safety check — if recipe somehow isn't loaded, render nothing
  if (!recipe) return null

  // Computed flags for conditional rendering
  const isAuthor = user && recipe.author?._id === user._id   // Is the current user the author?
  const hasReviewed = user && reviews.some((r) => r.user?._id === user._id) // Did the user already review?
  const placeholderImg = `https://placehold.co/800x400/1a1a28/ff8510?text=${encodeURIComponent(recipe.title?.slice(0, 20) || 'Recipe')}`

  return (
    <div className="recipe-detail-page page-wrapper">
      <div className="container">
        {/* Back button — navigates to the previous page in browser history */}
        <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>

        <div className="recipe-detail fade-in-up">
          {/* ─── Recipe Image ────────────────────────────────────── */}
          <div className="detail-image-wrapper">
            <img
              src={recipe.image || placeholderImg}
              alt={recipe.title}
              className="detail-image"
              onError={(e) => { e.target.src = placeholderImg }}
            />
            {/* Badges overlaid on the image */}
            <div className="detail-image-overlay">
              <span className="badge badge-primary">{recipe.category}</span>
              <span className={`badge difficulty-badge difficulty-${recipe.difficulty?.toLowerCase()}`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>

          {/* ─── Recipe Header ───────────────────────────────────── */}
          <div className="detail-header">
            <div className="detail-title-row">
              <h1 className="detail-title">{recipe.title}</h1>
              {/* Action buttons — save, edit, delete */}
              <div className="detail-actions">
                {/* Bookmark/save toggle button */}
                <button
                  className={`btn btn-ghost save-btn ${isSaved ? 'saved' : ''}`}
                  id="save-recipe-btn"
                  onClick={handleSave}
                >
                  <FiBookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
                {/* Edit and Delete buttons — only visible to the recipe author */}
                {isAuthor && (
                  <>
                    <Link to={`/edit/${recipe._id}`} className="btn btn-secondary btn-sm">
                      <FiEdit3 size={16} /> Edit
                    </Link>
                    <button className="btn btn-danger btn-sm" id="delete-recipe-btn" onClick={handleDelete}>
                      <FiTrash2 size={16} /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="detail-description">{recipe.description}</p>

            {/* Meta information — cook time, servings, rating, cuisine */}
            <div className="detail-meta">
              <div className="detail-meta-item">
                <FiClock size={18} />
                <span>{recipe.cookTime} min</span>
              </div>
              <div className="detail-meta-item">
                <FiUsers size={18} />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="detail-meta-item">
                <FiStar size={18} className="star-filled" />
                <span>{recipe.averageRating > 0 ? `${recipe.averageRating.toFixed(1)} (${recipe.totalReviews})` : 'No ratings'}</span>
              </div>
              {recipe.cuisine && (
                <span className="badge badge-info">{recipe.cuisine}</span>
              )}
            </div>

            {/* Author info — links to the author's profile page */}
            {recipe.author && (
              <Link to={`/profile/${recipe.author._id}`} className="detail-author">
                <img
                  src={recipe.author.avatar || `https://ui-avatars.com/api/?name=${recipe.author.name}&background=ff8510&color=fff`}
                  alt={recipe.author.name}
                  className="detail-author-avatar"
                />
                <div>
                  <span className="detail-author-name">{recipe.author.name}</span>
                  <span className="detail-author-label">Recipe Author</span>
                </div>
              </Link>
            )}
          </div>

          {/* ─── Content Grid: Ingredients + Steps ───────────────── */}
          <div className="detail-content-grid">
            {/* Ingredients list */}
            <div className="detail-section glass-card">
              <h2 className="detail-section-title">🥕 Ingredients</h2>
              <ul className="ingredients-list">
                {recipe.ingredients?.map((ing, i) => (
                  <li key={i} className="ingredient-item">
                    <span className="ingredient-bullet">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-step instructions */}
            <div className="detail-section glass-card">
              <h2 className="detail-section-title">👨‍🍳 Instructions</h2>
              <ol className="steps-list">
                {recipe.steps?.map((step, i) => (
                  <li key={i} className="step-item">
                    <span className="step-number">{i + 1}</span>
                    <p className="step-text">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ─── Reviews Section ─────────────────────────────────── */}
          <div className="reviews-section">
            <h2 className="detail-section-title">💬 Reviews ({reviews.length})</h2>

            {/* Add Review Form — shown only to logged-in users who haven't reviewed and aren't the author */}
            {user && !hasReviewed && !isAuthor && (
              <form className="review-form glass-card" onSubmit={handleReviewSubmit} id="review-form">
                <div className="review-form-header">
                  <span className="form-label">Your Rating</span>
                  <StarInput rating={reviewRating} setRating={setReviewRating} size={24} />
                </div>
                <textarea
                  className="form-textarea"
                  placeholder="Share your experience with this recipe..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={500}
                  id="review-textarea"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  id="submit-review-btn"
                >
                  {submitting ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card glass-card">
                    {/* Review header — user info and star rating */}
                    <div className="review-header">
                      <div className="review-user">
                        <img
                          src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.name}&background=ff8510&color=fff&size=32`}
                          alt={review.user?.name}
                          className="review-avatar"
                        />
                        <div>
                          <span className="review-user-name">{review.user?.name}</span>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="review-rating-inline">
                        <StarInput rating={review.rating} setRating={() => {}} size={14} readonly />
                      </div>
                    </div>
                    {/* Review comment text */}
                    <p className="review-comment">{review.comment}</p>
                    {/* Delete button — only visible for the review's author */}
                    {user && review.user?._id === user._id && (
                      <button
                        className="btn btn-ghost btn-sm review-delete"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        <FiTrash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-reviews">No reviews yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetail
