/**
 * pages/Recipes.jsx — Recipe exploration page with search, filters, and pagination.
 *
 * Features:
 *  - Full-text search bar (searches title, description, cuisine)
 *  - Filter chips for category and difficulty
 *  - Sort dropdown (newest, oldest, top rated, most reviewed)
 *  - Paginated recipe grid with Previous/Next navigation
 *  - URL-synced filters (all filters are stored as URL search params for shareable links)
 *
 * All filter/search values are read from and written to the URL via useSearchParams,
 * making the current view bookmarkable and shareable.
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import API from '../api/axiosInstance'
import RecipeCard from '../components/RecipeCard'
import './Recipes.css'

// Available filter options
const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Other']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Reviewed' },
]

const Recipes = () => {
  const [searchParams, setSearchParams] = useSearchParams() // URL search params for filters
  const [recipes, setRecipes] = useState([])                 // Fetched recipe results
  const [loading, setLoading] = useState(true)               // Loading state
  const [totalPages, setTotalPages] = useState(1)            // Total pages for pagination
  const [showFilters, setShowFilters] = useState(false)      // Toggle filters panel visibility

  // Read current filter values from URL search params (with defaults)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || 'All'
  const difficulty = searchParams.get('difficulty') || 'All'
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page')) || 1

  // Fetch recipes whenever any filter/search/sort/page value changes
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        // Build query string from current filter values
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (category !== 'All') params.set('category', category)
        if (difficulty !== 'All') params.set('difficulty', difficulty)
        params.set('sort', sort)
        params.set('page', page)
        params.set('limit', 12) // 12 recipes per page

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

  /**
   * Update a single filter value in the URL search params.
   * Resets to page 1 whenever a filter changes (to avoid showing an empty page).
   * 'All' or empty values are removed from the URL to keep it clean.
   */
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'All' || value === '') {
      params.delete(key)  // Remove filter from URL if it's the default value
    } else {
      params.set(key, value)
    }
    params.set('page', '1') // Reset to first page when filters change
    setSearchParams(params)
  }

  /**
   * Clear all active filters — resets the URL to a clean state.
   */
  const clearFilters = () => {
    setSearchParams({})
  }

  // Check if any non-default filters are active (for showing "Clear All" button)
  const hasActiveFilters = search || category !== 'All' || difficulty !== 'All' || sort !== 'newest'

  return (
    <div className="recipes-page page-wrapper">
      <div className="container">
        {/* Page header */}
        <div className="recipes-header fade-in-up">
          <h1 className="page-title">Explore Recipes</h1>
          <p className="page-subtitle">Discover delicious recipes from our community of food lovers</p>
        </div>

        {/* ─── Search Bar ──────────────────────────────────────────── */}
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
          {/* Toggle button to show/hide the filters panel */}
          <button
            className="btn btn-ghost filter-toggle"
            id="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={18} />
            Filters
          </button>
        </div>

        {/* ─── Filters Panel ───────────────────────────────────────── */}
        {/* Conditionally rendered based on showFilters state */}
        {showFilters && (
          <div className="filters-panel glass-card fade-in-up">
            {/* Category filter chips */}
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

            {/* Difficulty filter chips */}
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

            {/* Sort dropdown */}
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

            {/* Clear all filters button — only shown when filters are active */}
            {hasActiveFilters && (
              <button className="btn btn-ghost clear-filters" onClick={clearFilters}>
                <FiX size={16} /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* ─── Results ─────────────────────────────────────────────── */}
        {loading ? (
          // Loading spinner
          <div className="loading-page">
            <div className="spinner"></div>
          </div>
        ) : recipes.length > 0 ? (
          <>
            {/* Recipe cards grid */}
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>

            {/* ─── Pagination Controls ─────────────────────────────── */}
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
          // Empty state — no recipes match the current filters
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
