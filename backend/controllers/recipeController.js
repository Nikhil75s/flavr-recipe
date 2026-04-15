const Recipe = require('../models/Recipe');
const { cloudinary } = require('../helpers/cloudinary');

// @desc    Get all recipes (with search, filter, pagination)
// @route   GET /api/recipes
const getRecipes = async (req, res, next) => {
  try {
    const { search, category, cuisine, difficulty, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category) query.category = category;
    if (cuisine) query.cuisine = { $regex: cuisine, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'popular') sortOption = { totalReviews: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .populate('author', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Recipe.countDocuments(query),
    ]);

    res.json({
      recipes,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
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

// @desc    Create recipe
// @route   POST /api/recipes
const createRecipe = async (req, res, next) => {
  try {
    const { title, description, ingredients, steps, cookTime, servings, category, cuisine, difficulty } = req.body;

    // Parse ingredients and steps if they come as JSON strings
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedSteps = typeof steps === 'string' ? JSON.parse(steps) : steps;

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
      author: req.user._id,
    };

    // Handle image upload
    if (req.file) {
      recipeData.image = req.file.path;
      recipeData.imagePublicId = req.file.filename;
    }

    const recipe = await Recipe.create(recipeData);
    const populated = await recipe.populate('author', 'name avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
const updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check ownership
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const { title, description, ingredients, steps, cookTime, servings, category, cuisine, difficulty } = req.body;

    // Parse if needed
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedSteps = typeof steps === 'string' ? JSON.parse(steps) : steps;

    recipe.title = title || recipe.title;
    recipe.description = description || recipe.description;
    recipe.ingredients = parsedIngredients || recipe.ingredients;
    recipe.steps = parsedSteps || recipe.steps;
    recipe.cookTime = parseInt(cookTime) || recipe.cookTime;
    recipe.servings = parseInt(servings) || recipe.servings;
    recipe.category = category || recipe.category;
    recipe.cuisine = cuisine || recipe.cuisine;
    recipe.difficulty = difficulty || recipe.difficulty;

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (recipe.imagePublicId) {
        await cloudinary.uploader.destroy(recipe.imagePublicId);
      }
      recipe.image = req.file.path;
      recipe.imagePublicId = req.file.filename;
    }

    const updated = await recipe.save();
    const populated = await updated.populate('author', 'name avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check ownership
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    // Delete image from Cloudinary
    if (recipe.imagePublicId) {
      await cloudinary.uploader.destroy(recipe.imagePublicId);
    }

    await Recipe.findByIdAndDelete(req.params.id);

    // Also delete all reviews for this recipe
    const Review = require('../models/Review');
    await Review.deleteMany({ recipe: req.params.id });

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recipes by a specific user
// @route   GET /api/recipes/user/:userId
const getRecipesByUser = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ author: req.params.userId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe, getRecipesByUser };
