/**
 * pages/Profile.jsx — User profile page.
 *
 * Displays:
 *  - User avatar, name, email, and join date
 *  - Editable bio section (only on own profile)
 *  - Grid of recipes published by this user
 *  - Recipe count statistic
 *
 * Supports viewing any user's profile (public) and editing own profile (bio update).
 * Fetches user profile data and their recipes in parallel on mount.
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiEdit3, FiBookOpen } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import RecipeCard from '../components/RecipeCard'
import './Profile.css'

const Profile = () => {
  const { id } = useParams()                    // User ID from the URL
  const { user: currentUser } = useAuth()        // Currently logged-in user
  const [profile, setProfile] = useState(null)   // Profile data for the viewed user
  const [recipes, setRecipes] = useState([])     // Recipes published by this user
  const [loading, setLoading] = useState(true)   // Initial data loading state
  const [bio, setBio] = useState('')             // Bio text input value
  const [editingBio, setEditingBio] = useState(false) // Whether bio edit mode is active
  const [savingBio, setSavingBio] = useState(false)   // Bio save loading state

  // Determine if this is the logged-in user's own profile
  const isOwnProfile = currentUser && currentUser._id === id

  // Fetch profile data and user's recipes in parallel on mount (or when ID changes)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, recipesRes] = await Promise.all([
          API.get(`/users/${id}`),          // Fetch user profile
          API.get(`/recipes/user/${id}`),   // Fetch user's recipes
        ])
        setProfile(profileRes.data)
        setRecipes(recipesRes.data)
        setBio(profileRes.data.bio || '')  // Pre-fill bio input with existing bio
      } catch (error) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  /**
   * Save the updated bio to the backend.
   * Only available on the user's own profile.
   */
  const handleSaveBio = async () => {
    setSavingBio(true)
    try {
      const { data } = await API.put('/users/profile', { bio })
      setProfile({ ...profile, bio: data.bio }) // Update local profile state
      setEditingBio(false)                       // Exit edit mode
      toast.success('Bio updated!')
    } catch (error) {
      toast.error('Failed to update bio')
    } finally {
      setSavingBio(false)
    }
  }

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="loading-page page-wrapper">
        <div className="spinner"></div>
      </div>
    )
  }

  // Safety check — if profile data failed to load
  if (!profile) return null

  return (
    <div className="profile-page page-wrapper">
      <div className="container">
        {/* ─── Profile Header Card ───────────────────────────── */}
        <div className="profile-header glass-card fade-in-up">
          {/* User avatar — falls back to a generated avatar using ui-avatars.com */}
          <img
            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=ff8510&color=fff&size=120`}
            alt={profile.name}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-email">{profile.email}</p>

            {/* Bio section — toggles between display and edit mode */}
            {editingBio ? (
              // Bio edit mode — textarea with save/cancel buttons
              <div className="bio-edit">
                <textarea
                  className="form-textarea"
                  id="bio-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={300}
                  placeholder="Tell us about yourself..."
                />
                <div className="bio-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={handleSaveBio} disabled={savingBio}>
                    {savingBio ? 'Saving...' : 'Save'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingBio(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Bio display mode — shows bio text and edit button (own profile only)
              <div className="bio-display">
                <p className="profile-bio">{profile.bio || 'No bio yet.'}</p>
                {isOwnProfile && (
                  <button className="btn btn-ghost btn-sm" id="edit-bio-btn" onClick={() => setEditingBio(true)}>
                    <FiEdit3 size={14} /> Edit Bio
                  </button>
                )}
              </div>
            )}

            {/* Profile statistics — recipe count and join date */}
            <div className="profile-stats">
              <div className="profile-stat">
                <FiBookOpen size={18} />
                <span><strong>{profile.recipeCount || recipes.length}</strong> Recipes</span>
              </div>
              <div className="profile-stat">
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── User's Recipes Grid ───────────────────────────── */}
        <div className="profile-recipes">
          <h2 className="section-title" style={{ marginBottom: '24px' }}>
            {isOwnProfile ? 'My Recipes' : `${profile.name}'s Recipes`}
          </h2>

          {recipes.length > 0 ? (
            // Display recipes in a responsive grid
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            // Empty state — different message for own vs other's profile
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">No recipes yet</h3>
              <p className="empty-state-text">
                {isOwnProfile
                  ? "You haven't created any recipes yet."
                  : "This user hasn't shared any recipes yet."}
              </p>
              {isOwnProfile && (
                <Link to="/create" className="btn btn-primary">
                  Create Your First Recipe
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
