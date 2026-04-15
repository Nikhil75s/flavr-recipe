const User = require('../models/User');
const Recipe = require('../models/Recipe');

// @desc    Get user profile
// @route   GET /api/users/:id
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-googleId -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's recipe count
    const recipeCount = await Recipe.countDocuments({ author: req.params.id });

    res.json({ ...user.toObject(), recipeCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile (bio)
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio },
      { new: true, runValidators: true }
    ).select('-googleId -__v');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved recipes
// @route   GET /api/users/saved/recipes
const getSavedRecipes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedRecipes',
      populate: { path: 'author', select: 'name avatar' },
    });

    res.json(user.savedRecipes);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save/unsave recipe
// @route   POST /api/users/save/:recipeId
const toggleSaveRecipe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const recipeId = req.params.recipeId;

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const index = user.savedRecipes.indexOf(recipeId);

    if (index > -1) {
      // Already saved — unsave it
      user.savedRecipes.splice(index, 1);
      await user.save();
      res.json({ message: 'Recipe unsaved', saved: false });
    } else {
      // Save it
      user.savedRecipes.push(recipeId);
      await user.save();
      res.json({ message: 'Recipe saved', saved: true });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateProfile, getSavedRecipes, toggleSaveRecipe };
