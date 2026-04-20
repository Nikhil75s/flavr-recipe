/**
 * controllers/reviewController.js — Review CRUD request handlers.
 */

const Review = require('../models/Review');

/**
 * @desc    Get all reviews for a specific recipe
 * @route   GET /api/reviews/:recipeId
 * @access  Public
 */
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ recipe: req.params.recipeId })
      .populate('user', 'name avatar') // Include reviewer's name and avatar
      .sort({ createdAt: -1 });        // Newest reviews first

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a review to a recipe
 * @route   POST /api/reviews/:recipeId
 * @access  Private (requires auth)
 */
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    // Check if this user has already reviewed this recipe (one review per user per recipe)
    const existing = await Review.findOne({
      recipe: req.params.recipeId,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this recipe' });
    }

    // Create the review document
    const review = await Review.create({
      recipe: req.params.recipeId,
      user: req.user._id,
      rating,
      comment,
    });

    // Populate user info before returning the response
    const populated = await review.populate('user', 'name avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing review
 * @route   PUT /api/reviews/:reviewId
 * @access  Private (requires auth + ownership)
 */
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ownership check — only the review's author can update it
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update fields — keep existing values if new ones aren't provided
    const { rating, comment } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    // Save triggers the post-save hook which recalculates recipe rating
    const updated = await review.save();
    const populated = await updated.populate('user', 'name avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private (requires auth + ownership)
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ownership check — only the review's author can delete it
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // findByIdAndDelete triggers the post('findOneAndDelete') hook for rating recalculation
    await Review.findByIdAndDelete(req.params.reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, addReview, updateReview, deleteReview };
