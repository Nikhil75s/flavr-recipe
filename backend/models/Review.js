const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews: one review per user per recipe
reviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

// Static method: recalculate recipe average rating
reviewSchema.statics.calcAverageRating = async function (recipeId) {
  const Recipe = require('./Recipe');

  const result = await this.aggregate([
    { $match: { recipe: recipeId } },
    {
      $group: {
        _id: '$recipe',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    });
  } else {
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// Recalculate after save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.recipe);
});

// Recalculate after remove
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.recipe);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
