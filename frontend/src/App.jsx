/**
 * App.jsx — Main application layout and route configuration.
 */

import { Routes, Route } from 'react-router-dom'

// Layout components — always visible on every page
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Auth guard — redirects to /login if user is not authenticated
import ProtectedRoute from './components/ProtectedRoute'

// Page components — each corresponds to a route
import Home from './pages/Home'
import Login from './pages/Login'
import AuthSuccess from './pages/AuthSuccess'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import CreateRecipe from './pages/CreateRecipe'
import EditRecipe from './pages/EditRecipe'
import Profile from './pages/Profile'
import SavedRecipes from './pages/SavedRecipes'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      {/* Navbar — persistent navigation bar at the top of every page */}
      <Navbar />

      {/* Route definitions — React Router matches the URL and renders the component */}
      <Routes>
        {/* Public routes — accessible without authentication */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/profile/:id" element={<Profile />} />

        {/* Protected routes — require authentication (redirects to /login if not logged in) */}
        <Route path="/create" element={
          <ProtectedRoute><CreateRecipe /></ProtectedRoute>
        } />
        <Route path="/edit/:id" element={
          <ProtectedRoute><EditRecipe /></ProtectedRoute>
        } />
        <Route path="/saved" element={
          <ProtectedRoute><SavedRecipes /></ProtectedRoute>
        } />

        {/* Catch-all route — shows 404 page for any unmatched URL */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer — persistent footer at the bottom of every page */}
      <Footer />
    </>
  )
}

export default App
