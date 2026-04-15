const router = require('express').Router();
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByUser,
} = require('../controllers/recipeController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../helpers/cloudinary');

// Public routes
router.get('/', getRecipes);
router.get('/user/:userId', getRecipesByUser);
router.get('/:id', getRecipe);

// Protected routes (require JWT)
router.post('/', protect, upload.single('image'), createRecipe);
router.put('/:id', protect, upload.single('image'), updateRecipe);
router.delete('/:id', protect, deleteRecipe);

module.exports = router;
