import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import API from '../api/axiosInstance'
import RecipeCard from '../components/RecipeCard'
import './Recipes.css'

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Other']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Reviewed' },
]

const Recipes = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || 'All'
  const difficulty = searchParams.get('difficulty') || 'All'
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (category !== 'All') params.set('category', category)
        if (difficulty !== 'All') params.set('difficulty', difficulty)
        params.set('sort', sort)
        params.set('page', page)
        params.set('limit', 12)

        const { data } = await API.get(`/recipes?${params.toString()}`)
        setRecipes(data.recipes || [])
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error('Failed to fetch recipes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [search, category, difficulty, sort, page])

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'All' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters = search || category !== 'All' || difficulty !== 'All' || sort !== 'newest'

  return (
    <div className="recipes-page page-wrapper">
      <div className="container">
        <div className="recipes-header fade-in-up">
          <h1 className="page-title">Explore Recipes</h1>
          <p className="page-subtitle">Discover delicious recipes from our community of food lovers</p>
        </div>

        {/* Search Bar */}
        <div className="search-bar glass-card fade-in-up">
          <FiSearch size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            id="recipe-search-input"
            placeholder="Search recipes, ingredients, cuisines..."
            value={search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          <button
            className="btn btn-ghost filter-toggle"
            id="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={18} />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel glass-card fade-in-up">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="filter-chips">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`filter-chip ${category === cat ? 'active' : ''}`}
                    onClick={() => updateFilter('category', cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Difficulty</label>
              <div className="filter-chips">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    className={`filter-chip ${difficulty === diff ? 'active' : ''}`}
                    onClick={() => updateFilter('difficulty', diff)}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                className="form-select"
                id="sort-select"
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button className="btn btn-ghost clear-filters" onClick={clearFilters}>
                <FiX size={16} /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="loading-page">
            <div className="spinner"></div>
          </div>
        ) : recipes.length > 0 ? (
          <>
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => updateFilter('page', page - 1)}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => updateFilter('page', page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No recipes found</h3>
            <p className="empty-state-text">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms.'
                : 'No recipes have been created yet. Be the first!'}
            </p>
            {hasActiveFilters && (
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Recipes
