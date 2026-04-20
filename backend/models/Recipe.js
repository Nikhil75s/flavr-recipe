/**
 * models/Recipe.js — Mongoose schema and model for the Recipe collection.
 */

const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    // Recipe title — displayed as the main heading on recipe cards and detail pages
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: 120,
    },
    // Short description — shown in search results and as a preview on cards
    description: {
      type: String,
      required: [true, 'Recipe description is required'],
      maxlength: 500,
    },
    // List of ingredients — each element is a single ingredient string (e.g., "2 cups flour")
    ingredients: [
      {
        type: String,
        required: true,
      },
    ],
    // Ordered list of cooking instructions — each element is one step
    steps: [
      {
        type: String,
        required: true,
      },
    ],
    // Cloudinary URL of the uploaded recipe image
    image: {
      type: String,
      default: '',
    },
    // Cloudinary public ID — needed to delete the image when the recipe is updated/deleted
    imagePublicId: {
      type: String,
      default: '',
    },
    // Total cooking time in minutes
    cookTime: {
      type: Number,
      default: 0,
    },
    // Number of servings the recipe yields
    servings: {
      type: Number,
      default: 1,
    },
    // Meal category — restricted to predefined enum values
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Other'],
      default: 'Other',
    },
    // Cuisine type — free-form text (e.g., "Italian", "Indian", "Mexican")
    cuisine: {
      type: String,
      default: 'Other',
      trim: true,
    },
    // Difficulty level — restricted to Easy, Medium, or Hard
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    // Reference to the User who created this recipe
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Enables .populate('author') to fetch user details
      required: true,
    },
    // Cached average rating — recalculated by Review model hooks after each review change
    averageRating: {
      type: Number,
      default: 0,
    },
    // Cached total number of reviews — also recalculated by Review hooks
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

/**
 * Text index — enables MongoDB's $text search operator on these fields.
 * Used by GET /api/recipes?search=... for full-text search across
 * recipe titles, descriptions, and cuisines.
 */
recipeSchema.index({ title: 'text', description: 'text', cuisine: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
