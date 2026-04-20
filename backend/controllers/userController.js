/**
 * controllers/userController.js — User profile and saved recipes request handlers.
 */

const User = require('../models/User');
const Recipe = require('../models/Recipe');

/**
 * @desc    Get a user's public profile by their ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserProfile = async (req, res, next) => {
  try {
    // Fetch user but exclude googleId and version key from the response
    const user = await User.findById(req.params.id).select('-googleId -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Count how many recipes this user has published
    const recipeCount = await Recipe.countDocuments({ author: req.params.id });

    // Merge recipeCount into the user object before sending
    res.json({ ...user.toObject(), recipeCount });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the logged-in user's profile (currently supports bio only)
 * @route   PUT /api/users/profile
 * @access  Private (requires auth)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,                    // ID from the protect middleware
      { bio },                         // Fields to update
      { new: true, runValidators: true } // Return updated doc + validate
    ).select('-googleId -__v');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all recipes saved/bookmarked by the logged-in user
 * @route   GET /api/users/saved/recipes
 * @access  Private (requires auth)
 */
const getSavedRecipes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedRecipes',                           // Populate the saved recipe references
      populate: { path: 'author', select: 'name avatar' }, // Also populate each recipe's author
    });

    res.json(user.savedRecipes);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle save/unsave a recipe (bookmark functionality)
 * @route   POST /api/users/save/:recipeId
 * @access  Private (requires auth)
 */
const toggleSaveRecipe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const recipeId = req.params.recipeId;

    // Verify the recipe exists before attempting to save it
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe is already in the savedRecipes array
    const index = user.savedRecipes.indexOf(recipeId);

    if (index > -1) {
      // Recipe is already saved — remove it from the array (unsave)
      user.savedRecipes.splice(index, 1);
      await user.save();
      res.json({ message: 'Recipe unsaved', saved: false });
    } else {
      // Recipe is not saved — add it to the array (save)
      user.savedRecipes.push(recipeId);
      await user.save();
      res.json({ message: 'Recipe saved', saved: true });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateProfile, getSavedRecipes, toggleSaveRecipe };
