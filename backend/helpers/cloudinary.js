/**
 * helpers/cloudinary.js — Cloudinary image upload configuration.
 */

const cloudinary = require('cloudinary').v2;                    // Cloudinary SDK (v2 API)
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Multer storage adapter
const multer = require('multer');                                // File upload middleware

// Configure Cloudinary with API credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,         // API key from Cloudinary dashboard
  api_secret: process.env.CLOUDINARY_API_SECRET,   // API secret from Cloudinary dashboard
});

// Configure the storage engine — tells multer WHERE and HOW to store uploaded files
const storage = new CloudinaryStorage({
  cloudinary,                          // Use the configured Cloudinary instance
  params: {
    folder: 'flavr-recipes',           // Cloudinary folder to organize uploads
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Accepted image formats
    transformation: [
      {
        width: 800,                     // Max width in pixels
        height: 600,                    // Max height in pixels
        crop: 'limit',                  // Scale down if larger, never scale up
        quality: 'auto',                // Cloudinary auto-optimizes quality
      },
    ],
  },
});

// Create the multer upload middleware with the Cloudinary storage engine
const upload = multer({
  storage,                             // Use CloudinaryStorage configured above
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB (5 * 1024 * 1024 bytes)
});

// Export both the cloudinary instance (for deleting images) and the upload middleware
module.exports = { cloudinary, upload };
