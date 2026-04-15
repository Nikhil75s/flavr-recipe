import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiClock, FiUsers, FiEdit3, FiTrash2, FiBookmark, FiArrowLeft, FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import StarInput from '../components/StarInput'
import './RecipeDetail.css'

const RecipeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()

  const [recipe, setRecipe] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeRes, reviewsRes] = await Promise.all([
          API.get(`/recipes/${id}`),
          API.get(`/reviews/${id}`),
        ])
        setRecipe(recipeRes.data)
        setReviews(reviewsRes.data)

        // Check if recipe is saved
        if (user) {
          setIsSaved(user.savedRecipes?.includes(id))
        }
      } catch (error) {
        toast.error('Recipe not found')
        navigate('/recipes')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, user])

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

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save recipes')
      return navigate('/login')
    }
    try {
      const { data } = await API.post(`/users/save/${id}`)
      setIsSaved(data.saved)
      toast.success(data.saved ? 'Recipe saved!' : 'Recipe unsaved')
      refreshUser()
    } catch (error) {
      toast.error('Failed to save recipe')
    }
  }

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
      const { data } = await API.post(`/reviews/${id}`, {
        rating: reviewRating,
        comment: reviewText,
      })
      setReviews([data, ...reviews])
      setReviewText('')
      setReviewRating(5)
      toast.success('Review added!')

      // Refresh recipe to get updated rating
      const recipeRes = await API.get(`/recipes/${id}`)
      setRecipe(recipeRes.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await API.delete(`/reviews/${reviewId}`)
      setReviews(reviews.filter((r) => r._id !== reviewId))
      toast.success('Review deleted')

      const recipeRes = await API.get(`/recipes/${id}`)
      setRecipe(recipeRes.data)
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  if (loading) {
    return (
      <div className="loading-page page-wrapper">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!recipe) return null

  const isAuthor = user && recipe.author?._id === user._id
  const hasReviewed = user && reviews.some((r) => r.user?._id === user._id)
  const placeholderImg = `https://placehold.co/800x400/1a1a28/ff8510?text=${encodeURIComponent(recipe.title?.slice(0, 20) || 'Recipe')}`

  return (
    <div className="recipe-detail-page page-wrapper">
      <div className="container">
        <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>

        <div className="recipe-detail fade-in-up">
          {/* Image */}
          <div className="detail-image-wrapper">
            <img
              src={recipe.image || placeholderImg}
              alt={recipe.title}
              className="detail-image"
              onError={(e) => { e.target.src = placeholderImg }}
            />
            <div className="detail-image-overlay">
              <span className="badge badge-primary">{recipe.category}</span>
              <span className={`badge difficulty-badge difficulty-${recipe.difficulty?.toLowerCase()}`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="detail-header">
            <div className="detail-title-row">
              <h1 className="detail-title">{recipe.title}</h1>
              <div className="detail-actions">
                <button
                  className={`btn btn-ghost save-btn ${isSaved ? 'saved' : ''}`}
                  id="save-recipe-btn"
                  onClick={handleSave}
                >
                  <FiBookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
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

            {/* Author */}
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

          {/* Content Grid */}
          <div className="detail-content-grid">
            {/* Ingredients */}
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

            {/* Steps */}
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

          {/* Reviews Section */}
          <div className="reviews-section">
            <h2 className="detail-section-title">💬 Reviews ({reviews.length})</h2>

            {/* Add Review Form */}
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
                    <p className="review-comment">{review.comment}</p>
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
