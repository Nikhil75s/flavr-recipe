const Review = require('../models/Review');

// @desc    Get reviews for a recipe
// @route   GET /api/reviews/:recipeId
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ recipe: req.params.recipeId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a review
// @route   POST /api/reviews/:recipeId
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    // Check if user already reviewed this recipe
    const existing = await Review.findOne({
      recipe: req.params.recipeId,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this recipe' });
    }

    const review = await Review.create({
      recipe: req.params.recipeId,
      user: req.user._id,
      rating,
      comment,
    });

    const populated = await review.populate('user', 'name avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const { rating, comment } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    const updated = await review.save();
    const populated = await updated.populate('user', 'name avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, addReview, updateReview, deleteReview };
