/**
 * pages/EditRecipe.jsx — Recipe editing form page.
 *
 * Similar to CreateRecipe but pre-populates the form with existing recipe data.
 * Key differences from CreateRecipe:
 *  - Fetches the recipe by ID on mount and fills the form
 *  - Verifies ownership — only the recipe author can edit
 *  - Uses PUT instead of POST for the API call
 *  - Shows the existing image as the preview (until a new image is selected)
 *
 * Form submission sends multipart/form-data to PUT /api/recipes/:id.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiPlus, FiX, FiUploadCloud } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import './RecipeForm.css'

// Dropdown options for category and difficulty
const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Other']
const difficulties = ['Easy', 'Medium', 'Hard']

const EditRecipe = () => {
  const { id } = useParams()           // Recipe ID from the URL
  const navigate = useNavigate()
  const { user } = useAuth()           // Current authenticated user
  const [loading, setLoading] = useState(true)    // Initial data loading state
  const [saving, setSaving] = useState(false)     // Form submission loading state
  const [imagePreview, setImagePreview] = useState(null) // Image preview URL

  // Form state — initialized with defaults, overwritten by fetched recipe data
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [''],
    steps: [''],
    cookTime: '',
    servings: '',
    category: 'Other',
    cuisine: '',
    difficulty: 'Medium',
    image: null,           // Only set when user selects a NEW image
  })

  // Fetch the existing recipe data and populate the form
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await API.get(`/recipes/${id}`)

        // Verify the current user is the author of this recipe
        if (user && data.author?._id !== user._id) {
          toast.error('You can only edit your own recipes')
          return navigate('/recipes')
        }

        // Populate form fields with existing recipe data
        setForm({
          title: data.title || '',
          description: data.description || '',
          ingredients: data.ingredients?.length ? data.ingredients : [''],
          steps: data.steps?.length ? data.steps : [''],
          cookTime: data.cookTime || '',
          servings: data.servings || '',
          category: data.category || 'Other',
          cuisine: data.cuisine || '',
          difficulty: data.difficulty || 'Medium',
          image: null, // Don't pre-set — only set when user uploads a replacement
        })
        // Show the existing Cloudinary image as the preview
        setImagePreview(data.image || null)
      } catch (error) {
        toast.error('Recipe not found')
        navigate('/recipes')
      } finally {
        setLoading(false)
      }
    }
    fetchRecipe()
  }, [id, user])

  /**
   * Generic handler for text/number/select inputs.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /**
   * Handle new image file selection — replaces the existing preview.
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, image: file })
      setImagePreview(URL.createObjectURL(file))
    }
  }

  /**
   * Update a specific item in a dynamic list (ingredients or steps).
   */
  const handleListChange = (field, index, value) => {
    const updated = [...form[field]]
    updated[index] = value
    setForm({ ...form, [field]: updated })
  }

  /**
   * Add a new empty item to a dynamic list.
   */
  const addListItem = (field) => {
    setForm({ ...form, [field]: [...form[field], ''] })
  }

  /**
   * Remove an item from a dynamic list (minimum 1 item required).
   */
  const removeListItem = (field, index) => {
    if (form[field].length <= 1) return
    const updated = form[field].filter((_, i) => i !== index)
    setForm({ ...form, [field]: updated })
  }

  /**
   * Handle form submission — validates and sends updated data to PUT /api/recipes/:id.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.description.trim()) return toast.error('Description is required')

    setSaving(true)
    try {
      // Build FormData for multipart submission
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('ingredients', JSON.stringify(form.ingredients.filter((i) => i.trim())))
      formData.append('steps', JSON.stringify(form.steps.filter((s) => s.trim())))
      formData.append('cookTime', form.cookTime || 0)
      formData.append('servings', form.servings || 1)
      formData.append('category', form.category)
      formData.append('cuisine', form.cuisine || 'Other')
      formData.append('difficulty', form.difficulty)
      // Only append image if user selected a new one (otherwise the old image is kept)
      if (form.image) formData.append('image', form.image)

      await API.put(`/recipes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Recipe updated! ✅')
      navigate(`/recipes/${id}`) // Navigate back to the recipe detail page
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update recipe')
    } finally {
      setSaving(false)
    }
  }

  // Show loading spinner while fetching existing recipe data
  if (loading) {
    return (
      <div className="loading-page page-wrapper">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="recipe-form-page page-wrapper">
      <div className="container">
        <div className="recipe-form-container fade-in-up">
          <h1 className="page-title">Edit Recipe</h1>
          <p className="page-subtitle">Update your recipe details</p>

          <form onSubmit={handleSubmit} className="recipe-form" id="edit-recipe-form">
            {/* ─── Image Upload ─────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label">Recipe Photo</label>
              <div className="image-upload-area" onClick={() => document.getElementById('edit-image-input').click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <FiUploadCloud size={40} />
                    <span>Click to upload a photo</span>
                    <span className="upload-hint">JPG, PNG or WEBP (max 5MB)</span>
                  </div>
                )}
                <input
                  type="file"
                  id="edit-image-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </div>
            </div>

            {/* ─── Title & Description ─────────────────────────── */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-title">Title</label>
              <input
                type="text"
                className="form-input"
                id="edit-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-description">Description</label>
              <textarea
                className="form-textarea"
                id="edit-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={500}
                required
              />
            </div>

            {/* ─── Cook Time, Servings, Cuisine ────────────────── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-cookTime">Cook Time (min)</label>
                <input
                  type="number"
                  className="form-input"
                  id="edit-cookTime"
                  name="cookTime"
                  value={form.cookTime}
                  onChange={handleChange}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-servings">Servings</label>
                <input
                  type="number"
                  className="form-input"
                  id="edit-servings"
                  name="servings"
                  value={form.servings}
                  onChange={handleChange}
                  min={1}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-cuisine">Cuisine</label>
                <input
                  type="text"
                  className="form-input"
                  id="edit-cuisine"
                  name="cuisine"
                  value={form.cuisine}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ─── Category & Difficulty Dropdowns ─────────────── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-category">Category</label>
                <select className="form-select" id="edit-category" name="category" value={form.category} onChange={handleChange}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-difficulty">Difficulty</label>
                <select className="form-select" id="edit-difficulty" name="difficulty" value={form.difficulty} onChange={handleChange}>
                  {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* ─── Dynamic Ingredients List ────────────────────── */}
            <div className="form-group">
              <label className="form-label">Ingredients</label>
              {form.ingredients.map((ing, i) => (
                <div key={i} className="list-input-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Ingredient ${i + 1}`}
                    value={ing}
                    onChange={(e) => handleListChange('ingredients', i, e.target.value)}
                  />
                  {form.ingredients.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-sm remove-btn" onClick={() => removeListItem('ingredients', i)}>
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-ghost add-item-btn" onClick={() => addListItem('ingredients')}>
                <FiPlus size={16} /> Add Ingredient
              </button>
            </div>

            {/* ─── Dynamic Steps List ─────────────────────────── */}
            <div className="form-group">
              <label className="form-label">Instructions</label>
              {form.steps.map((step, i) => (
                <div key={i} className="list-input-row">
                  <span className="step-label">Step {i + 1}</span>
                  <textarea
                    className="form-textarea step-textarea"
                    placeholder={`Describe step ${i + 1}...`}
                    value={step}
                    onChange={(e) => handleListChange('steps', i, e.target.value)}
                  />
                  {form.steps.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-sm remove-btn" onClick={() => removeListItem('steps', i)}>
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-ghost add-item-btn" onClick={() => addListItem('steps')}>
                <FiPlus size={16} /> Add Step
              </button>
            </div>

            {/* ─── Submit Button ──────────────────────────────── */}
            <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={saving} id="update-recipe-btn">
              {saving ? 'Updating...' : 'Update Recipe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditRecipe
