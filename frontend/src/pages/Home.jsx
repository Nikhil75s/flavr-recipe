/**
 * pages/Home.jsx — Landing page / home page.
 *
 * Sections:
 *  1. Hero     — Full-width hero with animated gradient orbs, headline, and CTA buttons
 *  2. Stats    — Quick statistics cards (recipes count, home cooks, avg rating)
 *  3. Featured — Grid of top-rated recipes fetched from the API
 *  4. CTA      — Final call-to-action encouraging users to create a recipe
 *
 * Fetches the top 6 highest-rated recipes on mount to display in the featured section.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiSearch, FiBookOpen, FiUsers, FiStar } from 'react-icons/fi'
import API from '../api/axiosInstance'
import RecipeCard from '../components/RecipeCard'
import './Home.css'

const Home = () => {
  const [featuredRecipes, setFeaturedRecipes] = useState([]) // Top-rated recipes for the grid
  const [loading, setLoading] = useState(true)               // Loading state for the fetch

  // Fetch top-rated recipes on component mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Request top 6 recipes sorted by average rating (highest first)
        const { data } = await API.get('/recipes?sort=rating&limit=6')
        setFeaturedRecipes(data.recipes || [])
      } catch (err) {
        console.error('Failed to fetch featured recipes:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="home-page">
      {/* ─── Hero Section ──────────────────────────────────────────── */}
      <section className="hero" id="hero-section">
        {/* Animated gradient orbs — decorative background elements */}
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span>🍳</span> Your Kitchen, Your Story
          </div>
          <h1 className="hero-title">
            Share <span className="gradient-text">Delicious</span> Recipes<br />
            With The World
          </h1>
          <p className="hero-subtitle">
            Discover mouth-watering recipes from home cooks and food enthusiasts.
            Create, share, and bookmark your favorites.
          </p>
          {/* Primary CTA buttons */}
          <div className="hero-actions">
            <Link to="/recipes" className="btn btn-primary btn-lg" id="hero-explore-btn">
              <FiSearch size={18} />
              Explore Recipes
            </Link>
            <Link to="/create" className="btn btn-secondary btn-lg" id="hero-create-btn">
              Create Recipe
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─────────────────────────────────────────── */}
      {/* Quick platform statistics displayed as glassmorphism cards */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <FiBookOpen size={28} className="stat-icon" />
              <div className="stat-number">100+</div>
              <div className="stat-label">Recipes</div>
            </div>
            <div className="stat-card glass-card">
              <FiUsers size={28} className="stat-icon" />
              <div className="stat-number">50+</div>
              <div className="stat-label">Home Cooks</div>
            </div>
            <div className="stat-card glass-card">
              <FiStar size={28} className="stat-icon" />
              <div className="stat-number">4.8</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Recipes Section ──────────────────────────────── */}
      {/* Displays top-rated recipes in a responsive grid */}
      <section className="featured-section" id="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="gradient-text">Top Rated</span> Recipes
            </h2>
            <Link to="/recipes" className="btn btn-ghost">
              View All <FiArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            // Show spinner while recipes are loading
            <div className="loading-page">
              <div className="spinner"></div>
            </div>
          ) : featuredRecipes.length > 0 ? (
            // Render recipe cards in a grid layout
            <div className="recipe-grid">
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            // Empty state — no recipes exist yet
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <h3 className="empty-state-title">No recipes yet</h3>
              <p className="empty-state-text">Be the first to share a recipe!</p>
              <Link to="/create" className="btn btn-primary">Create Recipe</Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────────────── */}
      {/* Final call-to-action encouraging recipe creation */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card glass-card">
            <h2 className="cta-title">Ready to Share Your Recipe?</h2>
            <p className="cta-text">Join our community of food lovers and share your favorite recipes with the world.</p>
            <Link to="/create" className="btn btn-primary btn-lg" id="cta-create-btn">
              Start Cooking <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
