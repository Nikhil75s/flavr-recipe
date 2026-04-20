/**
 * controllers/recipeController.js — Recipe CRUD request handlers.
 */

const Recipe = require('../models/Recipe');
const { cloudinary } = require('../helpers/cloudinary');

/**
 * @desc    Get all recipes with optional search, filters, sorting, and pagination
 * @route   GET /api/recipes
 * @access  Public
 */
const getRecipes = async (req, res, next) => {
  try {
    const { search, category, cuisine, difficulty, sort, page = 1, limit = 12 } = req.query;

    // Build the MongoDB query object dynamically based on provided filters
    const query = {};

    // Text search — uses the text index defined on Recipe schema (title, description, cuisine)
    if (search) {
      query.$text = { $search: search };
    }

    // Exact match filters
    if (category) query.category = category;
    if (cuisine) query.cuisine = { $regex: cuisine, $options: 'i' }; // Case-insensitive regex
    if (difficulty) query.difficulty = difficulty;

    // Determine sort order based on the 'sort' query parameter
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };   // Highest rated first
    if (sort === 'popular') sortOption = { totalReviews: -1 };    // Most reviewed first

    // Calculate how many documents to skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute both queries in parallel for better performance
    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .populate('author', 'name avatar')  // Include author's name and avatar
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Recipe.countDocuments(query),          // Total matching documents (for pagination)
    ]);

    // Return paginated response
    res.json({
      recipes,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
};

/**
 * @desc    Get a single recipe by its ID
 * @route   GET /api/recipes/:id
 * @access  Public
 */
const getRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name avatar email');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new recipe
 * @route   POST /api/recipes
 * @access  Private (requires auth)
 */
const createRecipe = async (req, res, next) => {
  try {
    const { title, description, ingredients, steps, cookTime, servings, category, cuisine, difficulty } = req.body;

    // Parse ingredients and steps — they arrive as JSON strings when sent via FormData
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedSteps = typeof steps === 'string' ? JSON.parse(steps) : steps;

    // Build the recipe data object
    const recipeData = {
      title,
      description,
      ingredients: parsedIngredients,
      steps: parsedSteps,
      cookTime: parseInt(cookTime) || 0,
      servings: parseInt(servings) || 1,
      category: category || 'Other',
      cuisine: cuisine || 'Other',
      difficulty: difficulty || 'Medium',
      author: req.user._id, // Set from the protect middleware
    };

    // If an image was uploaded via multer, attach the Cloudinary URL and public ID
    if (req.file) {
      recipeData.image = req.file.path;          // Cloudinary URL
      recipeData.imagePublicId = req.file.filename; // Cloudinary public ID (for deletion)
    }

    // Create the recipe in MongoDB
    const recipe = await Recipe.create(recipeData);

    // Populate author data before sending the response
    const populated = await recipe.populate('author', 'name avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing recipe
 * @route   PUT /api/recipes/:id
 * @access  Private (requires auth + ownership)
 */
const updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Ownership check — only the author can update their recipe
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const { title, description, ingredients, steps, cookTime, servings, category, cuisine, difficulty } = req.body;

    // Parse JSON strings if sent via FormData
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedSteps = typeof steps === 'string' ? JSON.parse(steps) : steps;

    // Update fields — use new value if provided, otherwise keep the existing value
    recipe.title = title || recipe.title;
    recipe.description = description || recipe.description;
    recipe.ingredients = parsedIngredients || recipe.ingredients;
    recipe.steps = parsedSteps || recipe.steps;
    recipe.cookTime = parseInt(cookTime) || recipe.cookTime;
    recipe.servings = parseInt(servings) || recipe.servings;
    recipe.category = category || recipe.category;
    recipe.cuisine = cuisine || recipe.cuisine;
    recipe.difficulty = difficulty || recipe.difficulty;

    // Handle new image upload — replace the old image on Cloudinary
    if (req.file) {
      // Delete the previous image from Cloudinary to avoid orphaned files
      if (recipe.imagePublicId) {
        await cloudinary.uploader.destroy(recipe.imagePublicId);
      }
      recipe.image = req.file.path;
      recipe.imagePublicId = req.file.filename;
    }

    // Save the updated recipe and populate author info
    const updated = await recipe.save();
    const populated = await updated.populate('author', 'name avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a recipe and its associated image + reviews
 * @route   DELETE /api/recipes/:id
 * @access  Private (requires auth + ownership)
 */
const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Ownership check — only the author can delete their recipe
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    // Delete the associated image from Cloudinary
    if (recipe.imagePublicId) {
      await cloudinary.uploader.destroy(recipe.imagePublicId);
    }

    // Delete the recipe document from MongoDB
    await Recipe.findByIdAndDelete(req.params.id);

    // Cascading delete — remove all reviews that reference this recipe
    const Review = require('../models/Review');
    await Review.deleteMany({ recipe: req.params.id });

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all recipes created by a specific user
 * @route   GET /api/recipes/user/:userId
 * @access  Public
 */
const getRecipesByUser = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ author: req.params.userId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 }); // Newest first

    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe, getRecipesByUser };
