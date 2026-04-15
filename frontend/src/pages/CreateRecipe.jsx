import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiX, FiUploadCloud } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axiosInstance'
import './RecipeForm.css'

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Other']
const difficulties = ['Easy', 'Medium', 'Hard']

const CreateRecipe = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

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
    image: null,
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, image: file })
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleListChange = (field, index, value) => {
    const updated = [...form[field]]
    updated[index] = value
    setForm({ ...form, [field]: updated })
  }

  const addListItem = (field) => {
    setForm({ ...form, [field]: [...form[field], ''] })
  }

  const removeListItem = (field, index) => {
    if (form[field].length <= 1) return
    const updated = form[field].filter((_, i) => i !== index)
    setForm({ ...form, [field]: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.description.trim()) return toast.error('Description is required')
    if (form.ingredients.some((i) => !i.trim())) return toast.error('Fill all ingredient fields')
    if (form.steps.some((s) => !s.trim())) return toast.error('Fill all step fields')

    setLoading(true)
    try {
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
      if (form.image) formData.append('image', form.image)

      const { data } = await API.post('/recipes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Recipe created! 🎉')
      navigate(`/recipes/${data._id}`)
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
            {/* Image Upload */}
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

            {/* Title & Description */}
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

            {/* Meta info row */}
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

            {/* Ingredients */}
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
              <button
                type="button"
                className="btn btn-ghost add-item-btn"
                onClick={() => addListItem('ingredients')}
              >
                <FiPlus size={16} /> Add Ingredient
              </button>
            </div>

            {/* Steps */}
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
              <button
                type="button"
                className="btn btn-ghost add-item-btn"
                onClick={() => addListItem('steps')}
              >
                <FiPlus size={16} /> Add Step
              </button>
            </div>

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
