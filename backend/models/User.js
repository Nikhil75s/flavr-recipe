/**
 * models/User.js — Mongoose schema and model for the User collection.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Google OAuth unique identifier — used to match returning users
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    // User's display name (from Google profile)
    name: {
      type: String,
      required: true,
      trim: true, // Removes leading/trailing whitespace
    },
    // User's email address — unique constraint prevents duplicate accounts
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Normalizes to lowercase for consistent lookups
    },
    // Profile picture URL (typically from Google's servers)
    avatar: {
      type: String,
      default: '',
    },
    // Short bio/description the user can set on their profile page
    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },
    // Array of references to Recipe documents the user has bookmarked
    savedRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe', // Enables .populate('savedRecipes') to fetch full recipe data
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

module.exports = mongoose.model('User', userSchema);
