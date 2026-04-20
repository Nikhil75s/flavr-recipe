/**
 * pages/CreateRecipe.jsx — Recipe creation form page.
 *
 * Provides a form with fields for:
 *  - Image upload (preview shown immediately via URL.createObjectURL)
 *  - Title, description, cook time, servings, cuisine
 *  - Category and difficulty dropdowns
 *  - Dynamic ingredients list (add/remove items)
 *  - Dynamic steps list (add/remove items)
 *
 * Form data is sent as multipart/form-data (because of image upload).
 * Ingredients and steps arrays are JSON-stringified before sending.
 * On success, navigates to the new recipe's detail page.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiX, FiUploadCloud } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axiosInstance'
import './RecipeForm.css'

// Dropdown options for category and difficulty
const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Other']
const difficulties = ['Easy', 'Medium', 'Hard']

const CreateRecipe = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)          // Form submission loading state
  const [imagePreview, setImagePreview] = useState(null)  // URL for image preview

  // Form state — all recipe fields with default values
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [''],   // Start with one empty ingredient field
    steps: [''],          // Start with one empty step field
    cookTime: '',
    servings: '',
    category: 'Other',
    cuisine: '',
    difficulty: 'Medium',
    image: null,          // File object for the uploaded image
  })

  /**
   * Generic handler for text/number/select inputs.
   * Uses the input's `name` attribute to determine which field to update.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /**
   * Handle image file selection.
   * Creates a temporary URL for preview using URL.createObjectURL().
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, image: file })
      setImagePreview(URL.createObjectURL(file)) // Show preview immediately
    }
  }

  /**
   * Handle changes to a specific item in a dynamic list (ingredients or steps).
   * @param {string} field - 'ingredients' or 'steps'
   * @param {number} index - Index of the item to update
   * @param {string} value - New value for the item
   */
  const handleListChange = (field, index, value) => {
    const updated = [...form[field]]
    updated[index] = value
    setForm({ ...form, [field]: updated })
  }

  /**
   * Add a new empty item to a dynamic list (ingredients or steps).
   */
  const addListItem = (field) => {
    setForm({ ...form, [field]: [...form[field], ''] })
  }

  /**
   * Remove an item from a dynamic list by index.
   * Prevents removing the last item (minimum 1 ingredient/step required).
   */
  const removeListItem = (field, index) => {
    if (form[field].length <= 1) return // Keep at least one item
    const updated = form[field].filter((_, i) => i !== index)
    setForm({ ...form, [field]: updated })
  }

  /**
   * Handle form submission — validates, builds FormData, and posts to the API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.description.trim()) return toast.error('Description is required')
    if (form.ingredients.some((i) => !i.trim())) return toast.error('Fill all ingredient fields')
    if (form.steps.some((s) => !s.trim())) return toast.error('Fill all step fields')

    setLoading(true)
    try {
      // Build FormData for multipart/form-data submission (required for file upload)
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      // Arrays must be JSON-stringified when sent via FormData
      formData.append('ingredients', JSON.stringify(form.ingredients.filter((i) => i.trim())))
      formData.append('steps', JSON.stringify(form.steps.filter((s) => s.trim())))
      formData.append('cookTime', form.cookTime || 0)
      formData.append('servings', form.servings || 1)
      formData.append('category', form.category)
      formData.append('cuisine', form.cuisine || 'Other')
      formData.append('difficulty', form.difficulty)
      if (form.image) formData.append('image', form.image) // Attach image file if selected

      // POST to the API — the backend handles Cloudinary upload via multer
      const { data } = await API.post('/recipes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Recipe created! 🎉')
      navigate(`/recipes/${data._id}`) // Navigate to the new recipe's detail page
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recipe-form-page page-wrapper">
      <div className="container">
        <div className="recipe-form-container fade-in-up">
          <h1 className="page-title">Create Recipe</h1>
          <p className="page-subtitle">Share your culinary creation with the world</p>

          <form onSubmit={handleSubmit} className="recipe-form" id="create-recipe-form">
            {/* ─── Image Upload ─────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label">Recipe Photo</label>
              <div className="image-upload-area" onClick={() => document.getElementById('image-input').click()}>
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
                  id="image-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </div>
            </div>

            {/* ─── Title & Description ─────────────────────────── */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">Title</label>
              <input
                type="text"
                className="form-input"
                id="title"
                name="title"
                placeholder="e.g., Grandma's Chocolate Chip Cookies"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea
                className="form-textarea"
                id="description"
                name="description"
                placeholder="Describe your recipe..."
                value={form.description}
                onChange={handleChange}
                maxLength={500}
                required
              />
            </div>

            {/* ─── Cook Time, Servings, Cuisine ────────────────── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="cookTime">Cook Time (min)</label>
                <input
                  type="number"
                  className="form-input"
                  id="cookTime"
                  name="cookTime"
                  placeholder="30"
                  value={form.cookTime}
                  onChange={handleChange}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="servings">Servings</label>
                <input
                  type="number"
                  className="form-input"
                  id="servings"
                  name="servings"
                  placeholder="4"
                  value={form.servings}
                  onChange={handleChange}
                  min={1}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cuisine">Cuisine</label>
                <input
                  type="text"
                  className="form-input"
                  id="cuisine"
                  name="cuisine"
                  placeholder="e.g., Italian"
                  value={form.cuisine}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ─── Category & Difficulty Dropdowns ─────────────── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  className="form-select"
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="difficulty">Difficulty</label>
                <select
                  className="form-select"
                  id="difficulty"
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                >
                  {difficulties.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
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
                  {/* Remove button — hidden when only 1 item remains */}
                  {form.ingredients.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm remove-btn"
                      onClick={() => removeListItem('ingredients', i)}
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              ))}
              {/* Add new ingredient button */}
              <button
                type="button"
                className="btn btn-ghost add-item-btn"
                onClick={() => addListItem('ingredients')}
              >
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
                  {/* Remove button — hidden when only 1 step remains */}
                  {form.steps.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm remove-btn"
                      onClick={() => removeListItem('steps', i)}
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              ))}
              {/* Add new step button */}
              <button
                type="button"
                className="btn btn-ghost add-item-btn"
                onClick={() => addListItem('steps')}
              >
                <FiPlus size={16} /> Add Step
              </button>
            </div>

            {/* ─── Submit Button ──────────────────────────────── */}
            <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading} id="submit-recipe-btn">
              {loading ? 'Creating...' : 'Create Recipe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateRecipe
