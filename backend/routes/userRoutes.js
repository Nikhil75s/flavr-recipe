const router = require('express').Router();
const {
  getUserProfile,
  updateProfile,
  getSavedRecipes,
  toggleSaveRecipe,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Public
router.get('/:id', getUserProfile);

// Protected
router.put('/profile', protect, updateProfile);
router.get('/saved/recipes', protect, getSavedRecipes);
router.post('/save/:recipeId', protect, toggleSaveRecipe);

module.exports = router;
