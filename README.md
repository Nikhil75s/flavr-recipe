# 🍃 Flavr — MERN Recipe Sharing Platform

**A modern, full-stack recipe sharing platform built with the MERN stack.**
**Discover, create, share, and bookmark delicious recipes from around the world.**

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 📖 About

**Flavr** is a community-driven recipe sharing platform where food enthusiasts can:

- 🔐 **Sign in** with Google OAuth 2.0 for seamless authentication
- 📝 **Create** recipes with ingredients, step-by-step instructions, and images
- 🔍 **Explore** and search recipes by name, category, cuisine, or difficulty
- ⭐ **Review & Rate** recipes with a 5-star rating system
- 🔖 **Bookmark** your favorite recipes for quick access
- 👤 **Profile** pages with editable bios and personal recipe collections

---

## ✨ Features

### Authentication
- Google OAuth 2.0 sign-in via Passport.js
- JWT-based API authentication with Bearer tokens
- Protected routes on both frontend and backend
- Auto-redirect for unauthenticated users

### Recipe Management
- Full CRUD operations (Create, Read, Update, Delete)
- Image uploads via Cloudinary with auto-optimization
- Categories: Breakfast, Lunch, Dinner, Dessert, Snack, Beverage
- Difficulty levels: Easy, Medium, Hard
- Cook time, servings, and cuisine metadata

### Search & Discovery
- Full-text search across titles, descriptions, and cuisines
- Filter by category, difficulty, and sort order
- Pagination for browsing large datasets
- Sort by: Newest, Oldest, Top Rated, Most Reviewed

### Reviews & Ratings
- 5-star interactive rating system
- One review per user per recipe (enforced)
- Auto-calculated average rating on recipe cards
- Review ownership — edit/delete your own reviews

### Bookmarks
- Save/unsave toggle on any recipe
- Dedicated "Saved Recipes" page
- Persistent across sessions

### UI/UX
- Dark glassmorphism design with amber & green accent palette
- Animated hero section with floating gradient orbs
- Smooth micro-animations and hover effects
- Fully responsive — desktop, tablet, and mobile
- Custom 404 page with food-themed messaging

---

## 📁 Project Structure

```
recipe-app/
├── backend/
│   ├── server.js                 ← Entry point, middleware, route mounting
│   ├── db.js                     ← MongoDB connection
│   ├── .env                      ← Environment variables
│   ├── .env.example              ← Environment template
│   ├── config/
│   │   └── passport.js           ← Google OAuth strategy
│   ├── models/
│   │   ├── User.js               ← User schema (Google OAuth, savedRecipes)
│   │   ├── Recipe.js             ← Recipe schema (ingredients, steps, ratings)
│   │   └── Review.js             ← Review schema (auto-updates recipe rating)
│   ├── controllers/
│   │   ├── authController.js     ← OAuth callback, getMe, logout
│   │   ├── recipeController.js   ← CRUD + search/filter/pagination
│   │   ├── userController.js     ← Profile, save/unsave
│   │   └── reviewController.js   ← CRUD for reviews
│   ├── routes/
│   │   ├── authRoutes.js         ← /api/auth/*
│   │   ├── recipeRoutes.js       ← /api/recipes/*
│   │   ├── userRoutes.js         ← /api/users/*
│   │   └── reviewRoutes.js       ← /api/reviews/*
│   ├── middlewares/
│   │   ├── authMiddleware.js     ← JWT protect middleware
│   │   └── errorHandler.js       ← Global error handler
│   └── helpers/
│       ├── generateToken.js      ← JWT signing utility
│       └── cloudinary.js         ← Multer + Cloudinary storage
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx              ← React entry point
        ├── App.jsx               ← Routes
        ├── index.css             ← Global styles + design tokens
        ├── api/
        │   └── axiosInstance.js   ← Axios + JWT interceptor
        ├── context/
        │   └── AuthContext.jsx    ← Global auth state
        ├── components/
        │   ├── Navbar.jsx        ← Responsive navigation bar
        │   ├── Footer.jsx        ← Site footer
        │   ├── RecipeCard.jsx    ← Recipe preview card
        │   ├── StarInput.jsx     ← Interactive star rating
        │   └── ProtectedRoute.jsx← Auth guard wrapper
        └── pages/
            ├── Home.jsx          ← Landing page with hero & featured
            ├── Login.jsx         ← Google OAuth sign-in
            ├── AuthSuccess.jsx   ← OAuth callback handler
            ├── Recipes.jsx       ← Browse, search & filter
            ├── RecipeDetail.jsx  ← Full recipe view + reviews
            ├── CreateRecipe.jsx  ← Create recipe form
            ├── EditRecipe.jsx    ← Edit recipe form
            ├── Profile.jsx       ← User profile page
            ├── SavedRecipes.jsx  ← Bookmarked recipes
            └── NotFound.jsx      ← Custom 404 page
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org)
- **MongoDB** installed locally — [Download](https://www.mongodb.com/try/download/community)
- **MongoDB Compass** — [Download](https://www.mongodb.com/products/tools/compass)
- **Google Cloud Console** project — [Console](https://console.cloud.google.com)
- **Cloudinary** account — [Sign up](https://cloudinary.com)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/recipe-app.git
cd recipe-app
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Set up environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/flavr

JWT_SECRET=your_random_secret_key_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Set Application Type to **Web application**
6. Add Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret** into your `.env`

### 5. Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From the Dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**
3. Paste them into your `.env`

### 6. Start MongoDB

Make sure MongoDB is running locally. You can verify by opening **MongoDB Compass** and connecting to:

```
mongodb://localhost:27017
```

The `flavr` database will be auto-created when the first data is written.

### 7. Run the application

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # → http://localhost:5173
```

Open your browser and navigate to **http://localhost:5173** 🎉

---

## 🔌 API Reference

### Authentication

| Method | Endpoint                         | Auth | Description            |
|--------|----------------------------------|------|------------------------|
| GET    | `/api/auth/google`               | No   | Start Google OAuth     |
| GET    | `/api/auth/google/callback`      | No   | OAuth callback         |
| GET    | `/api/auth/me`                   | JWT  | Get current user       |
| POST   | `/api/auth/logout`               | JWT  | Logout                 |

### Recipes

| Method | Endpoint                         | Auth | Description            |
|--------|----------------------------------|------|------------------------|
| GET    | `/api/recipes`                   | No   | List/search recipes    |
| GET    | `/api/recipes/:id`               | No   | Get single recipe      |
| POST   | `/api/recipes`                   | JWT  | Create recipe          |
| PUT    | `/api/recipes/:id`               | JWT  | Update recipe (author) |
| DELETE | `/api/recipes/:id`               | JWT  | Delete recipe (author) |
| GET    | `/api/recipes/user/:userId`      | No   | Get recipes by user    |

**Query Parameters for GET `/api/recipes`:**

| Param      | Type   | Description                                    |
|------------|--------|------------------------------------------------|
| `search`   | string | Full-text search                               |
| `category` | string | Breakfast, Lunch, Dinner, Dessert, Snack, etc. |
| `cuisine`  | string | Filter by cuisine (case-insensitive)           |
| `difficulty` | string | Easy, Medium, Hard                           |
| `sort`     | string | `newest`, `oldest`, `rating`, `popular`        |
| `page`     | number | Page number (default: 1)                       |
| `limit`    | number | Items per page (default: 12)                   |

### Users

| Method | Endpoint                         | Auth | Description            |
|--------|----------------------------------|------|------------------------|
| GET    | `/api/users/:id`                 | No   | Get user profile       |
| PUT    | `/api/users/profile`             | JWT  | Update bio             |
| GET    | `/api/users/saved/recipes`       | JWT  | Get saved recipes      |
| POST   | `/api/users/save/:recipeId`      | JWT  | Toggle save/unsave     |

### Reviews

| Method | Endpoint                         | Auth | Description            |
|--------|----------------------------------|------|------------------------|
| GET    | `/api/reviews/:recipeId`         | No   | Get reviews for recipe |
| POST   | `/api/reviews/:recipeId`         | JWT  | Add review             |
| PUT    | `/api/reviews/:reviewId`         | JWT  | Update own review      |
| DELETE | `/api/reviews/:reviewId`         | JWT  | Delete own review      |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **Passport.js** | Google OAuth 2.0 authentication |
| **JWT** | Stateless API authentication |
| **Multer** | File upload middleware |
| **Cloudinary** | Cloud image storage & optimization |
| **Nodemon** | Dev server with hot reload |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **React Hot Toast** | Notification system |
| **React Icons** | Icon library (Feather icons) |

### Design
| Choice | Details |
|--------|---------|
| **Theme** | Dark mode with glassmorphism |
| **Colors** | Warm amber (#ff8510) + green (#22c55e) |
| **Typography** | Playfair Display (headings) + Inter (body) |
| **Animations** | CSS keyframes, floating orbs, hover transitions |

---

## 📱 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Hero section, stats, featured recipes, CTA |
| **Login** | `/login` | Google OAuth sign-in card |
| **Explore** | `/recipes` | Browse, search, filter, paginate recipes |
| **Recipe Detail** | `/recipes/:id` | Full recipe with ingredients, steps, reviews |
| **Create Recipe** | `/create` | Form with image upload, ingredients, steps |
| **Edit Recipe** | `/edit/:id` | Pre-filled edit form (author only) |
| **Profile** | `/profile/:id` | User info, bio, recipe collection |
| **Saved Recipes** | `/saved` | Bookmarked recipes list |
| **404** | `/*` | Custom not-found page |

---

## 🔒 Security Features

- **JWT Authentication** — Stateless, secure token-based auth
- **Route Protection** — Backend middleware + frontend `ProtectedRoute` component
- **Ownership Verification** — Only authors can edit/delete their recipes and reviews
- **Input Validation** — Mongoose schema validation with error messages
- **CORS Configuration** — Restricted to frontend origin
- **File Upload Limits** — 5MB max file size, allowed formats only

---

## 🚀 Scripts

### Backend

```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
```

### Frontend

```bash
npm run dev    # Start Vite dev server
npm run build  # Build for production
npm run preview # Preview production build
```

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---


