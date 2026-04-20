/**
 * models/Review.js — Mongoose schema and model for the Review collection.
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Reference to the Recipe being reviewed
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    // Reference to the User who wrote this review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Star rating — integer from 1 to 5
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    // Written review text
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

reviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

/**
 * @param {ObjectId} recipeId - The MongoDB ObjectId of the recipe to recalculate
 */
reviewSchema.statics.calcAverageRating = async function (recipeId) {
  const Recipe = require('./Recipe');

  // Aggregate all reviews for this recipe to get average and count
  const result = await this.aggregate([
    { $match: { recipe: recipeId } },               // Filter reviews for this recipe
    {
      $group: {
        _id: '$recipe',                               // Group by recipe ID
        averageRating: { $avg: '$rating' },           // Calculate average rating
        totalReviews: { $sum: 1 },                    // Count total reviews
      },
    },
  ]);

  if (result.length > 0) {
    // Update the recipe with the new computed stats
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: result[0].totalReviews,
    });
  } else {
    // No reviews left — reset stats to 0
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

/**
 * Post-save hook — triggered after a new review is created or an existing one is updated.
 * Automatically recalculates the recipe's average rating.
 */
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.recipe);
});

/**
 * Post-delete hook — triggered after a review is deleted via findByIdAndDelete().
 * Ensures the recipe's rating stats stay accurate after removal.
 */
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.recipe);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
