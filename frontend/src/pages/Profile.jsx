import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiEdit3, FiBookOpen } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import RecipeCard from '../components/RecipeCard'
import './Profile.css'

const Profile = () => {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [bio, setBio] = useState('')
  const [editingBio, setEditingBio] = useState(false)
  const [savingBio, setSavingBio] = useState(false)

  const isOwnProfile = currentUser && currentUser._id === id

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, recipesRes] = await Promise.all([
          API.get(`/users/${id}`),
          API.get(`/recipes/user/${id}`),
        ])
        setProfile(profileRes.data)
        setRecipes(recipesRes.data)
        setBio(profileRes.data.bio || '')
      } catch (error) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  const handleSaveBio = async () => {
    setSavingBio(true)
    try {
      const { data } = await API.put('/users/profile', { bio })
      setProfile({ ...profile, bio: data.bio })
      setEditingBio(false)
      toast.success('Bio updated!')
    } catch (error) {
      toast.error('Failed to update bio')
    } finally {
      setSavingBio(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-page page-wrapper">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="profile-page page-wrapper">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header glass-card fade-in-up">
          <img
            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=ff8510&color=fff&size=120`}
            alt={profile.name}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-email">{profile.email}</p>

            {editingBio ? (
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
              <div className="bio-display">
                <p className="profile-bio">{profile.bio || 'No bio yet.'}</p>
                {isOwnProfile && (
                  <button className="btn btn-ghost btn-sm" id="edit-bio-btn" onClick={() => setEditingBio(true)}>
                    <FiEdit3 size={14} /> Edit Bio
                  </button>
                )}
              </div>
            )}

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

        {/* User's Recipes */}
        <div className="profile-recipes">
          <h2 className="section-title" style={{ marginBottom: '24px' }}>
            {isOwnProfile ? 'My Recipes' : `${profile.name}'s Recipes`}
          </h2>

          {recipes.length > 0 ? (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
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
